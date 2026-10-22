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

function resolveModelName(requested) {
  if (!requested) return 'gemini-3-flash-preview';
  if (requested.includes('lite') || requested.includes('3.5')) return 'gemini-3.1-flash-lite-preview';
  if (requested.includes('argon') || requested.includes('4') || requested.includes('pro')) return 'gemini-3-flash-preview';
  return 'gemini-3-flash-preview';
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
  // Chuỗi 6 mô hình thuộc các nhóm hạn ngạch (quota bucket) độc lập để tự động chuyển tải khi 1 model chạm trần RPM/TPM
  const fallbackChain = [
    primaryModel,
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite-preview',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-flash-latest',
    'gemini-3.1-pro-preview'
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError = null;

  await acquireConcurrencySlot();
  try {
    for (const modelName of fallbackChain) {
      // Thử tối đa 2 lần cho mỗi model nếu gặp lỗi nghẽn mạng / 429 tạm thời
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
            // Đánh dấu tạm nghỉ 15s cho key vừa chạm giới hạn RPM và backoff nhẹ trước khi chuyển sang model/key kế tiếp
            keyCooldownMap.set(apiKey, Date.now() + 15000);
            const backoffMs = 350 * (attempt + 1) + Math.floor(Math.random() * 250);
            await sleep(backoffMs);
          } else {
            break; // Chuyển ngay sang model tiếp theo trong chuỗi fallback
          }
        }
      }
    }
  } finally {
    releaseConcurrencySlot();
  }

  throw lastError || new Error('Tất cả các cụm mô hình AI đang bận.');
}

app.post(['/api/gemini', '/biomaster-ai/api/gemini'], async (req, res) => {
  try {
    const { selectedModel, promptText, requireJson, systemInstruction } = req.body || {};
    if (!promptText || typeof promptText !== 'string') {
      return res.status(400).json({ error: 'Thiếu nội dung yêu cầu (promptText).' });
    }

    // 1. Kiểm tra bộ nhớ đệm trên Server (nếu đã có giáo viên khác soạn bài này -> trả về tức thì trong <5ms, không tốn quota)
    const cacheHash = getCacheHash(Boolean(requireJson), systemInstruction, promptText);
    const cached = getCachedResponse(cacheHash);
    if (cached) {
      return res.json({
        text: cached.text,
        modelUsed: cached.modelUsed,
        fromServerCache: true
      });
    }

    // 2. Gộp yêu cầu trùng lặp đang xử lý (Request Coalescing) nếu nhiều người bấm cùng một bài tại cùng một giây
    if (inflightRequests.has(cacheHash)) {
      const sharedResult = await inflightRequests.get(cacheHash);
      return res.json({
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
      return res.json(result);
    } finally {
      inflightRequests.delete(cacheHash);
    }
  } catch (err) {
    console.warn('[BioMaster AI] Chuyển sang cơ chế tổng hợp nội bộ do chạm ngưỡng:', err?.message || err);
    return res.status(503).json({
      error: err?.message || 'Hệ thống AI đang ở ngưỡng tải tối đa.',
      quotaReached: true
    });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BioMaster AI server running at http://0.0.0.0:${PORT}`);
});
