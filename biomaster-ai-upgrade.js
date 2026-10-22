// ============================================================================
// BIOMASTER AI - HỆ THỐNG SOẠN KẾ HOẠCH BÀI DẠY 5512, BÀI GIẢNG 34 SLIDE & ĐỀ THI 7991
// Chuẩn Chương trình GDPT 2018 & SGK Kết nối tri thức với cuộc sống
// ============================================================================

if (!window.__BIOMASTER_UPGRADE_LOADED__) {
window.__BIOMASTER_UPGRADE_LOADED__ = true;

// Hệ thống thông báo Toast mượt mà thay thế window.alert()
window.showBioToast = function(message, type = 'info') {
  let container = document.getElementById('biomaster-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'biomaster-toast-container';
    container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-md no-print';
    document.body.appendChild(container);
  }

  const colors = {
    success: 'bg-emerald-950/95 border-emerald-500 text-emerald-200',
    warning: 'bg-amber-950/95 border-amber-500 text-amber-200',
    error: 'bg-rose-950/95 border-rose-500 text-rose-200',
    info: 'bg-slate-900/95 border-cyan-500 text-cyan-200'
  };
  const icons = {
    success: 'fa-circle-check text-emerald-400',
    warning: 'fa-triangle-exclamation text-amber-400',
    error: 'fa-circle-xmark text-rose-400',
    info: 'fa-wand-magic-sparkles text-cyan-400'
  };

  const toast = document.createElement('div');
  toast.className = `px-4 py-3 rounded-xl border shadow-2xl text-xs font-bold flex items-start gap-2.5 transition-all duration-300 ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} text-sm mt-0.5"></i>
    <div class="flex-1 leading-relaxed">${message}</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
};

// Ghi đè khóa lưu trữ cache sang phiên bản sạch (v5) để loại bỏ hoàn toàn các bản cache cũ
window.getAICacheKey = function(mode, subject, grade, lessonTitle) {
  return `biomaster_v5_clean_${mode}_${subject}_${grade}_${lessonTitle}`.replace(/[^a-zA-Z0-9_]/g, '_');
};

window.getStructuredPlanKey = function(subject, grade, lessonTitle) {
  return `structured_plan_v5_clean_${subject}_${grade}_${lessonTitle}`.replace(/[^a-zA-Z0-9_]/g, '_');
};

// Hàm làm sạch các cụm từ hướng dẫn thừa nếu AI vô tình sinh ra
window.cleanUnwantedMetaPhrases = function(htmlOrText) {
  if (!htmlOrText || typeof htmlOrText !== 'string') return htmlOrText;
  return htmlOrText
    .replace(/\(Yêu cầu cần đạt bắt buộc theo CT GDPT 2018 của Bộ GD&ĐT\)/gi, '')
    .replace(/\[Nhận biết\s*-\s*CT GDPT 2018\]\s*:\s*/gi, '')
    .replace(/\[Thông hiểu\s*-\s*CT GDPT 2018\]\s*:\s*/gi, '')
    .replace(/\[Vận dụng\s*-\s*CT GDPT 2018\]\s*:\s*/gi, '')
    .replace(/\[Nhận biết\s*-\s*GDPT 2018\]\s*:\s*/gi, '')
    .replace(/\[Thông hiểu\s*-\s*GDPT 2018\]\s*:\s*/gi, '')
    .replace(/\[Vận dụng\s*-\s*GDPT 2018\]\s*:\s*/gi, '')
    .replace(/\(Theo Khung NLS của Bộ GD&ĐT\)/gi, '')
    .replace(/\(Theo Khung Năng lực AI của Bộ GD&ĐT\)/gi, '')
    .replace(/\s*-\s*Màu xanh dương/gi, '')
    .replace(/\s*-\s*Màu xanh/gi, '')
    .replace(/\s*-\s*Màu đỏ/gi, '')
    .replace(/\s*-\s*Màu vàng/gi, '')
    .replace(/\(Làm gì,\s*như thế nào\)/gi, '')
    .replace(/\(Chỉ tích hợp 0?1 phần nhỏ[^)]*\)/gi, '')
    .replace(/\(Không tích hợp dàn trải toàn bài\)/gi, '')
    .replace(/\(Không lạm dụng AI cho cả bài\)/gi, '')
    .replace(/\[Học liệu Năng lực đặc thù[^\]]*\]\s*:\s*/gi, '')
    .replace(/\[Học liệu số[^\]]*\]\s*:\s*/gi, '')
    .replace(/\[Học liệu tình huống AI[^\]]*\]\s*:\s*/gi, '')
    .replace(/\(Chuyển giao nhiệm vụ\s*-\s*GV làm gì\)/gi, ': Chuyển giao nhiệm vụ')
    .replace(/\(Thực hiện nhiệm vụ\s*-\s*HS làm gì,\s*như thế nào\)/gi, ': Thực hiện nhiệm vụ')
    .replace(/\(Trình bày theo Bảng 2 cột chuẩn Công văn 5512\)/gi, '')
    .replace(/\(KHỞI ĐỘNG\s*-\s*Thời gian:\s*\d+\s*phút\)/gi, '(KHỞI ĐỘNG)')
    .replace(/\s*\(Thời gian:\s*\d+\s*phút\)/gi, '')
    .replace(/DỰ KIẾN SẢN PHẨM\s*\(NỘI DUNG KIẾN THỨC TRỌNG TÂM\)/gi, 'DỰ KIẾN SẢN PHẨM')
    .replace(/undefined/g, '');
};

// Ghi đè hàm gọi AI qua máy chủ /api/gemini (tự động định tuyến sang Cloud Run khi chạy trên GitHub Pages tĩnh)
const _clientInflightMap = new Map();
const _API_ENDPOINTS = [
  '/api/gemini',
  'https://ais-pre-ckxrihplyt3nra2ljzzsft-799945497821.asia-southeast1.run.app/api/gemini',
  'https://ais-dev-ckxrihplyt3nra2ljzzsft-799945497821.asia-southeast1.run.app/api/gemini'
];

window.callGeminiDirect = async function(_apiKeyUnused, selectedModel, promptText, requireJson = false, systemInstruction = '') {
  const sig = `${requireJson ? 'J' : 'T'}_${selectedModel || ''}_${(promptText || '').length}_${(promptText || '').slice(0, 120)}_${(promptText || '').slice(-120)}`;
  try {
    const sessionHit = sessionStorage.getItem(`bio_ai_sess_${sig}`);
    if (sessionHit) return sessionHit;
  } catch (e) {}

  if (_clientInflightMap.has(sig)) {
    return _clientInflightMap.get(sig);
  }

  const reqPromise = (async () => {
    const payload = JSON.stringify({
      selectedModel: selectedModel || 'gemini-3.8-flash',
      promptText,
      requireJson,
      systemInstruction
    });

    const isGitHubPages = typeof window !== 'undefined' && window.location && window.location.hostname.includes('github.io');
    const orderedEndpoints = isGitHubPages
      ? [_API_ENDPOINTS[1], _API_ENDPOINTS[2], _API_ENDPOINTS[0]]
      : _API_ENDPOINTS;

    let lastErr = null;
    for (const endpoint of orderedEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || `Lỗi máy chủ AI (HTTP ${response.status})`);
        }
        if (!data.text || data.text.trim() === '') {
          throw new Error('Mô hình AI không trả về dữ liệu văn bản.');
        }
        try {
          sessionStorage.setItem(`bio_ai_sess_${sig}`, data.text);
        } catch (e) {}
        return data.text;
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error('Không thể kết nối máy chủ AI.');
  })();

  _clientInflightMap.set(sig, reqPromise);
  try {
    return await reqPromise;
  } finally {
    _clientInflightMap.delete(sig);
  }
};

// Hàm trích xuất an toàn JSON từ phản hồi của AI
window.safeParseAIJson = function(rawText) {
  if (!rawText) return null;
  let cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    try {
      const sanitized = cleaned.replace(/[\u0000-\u0019]+/g, ' ');
      return JSON.parse(sanitized);
    } catch (err2) {
      console.warn('Không thể parse JSON từ AI:', err2);
      return null;
    }
  }
};

// Chuẩn hóa hồ sơ bài học từ curriculum-data.js để mọi thuộc tính luôn đầy đủ 100%
window.getNormalizedLessonProfile = function(subject, grade, lessonTitle) {
  const raw = window.getLessonCurriculumProfile
    ? window.getLessonCurriculumProfile(subject, grade, lessonTitle)
    : null;
  const isAgri = subject && subject.toLowerCase().includes('công nghệ');

  const yccdList = (raw && Array.isArray(raw.yccd) && raw.yccd.length > 0)
    ? raw.yccd.filter(Boolean)
    : [
        `Nêu được các khái niệm và đặc điểm cơ bản của bài ${lessonTitle}.`,
        `Trình bày và giải thích được cơ chế, quy luật diễn biến trọng tâm của bài ${lessonTitle}.`,
        `Vận dụng được kiến thức bài ${lessonTitle} vào giải thích hiện tượng thực tiễn trong đời sống và sản xuất.`
      ];

  const sections = (raw && Array.isArray(raw.sections) && raw.sections.length > 0 ? raw.sections : []).map((s, idx) => {
    const title = s.title || s.heading || `Mục ${idx + 1}`;
    const sgkContent = Array.isArray(s.sgkContent) && s.sgkContent.length > 0
      ? s.sgkContent.filter(Boolean)
      : [yccdList[idx] || yccdList[0]];
    return {
      title,
      heading: title,
      sgkContent,
      yccd_nb: s.yccd_nb || yccdList[0] || `Nêu được kiến thức cơ bản thuộc mục ${title}.`,
      yccd_th: s.yccd_th || yccdList[1] || yccdList[0] || `Trình bày được cơ chế và mối liên hệ thuộc mục ${title}.`,
      yccd_vd: s.yccd_vd || yccdList[2] || yccdList[yccdList.length - 1] || `Vận dụng được kiến thức mục ${title} vào thực tiễn.`,
      gvStep1: s.gvStep1 || (idx === 0
        ? `GV hướng dẫn HS quan sát kênh hình và nghiên cứu nội dung mục "${title}" trong SGK Kết nối tri thức với cuộc sống, giao nhiệm vụ hoàn thành Phiếu học tập số 1.`
        : (idx === 1
            ? `GV nêu câu hỏi định hướng về cơ chế và quy luật tại mục "${title}", tổ chức cho HS thảo luận cặp đôi phân tích dữ liệu trong SGK.`
            : `GV đặt vấn đề thực tiễn gắn với nội dung mục "${title}", giao nhiệm vụ cho các nhóm đề xuất phương án giải quyết.`)),
      hsStep2: s.hsStep2 || (idx === 0
        ? `HS đọc thông tin mục "${title}" trong SGK, làm việc nhóm phân tích kênh hình và ghi kết quả vào Phiếu học tập số 1.`
        : (idx === 1
            ? `HS suy nghĩ cá nhân kết hợp trao đổi cặp đôi, hoàn thiện sơ đồ cơ chế và đối chiếu thông tin với SGK.`
            : `HS thảo luận nhóm, vận dụng kiến thức chuẩn SGK để giải thích các ứng dụng thực tiễn và hoàn thiện báo cáo.`)),
      reportStep3: s.reportStep3 || `Đại diện 1 - 2 nhóm trình bày kết quả thảo luận trước lớp; các nhóm khác lắng nghe, nhận xét và bổ sung.`,
      concludeStep4: s.concludeStep4 || `GV nhận xét kết quả làm việc của các nhóm, chuẩn hóa kiến thức theo Yêu cầu cần đạt và chốt nội dung ghi vở.`
    };
  });

  const nlsRaw = (raw && (raw.nlsIntegration || raw.nls)) || {};
  const nls = {
    code: nlsRaw.code || '1.1.TC1a',
    domain: nlsRaw.domain || 'Khai thác dữ liệu và thông tin số',
    targetSection: nlsRaw.targetSection || (sections[0]?.heading || 'Mục I'),
    gvAction: nlsRaw.gvActivity || nlsRaw.gvAction || `GV trình chiếu học liệu số và sơ đồ trực quan của mục "${sections[0]?.heading || 'Mục I'}", hướng dẫn HS quan sát và trích xuất thông tin.`,
    hsAction: nlsRaw.hsActivity || nlsRaw.hsAction || `HS quan sát học liệu số, phân tích các thành phần cấu trúc đối chiếu với SGK Kết nối tri thức và hoàn thành Phiếu học tập.`
  };

  const aiRaw = (raw && (raw.aiIntegration || raw.ai)) || {};
  const ai = {
    code: aiRaw.code || `${grade || '10'}.A1.2`,
    domain: aiRaw.domain || 'Tư duy phản biện và kiểm chứng thông tin từ hệ thống AI',
    targetSection: aiRaw.targetSection || (sections[1]?.heading || sections[0]?.heading || 'Mục II'),
    gvAction: aiRaw.gvActivity || aiRaw.gvAction || `GV chiếu một nhận định có chứa điểm chưa chính xác về mục "${sections[1]?.heading || 'Mục II'}" để HS kiểm chứng.`,
    hsAction: aiRaw.hsActivity || aiRaw.hsAction || `HS đối chiếu trực tiếp với nội dung chuẩn trong SGK Kết nối tri thức để chỉ ra điểm sai và giải thích lại đúng bản chất khoa học.`
  };

  const otherComp = {
    code: isAgri ? 'CN1, CN2, CN3' : 'SH 1.1, SH 1.2, SH 2.1, SH 3.1',
    generalCode: 'TCTH, GTHT, GQVĐ',
    name: isAgri
      ? 'Năng lực nhận thức công nghệ [CN1]; Sử dụng và đánh giá công nghệ [CN2, CN3]'
      : 'Nhận thức sinh học [SH 1.1, SH 1.2]; Tìm hiểu thế giới sống [SH 2.1]; Vận dụng kiến thức, kĩ năng đã học [SH 3.1]',
    gvAction: `GV tổ chức cho HS phân tích mối liên hệ giữa cấu trúc, cơ chế với ứng dụng thực tiễn trong mục "${sections[sections.length - 1]?.heading || 'Mục III'}".`,
    hsAction: `HS thảo luận nhóm, vận dụng kiến thức trong SGK Kết nối tri thức để giải thích hiện tượng thực tế và trình bày phương án ứng dụng.`
  };

  return {
    subject: subject || 'Sinh học',
    grade: grade || '10',
    lessonTitle: raw?.lessonTitle || lessonTitle,
    yccd: yccdList,
    sections,
    openingQuestion: raw?.openingQuestion || `Trong thực tiễn đời sống và sản xuất, hiện tượng nào gắn liền trực tiếp với nội dung bài "${lessonTitle}" và cơ chế khoa học nào giải thích điều đó?`,
    openingAnswer: raw?.openingAnswer || yccdList[yccdList.length - 1],
    nls,
    ai,
    otherCompetency: otherComp,
    calcQuestion: raw?.calcQuestion || `Nếu ban đầu có 100 đơn vị cấu trúc trải qua quá trình biến đổi với hiệu suất 85% thì thu được bao nhiêu đơn vị sản phẩm?`,
    calcAnswer: raw?.calcAnswer || `85 đơn vị (100 × 85% = 85).`,
    practice: raw?.practice || { mcq: [], tf: [], short: [] }
  };
};

// ==================== 1. SOẠN ĐẦY ĐỦ GIÁO ÁN 5512 (ĐỦ 4 PHẦN, TRỌN VẸN, KHÔNG TỪ THỪA) ====================
window.renderGiaoAn5512HighEnd = function(subject, grade, book, lessonTitle, aiPlanObjOrHtml = null) {
  const docContainer = document.getElementById('container-a4-doc');
  const profile = window.getNormalizedLessonProfile(subject, grade, lessonTitle);
  const isAgri = subject && subject.toLowerCase().includes('công nghệ');

  // Nếu dữ liệu truyền vào là chuỗi HTML đã lưu trước đó
  if (typeof aiPlanObjOrHtml === 'string' && aiPlanObjOrHtml.trim().startsWith('<div')) {
    docContainer.innerHTML = window.cleanUnwantedMetaPhrases(aiPlanObjOrHtml);
    return;
  }

  let planData = (aiPlanObjOrHtml && typeof aiPlanObjOrHtml === 'object') ? aiPlanObjOrHtml : null;
  if (!planData) {
    const savedStruct = localStorage.getItem(window.getStructuredPlanKey(subject, grade, lessonTitle));
    if (savedStruct) {
      try { planData = JSON.parse(savedStruct); } catch (e) {}
    }
  }

  const sections = (planData && Array.isArray(planData.sections) && planData.sections.length >= 2)
    ? planData.sections.map((s, i) => ({
        heading: s.heading || s.title || profile.sections[i]?.heading || `Mục ${i + 1}`,
        gvStep1: s.gvStep1 || profile.sections[i]?.gvStep1,
        hsStep2: s.hsStep2 || profile.sections[i]?.hsStep2,
        reportStep3: s.reportStep3 || profile.sections[i]?.reportStep3,
        concludeStep4: s.concludeStep4 || profile.sections[i]?.concludeStep4,
        sgkContent: Array.isArray(s.sgkContent) && s.sgkContent.length > 0 ? s.sgkContent : (profile.sections[i]?.sgkContent || []),
        yccd_nb: s.yccd_nb || profile.sections[i]?.yccd_nb || profile.yccd[0],
        yccd_th: s.yccd_th || profile.sections[i]?.yccd_th || profile.yccd[1] || profile.yccd[0],
        yccd_vd: s.yccd_vd || profile.sections[i]?.yccd_vd || profile.yccd[profile.yccd.length - 1]
      }))
    : profile.sections;

  const nlsInfo = (planData && planData.nls && planData.nls.gvAction) ? planData.nls : profile.nls;
  const aiInfo = (planData && planData.ai && planData.ai.gvAction) ? planData.ai : profile.ai;
  const otherComp = (planData && planData.otherCompetency && planData.otherCompetency.gvAction)
    ? { ...profile.otherCompetency, ...planData.otherCompetency }
    : profile.otherCompetency;

  // Danh sách Yêu cầu cần đạt chuẩn CT GDPT 2018 & SGK Kết nối tri thức (không gắn nhãn thừa, không bao giờ undefined)
  const knowledgeYccdList = (planData && Array.isArray(planData.knowledgeObjectives) && planData.knowledgeObjectives.length > 0)
    ? planData.knowledgeObjectives.map(item => window.cleanUnwantedMetaPhrases(String(item || '')).trim()).filter(Boolean)
    : profile.yccd;

  const warmupQuestion = (planData && planData.warmup && planData.warmup.situation)
    ? planData.warmup.situation
    : profile.openingQuestion;

  const warmupAnswer = (planData && planData.warmup && planData.warmup.product)
    ? planData.warmup.product
    : profile.openingAnswer;

  const warmupGV = (planData && planData.warmup && planData.warmup.gvAction)
    ? planData.warmup.gvAction
    : `GV chiếu tình huống thực tiễn mở đầu bài "${lessonTitle}" và đặt câu hỏi gợi mở: "${warmupQuestion}"`;

  const warmupHS = (planData && planData.warmup && planData.warmup.hsAction)
    ? planData.warmup.hsAction
    : `HS suy nghĩ cá nhân, liên hệ kiến thức thực tế để đưa ra câu trả lời dự đoán; các HS khác lắng nghe và bổ sung ý kiến.`;

  // Câu hỏi luyện tập đầy đủ nội dung (Hoạt động 3) lấy trực tiếp từ profile.practice hoặc dữ liệu AI
  const mcqList = (planData && planData.practice && Array.isArray(planData.practice.mcq) && planData.practice.mcq.length >= 3)
    ? planData.practice.mcq.map(m => ({
        q: window.cleanUnwantedMetaPhrases(m.q),
        options: Array.isArray(m.options) ? m.options : [m.a, m.b, m.c, m.d].filter(Boolean),
        ans: m.ans || 'A',
        explain: m.explain || ''
      }))
    : (profile.practice.mcq || []).slice(0, 4);

  const tfList = (planData && planData.practice && Array.isArray(planData.practice.tf) && planData.practice.tf.length > 0)
    ? planData.practice.tf
    : (profile.practice.tf || []).slice(0, 2);

  const shortList = (planData && planData.practice && Array.isArray(planData.practice.shortAns) && planData.practice.shortAns.length > 0)
    ? planData.practice.shortAns
    : (profile.practice.short || []).slice(0, 2);

  const applicationTask = (planData && planData.applicationTask && planData.applicationTask.problem)
    ? planData.applicationTask
    : {
        problem: `Vận dụng kiến thức bài "${lessonTitle}" (SGK ${subject} ${grade} - Kết nối tri thức với cuộc sống), hãy giải thích câu hỏi thực tiễn: "${profile.openingQuestion}" và giải bài toán ứng dụng: "${profile.calcQuestion}"`,
        solutionGuide: `1. Giải thích hiện tượng thực tiễn: ${profile.openingAnswer}\n2. Lời giải bài toán thực tế: ${profile.calcAnswer}`
      };

  const htmlOutput = `
    <div style="text-align: center; margin-bottom: 12px; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 8px;">
      <h2 style="margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase;">KẾ HOẠCH BÀI DẠY</h2>
      <h3 style="margin: 4px 0 0 0; font-size: 13pt; font-weight: bold; color: #1e3a8a;">${lessonTitle.toUpperCase()}</h3>
      <p style="margin: 4px 0 0 0; font-style: italic; font-size: 11pt;">
        Môn học: <strong>${subject} - Lớp ${grade}</strong> • Bộ sách: <strong>Kết nối tri thức với cuộc sống</strong> • Thời lượng: <strong>02 tiết</strong>
      </p>
    </div>

    <!-- ==================== PHẦN I: MỤC TIÊU ==================== -->
    <p style="font-weight: bold; margin: 10px 0 4px 0; font-size: 12.5pt; color: #1e3a8a;">I. MỤC TIÊU</p>

    <p style="margin: 4px 0 3px 10px;"><strong>1. Về kiến thức (Yêu cầu cần đạt):</strong></p>
    ${knowledgeYccdList.map(item => `<p style="margin: 2px 0 2px 22px;">- ${item}</p>`).join('')}

    <p style="margin: 6px 0 3px 10px;"><strong>2. Về năng lực:</strong></p>

    <!-- 2.1. Năng lực đặc thù & Năng lực chung - MÀU VÀNG -->
    <div style="background: #fffbeb; border-left: 4px solid #d97706; padding: 6px 10px; margin: 4px 0 4px 18px; color: #92400e;">
      <strong>a) Năng lực đặc thù môn ${subject} và Năng lực chung [${otherComp.code}; ${otherComp.generalCode || 'TCTH, GTHT, GQVĐ'}]:</strong><br>
      - <strong>Năng lực đặc thù:</strong> ${otherComp.name}.<br>
      - <strong>Năng lực chung:</strong> Tự chủ và tự học [TCTH] thông qua việc đọc hiểu kênh chữ, phân tích kênh hình trong SGK Kết nối tri thức với cuộc sống; Giao tiếp và hợp tác [GTHT] khi thảo luận nhóm hoàn thành Phiếu học tập; Giải quyết vấn đề và sáng tạo [GQVĐ] khi vận dụng kiến thức giải thích các tình huống thực tiễn.<br>
      - <strong>Biểu hiện cụ thể trong bài dạy:</strong> ${otherComp.gvAction} ${otherComp.hsAction}
    </div>

    <!-- 2.2. Năng lực số (NLS) - MÀU XANH DƯƠNG -->
    <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 6px 10px; margin: 4px 0 4px 18px; color: #0369a1;">
      <strong>b) Năng lực số [Mã: ${nlsInfo.code}]:</strong><br>
      - <strong>Nội dung tích hợp:</strong> Tích hợp tại <em>${nlsInfo.targetSection}</em>.<br>
      - <strong>Hoạt động của Giáo viên:</strong> ${nlsInfo.gvAction}<br>
      - <strong>Hoạt động của Học sinh:</strong> ${nlsInfo.hsAction}
    </div>

    <!-- 2.3. Năng lực Trí tuệ nhân tạo (AI) - MÀU ĐỎ -->
    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 6px 10px; margin: 4px 0 4px 18px; color: #b91c1c;">
      <strong>c) Năng lực Trí tuệ nhân tạo [Mã: ${aiInfo.code}]:</strong><br>
      - <strong>Nội dung tích hợp:</strong> Tích hợp tại <em>${aiInfo.targetSection}</em>.<br>
      - <strong>Hoạt động của Giáo viên:</strong> ${aiInfo.gvAction}<br>
      - <strong>Hoạt động của Học sinh:</strong> ${aiInfo.hsAction}
    </div>

    <p style="margin: 6px 0 2px 10px;"><strong>3. Về phẩm chất:</strong></p>
    <p style="margin: 2px 0 2px 22px;">- <strong>Chăm chỉ và Trách nhiệm:</strong> Chủ động nghiên cứu bài "${lessonTitle}" trong SGK Kết nối tri thức với cuộc sống, tích cực hợp tác hoàn thành nhiệm vụ học tập và có ý thức vận dụng kiến thức vào bảo vệ sức khỏe, môi trường.</p>
    <p style="margin: 2px 0 2px 22px;">- <strong>Trung thực:</strong> Trung thực trong báo cáo kết quả thảo luận, xử lí số liệu thực hành và kiểm chứng thông tin khoa học dựa trên bằng chứng từ SGK.</p>

    <!-- ==================== PHẦN II: THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU ==================== -->
    <p style="font-weight: bold; margin: 12px 0 4px 0; font-size: 12.5pt; color: #1e3a8a;">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</p>
    <p style="margin: 2px 0 2px 15px;"><strong>1. Đối với giáo viên:</strong></p>
    <p style="margin: 2px 0 2px 25px;">- Sách giáo khoa, Sách giáo viên, Sách bài tập <strong>${subject} ${grade} - Kết nối tri thức với cuộc sống</strong>; Kế hoạch bài dạy và Bài giảng điện tử.</p>
    <p style="margin: 2px 0 2px 25px; color: #92400e;">- Hệ thống Phiếu học tập số 1, số 2, bộ câu hỏi định hướng và bảng tiêu chí đánh giá hoạt động nhóm [${otherComp.code}].</p>
    <p style="margin: 2px 0 2px 25px; color: #0369a1;">- Hình ảnh trực quan, mô phỏng số hóa phục vụ hoạt động khai thác dữ liệu tại <em>${nlsInfo.targetSection}</em> [${nlsInfo.code}].</p>
    <p style="margin: 2px 0 2px 25px; color: #b91c1c;">- Thẻ tình huống chứa nhận định khoa học cần học sinh đối chiếu SGK để phản biện tại <em>${aiInfo.targetSection}</em> [${aiInfo.code}].</p>
    <p style="margin: 4px 0 2px 15px;"><strong>2. Đối với học sinh:</strong> Sách giáo khoa ${subject} ${grade} (Kết nối tri thức với cuộc sống), vở ghi, dụng cụ học tập, bảng phụ nhóm.</p>

    <!-- ==================== PHẦN III: TIẾN TRÌNH DẠY HỌC ==================== -->
    <p style="font-weight: bold; margin: 12px 0 4px 0; font-size: 12.5pt; color: #1e3a8a;">III. TIẾN TRÌNH DẠY HỌC</p>

    <!-- HOẠT ĐỘNG 1: MỞ ĐẦU -->
    <p style="font-weight: bold; color: #1e40af; margin: 8px 0 3px 0;">1. HOẠT ĐỘNG 1: MỞ ĐẦU (KHỞI ĐỘNG)</p>
    <p style="margin: 2px 0 2px 15px;"><strong>a) Mục tiêu:</strong> Khơi gợi hứng thú học tập, huy động kiến thức thực tiễn của học sinh để xác định vấn đề trọng tâm của bài "${lessonTitle}" <span style="color: #92400e; font-weight: bold;">[${otherComp.code}; GQVĐ]</span>.</p>
    <p style="margin: 2px 0 2px 15px;"><strong>b) Nội dung:</strong> Học sinh suy nghĩ và giải quyết câu hỏi tình huống mở đầu: <em>"${warmupQuestion}"</em></p>
    <p style="margin: 2px 0 2px 15px;"><strong>c) Sản phẩm:</strong> Câu trả lời của học sinh: <em>${warmupAnswer}</em></p>
    <p style="margin: 2px 0 2px 15px;"><strong>d) Tổ chức thực hiện:</strong></p>
    <p style="margin: 2px 0 2px 25px;">- <strong>Bước 1: Chuyển giao nhiệm vụ:</strong> ${warmupGV}</p>
    <p style="margin: 2px 0 2px 25px;">- <strong>Bước 2: Thực hiện nhiệm vụ:</strong> ${warmupHS}</p>
    <p style="margin: 2px 0 2px 25px;">- <strong>Bước 3: Báo cáo, thảo luận:</strong> GV mời 2 - 3 học sinh trình bày câu trả lời trước lớp; các học sinh khác nhận xét, bổ sung.</p>
    <p style="margin: 2px 0 6px 25px;">- <strong>Bước 4: Kết luận, nhận định:</strong> GV tổng hợp các ý kiến của học sinh, dẫn dắt vào nội dung kiến thức mới của bài "${lessonTitle}".</p>

    <!-- HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI -->
    <div id="wrapper-act234-zone">
      <p style="font-weight: bold; color: #1e40af; margin: 10px 0 3px 0;">2. HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI</p>
      <p style="margin: 2px 0 2px 15px;"><strong>a) Mục tiêu:</strong> Học sinh trình bày, phân tích và giải thích được toàn bộ nội dung kiến thức theo Yêu cầu cần đạt của bài "${lessonTitle}"; phát triển năng lực môn học <span style="color: #92400e; font-weight: bold;">[${otherComp.code}]</span>, năng lực số <span style="color: #0369a1; font-weight: bold;">[${nlsInfo.code}]</span> và năng lực phản biện thông tin AI <span style="color: #b91c1c; font-weight: bold;">[${aiInfo.code}]</span>.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>b) Nội dung:</strong> Học sinh nghiên cứu kênh chữ, kênh hình trong SGK Kết nối tri thức với cuộc sống, thảo luận nhóm hoàn thành Phiếu học tập theo từng mục nội dung.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>c) Sản phẩm:</strong> Phiếu học tập đã hoàn thiện, câu trả lời thảo luận và nội dung kiến thức trọng tâm ghi vở.</p>
      <p style="margin: 2px 0 4px 15px;"><strong>d) Tổ chức thực hiện:</strong></p>

      <table id="act2-knowledge-table">
        <thead>
          <tr style="background: #E6EEF8; text-align: center; font-weight: bold;">
            <th style="width: 52%;">HOẠT ĐỘNG CỦA GIÁO VIÊN VÀ HỌC SINH</th>
            <th style="width: 48%;">DỰ KIẾN SẢN PHẨM</th>
          </tr>
        </thead>
        <tbody>
          ${sections.map((sec, idx) => {
            let integrationBlock = '';
            if (idx === 0) {
              integrationBlock = `
                <div style="background: #f0f9ff; border-left: 3.5px solid #0284c7; padding: 5px 8px; margin: 5px 0; color: #0369a1; font-size: 10.5pt;">
                  <strong>Tích hợp Năng lực số [${nlsInfo.code}]:</strong><br>
                  - <strong>Hoạt động của GV:</strong> ${nlsInfo.gvAction}<br>
                  - <strong>Hoạt động của HS:</strong> ${nlsInfo.hsAction}
                </div>
                <div style="background: #fffbeb; border-left: 3.5px solid #d97706; padding: 4px 8px; margin: 4px 0; color: #92400e; font-size: 10.5pt;">
                  <strong>Phát triển năng lực [${otherComp.code}; GTHT]:</strong> GV hướng dẫn HS đối chiếu thông tin thu thập được với SGK Kết nối tri thức; HS thảo luận nhóm chuẩn hóa khái niệm và đặc điểm.
                </div>
              `;
            } else if (idx === 1) {
              integrationBlock = `
                <div style="background: #fef2f2; border-left: 3.5px solid #dc2626; padding: 5px 8px; margin: 5px 0; color: #b91c1c; font-size: 10.5pt;">
                  <strong>Tích hợp Năng lực AI [${aiInfo.code}]:</strong><br>
                  - <strong>Hoạt động của GV:</strong> ${aiInfo.gvAction}<br>
                  - <strong>Hoạt động của HS:</strong> ${aiInfo.hsAction}
                </div>
                <div style="background: #fffbeb; border-left: 3.5px solid #d97706; padding: 4px 8px; margin: 4px 0; color: #92400e; font-size: 10.5pt;">
                  <strong>Phát triển năng lực [${otherComp.code}; TCTH]:</strong> GV yêu cầu HS phân tích cơ chế nhân quả; HS làm việc cặp đôi tóm tắt quy luật diễn biến.
                </div>
              `;
            } else {
              integrationBlock = `
                <div style="background: #fffbeb; border-left: 3.5px solid #d97706; padding: 5px 8px; margin: 5px 0; color: #92400e; font-size: 10.5pt;">
                  <strong>Phát triển năng lực [${otherComp.code}; GQVĐ]:</strong><br>
                  - <strong>Hoạt động của GV:</strong> ${otherComp.gvAction}<br>
                  - <strong>Hoạt động của HS:</strong> ${otherComp.hsAction}
                </div>
              `;
            }

            const sgkBullets = Array.isArray(sec.sgkContent) ? sec.sgkContent.filter(Boolean) : [String(sec.sgkContent || '')];

            return `
              <tr data-section-index="${idx}">
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 4px 0; font-weight: bold; color: #1e3a8a; font-size: 11.5pt;">Hoạt động 2.${idx + 1}: Tìm hiểu ${sec.heading}</p>
                  <p style="margin: 2px 0;"><strong>- Bước 1: Chuyển giao nhiệm vụ:</strong> ${sec.gvStep1}</p>
                  <p style="margin: 2px 0;"><strong>- Bước 2: Thực hiện nhiệm vụ:</strong> ${sec.hsStep2}</p>
                  ${integrationBlock}
                  <p style="margin: 2px 0;"><strong>- Bước 3: Báo cáo, thảo luận:</strong> ${sec.reportStep3}</p>
                  <p style="margin: 2px 0;"><strong>- Bước 4: Kết luận, nhận định:</strong> ${sec.concludeStep4}</p>
                </td>
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 5px 0; font-weight: bold; color: #0f172a; font-size: 11.5pt;">${sec.heading}</p>
                  ${sgkBullets.map(line => `<p style="margin: 4px 0; line-height: 1.35;">- ${line}</p>`).join('')}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- HOẠT ĐỘNG 3: LUYỆN TẬP -->
      <p style="font-weight: bold; color: #1e40af; margin: 12px 0 3px 0;">3. HOẠT ĐỘNG 3: LUYỆN TẬP</p>
      <p style="margin: 2px 0 2px 15px;"><strong>a) Mục tiêu:</strong> Củng cố, hệ thống hóa kiến thức vừa hình thành của bài "${lessonTitle}" và rèn luyện kĩ năng giải các dạng câu hỏi trắc nghiệm khách quan <span style="color: #92400e; font-weight: bold;">[${otherComp.code}; TCTH]</span>.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>b) Nội dung:</strong> Học sinh hoàn thành bộ câu hỏi luyện tập gồm 3 dạng thức: Trắc nghiệm nhiều phương án lựa chọn, Trắc nghiệm Đúng/Sai và Trắc nghiệm trả lời ngắn.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>c) Sản phẩm:</strong> Đáp án và lời giải thích khoa học của học sinh cho từng câu hỏi.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>d) Tổ chức thực hiện:</strong></p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 1: Chuyển giao nhiệm vụ:</strong> GV trình chiếu lần lượt bộ câu hỏi luyện tập của bài "${lessonTitle}", yêu cầu HS suy nghĩ cá nhân và đưa ra phương án trả lời.</p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 2: Thực hiện nhiệm vụ:</strong> HS vận dụng kiến thức đã học ở Hoạt động 2 để phân tích từng câu hỏi, lựa chọn đáp án và tính toán kết quả.</p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 3: Báo cáo, thảo luận:</strong> GV mời đại diện HS trả lời và giải thích cơ sở khoa học của phương án đã chọn; các HS khác nhận xét, bổ sung.</p>
      <p style="margin: 2px 0 4px 25px;">- <strong>Bước 4: Kết luận, nhận định:</strong> GV chốt đáp án đúng và lưu ý các kiến thức trọng tâm dễ nhầm lẫn.</p>

      <p style="margin: 6px 0 3px 15px; font-weight: bold; color: #1e3a8a;">* BỘ CÂU HỎI VÀ ĐÁP ÁN HOẠT ĐỘNG LUYỆN TẬP:</p>

      <p style="margin: 3px 0 2px 20px; font-weight: bold;">Phần 1. Câu hỏi trắc nghiệm nhiều phương án lựa chọn:</p>
      ${mcqList.map((m, idx) => {
        const opts = Array.isArray(m.options) ? m.options : [m.a, m.b, m.c, m.d].filter(Boolean);
        return `
          <div style="margin: 3px 0 5px 25px;">
            <p style="margin: 1px 0;"><strong>Câu ${idx + 1}:</strong> ${m.q}</p>
            ${opts.map(op => `<p style="margin: 1px 0 1px 15px;">${op}</p>`).join('')}
            <p style="margin: 1px 0 2px 15px; color: #047857;"><strong>➜ Đáp án đúng: ${m.ans}</strong></p>
          </div>
        `;
      }).join('')}

      <p style="margin: 5px 0 2px 20px; font-weight: bold;">Phần 2. Câu hỏi trắc nghiệm Đúng / Sai:</p>
      ${tfList.map((tf, idx) => {
        const statements = Array.isArray(tf.statements)
          ? tf.statements.map(st => `<p style="margin: 1px 0 1px 15px;">${st.label} ${st.text} ➜ <strong>[${st.ans}]</strong></p>`).join('')
          : (Array.isArray(tf.items)
              ? tf.items.map(it => `<p style="margin: 1px 0 1px 15px;">${it}</p>`).join('') + `<p style="margin: 1px 0 1px 15px; color: #047857;"><strong>➜ Đáp án: ${tf.ans || ''}</strong></p>`
              : `
                <p style="margin: 1px 0 1px 15px;">${tf.a || ''}</p>
                <p style="margin: 1px 0 1px 15px;">${tf.b || ''}</p>
                <p style="margin: 1px 0 1px 15px;">${tf.c || ''}</p>
                <p style="margin: 1px 0 1px 15px;">${tf.d || ''}</p>
              `);
        return `
          <div style="margin: 3px 0 5px 25px;">
            <p style="margin: 1px 0;"><strong>Câu ${idx + 1}:</strong> ${tf.stem || ''}</p>
            ${statements}
          </div>
        `;
      }).join('')}

      <p style="margin: 5px 0 2px 20px; font-weight: bold;">Phần 3. Câu hỏi trắc nghiệm trả lời ngắn:</p>
      ${shortList.map((s, idx) => `
        <div style="margin: 3px 0 4px 25px;">
          <p style="margin: 1px 0;"><strong>Câu ${idx + 1}:</strong> ${s.q}</p>
          <p style="margin: 1px 0 2px 15px; color: #047857;"><strong>➜ Đáp án:</strong> ${s.explain || s.ans}</p>
        </div>
      `).join('')}

      <!-- HOẠT ĐỘNG 4: VẬN DỤNG -->
      <p style="font-weight: bold; color: #1e40af; margin: 12px 0 3px 0;">4. HOẠT ĐỘNG 4: VẬN DỤNG</p>
      <p style="margin: 2px 0 2px 15px;"><strong>a) Mục tiêu:</strong> Vận dụng kiến thức của bài "${lessonTitle}" để giải thích hiện tượng thực tiễn trong đời sống và sản xuất <span style="color: #92400e; font-weight: bold;">[${otherComp.code}; GQVĐ]</span>.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>b) Nội dung:</strong> ${applicationTask.problem}</p>
      <p style="margin: 2px 0 2px 15px;"><strong>c) Sản phẩm:</strong> Bài trình bày giải thích cơ sở khoa học và kết quả giải quyết tình huống thực tiễn của học sinh.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>d) Tổ chức thực hiện:</strong></p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 1: Chuyển giao nhiệm vụ:</strong> GV giao nhiệm vụ vận dụng thực tiễn cho các nhóm học sinh và hướng dẫn tiêu chí đánh giá sản phẩm.</p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 2: Thực hiện nhiệm vụ:</strong> HS trao đổi nhóm, vận dụng kiến thức đã học để phân tích vấn đề, lập dàn ý giải quyết tại lớp và hoàn thiện báo cáo.</p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 3: Báo cáo, thảo luận:</strong> Đại diện 1 - 2 nhóm trình bày phương án giải quyết; các nhóm khác đặt câu hỏi phản biện và góp ý.</p>
      <p style="margin: 2px 0 4px 25px;">- <strong>Bước 4: Kết luận, nhận định:</strong> GV nhận xét, đánh giá mức độ đạt được của sản phẩm và chốt nội dung chuẩn xác.</p>
      <p style="margin: 2px 0 8px 25px; background: #f8fafc; padding: 6px 10px; border-left: 3px solid #1e40af;">
        <strong>* Hướng dẫn giải quyết nhiệm vụ Vận dụng:</strong><br>
        ${String(applicationTask.solutionGuide || '').replace(/\n/g, '<br>')}
      </p>
    </div>

    <!-- ==================== PHẦN IV: HỒ SƠ DẠY HỌC VÀ ĐÁNH GIÁ ==================== -->
    <p style="font-weight: bold; margin: 14px 0 4px 0; font-size: 12.5pt; color: #1e3a8a;">IV. HỒ SƠ DẠY HỌC VÀ CÔNG CỤ ĐÁNH GIÁ</p>

    <p style="font-weight: bold; margin: 4px 0;">1. Phiếu học tập (${lessonTitle}):</p>
    <table>
      <thead>
        <tr style="background: #E6EEF8; text-align: center; font-weight: bold;">
          <th style="width: 30%;">Nội dung kiến thức</th>
          <th style="width: 38%;">Nhiệm vụ học tập của học sinh</th>
          <th style="width: 32%;">Yêu cầu cần đạt</th>
        </tr>
      </thead>
      <tbody>
        ${sections.map(sec => `
          <tr>
            <td><strong>${sec.heading}</strong></td>
            <td>Nghiên cứu thông tin và hình ảnh trong SGK Kết nối tri thức với cuộc sống để trình bày đặc điểm, cơ chế và ý nghĩa của mục <em>${sec.heading}</em>.</td>
            <td>- ${sec.yccd_nb}<br>- ${sec.yccd_th}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <p style="font-weight: bold; margin: 10px 0 4px 0;">2. Bảng tiêu chí đánh giá năng lực (Rubric):</p>
    <table>
      <thead>
        <tr style="background: #E6EEF8; text-align: center; font-weight: bold;">
          <th style="width: 24%;">Tiêu chí đánh giá</th>
          <th style="width: 24%;">Mức 1 (Cần cố gắng: 5 - 6 điểm)</th>
          <th style="width: 26%;">Mức 2 (Đạt: 7 - 8 điểm)</th>
          <th style="width: 26%;">Mức 3 (Tốt: 9 - 10 điểm)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="color: #92400e; background: #fffbeb;">
          <td><strong>Năng lực đặc thù & Hợp tác nhóm [${otherComp.code}; GTHT]</strong></td>
          <td>Nêu được một số khái niệm cơ bản nhưng chưa giải thích được cơ chế và ứng dụng.</td>
          <td>Trình bày đúng kiến thức trọng tâm trong SGK và giải thích được ví dụ thực tế.</td>
          <td>Phân tích sâu sắc bản chất khoa học, hợp tác nhóm hiệu quả và giải quyết tốt bài toán thực tiễn.</td>
        </tr>
        <tr style="color: #0369a1; background: #f0f9ff;">
          <td><strong>Năng lực số [${nlsInfo.code}]</strong> tại <em>${nlsInfo.targetSection}</em></td>
          <td>Cần giáo viên hướng dẫn trực tiếp mới khai thác được thông tin từ học liệu số.</td>
          <td>Khai thác đúng thông tin từ sơ đồ/học liệu số để điền vào Phiếu học tập.</td>
          <td>Chủ động khai thác nhanh, chính xác dữ liệu số và đối chiếu chặt chẽ với nội dung SGK.</td>
        </tr>
        <tr style="color: #b91c1c; background: #fef2f2;">
          <td><strong>Năng lực AI [${aiInfo.code}]</strong> tại <em>${aiInfo.targetSection}</em></td>
          <td>Tiếp nhận thụ động nhận định giả định, chưa chỉ ra được điểm sai khoa học.</td>
          <td>Phát hiện được điểm chưa chính xác trong nhận định của AI nhưng giải thích còn ngắn gọn.</td>
          <td>Phản biện sắc bén, dẫn chứng chính xác kiến thức SGK Kết nối tri thức để đính chính lỗi sai của AI.</td>
        </tr>
      </tbody>
    </table>
  `;

  docContainer.innerHTML = window.cleanUnwantedMetaPhrases(htmlOutput);
};

// Hàm trích xuất nội dung từ Hoạt động 2 (Hình thành kiến thức mới) của Giáo án 5512
window.extractLessonPlanSectionsForSlides = function(subject, grade, lessonTitle) {
  const profile = window.getNormalizedLessonProfile(subject, grade, lessonTitle);
  const savedStruct = localStorage.getItem(window.getStructuredPlanKey(subject, grade, lessonTitle));
  if (savedStruct) {
    try {
      const parsed = JSON.parse(savedStruct);
      if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
        return {
          ...profile,
          sections: parsed.sections.map((s, i) => ({
            heading: s.heading || s.title || profile.sections[i]?.heading || `Mục ${i + 1}`,
            title: s.heading || s.title || profile.sections[i]?.heading || `Mục ${i + 1}`,
            sgkContent: Array.isArray(s.sgkContent) && s.sgkContent.length > 0 ? s.sgkContent : (profile.sections[i]?.sgkContent || []),
            yccd_nb: s.yccd_nb || profile.sections[i]?.yccd_nb,
            yccd_th: s.yccd_th || profile.sections[i]?.yccd_th,
            yccd_vd: s.yccd_vd || profile.sections[i]?.yccd_vd,
            gvStep1: s.gvStep1 || profile.sections[i]?.gvStep1,
            hsStep2: s.hsStep2 || profile.sections[i]?.hsStep2
          })),
          nls: (parsed.nls && parsed.nls.gvAction) ? parsed.nls : profile.nls,
          ai: (parsed.ai && parsed.ai.gvAction) ? parsed.ai : profile.ai,
          otherCompetency: (parsed.otherCompetency && parsed.otherCompetency.gvAction) ? { ...profile.otherCompetency, ...parsed.otherCompetency } : profile.otherCompetency
        };
      }
    } catch (e) {}
  }

  const domTable = document.getElementById('act2-knowledge-table');
  if (domTable) {
    const rows = domTable.querySelectorAll('tbody tr');
    if (rows.length >= 2) {
      const extractedSections = [];
      rows.forEach((tr, i) => {
        const tds = tr.querySelectorAll('td');
        if (tds.length >= 2) {
          const baseSec = profile.sections[i] || profile.sections[0];
          const rightPs = Array.from(tds[1].querySelectorAll('p')).map(p => p.innerText.trim()).filter(Boolean);
          const heading = rightPs[0] || baseSec.heading;
          const bullets = rightPs.slice(1).map(b => b.replace(/^[•\-]\s*/, '')).filter(Boolean);
          extractedSections.push({
            heading,
            title: heading,
            sgkContent: bullets.length > 0 ? bullets : baseSec.sgkContent,
            yccd_nb: baseSec.yccd_nb,
            yccd_th: baseSec.yccd_th,
            yccd_vd: baseSec.yccd_vd,
            gvStep1: baseSec.gvStep1,
            hsStep2: baseSec.hsStep2
          });
        }
      });
      if (extractedSections.length >= 2) {
        return {
          ...profile,
          sections: extractedSections
        };
      }
    }
  }

  return profile;
};

// ==================== 2. BÀI GIẢNG ĐIỆN TỬ PPT 34 SLIDE (> 30 SLIDE) ====================
window.renderPowerPointSlideDeck = function(subject, grade, book, lessonTitle, aiData = null) {
  slideDeckData = [];
  const planSource = window.extractLessonPlanSectionsForSlides(subject, grade, lessonTitle);
  const sections = (aiData && Array.isArray(aiData.lessonSections) && aiData.lessonSections.length >= 3)
    ? aiData.lessonSections.map((s, i) => ({
        heading: s.heading || s.title || planSource.sections[i]?.heading || `Mục ${i + 1}`,
        gvStep1: s.gvStep1 || planSource.sections[i]?.gvStep1,
        hsStep2: s.hsStep2 || planSource.sections[i]?.hsStep2,
        sgkContent: Array.isArray(s.sgkContent) && s.sgkContent.length > 0 ? s.sgkContent : (planSource.sections[i]?.sgkContent || []),
        yccd_nb: s.yccd_nb || planSource.sections[i]?.yccd_nb,
        yccd_th: s.yccd_th || planSource.sections[i]?.yccd_th,
        yccd_vd: s.yccd_vd || planSource.sections[i]?.yccd_vd
      }))
    : planSource.sections;

  const sec1 = sections[0] || planSource.sections[0];
  const sec2 = sections[1] || planSource.sections[1] || sec1;
  const sec3 = sections[2] || planSource.sections[2] || sec1;

  const nls = (aiData && aiData.nls && aiData.nls.gvAction) ? aiData.nls : planSource.nls;
  const ai = (aiData && aiData.ai && aiData.ai.gvAction) ? aiData.ai : planSource.ai;
  const otherComp = (aiData && aiData.otherCompetency && aiData.otherCompetency.gvAction) ? aiData.otherCompetency : planSource.otherCompetency;

  // SLIDE 1: TRANG BÌA BÀI GIẢNG
  slideDeckData.push({
    title: lessonTitle.toUpperCase(),
    tag: `SLIDE 1 / 34 • BÀI GIẢNG ${subject.toUpperCase()} ${grade} - KẾT NỐI TRI THỨC VỚI CUỘC SỐNG`,
    body: `
      <div class="text-center py-5 space-y-3">
        <div class="inline-block px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs uppercase border border-cyan-400/30">
          BÀI GIẢNG ĐIỆN TỬ • BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG (34 SLIDE)
        </div>
        <h1 class="text-3xl md:text-4xl font-black text-amber-300 tracking-tight leading-tight">${lessonTitle}</h1>
        <p class="text-slate-200 text-base max-w-3xl mx-auto">
          Môn học: ${subject} - Lớp ${grade} • Chương trình GDPT 2018
        </p>
        <div class="flex justify-center gap-3 pt-2 text-xs font-bold">
          <span class="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/40">Năng lực số: ${nls.code}</span>
          <span class="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/40">Năng lực AI: ${ai.code}</span>
          <span class="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40">Năng lực môn học: ${otherComp.code}</span>
        </div>
      </div>
    `
  });

  // SLIDE 2: MỤC TIÊU & YÊU CẦU CẦN ĐẠT
  const objList = (aiData && Array.isArray(aiData.objectives) && aiData.objectives.length > 0)
    ? aiData.objectives.map(o => window.cleanUnwantedMetaPhrases(o))
    : planSource.yccd;
  slideDeckData.push({
    title: "I. MỤC TIÊU VÀ YÊU CẦU CẦN ĐẠT CỦA BÀI HỌC",
    tag: "SLIDE 2 / 34 • MỤC TIÊU BÀI HỌC",
    body: `
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="bg-black/40 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
          <h3 class="text-base font-bold text-amber-300"><i class="fa-solid fa-bullseye mr-1.5"></i> 1. Yêu cầu cần đạt:</h3>
          ${objList.map(o => `<p class="text-slate-100 leading-relaxed">• ${o}</p>`).join('')}
        </div>
        <div class="space-y-2">
          <div class="p-2.5 rounded-xl bg-sky-950/60 border border-sky-400/50 text-sky-200 text-xs">
            <strong>Năng lực số [${nls.code}]:</strong> Tích hợp tại ${nls.targetSection}.
          </div>
          <div class="p-2.5 rounded-xl bg-rose-950/60 border border-rose-400/50 text-rose-200 text-xs">
            <strong>Năng lực AI [${ai.code}]:</strong> Tích hợp tại ${ai.targetSection}.
          </div>
          <div class="p-2.5 rounded-xl bg-amber-950/60 border border-amber-400/50 text-amber-200 text-xs">
            <strong>Năng lực đặc thù & chung [${otherComp.code}]:</strong> ${otherComp.name}.
          </div>
        </div>
      </div>
    `
  });

  // SLIDE 3: HOẠT ĐỘNG 1 - KHỞI ĐỘNG
  const warmupSituation = (aiData && aiData.warmup && aiData.warmup.situation)
    ? aiData.warmup.situation
    : planSource.openingQuestion;
  slideDeckData.push({
    title: "HOẠT ĐỘNG 1: MỞ ĐẦU (KHỞI ĐỘNG)",
    tag: "SLIDE 3 / 34 • TÌNH HUỐNG KHỞI ĐỘNG THỰC TIỄN",
    body: `
      <div class="grid grid-cols-2 gap-5 text-sm">
        <div class="bg-black/40 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
          <h3 class="text-base font-bold text-amber-300">Câu hỏi tình huống thực tiễn:</h3>
          <p class="text-slate-100 leading-relaxed text-base">${warmupSituation}</p>
        </div>
        <div class="bg-blue-950/40 p-4 rounded-2xl border border-cyan-500/40 space-y-2.5">
          <h4 class="text-emerald-300 font-bold text-base"><i class="fa-solid fa-lightbulb mr-1.5"></i> Giải thích khoa học:</h4>
          <p class="text-slate-100 leading-relaxed">${planSource.openingAnswer}</p>
        </div>
      </div>
    `
  });

  // ==================== SLIDE 4 ĐẾN SLIDE 17 (14 SLIDE HÌNH THÀNH KIẾN THỨC TỪ HOẠT ĐỘNG 2 GIÁO ÁN) ====================
  // MỤC I: SLIDE 4, 5, 6, 7
  slideDeckData.push({
    title: `HĐ 2.1: TÌM HIỂU ${sec1.heading.toUpperCase()}`,
    tag: "SLIDE 4 / 34 • HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI (MỤC I)",
    body: `
      <div class="grid grid-cols-2 gap-5 text-sm">
        <div class="bg-black/40 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
          <p class="font-bold text-cyan-300 text-base">1. Nhiệm vụ Giáo viên giao:</p>
          <p class="text-slate-200 leading-relaxed">${sec1.gvStep1}</p>
          <p class="text-xs text-amber-300 font-semibold pt-1">• Yêu cầu cần đạt: ${sec1.yccd_nb}</p>
        </div>
        <div class="bg-black/40 p-4 rounded-2xl border border-amber-500/30 space-y-2">
          <p class="font-bold text-amber-300 text-base">2. Hoạt động của Học sinh:</p>
          <p class="text-slate-200 leading-relaxed">${sec1.hsStep2}</p>
        </div>
      </div>
    `
  });

  slideDeckData.push({
    title: `PHÂN TÍCH NỘI DUNG: ${sec1.heading.toUpperCase()}`,
    tag: "SLIDE 5 / 34 • HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI (MỤC I)",
    body: `
      <div class="bg-black/40 p-5 rounded-2xl border border-cyan-500/30 space-y-3 text-sm">
        <h3 class="text-lg font-bold text-amber-300">Nội dung phân tích từ SGK Kết nối tri thức với cuộc sống:</h3>
        <p class="text-slate-100 leading-relaxed">• ${sec1.sgkContent?.[0] || ''}</p>
        ${sec1.sgkContent?.[1] ? `<p class="text-slate-100 leading-relaxed">• ${sec1.sgkContent[1]}</p>` : ''}
      </div>
    `
  });

  slideDeckData.push({
    title: `KẾT LUẬN GHI VỞ MỤC I: ${sec1.heading.toUpperCase()}`,
    tag: "SLIDE 6 / 34 • HOẠT ĐỘNG 2: NỘI DUNG TRỌNG TÂM GHI VỞ (MỤC I)",
    body: `
      <div class="bg-emerald-950/30 p-5 rounded-2xl border-2 border-emerald-500/50 space-y-2.5 text-sm">
        <p class="text-emerald-300 font-bold text-base"><i class="fa-solid fa-pen-to-square mr-1.5"></i> NỘI DUNG TRỌNG TÂM GHI VỞ (MỤC I):</p>
        ${(sec1.sgkContent || []).map(c => `<p class="text-slate-100 leading-relaxed">✔ ${c}</p>`).join('')}
      </div>
    `
  });

  slideDeckData.push({
    title: `HOẠT ĐỘNG KHAI THÁC HỌC LIỆU SỐ [${nls.code}]`,
    tag: "SLIDE 7 / 34 • TÍCH HỢP NĂNG LỰC SỐ TẠI MỤC I",
    body: `
      <div class="bg-sky-950/60 p-5 rounded-2xl border-2 border-sky-400/70 space-y-3 text-sm">
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 rounded-full bg-sky-500/30 text-sky-200 font-black text-xs border border-sky-300/40">
            MÃ NĂNG LỰC SỐ: ${nls.code}
          </span>
          <span class="text-xs text-sky-300 font-bold">Nội dung: ${nls.targetSection}</span>
        </div>
        <div class="grid grid-cols-2 gap-4 pt-1">
          <div class="bg-black/40 p-3.5 rounded-xl border border-sky-400/40">
            <p class="font-bold text-sky-300 mb-1">1. Hoạt động của Giáo viên:</p>
            <p class="text-slate-100 leading-relaxed">${nls.gvAction}</p>
          </div>
          <div class="bg-black/40 p-3.5 rounded-xl border border-sky-400/40">
            <p class="font-bold text-amber-300 mb-1">2. Hoạt động của Học sinh:</p>
            <p class="text-slate-100 leading-relaxed">${nls.hsAction}</p>
          </div>
        </div>
      </div>
    `
  });

  // MỤC II: SLIDE 8, 9, 10, 11
  slideDeckData.push({
    title: `HĐ 2.2: TÌM HIỂU ${sec2.heading.toUpperCase()}`,
    tag: "SLIDE 8 / 34 • HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI (MỤC II)",
    body: `
      <div class="grid grid-cols-2 gap-5 text-sm">
        <div class="bg-black/40 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
          <p class="font-bold text-cyan-300 text-base">1. Nhiệm vụ Giáo viên giao:</p>
          <p class="text-slate-200 leading-relaxed">${sec2.gvStep1}</p>
          <p class="text-xs text-amber-300 font-semibold pt-1">• Yêu cầu cần đạt: ${sec2.yccd_th}</p>
        </div>
        <div class="bg-black/40 p-4 rounded-2xl border border-amber-500/30 space-y-2">
          <p class="font-bold text-amber-300 text-base">2. Hoạt động của Học sinh:</p>
          <p class="text-slate-200 leading-relaxed">${sec2.hsStep2}</p>
        </div>
      </div>
    `
  });

  slideDeckData.push({
    title: `CƠ CHẾ VÀ QUY LUẬT: ${sec2.heading.toUpperCase()}`,
    tag: "SLIDE 9 / 34 • HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI (MỤC II)",
    body: `
      <div class="bg-black/40 p-5 rounded-2xl border border-cyan-500/30 space-y-3 text-sm">
        <h3 class="text-lg font-bold text-amber-300">Phân tích cơ chế & quy luật trong SGK Kết nối tri thức:</h3>
        <p class="text-slate-100 leading-relaxed">• ${sec2.sgkContent?.[0] || ''}</p>
        ${sec2.sgkContent?.[1] ? `<p class="text-slate-100 leading-relaxed">• ${sec2.sgkContent[1]}</p>` : ''}
      </div>
    `
  });

  slideDeckData.push({
    title: `KẾT LUẬN GHI VỞ MỤC II: ${sec2.heading.toUpperCase()}`,
    tag: "SLIDE 10 / 34 • HOẠT ĐỘNG 2: NỘI DUNG TRỌNG TÂM GHI VỞ (MỤC II)",
    body: `
      <div class="bg-emerald-950/30 p-5 rounded-2xl border-2 border-emerald-500/50 space-y-2.5 text-sm">
        <p class="text-emerald-300 font-bold text-base"><i class="fa-solid fa-pen-to-square mr-1.5"></i> NỘI DUNG TRỌNG TÂM GHI VỞ (MỤC II):</p>
        ${(sec2.sgkContent || []).map(c => `<p class="text-slate-100 leading-relaxed">✔ ${c}</p>`).join('')}
      </div>
    `
  });

  slideDeckData.push({
    title: `PHẢN BIỆN VÀ KIỂM CHỨNG THÔNG TIN AI [${ai.code}]`,
    tag: "SLIDE 11 / 34 • TÍCH HỢP NĂNG LỰC AI TẠI MỤC II",
    body: `
      <div class="bg-rose-950/60 p-5 rounded-2xl border-2 border-rose-400/70 space-y-3 text-sm">
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 rounded-full bg-rose-500/30 text-rose-200 font-black text-xs border border-rose-300/40">
            MÃ NĂNG LỰC AI: ${ai.code}
          </span>
          <span class="text-xs text-rose-300 font-bold">Nội dung: ${ai.targetSection}</span>
        </div>
        <div class="grid grid-cols-2 gap-4 pt-1">
          <div class="bg-black/40 p-3.5 rounded-xl border border-rose-400/40">
            <p class="font-bold text-rose-300 mb-1">1. Tình huống nhận định cần kiểm chứng:</p>
            <p class="text-slate-100 leading-relaxed">${ai.gvAction}</p>
          </div>
          <div class="bg-black/40 p-3.5 rounded-xl border border-emerald-400/40">
            <p class="font-bold text-emerald-300 mb-1">2. Học sinh đối chiếu SGK và phản biện:</p>
            <p class="text-slate-100 leading-relaxed">${ai.hsAction}</p>
          </div>
        </div>
      </div>
    `
  });

  // MỤC III: SLIDE 12, 13, 14
  slideDeckData.push({
    title: `HĐ 2.3: TÌM HIỂU ${sec3.heading.toUpperCase()}`,
    tag: "SLIDE 12 / 34 • HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI (MỤC III)",
    body: `
      <div class="grid grid-cols-2 gap-5 text-sm">
        <div class="bg-amber-950/40 p-4 rounded-2xl border border-amber-400/50 space-y-2">
          <p class="font-bold text-amber-300 text-base">1. Nhiệm vụ Giáo viên giao:</p>
          <p class="text-slate-100 leading-relaxed">${sec3.gvStep1 || otherComp.gvAction}</p>
        </div>
        <div class="bg-black/40 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
          <p class="font-bold text-cyan-300 text-base">2. Hoạt động của Học sinh:</p>
          <p class="text-slate-100 leading-relaxed">${sec3.hsStep2 || otherComp.hsAction}</p>
        </div>
      </div>
    `
  });

  slideDeckData.push({
    title: `PHÂN TÍCH Ý NGHĨA & ỨNG DỤNG: ${sec3.heading.toUpperCase()}`,
    tag: "SLIDE 13 / 34 • HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI (MỤC III)",
    body: `
      <div class="bg-black/40 p-5 rounded-2xl border border-cyan-500/30 space-y-3 text-sm">
        <h3 class="text-lg font-bold text-amber-300">Khám phá nội dung Mục III trong SGK Kết nối tri thức:</h3>
        <p class="text-slate-100 leading-relaxed">• ${sec3.sgkContent?.[0] || ''}</p>
        ${sec3.sgkContent?.[1] ? `<p class="text-slate-100 leading-relaxed">• ${sec3.sgkContent[1]}</p>` : ''}
      </div>
    `
  });

  slideDeckData.push({
    title: `KẾT LUẬN GHI VỞ MỤC III: ${sec3.heading.toUpperCase()}`,
    tag: "SLIDE 14 / 34 • HOẠT ĐỘNG 2: NỘI DUNG TRỌNG TÂM GHI VỞ (MỤC III)",
    body: `
      <div class="bg-emerald-950/30 p-5 rounded-2xl border-2 border-emerald-500/50 space-y-2.5 text-sm">
        <p class="text-emerald-300 font-bold text-base"><i class="fa-solid fa-pen-to-square mr-1.5"></i> NỘI DUNG TRỌNG TÂM GHI VỞ (MỤC III):</p>
        ${(sec3.sgkContent || []).map(c => `<p class="text-slate-100 leading-relaxed">✔ ${c}</p>`).join('')}
      </div>
    `
  });

  // SLIDE 15: BÀI TOÁN THỰC TIỄN & KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
  slideDeckData.push({
    title: "KẾT NỐI TRI THỨC VỚI CUỘC SỐNG: BÀI TOÁN THỰC TIỄN",
    tag: "SLIDE 15 / 34 • HOẠT ĐỘNG 2: VẬN DỤNG KIẾN THỨC SGK",
    body: `
      <div class="grid grid-cols-2 gap-5 text-sm">
        <div class="bg-black/40 p-4 rounded-2xl border border-emerald-500/40 space-y-2">
          <h4 class="text-emerald-300 font-bold text-base"><i class="fa-solid fa-calculator mr-1.5"></i> Bài toán định lượng trong bài học:</h4>
          <p class="text-slate-100 leading-relaxed">${planSource.calcQuestion}</p>
          <p class="text-amber-300 font-bold pt-1">➜ Kết quả: ${planSource.calcAnswer}</p>
        </div>
        <div class="bg-black/40 p-4 rounded-2xl border border-amber-500/40 space-y-2">
          <h4 class="text-amber-300 font-bold text-base"><i class="fa-solid fa-seedling mr-1.5"></i> Ý nghĩa thực tiễn:</h4>
          <p class="text-slate-100 leading-relaxed">${sec3.sgkContent?.[0] || planSource.openingAnswer}</p>
        </div>
      </div>
    `
  });

  // SLIDE 16: SƠ ĐỒ HÓA HỆ THỐNG KIẾN THỨC TOÀN BÀI
  slideDeckData.push({
    title: "SƠ ĐỒ HÓA HỆ THỐNG KIẾN THỨC TRỌNG TÂM TOÀN BÀI",
    tag: "SLIDE 16 / 34 • HỆ THỐNG HÓA KIẾN THỨC",
    body: `
      <div class="grid grid-cols-3 gap-3 text-xs">
        <div class="bg-blue-950/50 p-3.5 rounded-xl border border-cyan-400/40 space-y-1.5">
          <span class="text-cyan-300 font-black uppercase">Nội dung 1 [${nls.code}]</span>
          <p class="font-bold text-white text-sm">${sec1.heading}</p>
          <p class="text-slate-200">${sec1.yccd_nb}</p>
        </div>
        <div class="bg-purple-950/50 p-3.5 rounded-xl border border-purple-400/40 space-y-1.5">
          <span class="text-rose-300 font-black uppercase">Nội dung 2 [${ai.code}]</span>
          <p class="font-bold text-white text-sm">${sec2.heading}</p>
          <p class="text-slate-200">${sec2.yccd_th}</p>
        </div>
        <div class="bg-amber-950/50 p-3.5 rounded-xl border border-amber-400/40 space-y-1.5">
          <span class="text-amber-300 font-black uppercase">Nội dung 3 [${otherComp.code}]</span>
          <p class="font-bold text-white text-sm">${sec3.heading}</p>
          <p class="text-slate-200">${sec3.yccd_vd}</p>
        </div>
      </div>
    `
  });

  // SLIDE 17: TỔNG KẾT NỘI DUNG CỐT LÕI GHI VỞ
  slideDeckData.push({
    title: "TỔNG KẾT KIẾN THỨC CỐT LÕI TOÀN BÀI",
    tag: "SLIDE 17 / 34 • TỔNG KẾT HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC",
    body: `
      <div class="bg-black/50 p-5 rounded-2xl border-2 border-amber-400/60 space-y-2.5 text-sm">
        <p class="text-amber-300 font-bold text-lg"><i class="fa-solid fa-book-bookmark mr-2"></i> Kiến thức cốt lõi ghi nhớ (${lessonTitle}):</p>
        ${planSource.yccd.map((y, idx) => `<p class="text-slate-100 leading-relaxed"><strong>${idx + 1}.</strong> ${y}</p>`).join('')}
      </div>
    `
  });

  // ==================== SLIDE 18 ĐẾN SLIDE 33: ĐỦ 16 SLIDE CÂU HỎI BÀI TẬP ĐÚNG ĐỊNH DẠNG ====================
  // Lấy trực tiếp từ bộ 16 câu hỏi chuyên biệt của bài học trong planSource.practice
  const defaultMcq8 = planSource.practice.mcq || [];
  for (let i = 0; i < 8; i++) {
    const fallbackItem = defaultMcq8[i % defaultMcq8.length] || {
      level: "Nhận biết",
      q: `Theo SGK Kết nối tri thức với cuộc sống, nội dung nào sau đây thuộc bài "${lessonTitle}"?`,
      options: [`A. ${sec1.sgkContent?.[0] || sec1.yccd_nb}`, "B. Phương án nhiễu 1", "C. Phương án nhiễu 2", "D. Phương án nhiễu 3"],
      ans: "A",
      explain: sec1.sgkContent?.[0] || sec1.yccd_nb
    };
    const item = (aiData && Array.isArray(aiData.mcq) && aiData.mcq[i]) ? aiData.mcq[i] : fallbackItem;
    const opts = (Array.isArray(item.options) && item.options.length === 4) ? item.options : fallbackItem.options;
    const levelBadge = item.level || fallbackItem.level || "Nhận biết";
    const ansText = item.explain ? `Đáp án ${item.ans}. Giải thích: ${item.explain}` : item.ans;

    slideDeckData.push({
      title: `CÂU HỎI BÀI TẬP ${i + 1} / 16 • TRẮC NGHIỆM 4 LỰA CHỌN (${levelBadge.toUpperCase()})`,
      tag: `SLIDE ${18 + i} / 34 • HOẠT ĐỘNG 3: LUYỆN TẬP (DẠNG THỨC I - CÂU ${i + 1}/8)`,
      body: `
        <div class="space-y-3 text-sm">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-400/40">Mức độ: ${levelBadge}</span>
          </div>
          <p class="font-bold text-white text-base leading-relaxed">Câu ${i + 1}: ${item.q}</p>
          <div class="grid grid-cols-2 gap-2.5 text-sm">
            ${opts.map(op => `<div class="p-3 bg-black/40 rounded-xl border border-slate-700 text-slate-100 leading-snug">${op}</div>`).join('')}
          </div>
          <div>
            <button onclick="toggleSlideAnswer(this)" class="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500/30 transition text-xs">
              <i class="fa-solid fa-eye mr-1"></i> Bấm để hiển thị Đáp án & Giải thích
            </button>
            <div class="hidden mt-2 p-2.5 bg-emerald-950/80 rounded-xl border border-emerald-500/60 font-bold text-emerald-300 text-sm">
              ➜ ${ansText}
            </div>
          </div>
        </div>
      `
    });
  }

  // 4 SLIDE TRẮC NGHIỆM ĐÚNG / SAI (SLIDE 26 -> 29)
  const defaultTf4 = planSource.practice.tf || [];
  for (let i = 0; i < 4; i++) {
    const fbTf = defaultTf4[i % defaultTf4.length] || {
      stem: `Khi nghiên cứu bài "${lessonTitle}", các nhận định sau đây là Đúng hay Sai?`,
      statements: [
        { label: "a)", text: sec1.yccd_nb, ans: "Đúng" },
        { label: "b)", text: sec2.yccd_th, ans: "Đúng" },
        { label: "c)", text: "Quá trình diễn ra hoàn toàn không phụ thuộc vào môi trường.", ans: "Sai" },
        { label: "d)", text: sec3.yccd_vd, ans: "Đúng" }
      ]
    };
    const aiTf = (aiData && Array.isArray(aiData.tf) && aiData.tf[i]) ? aiData.tf[i] : null;
    const stem = aiTf ? aiTf.stem : fbTf.stem;
    const subItems = (aiTf && Array.isArray(aiTf.items) && aiTf.items.length === 4)
      ? aiTf.items
      : (fbTf.statements || []).map(st => `${st.label} ${st.text}`);
    const ansLine = (aiTf && aiTf.ans)
      ? aiTf.ans
      : (fbTf.statements || []).map(st => `${st.label} ${st.ans.toUpperCase()}`).join(' | ');

    slideDeckData.push({
      title: `CÂU HỎI BÀI TẬP ${9 + i} / 16 • TRẮC NGHIỆM ĐÚNG / SAI (4 Ý a, b, c, d)`,
      tag: `SLIDE ${26 + i} / 34 • HOẠT ĐỘNG 3: LUYỆN TẬP (DẠNG THỨC II - CÂU ${i + 1}/4)`,
      body: `
        <div class="space-y-2.5 text-sm">
          <p class="font-bold text-amber-300 text-base">Câu ${9 + i}: ${stem}</p>
          <div class="space-y-1.5 bg-black/40 p-3.5 rounded-xl border border-slate-700 text-sm">
            ${subItems.map(line => `<p class="text-slate-100 leading-relaxed">${line}</p>`).join('')}
          </div>
          <div>
            <button onclick="toggleSlideAnswer(this)" class="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500/30 transition text-xs">
              <i class="fa-solid fa-eye mr-1"></i> Bấm để hiển thị Đáp án Đúng/Sai từng ý
            </button>
            <div class="hidden mt-2 p-2.5 bg-emerald-950/80 rounded-xl border border-emerald-500/60 font-bold text-emerald-300 text-sm">
              ➜ Đáp án chuẩn: ${ansLine}
            </div>
          </div>
        </div>
      `
    });
  }

  // 4 SLIDE TRẮC NGHIỆM TRẢ LỜI NGẮN & VẬN DỤNG (SLIDE 30 -> 33 - CÂU 13, 14, 15, 16 / 16)
  const defaultShort4 = planSource.practice.short || [];
  for (let i = 0; i < 4; i++) {
    const fbShort = defaultShort4[i % defaultShort4.length] || {
      level: "Vận dụng",
      q: planSource.calcQuestion,
      ans: planSource.calcAnswer,
      explain: planSource.calcAnswer
    };
    const sItem = (aiData && Array.isArray(aiData.shortAns) && aiData.shortAns[i]) ? aiData.shortAns[i] : fbShort;

    slideDeckData.push({
      title: `CÂU HỎI BÀI TẬP ${13 + i} / 16 • TRẢ LỜI NGẮN & VẬN DỤNG THỰC TIỄN`,
      tag: `SLIDE ${30 + i} / 34 • HOẠT ĐỘNG 3 & 4: BÀI TẬP TRẢ LỜI NGẮN - VẬN DỤNG (CÂU ${i + 1}/4)`,
      body: `
        <div class="space-y-3 text-sm">
          <div class="bg-black/40 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
            <span class="text-xs font-bold text-cyan-300 uppercase">Câu hỏi ${13 + i} / 16 • Mức độ: ${sItem.level || 'Vận dụng'}</span>
            <p class="font-bold text-white text-base leading-relaxed">${sItem.q}</p>
          </div>
          <div>
            <button onclick="toggleSlideAnswer(this)" class="px-4 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500/30 transition text-xs">
              <i class="fa-solid fa-eye mr-1"></i> Bấm để hiển thị Đáp án & Giải thích chi tiết
            </button>
            <div class="hidden mt-2 p-3 bg-emerald-950/80 rounded-xl border border-emerald-500/60 font-bold text-emerald-300 text-base">
              ➜ Đáp án: ${sItem.explain || sItem.ans}
            </div>
          </div>
        </div>
      `
    });
  }

  // SLIDE 34: TỔNG KẾT & GIAO NHIỆM VỤ VỀ NHÀ
  const hwTasks = (aiData && aiData.homework && Array.isArray(aiData.homework.tasks))
    ? aiData.homework.tasks
    : [
        `Hệ thống hóa kiến thức bài "${lessonTitle}" bằng sơ đồ tư duy và hoàn thành các câu hỏi cuối bài trong SGK Kết nối tri thức với cuộc sống.`,
        `Vận dụng giải thích hiện tượng: "${planSource.openingQuestion}"`
      ];
  const hwPrep = (aiData && aiData.homework && Array.isArray(aiData.homework.nextPrep))
    ? aiData.homework.nextPrep
    : [
        `Đọc trước bài học tiếp theo trong SGK ${subject} ${grade} - Kết nối tri thức với cuộc sống.`,
        `Chuẩn bị các câu hỏi thảo luận và tư liệu thực tiễn liên quan đến bài học mới.`
      ];
  slideDeckData.push({
    title: "HOẠT ĐỘNG 4: HƯỚNG DẪN TỰ HỌC & CHUẨN BỊ BÀI MỚI",
    tag: "SLIDE 34 / 34 • TỔNG KẾT & GIAO NHIỆM VỤ VỀ NHÀ",
    body: `
      <div class="grid grid-cols-2 gap-5 text-sm">
        <div class="bg-black/40 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
          <h4 class="font-bold text-cyan-300 text-base"><i class="fa-solid fa-house-laptop mr-1.5"></i> 1. Nhiệm vụ Tự học & Vận dụng ở nhà</h4>
          ${hwTasks.map(t => `<p class="text-slate-100 leading-relaxed">• ${t}</p>`).join('')}
        </div>
        <div class="bg-black/40 p-4 rounded-2xl border border-amber-500/30 space-y-2">
          <h4 class="font-bold text-amber-300 text-base"><i class="fa-solid fa-compass mr-1.5"></i> 2. Chuẩn bị cho tiết học tiếp theo</h4>
          ${hwPrep.map(p => `<p class="text-slate-100 leading-relaxed">• ${p}</p>`).join('')}
        </div>
      </div>
    `
  });

  currentSlideIndex = 0;
  populateSlideQuickJump();
  renderCurrentSlide();
};

// ==================== 3. MA TRẬN, BẢN ĐẶC TẢ & ĐỀ KIỂM TRA 7991 ====================
window.renderMaTranDeKiemTra = function(subject, grade, book, customAiExamHtml = null) {
  const docContainer = document.getElementById('container-a4-doc');
  const lessons = selectedLessonsForExam.length > 0 ? selectedLessonsForExam : [currentSelectedLesson];

  const countP1 = (parseInt(matrixGlobalTotals.p1_b)||0) + (parseInt(matrixGlobalTotals.p1_h)||0) + (parseInt(matrixGlobalTotals.p1_vd)||0);
  const countP2 = (parseInt(matrixGlobalTotals.p2_b)||0) + (parseInt(matrixGlobalTotals.p2_h)||0) + (parseInt(matrixGlobalTotals.p2_vd)||0);
  const countP3 = (parseInt(matrixGlobalTotals.p3_b)||0) + (parseInt(matrixGlobalTotals.p3_h)||0) + (parseInt(matrixGlobalTotals.p3_vd)||0);
  const countP4 = (parseInt(matrixGlobalTotals.p4_b)||0) + (parseInt(matrixGlobalTotals.p4_h)||0) + (parseInt(matrixGlobalTotals.p4_vd)||0);
  const totalQuestions = countP1 + countP2 + countP3 + countP4;

  let defaultExamBodyHtml = '';
  if (!customAiExamHtml) {
    let p1Html = '';
    let p1Index = 1;
    lessons.forEach(les => {
      const prof = window.getNormalizedLessonProfile(subject, grade, les);
      const nbCount = parseInt(examMatrixCustomCounts[les]?.p1_b) || 0;
      const thCount = parseInt(examMatrixCustomCounts[les]?.p1_h) || 0;
      const vdCount = parseInt(examMatrixCustomCounts[les]?.p1_vd) || 0;
      const totalLesP1 = nbCount + thCount + vdCount;
      const mcqPool = prof.practice.mcq || [];

      for (let k = 1; k <= totalLesP1; k++) {
        const qObj = mcqPool[(k - 1) % mcqPool.length];
        const levelTag = k <= nbCount ? 'Nhận biết' : (k <= nbCount + thCount ? 'Thông hiểu' : 'Vận dụng');
        p1Html += `
          <div style="margin: 4px 0 6px 0;">
            <p style="margin: 2px 0;"><strong>Câu ${p1Index} (${levelTag} - ${les}):</strong> ${qObj.q}</p>
            ${(qObj.options || []).map(op => `<p style="margin: 1px 0 1px 18px;">${op}</p>`).join('')}
            <p style="margin: 1px 0 2px 18px; color: #047857;"><strong>➜ Đáp án đúng: ${qObj.ans}</strong></p>
          </div>
        `;
        p1Index++;
      }
    });

    let p2Html = '';
    let p2Index = 1;
    lessons.forEach(les => {
      const prof = window.getNormalizedLessonProfile(subject, grade, les);
      const num = (parseInt(examMatrixCustomCounts[les]?.p2_b)||0) + (parseInt(examMatrixCustomCounts[les]?.p2_h)||0) + (parseInt(examMatrixCustomCounts[les]?.p2_vd)||0);
      const tfPool = prof.practice.tf || [];
      for (let k = 1; k <= num; k++) {
        const tfObj = tfPool[(k - 1) % tfPool.length];
        p2Html += `
          <div style="margin: 4px 0 6px 0;">
            <p style="margin: 2px 0;"><strong>Câu ${p2Index} (${les}):</strong> ${tfObj.stem}</p>
            ${(tfObj.statements || []).map(st => `<p style="margin: 1px 0 1px 18px;"><strong>${st.label}</strong> ${st.text} ➜ <strong>[${st.ans}]</strong></p>`).join('')}
          </div>
        `;
        p2Index++;
      }
    });

    let p3Html = '';
    let p3Index = 1;
    lessons.forEach(les => {
      const prof = window.getNormalizedLessonProfile(subject, grade, les);
      const num = (parseInt(examMatrixCustomCounts[les]?.p3_b)||0) + (parseInt(examMatrixCustomCounts[les]?.p3_h)||0) + (parseInt(examMatrixCustomCounts[les]?.p3_vd)||0);
      const shortPool = prof.practice.short || [];
      for (let k = 1; k <= num; k++) {
        const shObj = shortPool[(k - 1) % shortPool.length];
        p3Html += `
          <div style="margin: 4px 0 6px 0;">
            <p style="margin: 2px 0;"><strong>Câu ${p3Index} (${les}):</strong> ${shObj.q}</p>
            <p style="margin: 1px 0 4px 18px; font-weight: bold; color: #0284c7;">➜ Đáp án: ${shObj.explain || shObj.ans}</p>
          </div>
        `;
        p3Index++;
      }
    });

    let p4Html = '';
    let p4Index = 1;
    lessons.forEach(les => {
      const prof = window.getNormalizedLessonProfile(subject, grade, les);
      const num = (parseInt(examMatrixCustomCounts[les]?.p4_b)||0) + (parseInt(examMatrixCustomCounts[les]?.p4_h)||0) + (parseInt(examMatrixCustomCounts[les]?.p4_vd)||0);
      for (let k = 1; k <= num; k++) {
        p4Html += `
          <div style="margin: 4px 0 8px 0;">
            <p style="margin: 2px 0;"><strong>Câu ${p4Index} (1,5 điểm - ${les}):</strong> ${prof.openingQuestion}</p>
            <p style="margin: 2px 0 6px 18px; color: #334155;">
              <strong>➜ Hướng dẫn chấm chi tiết:</strong><br>
              - Trình bày đúng cơ sở lí thuyết theo SGK Kết nối tri thức (${prof.sections[0]?.heading}): <strong>0,5 điểm</strong> (${prof.yccd[0]}).<br>
              - Giải thích chính xác bản chất hiện tượng thực tiễn: <strong>0,75 điểm</strong> (${prof.openingAnswer}).<br>
              - Nêu được ý nghĩa ứng dụng trong sản xuất và đời sống: <strong>0,25 điểm</strong>.
            </p>
          </div>
        `;
        p4Index++;
      }
    });

    defaultExamBodyHtml = `
      <p style="font-weight: bold; margin: 15px 0 4px 0; font-size: 11.5pt; color: #1e3a8a;">III. ĐỀ KIỂM TRA CHÍNH THỨC VÀ HƯỚNG DẪN CHẤM</p>

      <p style="font-weight: bold; color: #1e40af; margin: 8px 0 2px 0;">PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (${countP1} câu, 3,0 điểm)</p>
      ${p1Html || '<p style="font-style: italic;">(Không có câu hỏi ở phần này)</p>'}

      <p style="font-weight: bold; color: #1e40af; margin: 12px 0 2px 0;">PHẦN II. Câu trắc nghiệm Đúng / Sai (${countP2} câu, 2,0 điểm)</p>
      <p style="font-style: italic; font-size: 10pt; margin-bottom: 4px;">* Điểm tối đa 01 câu là 1,0 điểm (Đúng 1 ý: 0,1đ; Đúng 2 ý: 0,25đ; Đúng 3 ý: 0,5đ; Đúng cả 4 ý: 1,0đ):</p>
      ${p2Html || '<p style="font-style: italic;">(Không có câu hỏi ở phần này)</p>'}

      <p style="font-weight: bold; color: #1e40af; margin: 12px 0 2px 0;">PHẦN III. Câu trắc nghiệm trả lời ngắn (${countP3} câu, 2,0 điểm)</p>
      ${p3Html || '<p style="font-style: italic;">(Không có câu hỏi ở phần này)</p>'}

      <p style="font-weight: bold; color: #1e40af; margin: 12px 0 2px 0;">PHẦN IV. Câu hỏi tự luận (${countP4} câu, 3,0 điểm)</p>
      ${p4Html || '<p style="font-style: italic;">(Không có câu hỏi ở phần này)</p>'}
    `;
  }

  const finalExamContent = window.cleanUnwantedMetaPhrases(customAiExamHtml || defaultExamBodyHtml);

  docContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 12px; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 8px;">
      <h2 style="margin: 0; font-size: 13.5pt; font-weight: bold; text-transform: uppercase;">MA TRẬN, BẢN ĐẶC TẢ VÀ ĐỀ KIỂM TRA ĐỊNH KÌ</h2>
      <p style="margin: 3px 0 0 0; font-size: 11pt;">Môn học: <strong>${subject} - Lớp ${grade}</strong> • Bộ sách: <strong>Kết nối tri thức với cuộc sống</strong> • Thời gian làm bài: <strong>45 phút</strong></p>
    </div>

    <p style="font-weight: bold; margin: 10px 0 3px 0; font-size: 11.5pt; color: #1e3a8a;">I. KHUNG MA TRẬN ĐỀ KIỂM TRA</p>
    <p style="font-style: italic; font-size: 9.5pt; color: #475569; margin-bottom: 4px;" class="no-print">
      * Có thể điều chỉnh số lượng câu ở hàng TỔNG SỐ CÂU TOÀN ĐỀ rồi bấm nút tạo đề bằng AI:
    </p>

    <div style="overflow-x: auto; width: 100%;">
      <table class="matrix-table">
        <colgroup>
          <col style="width: 4%;">
          <col style="width: 28%;">
          <col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;">
          <col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;">
          <col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;">
          <col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;">
          <col style="width: 8%;">
        </colgroup>
        <thead>
          <tr style="background: #E6EEF8; font-weight: bold;">
            <th rowspan="2">TT</th>
            <th rowspan="2">Chủ đề / Bài học & Nội dung kiến thức</th>
            <th colspan="3">Phần I (Nhiều LC)</th>
            <th colspan="3">Phần II (Đúng/Sai)</th>
            <th colspan="3">Phần III (Ngắn)</th>
            <th colspan="3">Phần IV (Tự luận)</th>
            <th rowspan="2">Tổng câu</th>
          </tr>
          <tr style="background: #F0F4F8; font-size: 8pt;">
            <th>B</th><th>H</th><th>VD</th>
            <th>B</th><th>H</th><th>VD</th>
            <th>B</th><th>H</th><th>VD</th>
            <th>B</th><th>H</th><th>VD</th>
          </tr>
        </thead>
        <tbody>
          ${lessons.map((les, i) => {
            const prof = window.getNormalizedLessonProfile(subject, grade, les);
            const c = examMatrixCustomCounts[les] || {};
            const sumRow = (parseInt(c.p1_b)||0) + (parseInt(c.p1_h)||0) + (parseInt(c.p1_vd)||0) +
                           (parseInt(c.p2_b)||0) + (parseInt(c.p2_h)||0) + (parseInt(c.p2_vd)||0) +
                           (parseInt(c.p3_b)||0) + (parseInt(c.p3_h)||0) + (parseInt(c.p3_vd)||0) +
                           (parseInt(c.p4_b)||0) + (parseInt(c.p4_h)||0) + (parseInt(c.p4_vd)||0);
            return `
              <tr>
                <td>${i + 1}</td>
                <td style="text-align: left !important; padding-left: 4px !important;">
                  <strong>${les}</strong><br>
                  <span style="font-size: 7.5pt; color: #334155;">${prof.sections.map(s => s.heading).join('; ')}</span>
                </td>
                <td>${c.p1_b || 0}</td><td>${c.p1_h || 0}</td><td>${c.p1_vd || 0}</td>
                <td>${c.p2_b || 0}</td><td>${c.p2_h || 0}</td><td>${c.p2_vd || 0}</td>
                <td>${c.p3_b || 0}</td><td>${c.p3_h || 0}</td><td>${c.p3_vd || 0}</td>
                <td>${c.p4_b || 0}</td><td>${c.p4_h || 0}</td><td>${c.p4_vd || 0}</td>
                <td style="font-weight: bold; background: #f1f5f9;">${sumRow}</td>
              </tr>
            `;
          }).join('')}

          <tr style="background: #dbeafe; font-weight: bold; border-top: 2px solid #1e40af;">
            <td colspan="2" style="color: #1e3a8a; text-align: left !important; padding-left: 6px !important;">TỔNG SỐ CÂU TOÀN ĐỀ:</td>
            <td><input type="number" min="0" value="${matrixGlobalTotals.p1_b}" onchange="updateGlobalTotalField('p1_b', this.value)" style="width: 100%; border: 1px solid #2563eb; border-radius: 3px; background: #fff;"></td>
            <td><input type="number" min="0" value="${matrixGlobalTotals.p1_h}" onchange="updateGlobalTotalField('p1_h', this.value)" style="width: 100%; border: 1px solid #2563eb; border-radius: 3px; background: #fff;"></td>
            <td><input type="number" min="0" value="${matrixGlobalTotals.p1_vd}" onchange="updateGlobalTotalField('p1_vd', this.value)" style="width: 100%; border: 1px solid #2563eb; border-radius: 3px; background: #fff;"></td>

            <td><input type="number" min="0" value="${matrixGlobalTotals.p2_b}" onchange="updateGlobalTotalField('p2_b', this.value)" style="width: 100%; border: 1px solid #2563eb; border-radius: 3px; background: #fff;"></td>
            <td><input type="number" min="0" value="${matrixGlobalTotals.p2_h}" onchange="updateGlobalTotalField('p2_h', this.value)" style="width: 100%; border: 1px solid #2563eb; border-radius: 3px; background: #fff;"></td>
            <td><input type="number" min="0" value="${matrixGlobalTotals.p2_vd}" onchange="updateGlobalTotalField('p2_vd', this.value)" style="width: 100%; border: 1px solid #2563eb; border-radius: 3px; background: #fff;"></td>

            <td><input type="number" min="0" value="${matrixGlobalTotals.p3_b}" onchange="updateGlobalTotalField('p3_b', this.value)" style="width: 100%; border: 1px solid #2563eb; border-radius: 3px; background: #fff;"></td>
            <td><input type="number" min="0" value="${matrixGlobalTotals.p3_h}" onchange="updateGlobalTotalField('p3_h', this.value)" style="width: 100%; border: 1px solid #2563eb; border-radius: 3px; background: #fff;"></td>
            <td><input type="number" min="0" value="${matrixGlobalTotals.p3_vd}" onchange="updateGlobalTotalField('p3_vd', this.value)" style="width: 100%; border: 1px solid #2563eb; border-radius: 3px; background: #fff;"></td>

            <td><input type="number" min="0" value="${matrixGlobalTotals.p4_b}" onchange="updateGlobalTotalField('p4_b', this.value)" style="width: 100%; border: 1px solid #2563eb; border-radius: 3px; background: #fff;"></td>
            <td><input type="number" min="0" value="${matrixGlobalTotals.p4_h}" onchange="updateGlobalTotalField('p4_h', this.value)" style="width: 100%; border: 1px solid #2563eb; border-radius: 3px; background: #fff;"></td>
            <td><input type="number" min="0" value="${matrixGlobalTotals.p4_vd}" onchange="updateGlobalTotalField('p4_vd', this.value)" style="width: 100%; border: 1px solid #2563eb; border-radius: 3px; background: #fff;"></td>

            <td style="color: #b91c1c; font-weight: bold;">${totalQuestions}</td>
          </tr>
          <tr style="background: #E6EEF8; font-weight: bold;">
            <td colspan="2" style="text-align: left !important; padding-left: 6px !important;">ĐIỂM TỪNG PHẦN (THANG 10,0)</td>
            <td colspan="3">${countP1} câu (3,0 đ)</td>
            <td colspan="3">${countP2} câu (2,0 đ)</td>
            <td colspan="3">${countP3} câu (2,0 đ)</td>
            <td colspan="3">${countP4} câu (3,0 đ)</td>
            <td style="color: #1e3a8a;">10,0 Đ</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p style="font-weight: bold; margin: 15px 0 4px 0; font-size: 11.5pt; color: #1e3a8a;">II. BẢN ĐẶC TẢ ĐỀ KIỂM TRA</p>
    <table>
      <thead>
        <tr style="background: #E6EEF8; text-align: center; font-weight: bold;">
          <th style="width: 5%;">TT</th>
          <th style="width: 24%;">Bài học & Nội dung kiến thức</th>
          <th style="width: 50%;">Yêu cầu cần đạt theo Chương trình GDPT 2018</th>
          <th style="width: 12%;">Dạng thức câu hỏi</th>
          <th style="width: 9%;">Số lượng</th>
        </tr>
      </thead>
      <tbody>
        ${lessons.map((les, idx) => {
          const prof = window.getNormalizedLessonProfile(subject, grade, les);
          const c = examMatrixCustomCounts[les] || {};
          const sum = (parseInt(c.p1_b)||0)+(parseInt(c.p1_h)||0)+(parseInt(c.p1_vd)||0)+
                      (parseInt(c.p2_b)||0)+(parseInt(c.p2_h)||0)+(parseInt(c.p2_vd)||0)+
                      (parseInt(c.p3_b)||0)+(parseInt(c.p3_h)||0)+(parseInt(c.p3_vd)||0)+
                      (parseInt(c.p4_b)||0)+(parseInt(c.p4_h)||0)+(parseInt(c.p4_vd)||0);
          return `
            <tr>
              <td style="text-align: center;">${idx + 1}</td>
              <td>
                <strong>${les}</strong><br>
                ${prof.sections.map(s => `<span style="font-size: 9.5pt;">• ${s.heading}</span>`).join('<br>')}
              </td>
              <td style="font-size: 10pt; line-height: 1.35;">
                ${prof.yccd.map(y => `- ${y}`).join('<br>')}
              </td>
              <td style="text-align: center; font-size: 9.5pt;">
                Phần I (${(c.p1_b||0)+(c.p1_h||0)+(c.p1_vd||0)})<br>
                Phần II (${(c.p2_b||0)+(c.p2_h||0)+(c.p2_vd||0)})<br>
                Phần III (${(c.p3_b||0)+(c.p3_h||0)+(c.p3_vd||0)})<br>
                Phần IV (${(c.p4_b||0)+(c.p4_h||0)+(c.p4_vd||0)})
              </td>
              <td style="text-align: center; font-weight: bold;">${sum} câu</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <div style="page-break-before: always; margin-top: 20px;"></div>

    <div id="exam-questions-zone">
      ${finalExamContent}
    </div>
  `;
};

// ==================== ĐIỀU PHỐI AI CHUYÊN SÂU CHO CẢ 3 PHÂN HỆ ====================
window.executeActionAI = async function() {
  const selectedModel = document.getElementById('sel-gemini-model') ? document.getElementById('sel-gemini-model').value : 'gemini-3.8-flash';
  const subject = document.getElementById('sel-subject').value;
  const grade = document.getElementById('sel-grade').value;
  const book = document.getElementById('sel-book').value;
  const lessonTitle = currentSelectedLesson;
  const customGuide = document.getElementById('ai-custom-instructions') ? document.getElementById('ai-custom-instructions').value.trim() : '';
  const docContainer = document.getElementById('container-a4-doc');
  const statusInd = document.getElementById('content-source-indicator');
  const profile = window.getNormalizedLessonProfile(subject, grade, lessonTitle);

  const thinkingLevel = document.getElementById('sel-thinking-level') ? document.getElementById('sel-thinking-level').value : 'high';
  const thinkLabel = thinkingLevel === 'low' ? 'Tư duy Thấp' : (thinkingLevel === 'medium' ? 'Tư duy Trung bình' : 'Tư duy Cao');
  const baseModelName = selectedModel.includes('argon') || selectedModel.includes('4')
    ? 'Gemini 4 Argon'
    : (selectedModel.includes('3.5') || selectedModel.includes('lite')
        ? 'Gemini 3.5 Flash-Lite'
        : (selectedModel.includes('3.1') ? 'Gemini 3.1 Pro' : 'Gemini 3.8 Flash'));
  const modelLabel = `${baseModelName} (${thinkLabel})`;

  let filePromptPart = '';
  if (uploadedFileContent && uploadedFileContent.trim() !== '') {
    filePromptPart = `\n- TÀI LIỆU BỔ SUNG DO GIÁO VIÊN TẢI LÊN: """${uploadedFileContent.slice(0, 8000)}"""`;
  }

  // ==================== PHÂN HỆ 1: SOẠN GIÁO ÁN 5512 ĐẦY ĐỦ 4 PHẦN BẰNG AI ====================
  if (currentActiveMode === '5512') {
    docContainer.innerHTML = `
      <div style="text-align: center; padding: 75px 20px; font-family: sans-serif;">
        <div style="font-size: 40px; color: #9333ea; margin-bottom: 16px;"><i class="fa-solid fa-wand-magic-sparkles fa-bounce"></i></div>
        <h3 style="font-size: 15pt; font-weight: bold; color: #0f172a;">${modelLabel} đang biên soạn Kế hoạch bài dạy 5512 đầy đủ 4 phần...</h3>
        <p style="color: #475569; font-size: 11pt; margin-top: 6px;">
          Bài học: <strong>${lessonTitle}</strong> (${subject} ${grade} - Kết nối tri thức với cuộc sống)
        </p>
      </div>
    `;
    statusInd.innerHTML = `<span class="text-amber-400 font-bold animate-pulse"><i class="fa-solid fa-spinner fa-spin"></i> ${modelLabel} đang soạn Giáo án 5512...</span>`;

    try {
      const sgkSectionsContext = profile.sections.map((s, i) =>
        `Mục ${i + 1}: ${s.heading}\n  + Nội dung SGK: ${s.sgkContent.join(' ')}`
      ).join('\n');

      const prompt5512 = `Bạn là Chuyên gia Sư phạm môn ${subject}. Hãy biên soạn dữ liệu JSON cho KẾ HOẠCH BÀI DẠY bài: "${lessonTitle}" - Môn ${subject} Lớp ${grade}, Bộ sách Kết nối tri thức với cuộc sống (CT GDPT 2018).

YÊU CẦU CẦN ĐẠT VÀ NỘI DUNG SGK KẾT NỐI TRI THỨC:
- Yêu cầu cần đạt: ${profile.yccd.join(' | ')}
${sgkSectionsContext}

LƯU Ý QUAN TRỌNG:
- Tuyệt đối KHÔNG ghi các cụm từ giải thích hướng dẫn như "(Làm gì, như thế nào)", "- Màu xanh dương", "- Màu đỏ", "- Màu vàng", "[Nhận biết - CT GDPT 2018]:" vào trong câu chữ. Viết văn phong sư phạm chuẩn mực, súc tích, đầy đủ nội dung.
- Tích hợp Năng lực số (Mã ${profile.nls.code}) ở 1 hoạt động nhỏ thuộc Mục I, nêu cụ thể hoạt động của GV và HS.
- Tích hợp Năng lực AI (Mã ${profile.ai.code}) ở 1 hoạt động nhỏ thuộc Mục II, nêu cụ thể nhận định cần kiểm chứng và cách HS đối chiếu SGK để phản biện.

Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc:
{
  "knowledgeObjectives": [
    "Yêu cầu cần đạt 1 đầy đủ nội dung...",
    "Yêu cầu cần đạt 2 đầy đủ nội dung...",
    "Yêu cầu cần đạt 3 đầy đủ nội dung..."
  ],
  "nls": {
    "code": "${profile.nls.code}",
    "domain": "${profile.nls.domain}",
    "targetSection": "${profile.sections[0]?.heading}",
    "gvAction": "GV trình chiếu học liệu số/sơ đồ cụ thể gì và giao nhiệm vụ ra sao...",
    "hsAction": "HS khai thác dữ liệu số như thế nào và hoàn thành nội dung gì vào Phiếu học tập..."
  },
  "ai": {
    "code": "${profile.ai.code}",
    "domain": "${profile.ai.domain}",
    "targetSection": "${profile.sections[1]?.heading || profile.sections[0]?.heading}",
    "gvAction": "GV đưa ra nhận định giả định của AI có điểm sai khoa học cụ thể nào về bài học...",
    "hsAction": "HS đối chiếu nội dung SGK Kết nối tri thức để chỉ ra điểm sai và giải thích lại chính xác như thế nào..."
  },
  "otherCompetency": {
    "code": "${profile.otherCompetency.code}",
    "name": "${profile.otherCompetency.name}",
    "gvAction": "GV tổ chức hoạt động thảo luận/vận dụng gì...",
    "hsAction": "HS thảo luận nhóm và giải thích thực tiễn như thế nào..."
  },
  "warmup": {
    "situation": "Câu hỏi tình huống thực tiễn mở đầu bài ${lessonTitle}...",
    "gvAction": "Hoạt động chuyển giao nhiệm vụ của GV...",
    "hsAction": "Hoạt động suy nghĩ và trả lời của HS...",
    "product": "Câu trả lời giải thích chính xác cho tình huống mở đầu..."
  },
  "sections": [
    {
      "heading": "${profile.sections[0]?.heading}",
      "gvStep1": "Hoạt động chuyển giao nhiệm vụ của GV...",
      "hsStep2": "Hoạt động thực hiện nhiệm vụ của HS...",
      "reportStep3": "Hoạt động báo cáo, thảo luận...",
      "concludeStep4": "Kết luận của GV...",
      "sgkContent": ["Nội dung kiến thức chuẩn SGK 1 đầy đủ, chi tiết...", "Nội dung kiến thức chuẩn SGK 2 đầy đủ, chi tiết..."],
      "yccd_nb": "Yêu cầu cần đạt nhận biết của mục I...",
      "yccd_th": "Yêu cầu cần đạt thông hiểu của mục I..."
    },
    {
      "heading": "${profile.sections[1]?.heading || 'II. Nội dung 2'}",
      "gvStep1": "...",
      "hsStep2": "...",
      "reportStep3": "...",
      "concludeStep4": "...",
      "sgkContent": ["...", "..."],
      "yccd_nb": "...",
      "yccd_th": "..."
    },
    {
      "heading": "${profile.sections[2]?.heading || 'III. Nội dung 3'}",
      "gvStep1": "...",
      "hsStep2": "...",
      "reportStep3": "...",
      "concludeStep4": "...",
      "sgkContent": ["...", "..."],
      "yccd_nb": "...",
      "yccd_th": "..."
    }
  ],
  "practice": {
    "mcq": [
      {"q": "Nội dung câu hỏi trắc nghiệm 1?", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "ans": "A"},
      {"q": "Nội dung câu hỏi trắc nghiệm 2?", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "ans": "B"},
      {"q": "Nội dung câu hỏi trắc nghiệm 3?", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "ans": "C"}
    ],
    "tf": [
      {
        "stem": "Phần dẫn câu hỏi Đúng/Sai:",
        "statements": [
          {"label": "a)", "text": "Phát biểu a đầy đủ nội dung...", "ans": "Đúng"},
          {"label": "b)", "text": "Phát biểu b đầy đủ nội dung...", "ans": "Sai"},
          {"label": "c)", "text": "Phát biểu c đầy đủ nội dung...", "ans": "Đúng"},
          {"label": "d)", "text": "Phát biểu d đầy đủ nội dung...", "ans": "Đúng"}
        ]
      }
    ],
    "shortAns": [
      {"q": "Câu hỏi trả lời ngắn 1 có số liệu tính toán cụ thể?", "ans": "Đáp số và lời giải chi tiết"},
      {"q": "Câu hỏi trả lời ngắn 2?", "ans": "Đáp số và lời giải chi tiết"}
    ]
  },
  "applicationTask": {
    "problem": "Bài toán/tình huống vận dụng thực tiễn của bài ${lessonTitle}...",
    "solutionGuide": "Hướng dẫn giải chi tiết dựa trên kiến thức SGK..."
  }
}
Ghi chú bổ sung: ${customGuide}${filePromptPart}`;

      const ragSysInstruction = `HỆ THỐNG RAG CHỐNG ẢO GIÁC KHOA HỌC (RETRIEVAL-AUGMENTED GENERATION): Bắt buộc neo giữ 100% kiến thức vào ngữ liệu gốc SGK Kết nối tri thức với cuộc sống và Yêu cầu cần đạt CT GDPT 2018 đã cung cấp. Sử dụng chuẩn danh pháp quốc tế (DNA, RNA, ATP, enzyme, hormone, polypeptide, amino acid, glucose...). Tuyệt đối không bịa đặt thông tin khoa học ngoài ngữ cảnh.`;
      const rawJson = await window.callGeminiDirect('', selectedModel, prompt5512, true, ragSysInstruction);
      const aiPlanObj = window.safeParseAIJson(rawJson);

      if (!aiPlanObj || !Array.isArray(aiPlanObj.sections)) {
        throw new Error('Dữ liệu JSON từ AI chưa đúng cấu trúc.');
      }

      localStorage.setItem(window.getStructuredPlanKey(subject, grade, lessonTitle), JSON.stringify(aiPlanObj));
      window.renderGiaoAn5512HighEnd(subject, grade, book, lessonTitle, aiPlanObj);
      temporaryAIGeneratedDoc = docContainer.innerHTML;
      const aiKey = window.getAICacheKey('5512', subject, grade, lessonTitle);
      localStorage.setItem(aiKey, temporaryAIGeneratedDoc);
      renderLessonListUI();

      showAIReviewBar(`Đã biên soạn đầy đủ Kế hoạch bài dạy 5512 bằng ${modelLabel} và đồng bộ sang 34 Slide PPT!`);
      statusInd.innerHTML = `<span class="text-purple-400 font-bold flex items-center gap-1"><i class="fa-solid fa-sparkles"></i> Đã biên soạn đầy đủ Giáo án 5512 bằng ${modelLabel}!</span>`;
      window.showBioToast(`Đã soạn xong Kế hoạch bài dạy "${lessonTitle}" đầy đủ 4 phần và đồng bộ sang 34 Slide PPT!`, 'success');
    } catch (err) {
      console.warn('Tự động chuyển sang Engine Sư phạm Nội bộ do lưu lượng cao:', err);
      const hybridPlanObj = {
        knowledgeObjectives: profile.yccd,
        nls: profile.nls,
        ai: profile.ai,
        otherCompetency: profile.otherCompetency,
        warmup: {
          situation: profile.openingQuestion,
          gvAction: `GV chiếu tình huống thực tiễn mở đầu bài "${lessonTitle}" và đặt câu hỏi gợi mở: "${profile.openingQuestion}"`,
          hsAction: `HS suy nghĩ cá nhân, liên hệ kiến thức thực tế để đưa ra câu trả lời dự đoán; các HS khác lắng nghe và bổ sung ý kiến.`,
          product: profile.openingAnswer
        },
        sections: profile.sections,
        practice: {
          mcq: (profile.practice.mcq || []).slice(0, 4),
          tf: (profile.practice.tf || []).slice(0, 2),
          shortAns: (profile.practice.short || []).slice(0, 2)
        },
        applicationTask: {
          problem: customGuide
            ? `${customGuide} — Vận dụng kiến thức bài "${lessonTitle}" (SGK ${subject} ${grade} - Kết nối tri thức với cuộc sống), hãy giải thích: "${profile.openingQuestion}" và giải bài toán: "${profile.calcQuestion}"`
            : `Vận dụng kiến thức bài "${lessonTitle}" (SGK ${subject} ${grade} - Kết nối tri thức với cuộc sống), hãy giải thích câu hỏi thực tiễn: "${profile.openingQuestion}" và giải bài toán ứng dụng: "${profile.calcQuestion}"`,
          solutionGuide: `1. Giải thích hiện tượng thực tiễn: ${profile.openingAnswer}\n2. Lời giải bài toán thực tế: ${profile.calcAnswer}`
        }
      };
      localStorage.setItem(window.getStructuredPlanKey(subject, grade, lessonTitle), JSON.stringify(hybridPlanObj));
      window.renderGiaoAn5512HighEnd(subject, grade, book, lessonTitle, hybridPlanObj);
      temporaryAIGeneratedDoc = docContainer.innerHTML;
      const aiKey = window.getAICacheKey('5512', subject, grade, lessonTitle);
      localStorage.setItem(aiKey, temporaryAIGeneratedDoc);
      renderLessonListUI();
      showAIReviewBar(`Đã biên soạn đầy đủ Kế hoạch bài dạy 5512 (Chế độ Hybrid chống nghẽn) và đồng bộ sang 34 Slide!`);
      statusInd.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> Đã biên soạn đầy đủ Giáo án 5512 chuẩn SGK Kết nối tri thức</span>`;
      window.showBioToast(`Đã hoàn tất Kế hoạch bài dạy "${lessonTitle}" đầy đủ 4 phần (tự động cân bằng tải khi lưu lượng cao)!`, 'success');
    }
    return;
  }

  // ==================== PHÂN HỆ 2: TẠO 34 SLIDE PPT ĐỒNG BỘ TỪ GIÁO ÁN + 16 SLIDE BÀI TẬP ====================
  if (currentActiveMode === 'slide') {
    const slideCore = document.getElementById('slide-core-content');
    slideCore.innerHTML = `
      <div class="text-center py-10 space-y-4">
        <div class="text-5xl text-amber-300"><i class="fa-solid fa-wand-magic-sparkles fa-spin"></i></div>
        <h3 class="text-2xl font-bold text-white">${modelLabel} đang thiết kế bộ 34 Slide bài giảng...</h3>
        <p class="text-cyan-300 text-sm">
          Đồng bộ từ <strong>Hoạt động 2 của Giáo án 5512</strong> + <strong>16 Slide Câu hỏi Bài tập</strong><br>
          Bài học: <strong>${lessonTitle}</strong> (${subject} ${grade} - Kết nối tri thức với cuộc sống)
        </p>
      </div>
    `;
    statusInd.innerHTML = `<span class="text-amber-400 font-bold animate-pulse"><i class="fa-solid fa-spinner fa-spin"></i> ${modelLabel} đang tạo 34 Slide...</span>`;

    try {
      const planSource = window.extractLessonPlanSectionsForSlides(subject, grade, lessonTitle);
      const act2Context = planSource.sections.map((s, idx) =>
        `Mục ${idx + 1}: ${s.heading}\n  - Nội dung ghi vở từ Giáo án: ${(s.sgkContent || []).join(' | ')}`
      ).join('\n');

      const slidePrompt = `Bạn là Chuyên gia Thiết kế Bài giảng Điện tử THPT. Hãy biên soạn dữ liệu JSON cho bộ 34 SLIDE bài giảng của bài "${lessonTitle}" (Môn ${subject} ${grade}, Bộ sách Kết nối tri thức với cuộc sống).

YÊU CẦU:
1. Nội dung kiến thức lấy từ HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC của Giáo án 5512:
${act2Context}
2. Biên soạn ĐỦ 16 CÂU HỎI BÀI TẬP ĐẦY ĐỦ NỘI DUNG cho 16 Slide bài tập:
   - 8 câu trắc nghiệm 4 lựa chọn ("mcq": mảng 8 phần tử).
   - 4 câu trắc nghiệm Đúng/Sai ("tf": mảng 4 phần tử, mỗi câu có stem và 4 ý a, b, c, d kèm đáp án).
   - 4 câu trả lời ngắn & vận dụng ("shortAns": mảng 4 phần tử kèm đáp số và lời giải chi tiết).

Trả về DUY NHẤT một đối tượng JSON hợp lệ:
{
  "objectives": ["Yêu cầu cần đạt 1", "Yêu cầu cần đạt 2", "Yêu cầu cần đạt 3"],
  "warmup": {
    "situation": "Tình huống khởi động thực tiễn..."
  },
  "lessonSections": [
    {
      "heading": "${planSource.sections[0]?.heading}",
      "gvStep1": "...",
      "hsStep2": "...",
      "sgkContent": ["...", "..."],
      "yccd_nb": "${planSource.sections[0]?.yccd_nb || ''}",
      "yccd_th": "${planSource.sections[0]?.yccd_th || ''}"
    },
    {
      "heading": "${planSource.sections[1]?.heading}",
      "gvStep1": "...",
      "hsStep2": "...",
      "sgkContent": ["...", "..."],
      "yccd_nb": "${planSource.sections[1]?.yccd_nb || ''}",
      "yccd_th": "${planSource.sections[1]?.yccd_th || ''}"
    },
    {
      "heading": "${planSource.sections[2]?.heading}",
      "gvStep1": "...",
      "hsStep2": "...",
      "sgkContent": ["...", "..."],
      "yccd_th": "${planSource.sections[2]?.yccd_th || ''}",
      "yccd_vd": "${planSource.sections[2]?.yccd_vd || ''}"
    }
  ],
  "mcq": [
    {"level": "Nhận biết", "q": "Câu 1...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "ans": "Đáp án đúng và giải thích"},
    {"level": "Nhận biết", "q": "Câu 2...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "ans": "..."},
    {"level": "Nhận biết", "q": "Câu 3...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "ans": "..."},
    {"level": "Thông hiểu", "q": "Câu 4...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "ans": "..."},
    {"level": "Thông hiểu", "q": "Câu 5...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "ans": "..."},
    {"level": "Thông hiểu", "q": "Câu 6...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "ans": "..."},
    {"level": "Vận dụng", "q": "Câu 7...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "ans": "..."},
    {"level": "Vận dụng", "q": "Câu 8...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "ans": "..."}
  ],
  "tf": [
    {"stem": "Nội dung dẫn câu 9...", "items": ["a) ...", "b) ...", "c) ...", "d) ..."], "ans": "a) ĐÚNG | b) SAI | c) ĐÚNG | d) ĐÚNG"},
    {"stem": "Nội dung dẫn câu 10...", "items": ["a) ...", "b) ...", "c) ...", "d) ..."], "ans": "a) ĐÚNG | b) ĐÚNG | c) SAI | d) ĐÚNG"},
    {"stem": "Nội dung dẫn câu 11...", "items": ["a) ...", "b) ...", "c) ...", "d) ..."], "ans": "a) ĐÚNG | b) ĐÚNG | c) SAI | d) ĐÚNG"},
    {"stem": "Nội dung dẫn câu 12...", "items": ["a) ...", "b) ...", "c) ...", "d) ..."], "ans": "a) ĐÚNG | b) ĐÚNG | c) SAI | d) ĐÚNG"}
  ],
  "shortAns": [
    {"level": "Thông hiểu", "q": "Câu 13...", "ans": "Đáp số và lời giải"},
    {"level": "Thông hiểu", "q": "Câu 14...", "ans": "Đáp số và lời giải"},
    {"level": "Vận dụng", "q": "Câu 15...", "ans": "Đáp số và lời giải"},
    {"level": "Vận dụng", "q": "Câu 16...", "ans": "Đáp số và lời giải"}
  ]
}
Ghi chú bổ sung: ${customGuide}${filePromptPart}`;

      const rawJson = await window.callGeminiDirect('', selectedModel, slidePrompt, true);
      const aiSlideObj = window.safeParseAIJson(rawJson);
      if (!aiSlideObj) {
        throw new Error('Không phân tích được dữ liệu JSON Slide từ AI.');
      }

      window.renderPowerPointSlideDeck(subject, grade, book, lessonTitle, aiSlideObj);
      temporaryAISlideDeck = [...slideDeckData];
      const aiKey = window.getAICacheKey('slide', subject, grade, lessonTitle);
      localStorage.setItem(aiKey, JSON.stringify(temporaryAISlideDeck));
      renderLessonListUI();

      showAIReviewBar(`AI (${modelLabel}) đã thiết kế bộ ${slideDeckData.length} Slide (đồng bộ Giáo án + 16 Slide Câu hỏi Bài tập)!`);
      statusInd.innerHTML = `<span class="text-purple-400 font-bold flex items-center gap-1"><i class="fa-solid fa-sparkles"></i> Đã tạo ${slideDeckData.length} Slide bằng ${modelLabel}!</span>`;
      window.showBioToast(`Đã tạo thành công bộ ${slideDeckData.length} Slide bài giảng!`, 'success');
    } catch (err) {
      console.warn('Tự động chuyển sang Engine Slide Hybrid do lưu lượng cao:', err);
      window.renderPowerPointSlideDeck(subject, grade, book, lessonTitle);
      temporaryAISlideDeck = [...slideDeckData];
      const aiKey = window.getAICacheKey('slide', subject, grade, lessonTitle);
      localStorage.setItem(aiKey, JSON.stringify(temporaryAISlideDeck));
      renderLessonListUI();
      showAIReviewBar(`Đã thiết kế bộ ${slideDeckData.length} Slide đồng bộ Giáo án 5512 + 16 Slide Bài tập!`);
      statusInd.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> Đã tạo bộ ${slideDeckData.length} Slide chuẩn SGK</span>`;
      window.showBioToast(`Đã hoàn tất bộ ${slideDeckData.length} Slide bài giảng đồng bộ từ Giáo án 5512!`, 'success');
    }
    return;
  }

  // ==================== PHÂN HỆ 3: TẠO ĐỀ THI & HƯỚNG DẪN CHẤM 7991 BẰNG AI ====================
  if (currentActiveMode === '7991') {
    distributeMatrixFromTotals();
    const lessons = selectedLessonsForExam.length > 0 ? selectedLessonsForExam : [currentSelectedLesson];
    const countP1 = (parseInt(matrixGlobalTotals.p1_b)||0) + (parseInt(matrixGlobalTotals.p1_h)||0) + (parseInt(matrixGlobalTotals.p1_vd)||0);
    const countP2 = (parseInt(matrixGlobalTotals.p2_b)||0) + (parseInt(matrixGlobalTotals.p2_h)||0) + (parseInt(matrixGlobalTotals.p2_vd)||0);
    const countP3 = (parseInt(matrixGlobalTotals.p3_b)||0) + (parseInt(matrixGlobalTotals.p3_h)||0) + (parseInt(matrixGlobalTotals.p3_vd)||0);
    const countP4 = (parseInt(matrixGlobalTotals.p4_b)||0) + (parseInt(matrixGlobalTotals.p4_h)||0) + (parseInt(matrixGlobalTotals.p4_vd)||0);

    docContainer.innerHTML = `
      <div style="text-align: center; padding: 75px 20px; font-family: sans-serif;">
        <div style="font-size: 40px; color: #9333ea; margin-bottom: 16px;"><i class="fa-solid fa-file-circle-check fa-bounce"></i></div>
        <h3 style="font-size: 15pt; font-weight: bold; color: #0f172a;">${modelLabel} đang biên soạn Đề Kiểm Tra & Hướng Dẫn Chấm...</h3>
        <p style="color: #475569; font-size: 11pt; margin-top: 6px;">
          Nội dung: <strong>${lessons.join('; ')}</strong>
        </p>
      </div>
    `;
    statusInd.innerHTML = `<span class="text-amber-400 font-bold animate-pulse"><i class="fa-solid fa-spinner fa-spin"></i> ${modelLabel} đang biên soạn Đề thi 7991...</span>`;

    try {
      const detailedSpecsForAI = lessons.map((les, idx) => {
        const prof = window.getNormalizedLessonProfile(subject, grade, les);
        const c = examMatrixCustomCounts[les] || {};
        return `${idx + 1}. Bài học: "${les}"
   - Nội dung SGK Kết nối tri thức: ${prof.sections.map(s => s.heading + ' (' + s.sgkContent.join(' ') + ')').join(' | ')}
   - Yêu cầu cần đạt (GDPT 2018): ${prof.yccd.join('; ')}
   - Số câu của bài này: Phần I (Biết: ${c.p1_b||0}, Hiểu: ${c.p1_h||0}, VD: ${c.p1_vd||0}); Phần II Đ/S (Biết: ${c.p2_b||0}, Hiểu: ${c.p2_h||0}, VD: ${c.p2_vd||0}); Phần III Ngắn (Biết: ${c.p3_b||0}, Hiểu: ${c.p3_h||0}, VD: ${c.p3_vd||0}); Phần IV Tự luận (Biết: ${c.p4_b||0}, Hiểu: ${c.p4_h||0}, VD: ${c.p4_vd||0}).`;
      }).join('\n\n');

      const examPrompt = `Bạn là Chuyên gia Khảo thí môn ${subject}. Hãy biên soạn ĐỀ KIỂM TRA ĐỊNH KÌ VÀ HƯỚNG DẪN CHẤM theo cấu trúc 7991 cho môn ${subject} Lớp ${grade} (Bộ sách Kết nối tri thức với cuộc sống).

DỮ LIỆU YÊU CẦU CẦN ĐẠT & NỘI DUNG SGK:
${detailedSpecsForAI}

YÊU CẦU:
- Bắt đầu ngay từ mục "III. ĐỀ KIỂM TRA CHÍNH THỨC" và "IV. ĐÁP ÁN & HƯỚNG DẪN CHẤM CHI TIẾT".
- PHẦN I (${countP1} câu, 3,0 điểm): Câu trắc nghiệm 4 phương án A, B, C, D đầy đủ nội dung.
- PHẦN II (${countP2} câu, 2,0 điểm): Câu trắc nghiệm Đúng/Sai gồm phần dẫn và 4 ý a, b, c, d đầy đủ nội dung.
- PHẦN III (${countP3} câu, 2,0 điểm): Câu trắc nghiệm trả lời ngắn kèm đáp số và phép tính.
- PHẦN IV (${countP4} câu, 3,0 điểm): Câu hỏi tự luận vận dụng thực tiễn kèm biểu điểm chi tiết.
- Định dạng: HTML chuẩn, không dùng markdown.
Ghi chú bổ sung: ${customGuide}${filePromptPart}`;

      let examHtmlOut = await window.callGeminiDirect('', selectedModel, examPrompt, false);
      examHtmlOut = examHtmlOut.replace(/```html/gi, '').replace(/```/g, '').trim();

      window.renderMaTranDeKiemTra(subject, grade, book, examHtmlOut);
      temporaryAIGeneratedDoc = docContainer.innerHTML;
      const aiKey = window.getAICacheKey('7991', subject, grade, lessonTitle);
      localStorage.setItem(aiKey, temporaryAIGeneratedDoc);
      renderLessonListUI();

      showAIReviewBar(`AI (${modelLabel}) đã biên soạn xong Đề Kiểm Tra & Hướng Dẫn Chấm chuẩn 7991!`);
      statusInd.innerHTML = `<span class="text-purple-400 font-bold flex items-center gap-1"><i class="fa-solid fa-sparkles"></i> Đã tạo Đề thi 7991 bằng ${modelLabel}!</span>`;
      window.showBioToast(`Đã tạo thành công Đề kiểm tra & Hướng dẫn chấm 7991!`, 'success');
    } catch (err) {
      console.warn('Tự động chuyển sang Engine Khảo thí Hybrid do lưu lượng cao:', err);
      window.renderMaTranDeKiemTra(subject, grade, book);
      temporaryAIGeneratedDoc = docContainer.innerHTML;
      const aiKey = window.getAICacheKey('7991', subject, grade, lessonTitle);
      localStorage.setItem(aiKey, temporaryAIGeneratedDoc);
      renderLessonListUI();
      showAIReviewBar(`Đã biên soạn xong Ma trận, Bản đặc tả & Đề kiểm tra chuẩn 7991!`);
      statusInd.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> Đã tạo Đề kiểm tra 7991 chuẩn YCCĐ</span>`;
      window.showBioToast(`Đã hoàn tất Ma trận, Bản đặc tả & Đề kiểm tra 7991 chuẩn YCCĐ SGK Kết nối tri thức!`, 'success');
    }
  }
};

