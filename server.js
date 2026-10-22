import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: '15mb' }));
app.use(express.static(__dirname));

// ============================================================================
// HỆ THỐNG CHỐNG QUÁ TẢI & VƯỢT GIỚI HẠN QUOTA KHI NHIỀU NGƯỜI DÙNG ĐỒNG THỜI
// 1. Server-side LRU Cache (Chia sẻ kết quả giữa mọi người dùng -> tốn 0 quota)
// 2. In-flight Request Coalescing (Gộp các yêu cầu trùng lặp cùng thời điểm)
// 3. Smart Concurrency Queue (Hàng đợi điều tiết luồng chống lỗi 429)
// 4. Multi-Key Pool & 6-Model Cascade (Xoay vòng khóa & chuyển đổi 6 cụm model độc lập)
// ============================================================================

const CACHE_MAX_ITEMS = 400;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 giờ
const serverResponseCache = new Map();
const inflightRequests = new Map();

// Điều tiết tối đa số luồng gọi Gemini đồng thời để tránh burst 429
const MAX_CONCURRENT_REQUESTS = 4;
let activeRequests = 0;
const requestWaitQueue = [];

function acquireConcurrencySlot() {
  if (activeRequests < MAX_CONCURRENT_REQUESTS) {
    activeRequests++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    requestWaitQueue.push(resolve);
  });
}

function releaseConcurrencySlot() {
  if (requestWaitQueue.length > 0) {
    const nextResolve = requestWaitQueue.shift();
    nextResolve();
  } else {
    activeRequests = Math.max(0, activeRequests - 1);
  }
}

function getCacheHash(requireJson, systemInstruction, promptText) {
  return crypto
    .createHash('sha256')
    .update(`${requireJson ? 'json' : 'text'}|${systemInstruction || ''}|${promptText}`)
    .digest('hex');
}

function getCachedResponse(hash) {
  const entry = serverResponseCache.get(hash);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    serverResponseCache.delete(hash);
    return null;
  }
  // Làm mới vị trí LRU
  serverResponseCache.delete(hash);
  serverResponseCache.set(hash, entry);
  return entry;
}

function setCachedResponse(hash, data) {
  if (serverResponseCache.size >= CACHE_MAX_ITEMS) {
    const oldestKey = serverResponseCache.keys().next().value;
    if (oldestKey) serverResponseCache.delete(oldestKey);
  }
  serverResponseCache.set(hash, {
    ...data,
    timestamp: Date.now()
  });
}

// Hỗ trợ xoay vòng nhiều API Key nếu cấu hình GEMINI_API_KEYS (phân cách bằng dấu phẩy)
let keyRotationIndex = 0;
const keyCooldownMap = new Map(); // apiKey -> cooldownUntilTimestamp

function getAvailableApiKeys() {
  const rawPool = [
    process.env.GEMINI_API_KEYS || '',
    process.env.GEMINI_API_KEY || ''
  ]
    .join(',')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  const uniqueKeys = [...new Set(rawPool)];
  if (uniqueKeys.length === 0) return [];

  const now = Date.now();
  const activeKeys = uniqueKeys.filter((k) => (keyCooldownMap.get(k) || 0) <= now);
  return activeKeys.length > 0 ? activeKeys : uniqueKeys;
}

function pickNextApiKey() {
  const keys = getAvailableApiKeys();
  if (keys.length === 0) return null;
  const selected = keys[keyRotationIndex % keys.length];
  keyRotationIndex = (keyRotationIndex + 1) % keys.length;
  return selected;
}

const MODEL_LABELS = {
  'gemini-3.8-flash': 'gemini-3.8-flash (Gemini 3.8 Flash — Tốc độ cao)',
  'gemini-3.5-flash-lite': 'gemini-3.5-flash-lite (Gemini 3.5 Flash-Lite — Siêu mượt)',
  'gemini-3.1-pro': 'gemini-3.1-pro (Gemini 3.1 Pro — Chuyên sâu)',
  'gemini-4-argon': 'gemini-4-argon (Gemini 4 Argon — Thế hệ mới)'
};

