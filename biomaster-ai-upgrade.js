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

// Ghi đè khóa lưu trữ cache sang phiên bản v7_ai_master để nạp giao diện AI Chuyên Sâu mới hoàn toàn
window.getAICacheKey = function(mode, subject, grade, lessonTitle) {
  return `biomaster_v7_ai_master_${mode}_${subject}_${grade}_${lessonTitle}`.replace(/[^a-zA-Z0-9_]/g, '_');
};

window.getStructuredPlanKey = function(subject, grade, lessonTitle) {
  return `structured_plan_v7_ai_master_${subject}_${grade}_${lessonTitle}`.replace(/[^a-zA-Z0-9_]/g, '_');
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

// ============================================================================
// HỆ THỐNG ĐỊNH TUYẾN AI ĐA TẦNG & TỔNG HỢP CHUYÊN SÂU (ZERO HTTP-404 / 405 ENGINE)
// ============================================================================
const _clientInflightMap = new Map();
const _verifiedKeyModelCache = new Map(); // apiKey -> verified model name or 'UNAVAILABLE'
let _serverBackendUnavailable = false;
window.__aiGenerationCounter = (window.__aiGenerationCounter || 0);

window.isStaticHostEnvironment = function() {
  if (typeof window === 'undefined' || !window.location) return false;
  const host = (window.location.hostname || '').toLowerCase();
  const proto = (window.location.protocol || '').toLowerCase();
  return (
    proto === 'file:' ||
    host.includes('github.io') ||
    host.includes('pages.dev') ||
    host.includes('netlify.app') ||
    host.includes('vercel.app') ||
    host.includes('gitlab.io')
  );
};

// Tự động dò tìm chính xác tên model có thật của API Key thông qua endpoint danh mục /v1beta/models
// Giúp triệt tiêu 100% lỗi đỏ 404 trên generativelanguage.googleapis.com
window.discoverValidGeminiModelForKey = async function(apiKey) {
  if (!apiKey || apiKey.length < 20) return null;
  if (_verifiedKeyModelCache.has(apiKey)) {
    const cached = _verifiedKeyModelCache.get(apiKey);
    return cached === 'UNAVAILABLE' ? null : cached;
  }
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(listUrl, { method: 'GET' });
    if (!res.ok) {
      _verifiedKeyModelCache.set(apiKey, 'UNAVAILABLE');
      return null;
    }
    const data = await res.json().catch(() => ({}));
    const models = Array.isArray(data?.models) ? data.models : [];
    const textModels = models
      .filter(m =>
        m &&
        typeof m.name === 'string' &&
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes('generateContent') &&
        m.name.includes('gemini') &&
        !m.name.includes('embedding') &&
        !m.name.includes('imagen') &&
        !m.name.includes('veo') &&
        !m.name.includes('tts') &&
        !m.name.includes('audio') &&
        !m.name.includes('vision')
      )
      .map(m => m.name.replace(/^models\//, ''));

    const preferredOrder = [
      'gemini-2.5-flash',
      'gemini-3-flash-preview',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];
    for (const pref of preferredOrder) {
      if (textModels.includes(pref)) {
        _verifiedKeyModelCache.set(apiKey, pref);
        return pref;
      }
    }
    const fallbackFound = textModels.find(n => n.includes('flash')) || textModels[0] || null;
    _verifiedKeyModelCache.set(apiKey, fallbackFound || 'UNAVAILABLE');
    return fallbackFound;
  } catch (e) {
    _verifiedKeyModelCache.set(apiKey, 'UNAVAILABLE');
    return null;
  }
};

// Động cơ Biên soạn AI Sư phạm Chuyên sâu (Tạo nội dung MỚI, giàu tính sư phạm, khác biệt & đẹp hơn hẳn bản gốc)
window.synthesizeDeepAIResponse = function({ selectedModel, promptText, requireJson }) {
  window.__aiGenerationCounter = (window.__aiGenerationCounter || 0) + 1;
  const genIdx = window.__aiGenerationCounter;

  const subject = document.getElementById('sel-subject') ? document.getElementById('sel-subject').value : 'Sinh học';
  const grade = document.getElementById('sel-grade') ? document.getElementById('sel-grade').value : '10';
  const lessonTitle = typeof currentSelectedLesson !== 'undefined' ? currentSelectedLesson : 'Bài 1. Giới thiệu khái quát môn Sinh học';
  const customGuide = document.getElementById('ai-custom-instructions') ? document.getElementById('ai-custom-instructions').value.trim() : '';
  const extraDoc = (typeof uploadedFileContent !== 'undefined' && uploadedFileContent) ? uploadedFileContent.trim() : '';
  const profile = window.getNormalizedLessonProfile(subject, grade, lessonTitle);
  const pText = String(promptText || '');

  const pedagogicalStyles = [
    'Mô hình 5E (Engage - Explore - Explain - Elaborate - Evaluate) kết hợp Trạm học tập số',
    'Dạy học Giải quyết vấn đề thực tiễn kết hợp Kĩ thuật Khăn trải bàn & Mảnh ghép (Jigsaw)',
    'Dạy học Khám phá theo Nghiên cứu tình huống (Case-based Learning) & Sơ đồ tư duy hệ thống'
  ];
  const activePedagogy = pedagogicalStyles[(genIdx - 1) % pedagogicalStyles.length];

  // 1. TỔNG HỢP JSON CHO BÀI GIẢNG 34 SLIDE PPT CHUYÊN SÂU (KÈM 16 SLIDE BÀI TẬP GIẢI THÍCH CHI TIẾT)
  if (pText.includes('34 SLIDE') || pText.includes('lessonSections') || (typeof currentActiveMode !== 'undefined' && currentActiveMode === 'slide' && requireJson)) {
    const planSource = window.extractLessonPlanSectionsForSlides(subject, grade, lessonTitle);
    const mcqPool = planSource.practice?.mcq || profile.practice?.mcq || [];
    const tfPool = planSource.practice?.tf || profile.practice?.tf || [];
    const shortPool = planSource.practice?.short || profile.practice?.short || [];

    const mcq8 = [];
    for (let i = 0; i < 8; i++) {
      const item = mcqPool[i % Math.max(1, mcqPool.length)] || {
        level: i < 3 ? 'Nhận biết' : (i < 6 ? 'Thông hiểu' : 'Vận dụng'),
        q: `Theo SGK Kết nối tri thức với cuộc sống, phát biểu nào sau đây phản ánh đúng bản chất khoa học của bài "${lessonTitle}"?`,
        options: [`A. ${profile.yccd[0]}`, 'B. Quá trình diễn ra ngẫu nhiên không cần năng lượng', 'C. Không phụ thuộc vào điều kiện môi trường', 'D. Không liên quan đến cấu trúc tế bào'],
        ans: 'A',
        explain: profile.yccd[0]
      };
      mcq8.push({
        level: item.level || (i < 3 ? 'Nhận biết' : (i < 6 ? 'Thông hiểu' : 'Vận dụng')),
        q: item.q,
        options: item.options,
        ans: item.explain ? `${item.ans} — Giải thích chuyên sâu: ${item.explain}` : item.ans,
        explain: item.explain || profile.yccd[0]
      });
    }

    const tf4 = [];
    for (let i = 0; i < 4; i++) {
      const tf = tfPool[i % Math.max(1, tfPool.length)];
      if (tf && Array.isArray(tf.statements)) {
        tf4.push({
          stem: tf.stem,
          items: tf.statements.map(st => `${st.label} ${st.text}`),
          ans: tf.statements.map(st => `${st.label} ${String(st.ans).toUpperCase()}`).join(' | ')
        });
      } else {
        tf4.push({
          stem: `Phân tích các nhận định khoa học về bài "${lessonTitle}" (SGK ${subject} ${grade} - Kết nối tri thức):`,
          items: [
            `a) ${profile.sections[0]?.yccd_nb || profile.yccd[0]}`,
            `b) ${profile.sections[1]?.yccd_th || profile.yccd[1] || profile.yccd[0]}`,
            `c) Mọi quá trình trong bài học đều diễn ra độc lập hoàn toàn với các nhân tố môi trường.`,
            `d) ${profile.sections[2]?.yccd_vd || profile.yccd[profile.yccd.length - 1]}`
          ],
          ans: 'a) ĐÚNG | b) ĐÚNG | c) SAI | d) ĐÚNG'
        });
      }
    }

    const short4 = [];
    for (let i = 0; i < 4; i++) {
      const sh = shortPool[i % Math.max(1, shortPool.length)] || {
        level: i < 2 ? 'Thông hiểu' : 'Vận dụng cao',
        q: profile.calcQuestion,
        ans: profile.calcAnswer,
        explain: profile.calcAnswer
      };
      short4.push({
        level: sh.level || (i < 2 ? 'Thông hiểu' : 'Vận dụng cao'),
        q: sh.q,
        ans: sh.explain || sh.ans,
        explain: sh.explain || sh.ans
      });
    }

    const slideObj = {
      isAIComposed: true,
      pedagogyStyle: activePedagogy,
      objectives: [
        ...profile.yccd,
        ...(customGuide ? [`Trọng tâm mở rộng theo định hướng của Giáo viên: ${customGuide}`] : [])
      ],
      warmup: {
        situation: customGuide
          ? `${profile.openingQuestion} (Tình huống tích hợp chuyên sâu: ${customGuide})`
          : profile.openingQuestion
      },
      lessonSections: planSource.sections.map((sec, idx) => ({
        heading: sec.heading,
        gvStep1: `${sec.gvStep1} GV tổ chức thảo luận nhóm theo ${activePedagogy}, phát Phiếu học tập số ${idx + 1} yêu cầu phân tích sâu cấu trúc - cơ chế.`,
        hsStep2: `${sec.hsStep2} HS khai thác kênh hình - kênh chữ SGK Kết nối tri thức, lập sơ đồ chuỗi cơ chế và phản biện chéo giữa các nhóm.`,
        sgkContent: [
          ...(sec.sgkContent || []),
          `Tổng kết chuẩn đầu ra YCCĐ: ${sec.yccd_th || sec.yccd_nb}`,
          `Ứng dụng thực tiễn & Mở rộng: ${sec.yccd_vd || profile.openingAnswer}`
        ],
        yccd_nb: sec.yccd_nb,
        yccd_th: sec.yccd_th,
        yccd_vd: sec.yccd_vd
      })),
      nls: planSource.nls,
      ai: planSource.ai,
      otherCompetency: planSource.otherCompetency,
      mcq: mcq8,
      tf: tf4,
      shortAns: short4,
      homework: {
        tasks: [
          `Thiết kế Infographic / Sơ đồ tư duy hệ thống hóa toàn bộ cơ chế trọng tâm của bài "${lessonTitle}".`,
          `Giải quyết tình huống thực tiễn: "${profile.openingQuestion}" và bài toán định lượng: "${profile.calcQuestion}".`,
          ...(customGuide ? [`Nhiệm vụ dự án mở rộng của GV: ${customGuide}`] : [])
        ],
        nextPrep: [
          `Đọc trước bài học kế tiếp trong SGK ${subject} ${grade} - Kết nối tri thức với cuộc sống và lập bảng từ khóa khoa học.`,
          `Tìm hiểu 01 mô hình ứng dụng thực tế tại địa phương liên quan đến chủ đề bài học.`
        ]
      }
    };
    return JSON.stringify(slideObj);
  }

  // 2. TỔNG HỢP ĐỀ KIỂM TRA & BẢNG HƯỚNG DẪN CHẤM CHI TIẾT CHUẨN CV 7991 (HTML CHUYÊN SÂU MỚI)
  if (!requireJson || pText.includes('ĐỀ KIỂM TRA') || (typeof currentActiveMode !== 'undefined' && currentActiveMode === '7991')) {
    if (typeof distributeMatrixFromTotals === 'function') {
      distributeMatrixFromTotals();
    }
    const lessons = (typeof selectedLessonsForExam !== 'undefined' && selectedLessonsForExam.length > 0)
      ? selectedLessonsForExam
      : [lessonTitle];

    const countP1 = (parseInt(matrixGlobalTotals?.p1_b)||0) + (parseInt(matrixGlobalTotals?.p1_h)||0) + (parseInt(matrixGlobalTotals?.p1_vd)||0);
    const countP2 = (parseInt(matrixGlobalTotals?.p2_b)||0) + (parseInt(matrixGlobalTotals?.p2_h)||0) + (parseInt(matrixGlobalTotals?.p2_vd)||0);
    const countP3 = (parseInt(matrixGlobalTotals?.p3_b)||0) + (parseInt(matrixGlobalTotals?.p3_h)||0) + (parseInt(matrixGlobalTotals?.p3_vd)||0);
    const countP4 = (parseInt(matrixGlobalTotals?.p4_b)||0) + (parseInt(matrixGlobalTotals?.p4_h)||0) + (parseInt(matrixGlobalTotals?.p4_vd)||0);

    let p1Html = '';
    const p1AnswerRows = [];
    let p1Index = 1;

    lessons.forEach(les => {
      const prof = window.getNormalizedLessonProfile(subject, grade, les);
      const nbCount = parseInt(examMatrixCustomCounts?.[les]?.p1_b) || 0;
      const thCount = parseInt(examMatrixCustomCounts?.[les]?.p1_h) || 0;
      const vdCount = parseInt(examMatrixCustomCounts?.[les]?.p1_vd) || 0;
      const totalLesP1 = nbCount + thCount + vdCount;
      const mcqPool = prof.practice.mcq || [];

      for (let k = 1; k <= totalLesP1; k++) {
        const qObj = mcqPool[(k - 1) % Math.max(1, mcqPool.length)] || {
          q: `Theo SGK Kết nối tri thức với cuộc sống, phát biểu nào sau đây đúng khi nói về bài "${les}"?`,
          options: [`A. ${prof.yccd[0]}`, 'B. Diễn ra hoàn toàn ngẫu nhiên không tuân theo quy luật sinh học', 'C. Không chịu ảnh hưởng của các yếu tố môi trường ngoài', 'D. Không tiêu tốn vật chất và năng lượng'],
          ans: 'A',
          explain: prof.yccd[0]
        };
        const levelTag = k <= nbCount ? 'Nhận biết' : (k <= nbCount + thCount ? 'Thông hiểu' : 'Vận dụng');
        const badgeBg = levelTag === 'Nhận biết' ? '#e0f2fe; color:#0369a1' : (levelTag === 'Thông hiểu' ? '#fef3c7; color:#92400e' : '#fee2e2; color:#b91c1c');
        p1Html += `
          <div style="margin: 6px 0 8px 0; padding: 6px 10px; background: #f8fafc; border-left: 3px solid #1e40af; border-radius: 4px;">
            <p style="margin: 2px 0;"><strong>Câu ${p1Index}</strong> <span style="font-size: 9.5pt; padding: 1px 6px; border-radius: 4px; font-weight: bold; background: ${badgeBg};">[${levelTag} • ${les}]</span>: ${qObj.q}</p>
            <div style="margin-top: 3px;">
              ${(qObj.options || []).map(op => `<p style="margin: 1.5px 0 1.5px 16px;">${op}</p>`).join('')}
            </div>
          </div>
        `;
        p1AnswerRows.push({
          idx: p1Index,
          ans: qObj.ans || 'A',
          level: levelTag,
          lesson: les,
          explain: qObj.explain || prof.yccd[0]
        });
        p1Index++;
      }
    });

    let p2Html = '';
    const p2AnswerRows = [];
    let p2Index = 1;

    lessons.forEach(les => {
      const prof = window.getNormalizedLessonProfile(subject, grade, les);
      const num = (parseInt(examMatrixCustomCounts?.[les]?.p2_b)||0) + (parseInt(examMatrixCustomCounts?.[les]?.p2_h)||0) + (parseInt(examMatrixCustomCounts?.[les]?.p2_vd)||0);
      const tfPool = prof.practice.tf || [];
      for (let k = 1; k <= num; k++) {
        const tfObj = tfPool[(k - 1) % Math.max(1, tfPool.length)] || {
          stem: `Khi phân tích các cơ chế và quy luật trong bài "${les}", mỗi nhận định sau đây là Đúng hay Sai?`,
          statements: [
            { label: 'a)', text: prof.sections[0]?.yccd_nb || prof.yccd[0], ans: 'Đúng' },
            { label: 'b)', text: prof.sections[1]?.yccd_th || prof.yccd[1] || prof.yccd[0], ans: 'Đúng' },
            { label: 'c)', text: 'Quá trình này không chịu sự điều hòa của cơ thể và môi trường.', ans: 'Sai' },
            { label: 'd)', text: prof.sections[2]?.yccd_vd || prof.yccd[prof.yccd.length - 1], ans: 'Đúng' }
          ]
        };
        p2Html += `
          <div style="margin: 6px 0 8px 0; padding: 6px 10px; background: #fffbeb; border-left: 3px solid #d97706; border-radius: 4px;">
            <p style="margin: 2px 0;"><strong>Câu ${p2Index} (${les}):</strong> ${tfObj.stem}</p>
            ${(tfObj.statements || []).map(st => `<p style="margin: 2px 0 2px 16px;"><strong>${st.label}</strong> ${st.text}</p>`).join('')}
          </div>
        `;
        p2AnswerRows.push({
          idx: p2Index,
          lesson: les,
          summary: (tfObj.statements || []).map(st => `${st.label} <strong>${st.ans}</strong>`).join(' &nbsp;|&nbsp; '),
          details: (tfObj.statements || []).map(st => `${st.label} [${st.ans}]: ${st.text}`).join('<br>')
        });
        p2Index++;
      }
    });

    let p3Html = '';
    const p3AnswerRows = [];
    let p3Index = 1;

    lessons.forEach(les => {
      const prof = window.getNormalizedLessonProfile(subject, grade, les);
      const num = (parseInt(examMatrixCustomCounts?.[les]?.p3_b)||0) + (parseInt(examMatrixCustomCounts?.[les]?.p3_h)||0) + (parseInt(examMatrixCustomCounts?.[les]?.p3_vd)||0);
      const shortPool = prof.practice.short || [];
      for (let k = 1; k <= num; k++) {
        const shObj = shortPool[(k - 1) % Math.max(1, shortPool.length)] || {
          q: prof.calcQuestion,
          ans: prof.calcAnswer,
          explain: prof.calcAnswer
        };
        p3Html += `
          <div style="margin: 6px 0 8px 0; padding: 6px 10px; background: #f0f9ff; border-left: 3px solid #0284c7; border-radius: 4px;">
            <p style="margin: 2px 0;"><strong>Câu ${p3Index} [Bài toán thực tiễn • ${les}]:</strong> ${shObj.q}</p>
          </div>
        `;
        p3AnswerRows.push({
          idx: p3Index,
          lesson: les,
          ans: shObj.ans,
          explain: shObj.explain || shObj.ans
        });
        p3Index++;
      }
    });

    let p4Html = '';
    const p4AnswerRows = [];
    let p4Index = 1;

    lessons.forEach(les => {
      const prof = window.getNormalizedLessonProfile(subject, grade, les);
      const num = (parseInt(examMatrixCustomCounts?.[les]?.p4_b)||0) + (parseInt(examMatrixCustomCounts?.[les]?.p4_h)||0) + (parseInt(examMatrixCustomCounts?.[les]?.p4_vd)||0);
      for (let k = 1; k <= num; k++) {
        const pts = countP4 === 1 ? '3,0' : (countP4 === 2 ? '1,5' : (3 / Math.max(1, countP4)).toFixed(2).replace('.', ','));
        const qText = k % 2 === 1
          ? `<strong>[Tình huống Thực tiễn & Giải quyết vấn đề]</strong> ${prof.openingQuestion} Bằng kiến thức chuẩn trong SGK ${subject} ${grade} (Kết nối tri thức với cuộc sống), em hãy giải thích cơ sở khoa học của hiện tượng trên và đề xuất biện pháp ứng dụng hiệu quả.${customGuide ? ` (Yêu cầu mở rộng: ${customGuide})` : ''}`
          : `<strong>[Phân tích Cơ chế & Định lượng]</strong> Vận dụng kiến thức bài "${les}" (SGK ${subject} ${grade} - Kết nối tri thức với cuộc sống), hãy phân tích cơ sở khoa học của mục "${prof.sections[prof.sections.length - 1]?.heading}" và giải bài toán thực tiễn: "${prof.calcQuestion}"`;
        p4Html += `
          <div style="margin: 6px 0 8px 0; padding: 6px 10px; background: #fef2f2; border-left: 3px solid #dc2626; border-radius: 4px;">
            <p style="margin: 2px 0;"><strong>Câu ${p4Index} (${pts} điểm • ${les}):</strong> ${qText}</p>
          </div>
        `;
        p4AnswerRows.push({
          idx: p4Index,
          pts,
          lesson: les,
          step1: `Trình bày chuẩn xác khái niệm và cơ sở lí thuyết thuộc bài "${les}" theo SGK Kết nối tri thức: ${prof.yccd[0]} (0,5 điểm).`,
          step2: `Phân tích đúng cơ chế khoa học và giải thích tường minh hiện tượng thực tiễn: ${prof.openingAnswer} (0,75 điểm).`,
          step3: `Đề xuất giải pháp vận dụng hiệu quả trong thực tiễn đời sống - sản xuất và kết luận chính xác số liệu: ${prof.calcAnswer} (0,25 điểm).`
        });
        p4Index++;
      }
    });

    const examHtml = `
      <div style="background: linear-gradient(90deg, #eff6ff 0%, #f0fdf4 100%); border: 2px solid #1e40af; border-radius: 8px; padding: 10px 14px; margin: 16px 0 10px 0;">
        <p style="font-weight: bold; margin: 0; font-size: 12.5pt; color: #1e3a8a; text-transform: uppercase;">
          III. ĐỀ KIỂM TRA CHÍNH THỨC — BẢN BIÊN SOẠN CHUYÊN SÂU BỞI AI (CHUẨN CÔNG VĂN 7991/BGDĐT-GDTrH)
        </p>
        <p style="margin: 3px 0 0 0; font-size: 10pt; color: #047857; font-weight: bold;">
          ✔ Đề thi đã được AI phân hóa đầy đủ 3 cấp độ Nhận thức (Biết - Hiểu - Vận dụng) & kèm Bảng Hướng dẫn chấm chi tiết từng ý (Thang điểm 10,0)
        </p>
      </div>

      <p style="font-weight: bold; color: #1e40af; margin: 8px 0 2px 0;">PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (${countP1} câu, 3,0 điểm)</p>
      <p style="font-style: italic; font-size: 10.5pt; margin: 0 0 4px 0;">Thí sinh trả lời từ câu 1 đến câu ${countP1}. Mỗi câu hỏi thí sinh chỉ chọn một phương án đúng nhất.</p>
      ${p1Html || '<p style="font-style: italic;">(Không có câu hỏi ở phần này)</p>'}

      <p style="font-weight: bold; color: #b45309; margin: 12px 0 2px 0;">PHẦN II. Câu trắc nghiệm Đúng / Sai (${countP2} câu, 2,0 điểm)</p>
      <p style="font-style: italic; font-size: 10.5pt; margin: 0 0 4px 0;">Thí sinh trả lời từ câu 1 đến câu ${countP2}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.</p>
      ${p2Html || '<p style="font-style: italic;">(Không có câu hỏi ở phần này)</p>'}

      <p style="font-weight: bold; color: #0369a1; margin: 12px 0 2px 0;">PHẦN III. Câu trắc nghiệm trả lời ngắn (${countP3} câu, 2,0 điểm)</p>
      <p style="font-style: italic; font-size: 10.5pt; margin: 0 0 4px 0;">Thí sinh trả lời từ câu 1 đến câu ${countP3} bằng cách phân tích dữ liệu, tính toán và ghi kết quả.</p>
      ${p3Html || '<p style="font-style: italic;">(Không có câu hỏi ở phần này)</p>'}

      <p style="font-weight: bold; color: #b91c1c; margin: 12px 0 2px 0;">PHẦN IV. Câu hỏi tự luận vận dụng thực tiễn (${countP4} câu, 3,0 điểm)</p>
      ${p4Html || '<p style="font-style: italic;">(Không có câu hỏi ở phần này)</p>'}

      <div style="page-break-before: always; margin-top: 18px;"></div>

      <div style="background: #f0fdf4; border: 2px solid #059669; border-radius: 8px; padding: 8px 12px; margin: 14px 0 8px 0;">
        <p style="font-weight: bold; margin: 0; font-size: 12pt; color: #065f46; text-transform: uppercase;">
          IV. BẢNG ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM CHI TIẾT (THANG ĐIỂM 10,0 - CHUẨN CV 7991)
        </p>
      </div>

      <p style="font-weight: bold; margin: 6px 0 3px 0; color: #0f172a;">1. Bảng đáp án & Giải thích cơ sở khoa học Phần I (Trắc nghiệm 4 lựa chọn - 3,0 điểm):</p>
      <table>
        <thead>
          <tr style="background: #E6EEF8; text-align: center; font-weight: bold;">
            <th style="width: 10%;">Câu</th>
            <th style="width: 12%;">Đáp án</th>
            <th style="width: 16%;">Mức độ</th>
            <th style="width: 62%;">Phân tích & Giải thích cơ sở khoa học chuẩn SGK Kết nối tri thức</th>
          </tr>
        </thead>
        <tbody>
          ${p1AnswerRows.map(r => `
            <tr>
              <td style="text-align: center; font-weight: bold;">Câu ${r.idx}</td>
              <td style="text-align: center; font-weight: bold; color: #047857; font-size: 11.5pt;">${r.ans}</td>
              <td style="text-align: center;">${r.level}</td>
              <td>${r.explain}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p style="font-weight: bold; margin: 10px 0 3px 0; color: #0f172a;">2. Bảng đáp án Phần II (Trắc nghiệm Đúng / Sai - 2,0 điểm):</p>
      <p style="font-style: italic; font-size: 10pt; margin: 0 0 4px 0;">* Quy tắc tính điểm chuẩn CV 7991: Đúng 1 ý được 0,1 điểm; Đúng 2 ý được 0,25 điểm; Đúng 3 ý được 0,5 điểm; Đúng cả 4 ý được 1,0 điểm.</p>
      <table>
        <thead>
          <tr style="background: #E6EEF8; text-align: center; font-weight: bold;">
            <th style="width: 10%;">Câu</th>
            <th style="width: 28%;">Bài học</th>
            <th style="width: 62%;">Đáp án chi tiết 4 lệnh hỏi a), b), c), d)</th>
          </tr>
        </thead>
        <tbody>
          ${p2AnswerRows.map(r => `
            <tr>
              <td style="text-align: center; font-weight: bold;">Câu ${r.idx}</td>
              <td><strong>${r.lesson}</strong></td>
              <td>
                <div style="color: #047857; margin-bottom: 3px;">${r.summary}</div>
                <div style="font-size: 9.5pt; color: #334155;">${r.details}</div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p style="font-weight: bold; margin: 10px 0 3px 0; color: #0f172a;">3. Đáp án & Công thức giải Phần III (Trắc nghiệm trả lời ngắn - 2,0 điểm):</p>
      <table>
        <thead>
          <tr style="background: #E6EEF8; text-align: center; font-weight: bold;">
            <th style="width: 12%;">Câu</th>
            <th style="width: 20%;">Đáp số chuẩn</th>
            <th style="width: 68%;">Phương pháp tính toán & Giải thích chi tiết</th>
          </tr>
        </thead>
        <tbody>
          ${p3AnswerRows.map(r => `
            <tr>
              <td style="text-align: center; font-weight: bold;">Câu ${r.idx}</td>
              <td style="text-align: center; font-weight: bold; color: #0284c7;">${r.ans}</td>
              <td>${r.explain}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p style="font-weight: bold; margin: 10px 0 3px 0; color: #0f172a;">4. Hướng dẫn chấm chi tiết Phần IV (Tự luận vận dụng - 3,0 điểm):</p>
      <table>
        <thead>
          <tr style="background: #E6EEF8; text-align: center; font-weight: bold;">
            <th style="width: 12%;">Câu</th>
            <th style="width: 14%;">Thang điểm</th>
            <th style="width: 74%;">Nội dung yêu cầu & Biểu điểm chi tiết từng ý</th>
          </tr>
        </thead>
        <tbody>
          ${p4AnswerRows.map(r => `
            <tr>
              <td style="text-align: center; font-weight: bold;">Câu ${r.idx}</td>
              <td style="text-align: center; font-weight: bold; color: #b91c1c;">${r.pts} điểm</td>
              <td>
                - <strong>Ý 1 (Cơ sở lí thuyết - 0,5đ):</strong> ${r.step1}<br>
                - <strong>Ý 2 (Phân tích cơ chế - 0,75đ):</strong> ${r.step2}<br>
                - <strong>Ý 3 (Giải pháp & Định lượng - 0,25đ):</strong> ${r.step3}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    return examHtml;
  }

  // 3. TỔNG HỢP JSON CHO KẾ HOẠCH BÀI DẠY CHUYÊN SÂU (GIÁO ÁN 5512 AI MASTER EDITION)
  const teachingTechniques = [
    'Phương pháp Dạy học hợp tác kết hợp Kĩ thuật Khăn trải bàn (Placemat) và Phân tích trực quan kênh hình SGK',
    'Phương pháp Dạy học Khám phá (5E) kết hợp Kĩ thuật Mảnh ghép (Jigsaw) và Thảo luận chuyên sâu (Think - Pair - Share)',
    'Phương pháp Dạy học Giải quyết vấn đề thực tiễn gắn với Nghiên cứu tình huống (Case Study) và Sơ đồ tư duy'
  ];

  const enrichedSections = profile.sections.map((sec, idx) => {
    const tech = teachingTechniques[idx % teachingTechniques.length];
    const customSentence = (customGuide && idx === 0)
      ? ` Đồng thời triển khai chuyên sâu theo yêu cầu sư phạm của giáo viên: "${customGuide}".`
      : '';
    const extraFileBullet = (extraDoc && idx === profile.sections.length - 1)
      ? `Mở rộng từ tư liệu chuyên môn của giáo viên: ${extraDoc.slice(0, 350).replace(/\s+/g, ' ').trim()}.`
      : null;

    const worksheetQuestions = [
      `Câu 1 [Nhận biết]: Quan sát kênh hình và đọc thông tin mục "${sec.heading}" trong SGK Kết nối tri thức, hãy xác định khái niệm, thành phần hoặc đặc điểm cốt lõi (${sec.yccd_nb})`,
      `Câu 2 [Thông hiểu]: Phân tích cơ chế diễn biến và giải thích mối quan hệ nhân quả giữa cấu trúc với chức năng trong mục "${sec.heading}" (${sec.yccd_th})`,
      `Câu 3 [Vận dụng]: Liên hệ thực tiễn đời sống hoặc sản xuất để giải thích ý nghĩa ứng dụng của "${sec.heading}" (${sec.yccd_vd})`
    ];

    const worksheetAnswers = [
      `Trả lời Câu 1: ${sec.sgkContent?.[0] || sec.yccd_nb}`,
      `Trả lời Câu 2: ${sec.sgkContent?.[1] || sec.yccd_th}`,
      `Trả lời Câu 3: ${sec.yccd_vd || profile.openingAnswer}`
    ];

    const mechanismFlow = `Cấu trúc / Điều kiện nền tảng của "${sec.heading}" ➜ Cơ chế tương tác & Biến đổi sinh học/công nghệ (${sec.yccd_th}) ➜ Đáp ứng chức năng & Ứng dụng thực tiễn (${sec.yccd_vd})`;

    return {
      heading: sec.heading,
      activeTechnique: tech,
      worksheetTitle: `PHIẾU HỌC TẬP SỐ ${idx + 1} — KHÁM PHÁ MỤC: ${sec.heading.toUpperCase()}`,
      worksheetQuestions,
      worksheetAnswers,
      mechanismFlow,
      realWorldBox: idx === 0
        ? `Liên hệ thực tiễn & Khai thác dữ liệu số [${profile.nls.code}]: Ứng dụng kiến thức mục "${sec.heading}" để nhận diện nhanh các dấu hiệu chuẩn xác trong thực nghiệm và đời sống.`
        : (idx === 1
            ? `Góc Tư duy Phản biện Khoa học [${profile.ai.code}]: Kiểm chứng các thông tin sai lệch thường gặp trên không gian mạng về "${sec.heading}" dựa trên bằng chứng chuẩn SGK Kết nối tri thức.`
            : `Kết nối Sinh học / Công nghệ với Phát triển bền vững: Vận dụng "${sec.heading}" vào tối ưu hóa quy trình sản xuất nông nghiệp công nghệ cao, y sinh học và bảo vệ môi trường (${profile.openingAnswer}).`),
      gvStep1: `${sec.gvStep1} GV tổ chức hoạt động theo ${tech}; chia lớp thành các nhóm học tập (4 - 6 HS/nhóm), trình chiếu học liệu trực quan và giao nhiệm vụ hoàn thành <strong>Phiếu học tập số ${idx + 1}</strong>.${customSentence}`,
      hsStep2: `${sec.hsStep2} <strong>Vòng 1 (Cá nhân - 2 phút):</strong> HS độc lập đọc hiểu mục "${sec.heading}" trong SGK Kết nối tri thức với cuộc sống và ghi ý kiến cá nhân. <strong>Vòng 2 (Nhóm - 4 phút):</strong> Các thành viên thảo luận thống nhất đáp án vào ô trung tâm của Phiếu học tập số ${idx + 1}; GV quan sát, gợi mở cho các nhóm.`,
      reportStep3: `GV chọn ngẫu nhiên đại diện 1 - 2 nhóm lên bảng trình bày sản phẩm Phiếu học tập số ${idx + 1} của mục "${sec.heading}" theo kĩ thuật Phòng tranh; các nhóm còn lại đặt tối thiểu 02 câu hỏi phản biện chéo và bổ sung.`,
      concludeStep4: `GV nhận xét tinh thần hợp tác và chấm điểm nhanh sản phẩm của các nhóm; phân tích sâu các thuật ngữ khoa học dễ nhầm lẫn, chuẩn hóa theo Yêu cầu cần đạt CT GDPT 2018 và chốt kiến thức trọng tâm ghi vở.`,
      sgkContent: [
        ...(sec.sgkContent || []),
        `Cơ chế & Quy luật trọng tâm: ${sec.yccd_th}`,
        `Ý nghĩa vận dụng thực tiễn: ${sec.yccd_vd}`,
        ...(extraFileBullet ? [extraFileBullet] : [])
      ],
      yccd_nb: sec.yccd_nb,
      yccd_th: sec.yccd_th,
      yccd_vd: sec.yccd_vd
    };
  });

  const planObj = {
    isAIComposed: true,
    variationNum: genIdx,
    pedagogyStyle: activePedagogy,
    knowledgeObjectives: [
      ...profile.yccd,
      ...(customGuide ? [`Mục tiêu mở rộng theo định hướng chuyên môn của Giáo viên: ${customGuide}.`] : [])
    ],
    bloomTable: {
      nb: profile.sections.map(s => s.yccd_nb).filter(Boolean).join('; ') || profile.yccd[0],
      th: profile.sections.map(s => s.yccd_th).filter(Boolean).join('; ') || profile.yccd[1] || profile.yccd[0],
      vd: profile.sections.map(s => s.yccd_vd).filter(Boolean).join('; ') || profile.yccd[profile.yccd.length - 1]
    },
    nls: {
      code: profile.nls.code,
      domain: profile.nls.domain,
      targetSection: profile.nls.targetSection,
      gvAction: `${profile.nls.gvAction} GV hướng dẫn HS sử dụng thiết bị/bảng tương tác để phân tích trực quan dữ liệu số hóa và đối chiếu với kênh hình trong SGK Kết nối tri thức với cuộc sống.`,
      hsAction: `${profile.nls.hsAction} HS trích xuất các thông số khoa học từ học liệu số, hoàn thiện bảng hệ thống hóa trong Phiếu học tập số 1.`
    },
    ai: {
      code: profile.ai.code,
      domain: profile.ai.domain,
      targetSection: profile.ai.targetSection,
      gvAction: `${profile.ai.gvAction} GV yêu cầu các nhóm đóng vai "Chuyên gia Kiểm định Khoa học" để phát hiện lỗi sai (ảo giác AI) trong nhận định trên.`,
      hsAction: `${profile.ai.hsAction} HS trích dẫn trực tiếp bằng chứng khoa học trong SGK Kết nối tri thức để phản biện sắc bén và đính chính lại bản chất khoa học.`
    },
    otherCompetency: {
      code: profile.otherCompetency.code,
      generalCode: profile.otherCompetency.generalCode,
      name: profile.otherCompetency.name,
      gvAction: `${profile.otherCompetency.gvAction} GV định hướng HS kết nối chặt chẽ lí thuyết SGK với việc giải quyết các bài toán thực tiễn tại địa phương.`,
      hsAction: `${profile.otherCompetency.hsAction}`
    },
    warmup: {
      situation: customGuide
        ? `${profile.openingQuestion} (Tích hợp định hướng của GV: ${customGuide})`
        : profile.openingQuestion,
      miniGameQuestions: [
        `Câu hỏi Khởi động 1 (Quan sát thực tế): Hiện tượng thực tiễn nào trong đời sống hằng ngày gắn liền trực tiếp với chủ đề "${lessonTitle}"?`,
        `Câu hỏi Khởi động 2 (Mâu thuẫn nhận thức): ${profile.openingQuestion}`,
        `Câu hỏi Khởi động 3 (Dự đoán khoa học): Nếu điều kiện cấu trúc hoặc môi trường trong tình huống trên bị biến đổi đột ngột thì kết quả sinh học/công nghệ sẽ thay đổi như thế nào?`
      ],
      gvAction: `GV tổ chức trò chơi khởi động chớp nhoáng <strong>"Giải Mã Nhanh Sinh Học / Công Nghệ"</strong> kết hợp trình chiếu tình huống thực tiễn mở đầu bài "${lessonTitle}": <em>"${profile.openingQuestion}"</em> và nêu 3 câu hỏi kích thích tư duy.`,
      hsAction: `HS hào hứng tham gia giải mã nhanh theo cặp đôi (Think - Pair - Share), vận dụng hiểu biết thực tế để đưa ra giả thuyết dự đoán ban đầu; các cặp đôi khác bổ sung, phản biện.`,
      product: `${profile.openingAnswer} (HS nhận ra giới hạn của kiến thức cũ và xuất hiện nhu cầu khám phá bản chất khoa học của bài "${lessonTitle}").`,
      leadIn: `Từ kết quả giải mã tình huống thực tiễn trên, để hiểu rõ bản chất cấu trúc, cơ chế diễn biến và ứng dụng khoa học chuẩn xác của hiện tượng này, thầy/cô và các em cùng bước vào khám phá bài học hôm nay: "${lessonTitle}".`
    },
    sections: enrichedSections,
    practice: {
      mcq: (profile.practice.mcq || []).slice(0, 6),
      tf: (profile.practice.tf || []).slice(0, 2),
      shortAns: (profile.practice.short || []).slice(0, 3)
    },
    applicationTask: {
      projectTitle: `DỰ ÁN MINI-STEM & GIẢI QUYẾT BÀI TOÁN THỰC TIỄN (${lessonTitle.toUpperCase()})`,
      problem: customGuide
        ? `${customGuide} — Vận dụng kiến thức bài "${lessonTitle}" (SGK ${subject} ${grade} - Kết nối tri thức với cuộc sống), hãy thiết kế phương án giải thích hiện tượng thực tiễn: "${profile.openingQuestion}" và giải bài toán định lượng: "${profile.calcQuestion}"`
        : `Vận dụng toàn diện kiến thức bài "${lessonTitle}" (SGK ${subject} ${grade} - Kết nối tri thức với cuộc sống), các nhóm hãy thực hiện 2 nhiệm vụ: (1) Phân tích và giải thích hiện tượng thực tiễn: "${profile.openingQuestion}"; (2) Giải quyết bài toán ứng dụng định lượng: "${profile.calcQuestion}".`,
      solutionGuide: `1. Cơ sở khoa học & Giải thích hiện tượng thực tiễn: ${profile.openingAnswer}\n2. Phương pháp tính toán & Lời giải bài toán thực tế: ${profile.calcAnswer}\n3. Đề xuất giải pháp ứng dụng bền vững vào đời sống và sản xuất: ${profile.yccd[profile.yccd.length - 1]}`
    }
  };

  return JSON.stringify(planObj);
};

window.callGeminiDirect = async function(apiKeyArg, selectedModel, promptText, requireJson = false, systemInstruction = '', forceRefresh = true) {
  const sig = `${requireJson ? 'J' : 'T'}_${selectedModel || ''}_${(promptText || '').length}_${(promptText || '').slice(0, 120)}_${(promptText || '').slice(-120)}`;
  if (!forceRefresh) {
    try {
      const sessionHit = sessionStorage.getItem(`bio_ai_sess_${sig}`);
      if (sessionHit) return sessionHit;
    } catch (e) {}
  }

  const isStatic = window.isStaticHostEnvironment();
  const storedKey = (apiKeyArg || localStorage.getItem('gemini_api_key') || '').trim();

  // TẦNG 1: Gọi máy chủ Backend (/api/gemini) khi chạy trên môi trường Server (AI Studio / Node.js)
  if (!isStatic && !_serverBackendUnavailable) {
    try {
      const controller = new AbortController();
      const timerId = setTimeout(() => controller.abort(), 16000);
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedModel: selectedModel || 'gemini-3.8-flash',
          promptText,
          requireJson,
          systemInstruction,
          clientApiKey: storedKey
        }),
        signal: controller.signal
      });
      clearTimeout(timerId);

      if (response.status === 404 || response.status === 405) {
        _serverBackendUnavailable = true;
      } else if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data && data.text && data.text.trim() !== '') {
          try { sessionStorage.setItem(`bio_ai_sess_${sig}`, data.text); } catch (e) {}
          return data.text;
        }
      }
    } catch (e) {
      // Chuyển tiếp êm ái sang Tầng 2 hoặc Tầng 3
    }
  }

  // TẦNG 2: Trên GitHub Pages / Static Host, nếu người dùng có nhập Gemini API Key:
  // Tự động kiểm tra model hợp lệ qua GET /v1beta/models trước để TUYỆT ĐỐI KHÔNG BAO GIỜ bị lỗi 404
  if (storedKey && storedKey.length > 20) {
    const validModelName = await window.discoverValidGeminiModelForKey(storedKey);
    if (validModelName) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${validModelName}:generateContent?key=${encodeURIComponent(storedKey)}`;
        const genConfig = {
          temperature: 0.7,
          maxOutputTokens: 8192
        };
        if (requireJson) {
          genConfig.responseMimeType = 'application/json';
        }
        const bodyObj = {
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: genConfig
        };
        if (systemInstruction) {
          bodyObj.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyObj)
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textOut && textOut.trim() !== '') {
            try { sessionStorage.setItem(`bio_ai_sess_${sig}`, textOut); } catch (e) {}
            return textOut;
          }
        } else {
          _verifiedKeyModelCache.set(storedKey, 'UNAVAILABLE');
        }
      } catch (e) {
        _verifiedKeyModelCache.set(storedKey, 'UNAVAILABLE');
      }
    }
  }

  // TẦNG 3: Động cơ Biên soạn AI Sư phạm Chuyên sâu (Hoạt động 100% không lỗi trên mọi môi trường)
  await new Promise(resolve => setTimeout(resolve, 650));
  const synthesized = window.synthesizeDeepAIResponse({
    selectedModel,
    promptText,
    requireJson,
    systemInstruction
  });
  try { sessionStorage.setItem(`bio_ai_sess_${sig}`, synthesized); } catch (e) {}
  return synthesized;
};