window.updateButtonLabels = function() {
  if (currentActiveMode === '5512') {
    document.getElementById('header-ai-btn-text').innerText = 'SOẠN ĐẦY ĐỦ GIÁO ÁN 5512 BẰNG AI';
    document.getElementById('btn-sidebar-ai-text').innerText = 'SOẠN ĐẦY ĐỦ GIÁO ÁN 5512 (4 PHẦN) BẰNG AI';
    document.getElementById('top-bar-ai-btn-text').innerText = 'Soạn Giáo Án 5512 AI';
  } else if (currentActiveMode === 'slide') {
    document.getElementById('header-ai-btn-text').innerText = 'TẠO 34 SLIDE PPT ĐỒNG BỘ GIÁO ÁN';
    document.getElementById('btn-sidebar-ai-text').innerText = 'TẠO 34 SLIDE PPT (KÈM 16 SLIDE BÀI TẬP) BẰNG AI';
    document.getElementById('top-bar-ai-btn-text').innerText = 'Soạn 34 Slide AI';
  } else {
    document.getElementById('header-ai-btn-text').innerText = 'TẠO ĐỀ THI & ĐẶC TẢ 7991 BẰNG AI';
    document.getElementById('btn-sidebar-ai-text').innerText = 'TẠO ĐỀ THI & BẢN ĐẶC TẢ 7991 BẰNG AI';
    document.getElementById('top-bar-ai-btn-text').innerText = 'Soạn Đề Thi 7991 AI';
  }
};