function resolveModelName(requested) {
  if (!requested) return 'gemini-3.8-flash';
  const r = String(requested).toLowerCase();
  if (r.includes('lite')) return 'gemini-3.5-flash-lite';
  if (r.includes('3.1') || r.includes('pro')) return 'gemini-3.1-pro';
  if (r.includes('argon') || r.includes('agon') || r.includes('4')) return 'gemini-4-argon';
  return 'gemini-3.8-flash';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitOrQuotaError(err) {
  const msg = String(err?.message || err || '').toLowerCase();
  const status = err?.status || err?.statusCode || 0;
  return (
    status === 429 ||
    status === 503 ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('overloaded')
  );
}

async function executeGeminiWithFailover({ selectedModel, promptText, requireJson, systemInstruction }) {
  const primaryModel = resolveModelName(selectedModel);
  const fallbackChain = [
    primaryModel,
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-pro',
    'gemini-4-argon',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite-preview',
    'gemini-3.1-pro-preview'
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError = null;

  await acquireConcurrencySlot();
  try {
    for (const modelName of fallbackChain) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const apiKey = pickNextApiKey();
        if (!apiKey) {
          throw new Error('Chưa cấu hình GEMINI_API_KEY trên máy chủ.');
        }

        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build'
              }
            }
          });

          const config = {
            temperature: 0.65
          };
          if (requireJson) {
            config.responseMimeType = 'application/json';
          }
          if (systemInstruction) {
            config.systemInstruction = systemInstruction;
          }

          const response = await ai.models.generateContent({
            model: modelName,
            contents: promptText,
            config
          });

          const textOut = response.text;
          if (textOut && textOut.trim() !== '') {
            return {
              text: textOut,
              modelUsed: modelName,
              fromServerCache: false
            };
          }
          throw new Error(`Mô hình ${modelName} trả về nội dung rỗng.`);
        } catch (err) {
          lastError = err;
          if (isRateLimitOrQuotaError(err)) {
            keyCooldownMap.set(apiKey, Date.now() + 15000);
            const backoffMs = 350 * (attempt + 1) + Math.floor(Math.random() * 250);
            await sleep(backoffMs);
          } else {
            break;
          }
        }
      }
    }
  } finally {
    releaseConcurrencySlot();
  }

  throw lastError || new Error('Tất cả các cụm mô hình AI đang bận.');
}

app.get('/favicon.ico', (_req, res) => {
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0f172a"/><path d="M20 14c12 0 12 36 24 36M44 14c-12 0-12 36-24 36" stroke="#22d3ee" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="32" cy="32" r="6" fill="#10b981"/></svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.status(200).send(svgIcon);
});

app.post(['/api/gemini', '/biomaster-ai/api/gemini'], async (req, res) => {
  try {
    const { selectedModel, promptText, requireJson, systemInstruction, clientApiKey } = req.body || {};
    if (!promptText || typeof promptText !== 'string') {
      return res.status(200).json({ fallback: true, error: 'Thiếu nội dung yêu cầu (promptText).' });
    }

    if (clientApiKey && typeof clientApiKey === 'string' && clientApiKey.trim().length > 20) {
      const clientKeys = clientApiKey
        .split(/[\n,;]+/)
        .map(k => k.trim())
        .filter(k => k.length > 20);
      if (clientKeys.length > 0) {
        const merged = [...new Set([...clientKeys, ...(process.env.GEMINI_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean)])];
        process.env.GEMINI_API_KEYS = merged.join(',');
      }
    }

    // 1. Kiểm tra bộ nhớ đệm trên Server
    const cacheHash = getCacheHash(Boolean(requireJson), systemInstruction, promptText);
    const cached = getCachedResponse(cacheHash);
    if (cached) {
      return res.status(200).json({
        text: cached.text,
        modelUsed: cached.modelUsed,
        fromServerCache: true
      });
    }

    // 2. Gộp yêu cầu trùng lặp đang xử lý (Request Coalescing)
    if (inflightRequests.has(cacheHash)) {
      const sharedResult = await inflightRequests.get(cacheHash);
      return res.status(200).json({
        ...sharedResult,
        coalesced: true
      });
    }

    const requestPromise = executeGeminiWithFailover({
      selectedModel,
      promptText,
      requireJson,
      systemInstruction
    });

    inflightRequests.set(cacheHash, requestPromise);

    try {
      const result = await requestPromise;
      setCachedResponse(cacheHash, result);
      return res.status(200).json(result);
    } finally {
      inflightRequests.delete(cacheHash);
    }
  } catch (err) {
    return res.status(200).json({
      fallback: true,
      quotaReached: true,
      info: err?.message || 'Chuyển sang Động cơ Tổng hợp AI Sư phạm Chuyên sâu.'
    });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BioMaster AI server running at http://0.0.0.0:${PORT}`);
});