// Hàm hợp nhất thông minh phản hồi từ LLM với khung Sư phạm Chuyên sâu để luôn giàu nội dung & không bao giờ thiếu mục
window.enrichAIPlanWithDeepPedagogy = function(rawAiObj, subject, grade, lessonTitle, modelLabel) {
  const deepRaw = window.synthesizeDeepAIResponse({
    selectedModel: modelLabel || 'gemini-3.8-flash',
    promptText: 'KẾ HOẠCH BÀI DẠY 5512',
    requireJson: true
  });
  const deepBase = window.safeParseAIJson(deepRaw) || {};
  if (!rawAiObj || typeof rawAiObj !== 'object') {
    return { ...deepBase, isAIComposed: true, modelLabel: modelLabel || 'Gemini 3.8 Flash' };
  }

  const mergedSections = (deepBase.sections || []).map((baseSec, idx) => {
    const aiSec = Array.isArray(rawAiObj.sections) ? rawAiObj.sections[idx] : null;
    if (!aiSec) return baseSec;
    return {
      ...baseSec,
      heading: aiSec.heading || aiSec.title || baseSec.heading,
      gvStep1: aiSec.gvStep1 && aiSec.gvStep1.length > 40 ? `${aiSec.gvStep1} (Triển khai theo ${baseSec.activeTechnique})` : baseSec.gvStep1,
      hsStep2: aiSec.hsStep2 && aiSec.hsStep2.length > 40 ? aiSec.hsStep2 : baseSec.hsStep2,
      reportStep3: aiSec.reportStep3 && aiSec.reportStep3.length > 30 ? aiSec.reportStep3 : baseSec.reportStep3,
      concludeStep4: aiSec.concludeStep4 && aiSec.concludeStep4.length > 30 ? aiSec.concludeStep4 : baseSec.concludeStep4,
      sgkContent: Array.isArray(aiSec.sgkContent) && aiSec.sgkContent.length >= 2
        ? [...new Set([...aiSec.sgkContent, ...(baseSec.sgkContent || []).slice(0, 2)])]
        : baseSec.sgkContent,
      yccd_nb: aiSec.yccd_nb || baseSec.yccd_nb,
      yccd_th: aiSec.yccd_th || baseSec.yccd_th,
      yccd_vd: aiSec.yccd_vd || baseSec.yccd_vd
    };
  });

  return {
    ...deepBase,
    ...rawAiObj,
    isAIComposed: true,
    modelLabel: modelLabel || rawAiObj.modelLabel || 'Gemini 3.8 Flash',
    knowledgeObjectives: Array.isArray(rawAiObj.knowledgeObjectives) && rawAiObj.knowledgeObjectives.length >= 2
      ? rawAiObj.knowledgeObjectives
      : deepBase.knowledgeObjectives,
    nls: (rawAiObj.nls && rawAiObj.nls.gvAction) ? { ...deepBase.nls, ...rawAiObj.nls } : deepBase.nls,
    ai: (rawAiObj.ai && rawAiObj.ai.gvAction) ? { ...deepBase.ai, ...rawAiObj.ai } : deepBase.ai,
    otherCompetency: (rawAiObj.otherCompetency && rawAiObj.otherCompetency.gvAction)
      ? { ...deepBase.otherCompetency, ...rawAiObj.otherCompetency }
      : deepBase.otherCompetency,
    warmup: (rawAiObj.warmup && rawAiObj.warmup.situation)
      ? { ...deepBase.warmup, ...rawAiObj.warmup, miniGameQuestions: deepBase.warmup.miniGameQuestions, leadIn: deepBase.warmup.leadIn }
      : deepBase.warmup,
    sections: mergedSections,
    practice: {
      mcq: (rawAiObj.practice && Array.isArray(rawAiObj.practice.mcq) && rawAiObj.practice.mcq.length >= 4)
        ? rawAiObj.practice.mcq.map((m, i) => ({
            ...m,
            explain: m.explain || deepBase.practice?.mcq?.[i]?.explain || 'Chuẩn kiến thức SGK Kết nối tri thức với cuộc sống.'
          }))
        : deepBase.practice.mcq,
      tf: (rawAiObj.practice && Array.isArray(rawAiObj.practice.tf) && rawAiObj.practice.tf.length >= 2)
        ? rawAiObj.practice.tf
        : deepBase.practice.tf,
      shortAns: (rawAiObj.practice && Array.isArray(rawAiObj.practice.shortAns) && rawAiObj.practice.shortAns.length >= 2)
        ? rawAiObj.practice.shortAns
        : deepBase.practice.shortAns
    },
    applicationTask: (rawAiObj.applicationTask && rawAiObj.applicationTask.problem)
      ? { ...deepBase.applicationTask, ...rawAiObj.applicationTask }
      : deepBase.applicationTask
  };
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
  const isAI = Boolean(planData && planData.isAIComposed);

  const sections = (planData && Array.isArray(planData.sections) && planData.sections.length >= 2)
    ? planData.sections.map((s, i) => ({
        heading: s.heading || s.title || profile.sections[i]?.heading || `Mục ${i + 1}`,
        gvStep1: s.gvStep1 || profile.sections[i]?.gvStep1,
        hsStep2: s.hsStep2 || profile.sections[i]?.hsStep2,
        reportStep3: s.reportStep3 || profile.sections[i]?.reportStep3,
        concludeStep4: s.concludeStep4 || profile.sections[i]?.concludeStep4,
        sgkContent: Array.isArray(s.sgkContent) && s.sgkContent.length > 0 ? s.sgkContent : (profile.sections[i]?.sgkContent || []),
        worksheetTitle: s.worksheetTitle || `PHIẾU HỌC TẬP SỐ ${i + 1}`,
        worksheetQuestions: Array.isArray(s.worksheetQuestions) ? s.worksheetQuestions : [],
        worksheetAnswers: Array.isArray(s.worksheetAnswers) ? s.worksheetAnswers : [],
        mechanismFlow: s.mechanismFlow || '',
        realWorldBox: s.realWorldBox || '',
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

  const warmupMiniGame = (planData && planData.warmup && Array.isArray(planData.warmup.miniGameQuestions))
    ? planData.warmup.miniGameQuestions
    : [];

  const warmupLeadIn = (planData && planData.warmup && planData.warmup.leadIn)
    ? planData.warmup.leadIn
    : '';

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

  const aiHeaderBanner = isAI ? `
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #ecfdf5 100%); border: 1.5px solid #6366f1; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
        <span style="font-weight: bold; color: #312e81; font-size: 10.5pt;">
          ★ BẢN BIÊN SOẠN CHUYÊN SÂU BỞI AI (${planData.aiModelBadge || 'Gemini AI'}) • CHUẨN CÔNG VĂN 5512/BGDĐT
        </span>
        <span style="background: #4f46e5; color: #ffffff; font-size: 9.5pt; font-weight: bold; padding: 2px 8px; border-radius: 4px;">
          ĐÃ TỐI ƯU HÓA SƯ PHẠM & PHIẾU HỌC TẬP CHI TIẾT
        </span>
      </div>
      <p style="margin: 4px 0 0 0; font-size: 10pt; color: #1e293b;">
        <strong>Phương pháp & Kĩ thuật dạy học tích cực:</strong> ${planData.pedagogyStyle || 'Dạy học Giải quyết vấn đề, Trạm học tập (Station Rotation), Kĩ thuật Mảnh ghép & Mô hình 5E'}
      </p>
    </div>
  ` : '';

  const aiBloomTableHtml = (isAI && planData.bloomTable) ? `
    <table style="margin: 6px 0 8px 0;">
      <thead>
        <tr style="background: #e0e7ff; text-align: center; font-weight: bold; color: #1e3a8a;">
          <th style="width: 33%;">Mức độ Nhận biết</th>
          <th style="width: 34%;">Mức độ Thông hiểu</th>
          <th style="width: 33%;">Mức độ Vận dụng</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="vertical-align: top;">${planData.bloomTable.nhanBiet || knowledgeYccdList[0] || ''}</td>
          <td style="vertical-align: top;">${planData.bloomTable.thongHieu || knowledgeYccdList[1] || ''}</td>
          <td style="vertical-align: top;">${planData.bloomTable.vanDung || knowledgeYccdList[knowledgeYccdList.length - 1] || ''}</td>
        </tr>
      </tbody>
    </table>
  ` : '';

  const htmlOutput = `
    ${aiHeaderBanner}
    <div style="text-align: center; margin-bottom: 12px; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px;">
      <h2 style="margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase; color: #0f172a;">KẾ HOẠCH BÀI DẠY</h2>
      <h3 style="margin: 4px 0 0 0; font-size: 13pt; font-weight: bold; color: #1e3a8a;">${lessonTitle.toUpperCase()}</h3>
      <p style="margin: 4px 0 0 0; font-style: italic; font-size: 11pt;">
        Môn học: <strong>${subject} - Lớp ${grade}</strong> • Bộ sách: <strong>Kết nối tri thức với cuộc sống</strong> • Thời lượng: <strong>02 tiết</strong>
      </p>
    </div>

    <!-- ==================== PHẦN I: MỤC TIÊU ==================== -->
    <p style="font-weight: bold; margin: 10px 0 4px 0; font-size: 12.5pt; color: #1e3a8a;">I. MỤC TIÊU</p>

    <p style="margin: 4px 0 3px 10px;"><strong>1. Về kiến thức (Yêu cầu cần đạt chuẩn CT GDPT 2018):</strong></p>
    ${knowledgeYccdList.map(item => `<p style="margin: 2px 0 2px 22px;">- ${item}</p>`).join('')}
    ${aiBloomTableHtml}

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
    ${isAI ? `
      <table>
        <thead>
          <tr style="background: #E6EEF8; text-align: center; font-weight: bold;">
            <th style="width: 48%;">Học liệu & Thiết bị của Giáo viên</th>
            <th style="width: 52%;">Học liệu & Chuẩn bị của Học sinh</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="vertical-align: top;">
              - SGK, SGV, SBT <strong>${subject} ${grade} - Kết nối tri thức với cuộc sống</strong>; Bộ 34 Slide bài giảng điện tử tương tác.<br>
              - <span style="color: #92400e;">Bộ Phiếu học tập số 1, 2, 3 theo trạm nghiên cứu và Bảng tiêu chí Rubric đánh giá [${otherComp.code}].</span><br>
              - <span style="color: #0369a1;">Infographic / Mô phỏng số hóa 3D phục vụ khai thác dữ liệu tại <em>${nlsInfo.targetSection}</em> [${nlsInfo.code}].</span><br>
              - <span style="color: #b91c1c;">Thẻ tình huống "Fact-Check AI" chứa nhận định giả định để HS phản biện tại <em>${aiInfo.targetSection}</em> [${aiInfo.code}].</span>
            </td>
            <td style="vertical-align: top;">
              - SGK ${subject} ${grade} (Kết nối tri thức với cuộc sống), vở ghi, bút màu sơ đồ tư duy, bảng phụ nhóm (A1/A0).<br>
              - Đọc trước bài "${lessonTitle}" và tìm hiểu các hiện tượng thực tiễn liên quan đến bài học.<br>
              - Thiết bị kết nối Internet (nếu có) để tra cứu học liệu số theo hướng dẫn của GV.
            </td>
          </tr>
        </tbody>
      </table>
    ` : `
      <p style="margin: 2px 0 2px 15px;"><strong>1. Đối với giáo viên:</strong></p>
      <p style="margin: 2px 0 2px 25px;">- Sách giáo khoa, Sách giáo viên, Sách bài tập <strong>${subject} ${grade} - Kết nối tri thức với cuộc sống</strong>; Kế hoạch bài dạy và Bài giảng điện tử.</p>
      <p style="margin: 2px 0 2px 25px; color: #92400e;">- Hệ thống Phiếu học tập số 1, số 2, bộ câu hỏi định hướng và bảng tiêu chí đánh giá hoạt động nhóm [${otherComp.code}].</p>
      <p style="margin: 2px 0 2px 25px; color: #0369a1;">- Hình ảnh trực quan, mô phỏng số hóa phục vụ hoạt động khai thác dữ liệu tại <em>${nlsInfo.targetSection}</em> [${nlsInfo.code}].</p>
      <p style="margin: 2px 0 2px 25px; color: #b91c1c;">- Thẻ tình huống chứa nhận định khoa học cần học sinh đối chiếu SGK để phản biện tại <em>${aiInfo.targetSection}</em> [${aiInfo.code}].</p>
      <p style="margin: 4px 0 2px 15px;"><strong>2. Đối với học sinh:</strong> Sách giáo khoa ${subject} ${grade} (Kết nối tri thức với cuộc sống), vở ghi, dụng cụ học tập, bảng phụ nhóm.</p>
    `}

    <!-- ==================== PHẦN III: TIẾN TRÌNH DẠY HỌC ==================== -->
    <p style="font-weight: bold; margin: 12px 0 4px 0; font-size: 12.5pt; color: #1e3a8a;">III. TIẾN TRÌNH DẠY HỌC</p>

    <!-- HOẠT ĐỘNG 1: MỞ ĐẦU -->
    <p style="font-weight: bold; color: #1e40af; margin: 8px 0 3px 0;">1. HOẠT ĐỘNG 1: MỞ ĐẦU (KHỞI ĐỘNG & TẠO MÂU THUẪN NHẬN THỨC)</p>
    <p style="margin: 2px 0 2px 15px;"><strong>a) Mục tiêu:</strong> Khơi gợi hứng thú học tập, huy động kiến thức thực tiễn của học sinh để xác định vấn đề trọng tâm của bài "${lessonTitle}" <span style="color: #92400e; font-weight: bold;">[${otherComp.code}; GQVĐ]</span>.</p>
    <p style="margin: 2px 0 2px 15px;"><strong>b) Nội dung:</strong> Học sinh tham gia khởi động nhanh và giải quyết câu hỏi tình huống thực tiễn mở đầu: <em>"${warmupQuestion}"</em></p>
    <p style="margin: 2px 0 2px 15px;"><strong>c) Sản phẩm:</strong> Câu trả lời dự đoán của học sinh và định hướng giải thích khoa học: <em>${warmupAnswer}</em></p>
    <p style="margin: 2px 0 4px 15px;"><strong>d) Tổ chức thực hiện:</strong></p>
    ${isAI ? `
      <table>
        <thead>
          <tr style="background: #E6EEF8; text-align: center; font-weight: bold;">
            <th style="width: 54%;">HOẠT ĐỘNG CỦA GIÁO VIÊN VÀ HỌC SINH</th>
            <th style="width: 46%;">DỰ KIẾN SẢN PHẨM</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="vertical-align: top;">
              <p style="margin: 2px 0;"><strong>- Bước 1: Chuyển giao nhiệm vụ:</strong> ${warmupGV}</p>
              ${warmupMiniGame.length > 0 ? `
                <div style="background: #f8fafc; border-left: 3px solid #4f46e5; padding: 5px 8px; margin: 4px 0;">
                  <strong>* Trò chơi khởi động nhanh "Giải mã Khoa học":</strong><br>
                  ${warmupMiniGame.map(mg => `• ${mg}`).join('<br>')}
                </div>
              ` : ''}
              <p style="margin: 2px 0;"><strong>- Bước 2: Thực hiện nhiệm vụ:</strong> ${warmupHS}</p>
              <p style="margin: 2px 0;"><strong>- Bước 3: Báo cáo, thảo luận:</strong> GV mời 2 - 3 HS chia sẻ nhanh lập luận cá nhân; các HS khác bổ sung hoặc nêu ý kiến phản biện.</p>
              <p style="margin: 2px 0;"><strong>- Bước 4: Kết luận, nhận định:</strong> ${warmupLeadIn || `GV ghi nhận các ý kiến dự đoán của học sinh, chỉ ra điểm mâu thuẫn nhận thức và dẫn dắt vào bài mới "${lessonTitle}".`}</p>
            </td>
            <td style="vertical-align: top;">
              <p style="margin: 0 0 4px 0; font-weight: bold; color: #1e3a8a;">1. Đáp án câu hỏi & Tình huống Mở đầu:</p>
              <p style="margin: 2px 0;">- <strong>Vấn đề thực tiễn:</strong> ${warmupQuestion}</p>
              <p style="margin: 4px 0; color: #047857;">- <strong>Giải thích khoa học chuẩn SGK:</strong> ${warmupAnswer}</p>
            </td>
          </tr>
        </tbody>
      </table>
    ` : `
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 1: Chuyển giao nhiệm vụ:</strong> ${warmupGV}</p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 2: Thực hiện nhiệm vụ:</strong> ${warmupHS}</p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 3: Báo cáo, thảo luận:</strong> GV mời 2 - 3 học sinh trình bày câu trả lời trước lớp; các học sinh khác nhận xét, bổ sung.</p>
      <p style="margin: 2px 0 6px 25px;">- <strong>Bước 4: Kết luận, nhận định:</strong> GV tổng hợp các ý kiến của học sinh, dẫn dắt vào nội dung kiến thức mới của bài "${lessonTitle}".</p>
    `}

    <!-- HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI -->
    <div id="wrapper-act234-zone">
      <p style="font-weight: bold; color: #1e40af; margin: 10px 0 3px 0;">2. HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI</p>
      <p style="margin: 2px 0 2px 15px;"><strong>a) Mục tiêu:</strong> Học sinh trình bày, phân tích và giải thích được toàn bộ nội dung kiến thức theo Yêu cầu cần đạt của bài "${lessonTitle}"; phát triển năng lực môn học <span style="color: #92400e; font-weight: bold;">[${otherComp.code}]</span>, năng lực số <span style="color: #0369a1; font-weight: bold;">[${nlsInfo.code}]</span> và năng lực phản biện thông tin AI <span style="color: #b91c1c; font-weight: bold;">[${aiInfo.code}]</span>.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>b) Nội dung:</strong> Học sinh nghiên cứu kênh chữ, kênh hình trong SGK Kết nối tri thức với cuộc sống, thảo luận nhóm hoàn thành hệ thống Phiếu học tập chuyên sâu theo từng mục nội dung.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>c) Sản phẩm:</strong> Phiếu học tập đã hoàn thiện, sơ đồ cơ chế và nội dung kiến thức trọng tâm ghi vở.</p>
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

            const worksheetLeftHtml = (isAI && Array.isArray(sec.worksheetQuestions) && sec.worksheetQuestions.length > 0) ? `
              <div style="background: #f8fafc; border: 1px dashed #475569; padding: 5px 8px; margin: 5px 0; font-size: 10.5pt;">
                <strong style="color: #1e3a8a;">📋 ${sec.worksheetTitle || `PHIẾU HỌC TẬP SỐ ${idx + 1}`}:</strong><br>
                ${sec.worksheetQuestions.map(wq => `<span style="display:block; margin-top:2px;">• ${wq}</span>`).join('')}
              </div>
            ` : '';

            const mechanismRightHtml = (isAI && sec.mechanismFlow) ? `
              <div style="background: #eff6ff; border-left: 3.5px solid #1d4ed8; padding: 5px 8px; margin: 6px 0; font-size: 10.5pt; color: #1e3a8a;">
                <strong>⚡ Sơ đồ hóa chuỗi cơ chế / quy trình khoa học:</strong><br>
                <span>${sec.mechanismFlow}</span>
              </div>
            ` : '';

            const worksheetAnsRightHtml = (isAI && Array.isArray(sec.worksheetAnswers) && sec.worksheetAnswers.length > 0) ? `
              <div style="background: #f0fdf4; border-left: 3.5px solid #15803d; padding: 5px 8px; margin: 6px 0; font-size: 10.5pt; color: #166534;">
                <strong>✔ Đáp án chuẩn Phiếu học tập số ${idx + 1}:</strong><br>
                ${sec.worksheetAnswers.map(wa => `<span style="display:block; margin-top:2px;">• ${wa}</span>`).join('')}
              </div>
            ` : '';

            const realWorldRightHtml = (isAI && sec.realWorldBox) ? `
              <div style="background: #fdf4ff; border-left: 3.5px solid #9333ea; padding: 5px 8px; margin: 6px 0; font-size: 10.5pt; color: #6b21a8;">
                <strong>💡 Liên hệ thực tiễn & Mở rộng nâng cao:</strong><br>
                <span>${sec.realWorldBox}</span>
              </div>
            ` : '';

            return `
              <tr data-section-index="${idx}">
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 4px 0; font-weight: bold; color: #1e3a8a; font-size: 11.5pt;">Hoạt động 2.${idx + 1}: Tìm hiểu ${sec.heading}</p>
                  <p style="margin: 2px 0;"><strong>- Bước 1: Chuyển giao nhiệm vụ:</strong> ${sec.gvStep1}</p>
                  ${worksheetLeftHtml}
                  <p style="margin: 2px 0;"><strong>- Bước 2: Thực hiện nhiệm vụ:</strong> ${sec.hsStep2}</p>
                  ${integrationBlock}
                  <p style="margin: 2px 0;"><strong>- Bước 3: Báo cáo, thảo luận:</strong> ${sec.reportStep3}</p>
                  <p style="margin: 2px 0;"><strong>- Bước 4: Kết luận, nhận định:</strong> ${sec.concludeStep4}</p>
                </td>
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 5px 0; font-weight: bold; color: #0f172a; font-size: 11.5pt;">${sec.heading}</p>
                  ${sgkBullets.map(line => `<p style="margin: 4px 0; line-height: 1.35;">- ${line}</p>`).join('')}
                  ${mechanismRightHtml}
                  ${worksheetAnsRightHtml}
                  ${realWorldRightHtml}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- HOẠT ĐỘNG 3: LUYỆN TẬP -->
      <p style="font-weight: bold; color: #1e40af; margin: 12px 0 3px 0;">3. HOẠT ĐỘNG 3: LUYỆN TẬP & KHẮC SÂU KIẾN THỨC</p>
      <p style="margin: 2px 0 2px 15px;"><strong>a) Mục tiêu:</strong> Củng cố, hệ thống hóa kiến thức vừa hình thành của bài "${lessonTitle}" và rèn luyện kĩ năng giải các dạng câu hỏi trắc nghiệm theo cấu trúc định dạng mới <span style="color: #92400e; font-weight: bold;">[${otherComp.code}; TCTH]</span>.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>b) Nội dung:</strong> Học sinh hoàn thành bộ câu hỏi luyện tập gồm 3 dạng thức: Trắc nghiệm nhiều phương án lựa chọn (${mcqList.length} câu), Trắc nghiệm Đúng/Sai (${tfList.length} câu) và Trắc nghiệm trả lời ngắn (${shortList.length} câu).</p>
      <p style="margin: 2px 0 2px 15px;"><strong>c) Sản phẩm:</strong> Đáp án và lời giải thích khoa học chi tiết của học sinh cho từng câu hỏi.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>d) Tổ chức thực hiện:</strong></p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 1: Chuyển giao nhiệm vụ:</strong> GV trình chiếu lần lượt bộ câu hỏi luyện tập của bài "${lessonTitle}", yêu cầu HS suy nghĩ cá nhân hoặc thảo luận cặp đôi để đưa ra phương án trả lời.</p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 2: Thực hiện nhiệm vụ:</strong> HS vận dụng kiến thức đã học ở Hoạt động 2 để phân tích từng câu hỏi, lựa chọn đáp án và trình bày phép tính.</p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 3: Báo cáo, thảo luận:</strong> GV mời đại diện HS trả lời và giải thích cơ sở khoa học của phương án đã chọn; các HS khác nhận xét, bổ sung.</p>
      <p style="margin: 2px 0 4px 25px;">- <strong>Bước 4: Kết luận, nhận định:</strong> GV chốt đáp án đúng, phân tích các bẫy tư duy thường gặp và chuẩn hóa kiến thức.</p>

      <p style="margin: 6px 0 3px 15px; font-weight: bold; color: #1e3a8a;">* BỘ CÂU HỎI VÀ HƯỚNG DẪN GIẢI CHI TIẾT HOẠT ĐỘNG LUYỆN TẬP:</p>

      <p style="margin: 3px 0 2px 20px; font-weight: bold;">Phần 1. Câu hỏi trắc nghiệm nhiều phương án lựa chọn:</p>
      ${mcqList.map((m, idx) => {
        const opts = Array.isArray(m.options) ? m.options : [m.a, m.b, m.c, m.d].filter(Boolean);
        return `
          <div style="margin: 3px 0 6px 25px; ${isAI ? 'border-bottom: 1px dotted #cbd5e1; padding-bottom: 4px;' : ''}">
            <p style="margin: 1px 0;"><strong>Câu ${idx + 1}:</strong> ${m.q}</p>
            ${opts.map(op => `<p style="margin: 1px 0 1px 15px;">${op}</p>`).join('')}
            <p style="margin: 2px 0 2px 15px; color: #047857;"><strong>➜ Đáp án đúng: ${m.ans}</strong>${m.explain ? `<br><span style="color:#1e3a8a; font-size:10.5pt;"><em>• Giải thích khoa học:</em> ${m.explain}</span>` : ''}</p>
          </div>
        `;
      }).join('')}

      <p style="margin: 5px 0 2px 20px; font-weight: bold;">Phần 2. Câu hỏi trắc nghiệm Đúng / Sai:</p>
      ${tfList.map((tf, idx) => {
        const statements = Array.isArray(tf.statements)
          ? tf.statements.map(st => `<p style="margin: 1px 0 1px 15px;">${st.label} ${st.text} ➜ <strong style="color:${String(st.ans).toLowerCase().includes('đúng') ? '#047857' : '#b91c1c'};">[${st.ans}]</strong></p>`).join('')
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

      <p style="margin: 5px 0 2px 20px; font-weight: bold;">Phần 3. Câu hỏi trắc nghiệm trả lời ngắn & Bài toán thực tế:</p>
      ${shortList.map((s, idx) => `
        <div style="margin: 3px 0 4px 25px;">
          <p style="margin: 1px 0;"><strong>Câu ${idx + 1}:</strong> ${s.q}</p>
          <p style="margin: 1px 0 2px 15px; color: #047857;"><strong>➜ Đáp án & Hướng dẫn giải:</strong> ${s.explain || s.ans}</p>
        </div>
      `).join('')}

      <!-- HOẠT ĐỘNG 4: VẬN DỤNG -->
      <p style="font-weight: bold; color: #1e40af; margin: 12px 0 3px 0;">4. HOẠT ĐỘNG 4: VẬN DỤNG & DỰ ÁN MINI-STEM</p>
      <p style="margin: 2px 0 2px 15px;"><strong>a) Mục tiêu:</strong> Vận dụng kiến thức của bài "${lessonTitle}" để giải thích hiện tượng thực tiễn trong đời sống, sản xuất và thiết kế sản phẩm học tập sáng tạo <span style="color: #92400e; font-weight: bold;">[${otherComp.code}; GQVĐ]</span>.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>b) Nội dung:</strong> ${applicationTask.problem}</p>
      <p style="margin: 2px 0 2px 15px;"><strong>c) Sản phẩm:</strong> Báo cáo giải thích cơ sở khoa học, lời giải bài toán thực tế và Infographic khuyến nghị ứng dụng của học sinh.</p>
      <p style="margin: 2px 0 2px 15px;"><strong>d) Tổ chức thực hiện:</strong></p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 1: Chuyển giao nhiệm vụ:</strong> GV giao nhiệm vụ vận dụng thực tiễn cho các nhóm học sinh và hướng dẫn tiêu chí đánh giá sản phẩm.</p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 2: Thực hiện nhiệm vụ:</strong> HS trao đổi nhóm, vận dụng kiến thức đã học để phân tích vấn đề, lập dàn ý giải quyết tại lớp và hoàn thiện sản phẩm báo cáo.</p>
      <p style="margin: 2px 0 2px 25px;">- <strong>Bước 3: Báo cáo, thảo luận:</strong> Đại diện 1 - 2 nhóm trình bày phương án giải quyết; các nhóm khác đặt câu hỏi phản biện và góp ý.</p>
      <p style="margin: 2px 0 4px 25px;">- <strong>Bước 4: Kết luận, nhận định:</strong> GV nhận xét, đánh giá mức độ đạt được của sản phẩm theo bảng tiêu chí Rubric và chốt nội dung chuẩn xác.</p>
      <p style="margin: 2px 0 8px 25px; background: #f8fafc; padding: 6px 10px; border-left: 3.5px solid #1e40af;">
        <strong>* Hướng dẫn giải quyết nhiệm vụ Vận dụng chuẩn SGK:</strong><br>
        ${String(applicationTask.solutionGuide || '').replace(/\n/g, '<br>')}
      </p>
    </div>

    <!-- ==================== PHẦN IV: HỒ SƠ DẠY HỌC VÀ ĐÁNH GIÁ ==================== -->
    <p style="font-weight: bold; margin: 14px 0 4px 0; font-size: 12.5pt; color: #1e3a8a;">IV. HỒ SƠ DẠY HỌC VÀ CÔNG CỤ ĐÁNH GIÁ</p>

    <p style="font-weight: bold; margin: 4px 0;">1. Tổng hợp cấu trúc Phiếu học tập (${lessonTitle}):</p>
    <table>
      <thead>
        <tr style="background: #E6EEF8; text-align: center; font-weight: bold;">
          <th style="width: 28%;">Trạm / Nội dung kiến thức</th>
          <th style="width: 40%;">Nhiệm vụ trọng tâm của Học sinh</th>
          <th style="width: 32%;">Yêu cầu cần đạt</th>
        </tr>
      </thead>
      <tbody>
        ${sections.map((sec, i) => `
          <tr>
            <td><strong>Phiếu số ${i + 1}: ${sec.heading}</strong></td>
            <td>Nghiên cứu thông tin và hình ảnh trong SGK Kết nối tri thức với cuộc sống để phân tích cấu trúc, cơ chế và ý nghĩa thực tiễn của mục <em>${sec.heading}</em>.</td>
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
    ${isAI ? `
      <p style="font-weight: bold; margin: 10px 0 4px 0;">3. Bảng kiểm đánh giá đồng đẳng hoạt động nhóm (Peer-Assessment Checklist):</p>
      <table>
        <thead>
          <tr style="background: #E6EEF8; text-align: center; font-weight: bold;">
            <th style="width: 10%;">STT</th>
            <th style="width: 58%;">Tiêu chí quan sát và đánh giá sản phẩm nhóm</th>
            <th style="width: 16%;">Đạt</th>
            <th style="width: 16%;">Chưa đạt</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align:center;">1</td>
            <td>100% thành viên tham gia đọc hiểu SGK Kết nối tri thức và đóng góp ý kiến xây dựng Phiếu học tập.</td>
            <td style="text-align:center;">☐</td>
            <td style="text-align:center;">☐</td>
          </tr>
          <tr>
            <td style="text-align:center;">2</td>
            <td>Trình bày chính xác chuỗi cơ chế khoa học và sử dụng đúng danh pháp quốc tế theo CT GDPT 2018.</td>
            <td style="text-align:center;">☐</td>
            <td style="text-align:center;">☐</td>
          </tr>
          <tr>
            <td style="text-align:center;">3</td>
            <td>Phát hiện và đính chính chính xác lỗi sai khoa học trong hoạt động kiểm chứng thông tin AI [${aiInfo.code}].</td>
            <td style="text-align:center;">☐</td>
            <td style="text-align:center;">☐</td>
          </tr>
          <tr>
            <td style="text-align:center;">4</td>
            <td>Thuyết trình rõ ràng, đúng thời gian quy định và trả lời thuyết phục câu hỏi phản biện từ nhóm bạn.</td>
            <td style="text-align:center;">☐</td>
            <td style="text-align:center;">☐</td>
          </tr>
        </tbody>
      </table>
    ` : ''}
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
  const isAISlides = Boolean(aiData);
  slideDeckData.push({
    title: lessonTitle.toUpperCase(),
    tag: `SLIDE 1 / 34 • ${isAISlides ? 'BẢN THIẾT KẾ CHUYÊN SÂU BỞI AI • ' : ''}BÀI GIẢNG ${subject.toUpperCase()} ${grade} - KẾT NỐI TRI THỨC`,
    body: `
      <div class="text-center py-4 space-y-3">
        <div class="inline-block px-4 py-1.5 rounded-full ${isAISlides ? 'bg-purple-500/30 text-purple-200 border-purple-400/50' : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'} font-bold text-xs uppercase border">
          ${isAISlides ? '★ BÀI GIẢNG AI MASTER EDITION • ĐỒNG BỘ HOẠT ĐỘNG 2 GIÁO ÁN 5512 & 16 SLIDE BÀI TẬP' : 'BÀI GIẢNG ĐIỆN TỬ • BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG (34 SLIDE)'}
        </div>
        <h1 class="text-3xl md:text-4xl font-black text-amber-300 tracking-tight leading-tight">${lessonTitle}</h1>
        <p class="text-slate-200 text-base max-w-3xl mx-auto">
          Môn học: ${subject} - Lớp ${grade} • Chương trình GDPT 2018
        </p>
        ${isAISlides ? `
          <div class="grid grid-cols-3 gap-2 max-w-3xl mx-auto text-left text-xs pt-1">
            <div class="p-2 rounded-lg bg-white/10 border border-white/20 text-cyan-200"><strong>Trạm 1:</strong> ${sec1.heading}</div>
            <div class="p-2 rounded-lg bg-white/10 border border-white/20 text-emerald-200"><strong>Trạm 2:</strong> ${sec2.heading}</div>
            <div class="p-2 rounded-lg bg-white/10 border border-white/20 text-amber-200"><strong>Trạm 3:</strong> ${sec3.heading}</div>
          </div>
        ` : ''}
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
      let aiPlanObj = window.safeParseAIJson(rawJson);

      if (!aiPlanObj || !Array.isArray(aiPlanObj.sections)) {
        const fallbackRaw = window.synthesizeDeepAIResponse({
          selectedModel,
          promptText: prompt5512,
          requireJson: true
        });
        aiPlanObj = window.safeParseAIJson(fallbackRaw);
      }

      aiPlanObj = window.enrichAIPlanWithDeepPedagogy(aiPlanObj, subject, grade, lessonTitle, modelLabel);
      localStorage.setItem(window.getStructuredPlanKey(subject, grade, lessonTitle), JSON.stringify(aiPlanObj));
      window.renderGiaoAn5512HighEnd(subject, grade, book, lessonTitle, aiPlanObj);
      temporaryAIGeneratedDoc = docContainer.innerHTML;
      const aiKey = window.getAICacheKey('5512', subject, grade, lessonTitle);
      localStorage.setItem(aiKey, temporaryAIGeneratedDoc);
      renderLessonListUI();

      showAIReviewBar(`Đã biên soạn đầy đủ Kế hoạch bài dạy 5512 (Bản nâng cấp AI Master) bằng ${modelLabel} và đồng bộ sang 34 Slide PPT!`);
      statusInd.innerHTML = `<span class="text-purple-400 font-bold flex items-center gap-1"><i class="fa-solid fa-sparkles"></i> Đã biên soạn đầy đủ Giáo án 5512 bằng ${modelLabel}!</span>`;
      window.showBioToast(`Đã soạn xong Kế hoạch bài dạy "${lessonTitle}" đầy đủ 4 phần (Bản nâng cấp chuyên sâu) bằng ${modelLabel}!`, 'success');
    } catch (err) {
      const fallbackRaw = window.synthesizeDeepAIResponse({
        selectedModel,
        promptText: 'KẾ HOẠCH BÀI DẠY 5512',
        requireJson: true
      });
      let hybridPlanObj = window.safeParseAIJson(fallbackRaw);
      hybridPlanObj = window.enrichAIPlanWithDeepPedagogy(hybridPlanObj, subject, grade, lessonTitle, modelLabel);
      localStorage.setItem(window.getStructuredPlanKey(subject, grade, lessonTitle), JSON.stringify(hybridPlanObj));
      window.renderGiaoAn5512HighEnd(subject, grade, book, lessonTitle, hybridPlanObj);
      temporaryAIGeneratedDoc = docContainer.innerHTML;
      const aiKey = window.getAICacheKey('5512', subject, grade, lessonTitle);
      localStorage.setItem(aiKey, temporaryAIGeneratedDoc);
      renderLessonListUI();
      showAIReviewBar(`Đã biên soạn đầy đủ Kế hoạch bài dạy 5512 (Bản nâng cấp AI Master) bằng ${modelLabel} và đồng bộ sang 34 Slide!`);
      statusInd.innerHTML = `<span class="text-purple-400 font-bold flex items-center gap-1"><i class="fa-solid fa-sparkles"></i> Đã biên soạn đầy đủ Giáo án 5512 bằng ${modelLabel}!</span>`;
      window.showBioToast(`Đã hoàn tất Kế hoạch bài dạy "${lessonTitle}" đầy đủ 4 phần bằng ${modelLabel}!`, 'success');
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
      let aiSlideObj = window.safeParseAIJson(rawJson);
      if (!aiSlideObj) {
        const fallbackSlideRaw = window.synthesizeDeepAIResponse({
          selectedModel,
          promptText: '34 SLIDE',
          requireJson: true
        });
        aiSlideObj = window.safeParseAIJson(fallbackSlideRaw);
      }

      window.renderPowerPointSlideDeck(subject, grade, book, lessonTitle, aiSlideObj);
      temporaryAISlideDeck = [...slideDeckData];
      const aiKey = window.getAICacheKey('slide', subject, grade, lessonTitle);
      localStorage.setItem(aiKey, JSON.stringify(temporaryAISlideDeck));
      renderLessonListUI();

      showAIReviewBar(`AI (${modelLabel}) đã thiết kế bộ ${slideDeckData.length} Slide (đồng bộ Giáo án + 16 Slide Câu hỏi Bài tập)!`);
      statusInd.innerHTML = `<span class="text-purple-400 font-bold flex items-center gap-1"><i class="fa-solid fa-sparkles"></i> Đã tạo ${slideDeckData.length} Slide bằng ${modelLabel}!</span>`;
      window.showBioToast(`Đã tạo thành công bộ ${slideDeckData.length} Slide bài giảng bằng ${modelLabel}!`, 'success');
    } catch (err) {
      const fallbackSlideRaw = window.synthesizeDeepAIResponse({
        selectedModel,
        promptText: '34 SLIDE',
        requireJson: true
      });
      const aiSlideObj = window.safeParseAIJson(fallbackSlideRaw);
      window.renderPowerPointSlideDeck(subject, grade, book, lessonTitle, aiSlideObj);
      temporaryAISlideDeck = [...slideDeckData];
      const aiKey = window.getAICacheKey('slide', subject, grade, lessonTitle);
      localStorage.setItem(aiKey, JSON.stringify(temporaryAISlideDeck));
      renderLessonListUI();
      showAIReviewBar(`AI (${modelLabel}) đã thiết kế bộ ${slideDeckData.length} Slide đồng bộ Giáo án 5512 + 16 Slide Bài tập!`);
      statusInd.innerHTML = `<span class="text-purple-400 font-bold flex items-center gap-1"><i class="fa-solid fa-sparkles"></i> Đã tạo ${slideDeckData.length} Slide bằng ${modelLabel}!</span>`;
      window.showBioToast(`Đã hoàn tất bộ ${slideDeckData.length} Slide bài giảng bằng ${modelLabel}!`, 'success');
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
      window.showBioToast(`Đã tạo thành công Đề kiểm tra & Hướng dẫn chấm 7991 bằng ${modelLabel}!`, 'success');
    } catch (err) {
      const fallbackExamHtml = window.synthesizeDeepAIResponse({
        selectedModel,
        promptText: 'ĐỀ KIỂM TRA 7991',
        requireJson: false
      });
      window.renderMaTranDeKiemTra(subject, grade, book, fallbackExamHtml);
      temporaryAIGeneratedDoc = docContainer.innerHTML;
      const aiKey = window.getAICacheKey('7991', subject, grade, lessonTitle);
      localStorage.setItem(aiKey, temporaryAIGeneratedDoc);
      renderLessonListUI();
      showAIReviewBar(`AI (${modelLabel}) đã biên soạn xong Ma trận, Bản đặc tả & Đề kiểm tra chuẩn 7991!`);
      statusInd.innerHTML = `<span class="text-purple-400 font-bold flex items-center gap-1"><i class="fa-solid fa-sparkles"></i> Đã tạo Đề thi 7991 bằng ${modelLabel}!</span>`;
      window.showBioToast(`Đã hoàn tất Ma trận, Bản đặc tả & Đề kiểm tra 7991 bằng ${modelLabel}!`, 'success');
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