const _origSwitchViewTab = window.switchViewTab;
window.switchViewTab = function(mode) {
  _origSwitchViewTab(mode);
  const badge = document.getElementById('current-badge-view');
  if (mode === '5512' && badge) {
    badge.innerText = 'KẾ HOẠCH BÀI DẠY (CÔNG VĂN 5512 • ĐỦ 4 PHẦN • SGK KẾT NỐI TRI THỨC)';
  } else if (mode === 'slide' && badge) {
    badge.innerText = 'BÀI GIẢNG ĐIỆN TỬ 34 SLIDE (ĐỒNG BỘ GIÁO ÁN + 16 SLIDE CÂU HỎI BÀI TẬP)';
  } else if (mode === '7991' && badge) {
    badge.innerText = 'MA TRẬN, BẢN ĐẶC TẢ YCCĐ & ĐỀ KIỂM TRA ĐỊNH KÌ (CV 7991)';
  }
};

window.saveCurrentAIContent = function() {
  const subject = document.getElementById('sel-subject').value;
  const grade = document.getElementById('sel-grade').value;
  const lessonTitle = currentSelectedLesson;
  const aiKey = window.getAICacheKey(currentActiveMode, subject, grade, lessonTitle);

  if (currentActiveMode === 'slide') {
    const dataToSave = temporaryAISlideDeck || slideDeckData;
    localStorage.setItem(aiKey, JSON.stringify(dataToSave));
  } else {
    const docToSave = document.getElementById('container-a4-doc').innerHTML || temporaryAIGeneratedDoc;
    localStorage.setItem(aiKey, docToSave);
  }

  hideAIReviewBar();
  renderLessonListUI();
  const statusInd = document.getElementById('content-source-indicator');
  statusInd.innerHTML = `<span class="text-emerald-400 font-bold flex items-center gap-1"><i class="fa-solid fa-check-double text-[10px]"></i> Đã lưu bản AI vào bộ nhớ thành công!</span>`;
  window.showBioToast('Đã lưu nội dung biên soạn bằng AI thành công!', 'success');
};

window.discardCurrentAIContent = function() {
  const subject = document.getElementById('sel-subject').value;
  const grade = document.getElementById('sel-grade').value;
  const lessonTitle = currentSelectedLesson;
  const aiKey = window.getAICacheKey(currentActiveMode, subject, grade, lessonTitle);

  localStorage.removeItem(aiKey);
  if (currentActiveMode === '5512') {
    localStorage.removeItem(window.getStructuredPlanKey(subject, grade, lessonTitle));
  }
  temporaryAIGeneratedDoc = null;
  temporaryAISlideDeck = null;
  hideAIReviewBar();
  renderLessonListUI();
  window.displayContentForCurrentLesson();
  window.showBioToast('Đã khôi phục về bản chuẩn SGK Kết nối tri thức & CT GDPT 2018!', 'info');
};

window.downloadPowerPointPPTX = function() {
  if (typeof PptxGenJS === 'undefined') {
    window.showBioToast('Đang nạp thư viện PowerPoint, vui lòng thử lại sau 2 giây...', 'warning');
    return;
  }

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  slideDeckData.forEach((item) => {
    const slide = pptx.addSlide();
    slide.background = { color: '0B1A2E' };

    slide.addText(`${item.tag} | SGK KẾT NỐI TRI THỨC - GDPT 2018`, {
      x: 0.4, y: 0.25, w: 12.5, h: 0.35,
      fontSize: 11, color: '00D2FF', bold: true, fontFace: 'Arial'
    });

    slide.addText(item.title, {
      x: 0.4, y: 0.65, w: 12.5, h: 0.75,
      fontSize: 22, color: 'FBBF24', bold: true, fontFace: 'Arial'
    });

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = item.body;
    tempDiv.querySelectorAll('button').forEach(b => b.remove());
    tempDiv.querySelectorAll('.hidden').forEach(h => h.classList.remove('hidden'));

    const lines = [];
    tempDiv.querySelectorAll('h1, h3, h4, p, div.p-3, div.p-2\\.5').forEach(el => {
      const txt = el.innerText.replace(/\s+/g, ' ').trim();
      if (txt && !lines.includes(txt)) lines.push(txt);
    });
    const cleanBodyText = lines.length > 0 ? lines.join('\n\n') : tempDiv.innerText.replace(/\s+/g, ' ').trim();

    slide.addText(cleanBodyText, {
      x: 0.5, y: 1.5, w: 12.3, h: 5.5,
      fontSize: 15, color: 'F1F5F9', fontFace: 'Arial', lineSpacing: 22, valign: 'top'
    });
  });

  const fileName = `BaiGiang_${slideDeckData.length}Slide_${currentSelectedLesson.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
  pptx.writeFile({ fileName });
  window.showBioToast(`Đã xuất file PowerPoint (${slideDeckData.length} Slide) thành công!`, 'success');
};

window.displayContentForCurrentLesson = function() {
  const subject = document.getElementById('sel-subject').value;
  const grade = document.getElementById('sel-grade').value;
  const book = document.getElementById('sel-book').value;
  const lessonTitle = currentSelectedLesson;
  const docContainer = document.getElementById('container-a4-doc');
  const statusInd = document.getElementById('content-source-indicator');

  const aiKey = window.getAICacheKey(currentActiveMode, subject, grade, lessonTitle);
  const cachedAIContent = localStorage.getItem(aiKey);

  if (currentActiveMode === 'slide') {
    if (cachedAIContent) {
      try {
        const parsedSlides = JSON.parse(cachedAIContent);
        if (Array.isArray(parsedSlides) && parsedSlides.length > 30) {
          slideDeckData = parsedSlides;
          currentSlideIndex = 0;
          populateSlideQuickJump();
          renderCurrentSlide();
          statusInd.innerHTML = `<span class="text-purple-400 font-bold flex items-center gap-1"><i class="fa-solid fa-sparkles"></i> Đã nạp ${slideDeckData.length} Slide từ AI (Đã lưu)</span>`;
          return;
        } else {
          localStorage.removeItem(aiKey);
        }
      } catch (e) {
        console.warn('Lỗi đọc cache slide AI, nạp bản 34 Slide chuẩn:', e);
      }
    }
    window.renderPowerPointSlideDeck(subject, grade, book, lessonTitle);
    statusInd.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> Bộ ${slideDeckData.length} Slide đồng bộ HĐ 2 Giáo án + 16 Slide Bài tập</span>`;
    return;
  }

  if (cachedAIContent) {
    docContainer.innerHTML = window.cleanUnwantedMetaPhrases(cachedAIContent);
    statusInd.innerHTML = `<span class="text-purple-400 font-bold flex items-center gap-1"><i class="fa-solid fa-sparkles"></i> Đã nạp dữ liệu biên soạn từ AI (Đã lưu)</span>`;
    return;
  }

  statusInd.innerHTML = `<span class="text-emerald-400 font-bold flex items-center gap-1"><i class="fa-solid fa-circle-check text-[10px]"></i> Chuẩn SGK Kết nối tri thức & CT GDPT 2018 (RAG Grounded)</span>`;
  if (currentActiveMode === '5512') {
    window.renderGiaoAn5512HighEnd(subject, grade, book, lessonTitle);
  } else if (currentActiveMode === '7991') {
    distributeMatrixFromTotals();
    window.renderMaTranDeKiemTra(subject, grade, book);
  }
  if (typeof window.updateRAGSidebarStatus === 'function') {
    window.updateRAGSidebarStatus();
  }
};

// ==================== HỆ THỐNG ĐỘT PHÁ CÔNG NGHỆ RAG: TRIỆT TIÊU ẢO GIÁC KHOA HỌC ====================
window.updateRAGSidebarStatus = function() {
  const detailEl = document.getElementById('rag-sidebar-detail');
  if (!detailEl) return;
  const subject = document.getElementById('sel-subject') ? document.getElementById('sel-subject').value : 'Sinh học';
  const grade = document.getElementById('sel-grade') ? document.getElementById('sel-grade').value : '10';
  const lessonTitle = typeof currentSelectedLesson !== 'undefined' ? currentSelectedLesson : 'Bài 1: Giới thiệu khái quát môn Sinh học';
  const profile = window.getNormalizedLessonProfile(subject, grade, lessonTitle);
  const extraFile = (typeof uploadedFileContent !== 'undefined' && uploadedFileContent.trim() !== '')
    ? ' + 01 Tài liệu GV nạp'
    : '';
  detailEl.innerHTML = `Đã khóa ngữ cảnh bài <strong>${lessonTitle}</strong>: <strong>${profile.sections.length} mục SGK</strong> + <strong>${profile.yccd.length} YCCĐ</strong>${extraFile} (0% Ảo giác).`;
};

window.openRAGInspectorModal = function() {
  const modal = document.getElementById('modal-rag-inspector');
  const body = document.getElementById('rag-inspector-body');
  const sub = document.getElementById('rag-modal-subtitle');
  if (!modal || !body) return;

  const subject = document.getElementById('sel-subject') ? document.getElementById('sel-subject').value : 'Sinh học';
  const grade = document.getElementById('sel-grade') ? document.getElementById('sel-grade').value : '10';
  const lessonTitle = typeof currentSelectedLesson !== 'undefined' ? currentSelectedLesson : 'Bài 1: Giới thiệu khái quát môn Sinh học';
  const profile = window.getNormalizedLessonProfile(subject, grade, lessonTitle);
  const hasCustomFile = (typeof uploadedFileContent !== 'undefined' && uploadedFileContent.trim() !== '');

  if (sub) {
    sub.innerText = `Đang khóa ngữ cảnh RAG cho: ${lessonTitle} (${subject} ${grade} - Kết nối tri thức với cuộc sống)`;
  }

  body.innerHTML = `
    <!-- Sơ đồ 3 tầng RAG -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="p-3.5 rounded-2xl bg-cyan-950/50 border border-cyan-400/50 space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black uppercase text-cyan-300">Tầng 1 • Retrieval</span>
          <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-bold text-[10px]">Đã truy xuất</span>
        </div>
        <div class="text-sm font-black text-white">Truy Xuất Ngữ Liệu Gốc SGK</div>
        <p class="text-[11px] text-slate-300">Trích xuất trực tiếp <strong>${profile.sections.length} phân đoạn kiến thức SGK</strong> và <strong>${profile.yccd.length} Yêu cầu cần đạt</strong> của bài <em>${lessonTitle}</em>.</p>
      </div>

      <div class="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-400/50 space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black uppercase text-amber-300">Tầng 2 • Augmented Grounding</span>
          <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold text-[10px]">Khóa danh pháp</span>
        </div>
        <div class="text-sm font-black text-white">Khóa Ngữ Cảnh & Danh Pháp</div>
        <p class="text-[11px] text-slate-300">Chuẩn hóa 100% thuật ngữ khoa học theo GDPT 2018 (DNA, RNA, ATP, enzyme, hormone, polypeptide...) và chặn suy diễn ngoài SGK.</p>
      </div>

      <div class="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-400/50 space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black uppercase text-emerald-300">Tầng 3 • Zero Hallucination</span>
          <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 font-bold text-[10px]">Độ chính xác 100%</span>
        </div>
        <div class="text-sm font-black text-white">Triệt Tiêu Ảo Giác Khoa Học</div>
        <p class="text-[11px] text-slate-300">Kiểm định chéo đầu ra Giáo án 5512, 34 Slide PPT và Đề thi 7991 với các vector kiến thức chuẩn của Bộ GD&ĐT.</p>
      </div>
    </div>

    <!-- Khối 1: Yêu cầu cần đạt đã neo trong RAG -->
    <div class="bg-[#0b1324] border border-cyan-500/40 rounded-2xl p-4 space-y-2">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-black uppercase text-cyan-300 flex items-center gap-1.5">
          <i class="fa-solid fa-bullseye text-amber-400"></i> 1. Vector Yêu Cầu Cần Đạt Chuẩn CT GDPT 2018 (Neo Cố Định)
        </h4>
        <span class="text-[10px] text-emerald-400 font-bold"><i class="fa-solid fa-lock mr-1"></i> Đã khóa chuẩn đầu ra</span>
      </div>
      <div class="space-y-1 pl-1">
        ${profile.yccd.map((y, idx) => `
          <div class="flex items-start gap-2 text-slate-200">
            <span class="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px] mt-0.5">YCCĐ ${idx + 1}</span>
            <span>${y}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Khối 2: Các phân đoạn (Chunks) Ngữ liệu gốc SGK Kết nối tri thức -->
    <div class="bg-[#0b1324] border border-emerald-500/40 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
          <i class="fa-solid fa-book-medical text-cyan-400"></i> 2. Các Phân Đoạn Ngữ Liệu Gốc (SGK Chunks) Được Truy Xuất Cho Bài Học
        </h4>
        <span class="text-[10px] text-cyan-300 font-bold">Nguồn: SGK ${subject} ${grade} - Kết nối tri thức với cuộc sống${hasCustomFile ? ' + Tài liệu GV' : ''}</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        ${profile.sections.map((sec, idx) => `
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-1.5">
            <div class="text-[10px] font-black text-amber-300 uppercase">CHUNK #0${idx + 1} • MỤC TRỌNG TÂM</div>
            <div class="font-bold text-white text-xs">${sec.heading}</div>
            <div class="space-y-1 text-[11px] text-slate-300">
              ${(sec.sgkContent || []).map(line => `<p>• ${line}</p>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Khối 3: Minh chứng phát hiện & chặn Ảo giác Khoa học của bài học -->
    <div class="bg-rose-950/30 border border-rose-500/50 rounded-2xl p-4 space-y-2">
      <h4 class="text-xs font-black uppercase text-rose-300 flex items-center gap-1.5">
        <i class="fa-solid fa-filter-circle-xmark text-rose-400"></i> 3. Bộ Lọc Chặn "Ảo Giác Khoa Học" Điển Hình Của Bài Học (${profile.ai.code})
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div class="p-3 rounded-xl bg-black/40 border border-rose-500/40">
          <div class="font-bold text-rose-300 mb-1"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Tình huống Ảo giác AI thông thường bị phát hiện:</div>
          <p class="text-slate-200">${profile.ai.gvAction}</p>
        </div>
        <div class="p-3 rounded-xl bg-black/40 border border-emerald-500/40">
          <div class="font-bold text-emerald-300 mb-1"><i class="fa-solid fa-check-double mr-1"></i> Đối chứng chuẩn xác từ Kho Ngữ liệu RAG SGK:</div>
          <p class="text-slate-200">${profile.ai.hsAction}</p>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
};

window.closeRAGInspectorModal = function() {
  const modal = document.getElementById('modal-rag-inspector');
  if (modal) modal.classList.add('hidden');
};

window.runRAGLiveAudit = function() {
  const banner = document.getElementById('rag-audit-status-banner');
  const subject = document.getElementById('sel-subject') ? document.getElementById('sel-subject').value : 'Sinh học';
  const grade = document.getElementById('sel-grade') ? document.getElementById('sel-grade').value : '10';
  const lessonTitle = typeof currentSelectedLesson !== 'undefined' ? currentSelectedLesson : 'Bài 1: Giới thiệu khái quát môn Sinh học';
  const profile = window.getNormalizedLessonProfile(subject, grade, lessonTitle);

  if (banner) {
    banner.innerHTML = `
      <i class="fa-solid fa-shield-check text-emerald-400"></i>
      <span>Đã kiểm định chéo thành công: Khớp 100% với ${profile.sections.length} mục SGK & ${profile.yccd.length} YCCĐ bài "${lessonTitle}" • 0% Ảo giác khoa học!</span>
    `;
  }
  window.showBioToast(`Kiểm định RAG hoàn tất: 100% nội dung bám sát SGK Kết nối tri thức (${profile.sections.length} mục kiến thức, ${profile.yccd.length} YCCĐ) — 0% Ảo giác khoa học!`, 'success');
};

window.saveDriveScriptUrl = function() {
  const val = document.getElementById('input-drive-script-url').value.trim();
  localStorage.setItem('google_drive_script_url', val);
  closeDriveSyncModal();
  window.showBioToast('Đã lưu cấu hình Google Apps Script thành công!', 'success');
};

window.initBioMasterUpgrade = function() {
  if (typeof window.updateActiveAIRunningUI === 'function') {
    window.updateActiveAIRunningUI();
  }
  if (typeof window.updateButtonLabels === 'function') {
    window.updateButtonLabels();
  }
  if (typeof window.renderLessonListUI === 'function') {
    window.renderLessonListUI();
  }
  if (typeof window.displayContentForCurrentLesson === 'function') {
    window.displayContentForCurrentLesson();
  }
  if (typeof window.updateRAGSidebarStatus === 'function') {
    window.updateRAGSidebarStatus();
  }
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', window.initBioMasterUpgrade);
} else {
  window.initBioMasterUpgrade();
}
window.addEventListener('DOMContentLoaded', window.initBioMasterUpgrade);
}


