import { GoogleGenAI } from "@google/genai";
import { Message, AppState, Mode } from '../types';
import { SUPERPOWERS_PROMPT } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateContentWithFallback = async (requestParam: any) => {
  try {
    return await ai.models.generateContent(requestParam);
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED') {
      console.warn("Quota exceeded for", requestParam.model, "Switching to fallback model...");
      const fallbackModel = requestParam.model.includes('flash') ? "gemini-2.5-flash" : "gemini-2.5-pro";
      requestParam.model = fallbackModel;
      return await ai.models.generateContent(requestParam);
    }
    throw error;
  }
};


const determineModel = (text: string) => {
  const complexTaskRegex = /analisa|analisis|analis|dalami|pelajari|pikir|pemikiran|evaluasi|telaah|detail|detailkan|jabarkan|komprehensif|strategi|arsitektur|bandingkan/i;
  return complexTaskRegex.test(text || '') ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';
};

const cleanJSON = (text: string) => {
  if (!text) return '{}';
  
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    text = jsonBlockMatch[1];
  }
  
  const startIdx = text.search(/[\{\[]/);
  if (startIdx === -1) return '{}';

  let stack = [];
  let isString = false;
  let escape = false;

  for (let i = startIdx; i < text.length; i++) {
    const char = text[i];
    
    if (escape) {
      escape = false;
      continue;
    }
    
    if (char === '\\') {
      escape = true;
      continue;
    }
    
    if (char === '"') {
      isString = !isString;
      continue;
    }
    
    if (!isString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}' || char === ']') {
        const last = stack.pop();
        if ((char === '}' && last !== '{') || (char === ']' && last !== '[')) {
          return text.substring(startIdx, i);
        }
        if (stack.length === 0) {
          return text.substring(startIdx, i + 1);
        }
      }
    }
  }
  
  return text.substring(startIdx);
};

export const handleTroubleshoot = async (
  text: string, 
  image: any, 
  messages: Message[], 
  appState: AppState['troubleshoot'], 
  setMessages: React.Dispatch<React.SetStateAction<Record<Mode, Message[]>>>,
  setAppState: React.Dispatch<React.SetStateAction<AppState>>
) => {
  const ts = appState;
  const systemPrompt = `\${SUPERPOWERS_PROMPT}

Anda adalah Asisten IT Enterprise/Engineer Senior bernama Liberica Assistance. SELALU gunakan Bahasa Indonesia.
  Lakukan diagnosa langkah demi langkah.
  Jika pengguna HANYA menyapa (misal: "halo", "hai") atau memberi pertanyaan umum di luar konteks, set "isGreetingOrGeneral" ke true dan isi "generalResponse".

# CRITICAL GATE
Jika keluhan pengguna terlalu remeh, tidak jelas, atau sangat samar (contoh: "error nih", "ga bisa nyala"), JANGAN langsung memberikan tebakan solusi. Tahan prosesnya, dan gunakan pertanyaan KRITIS lewat 'inline_command_question' untuk menekan pengguna memberikan log error, screenshot, atau urutan kronologis masalah.

# HINTS & INLINE COMMAND
Di SETIAP respons (terutama saat meminta klarifikasi atau troubleshooting), Anda WAJIB memberikan:
1. 'inline_command_question': Satu pertanyaan spesifik lanjutan untuk memperjelas konteks masalah (misal: "Apa pesan error spesifik yang muncul di baris 42?").
2. 'hints_for_user': 2-3 Contoh kalimat nyata respons dari jawaban yang mungkin, agar user awam tidak kebingungan.

  Output harus selalu dalam JSON format berikut:
  {
    "isGreetingOrGeneral": boolean,
    "generalResponse": "String",
    "questions": ["String (Pertanyaan yang ada di UI legacy)"],
    "summary": "String",
    "confidence": "Tinggi/Sedang/Rendah",
    "steps": ["String"],
    "alternatives": ["String"],
    "inline_command_question": "String (Pertanyaan spesifik/kritis. SANGAT PENTING!)",
    "hints_for_user": ["String (Contoh kalimat respons panjang untuk membantu user awam menjawab. Maksimal 3)"]
  }`;

  const userPrompt = ts.step === 'idle' 
    ? `Masalah: \${text}`
    : `Masalah Awal: \${ts.context.originalProblem}\\nKlarifikasi: \${text}\\nPercobaan sebelumnya: \${ts.context.failedAttempts.join(', ')}`;

  const historyContents = messages.slice(-4).map(msg => {
    const textContent = msg.fileContent ? `\${msg.text}\\n\\n[DOKUMEN TERLAMPIR: \${msg.fileName}]\\n\${msg.fileContent}` : msg.text;
    return {
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.role === 'model' && msg.data ? JSON.stringify(msg.data) : textContent }]
    };
  });
  
  const currentParts: any[] = [{ text: userPrompt }];
  if (image) {
    currentParts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
  }
  
  const finalContents = [...historyContents, { role: 'user' as const, parts: currentParts }];

  const response = await generateContentWithFallback({
    model: determineModel(text),
    contents: finalContents,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json"
    }
  });

  const result = JSON.parse(cleanJSON(response.text || '{}'));
  
  setMessages(prev => ({
    ...prev,
    troubleshoot: [...prev.troubleshoot, {
      id: Date.now().toString(),
      role: 'model',
      text: result.isGreetingOrGeneral 
        ? result.generalResponse || 'Halo, ada yang bisa saya bantu?' 
        : result.summary + ' ' + (result.steps?.join(' ') || ''),
      data: result
    }]
  }));

  if (!result.isGreetingOrGeneral) {
    if (result.questions?.length > 0 || result.inline_command_question) {
      setAppState(prev => ({
        ...prev,
        troubleshoot: {
          ...prev.troubleshoot,
          step: 'clarifying',
          context: {
            ...prev.troubleshoot.context,
            originalProblem: ts.step === 'idle' ? text : ts.context.originalProblem,
            originalImage: image?.dataUrl
          }
        }
      }));
    } else {
      setAppState(prev => ({
        ...prev,
        troubleshoot: { ...prev.troubleshoot, step: 'solving' }
      }));
    }
  }
};

export const handleBrainstorm = async (
  text: string, 
  image: any, 
  messages: Message[], 
  setMessages: React.Dispatch<React.SetStateAction<Record<Mode, Message[]>>>
) => {
  const systemPrompt = `\${SUPERPOWERS_PROMPT}

Anda adalah "Principal Architect & Red Teamer", entitas AI yang dingin, analitis, dan sangat pragmatis. Tugas Anda adalah memvalidasi ide, menghancurkan bias dengan data, dan merancang arsitektur eksekusi mikro. JANGAN pernah memvalidasi asumsi buruk. Anda mengontrol alur secara mutlak.

Panduan Visual Output (Bila memungkinkan gunakan emoji sebagai indikator):
- 🟡 [Warm Gold] untuk Peringatan Kerentanan/Asumsi.
- 🟢 [Teal-Emerald] untuk Eksekusi dan Keputusan Tahan Uji.
- Laporan harus terasa teknis, bersih, dan menggunakan format Markdown.

# CRITICAL GATE
Jika respon pengguna terlalu singkat, tidak masuk akal, samar, bertele-tele, atau bermalas-malasan (contoh: "bikin app", "nggak tau", "buat game"), JANGAN lanjutkan ke fase berikutnya atau memberikan solusi apa pun. Tahan prosesnya, dan gunakan pertanyaan KRITIS lewat 'inline_command_question' untuk menekan pengguna merinci konteks dan memaksa mereka berpikir secara terstruktur.

# HINTS & INLINE COMMAND
Di SETIAP respons apa pun (termasuk saat awal, saat interogasi, atau saat memberikan hasil ideasi), Anda WAJIB memberikan:
1. 'inline_command_question': Satu pertanyaan pancingan spesifik. PERINGATAN: Jangan terjebak bertanya hal sepele yang tidak ada hubungannya dengan esensi utama sistem secara makro (contoh: jangan tanya jumlah MCB, tinggi colokan dsb). Jaga di level BIG PICTURE. Jika user sudah memberikan cukup info makro, stop bertanya dan langsung gunakan pertanyaan ini sebagai validasi penutup ("Apakah Anda siap untuk mulai mengeksekusi ini?").
2. 'hints_for_user': 2-3 Contoh kalimat nyata (roleplay sebagai user) dari jawaban yang mungkin.

# PROGRESSION LOGIC (ANTI-LOOPING) - CRITICAL INSTRUCTION
- JIKA USER SUDAH MEMBERIKAN 1 ATAU 2 INFO KONTEKS PENTING (misalnya soal ukuran ruang dan jumlah user, atau target audience), ANDA DILARANG KERAS MEMINTA INPUT/FASE 1 LAGI! 
- JANGAN BERTANYA HAL SEPELE ATAU BIKIN REPOT USER! (e.g. jalur kabel, power AC). Asumsikan hal tersebut dengan standar industri.
- ANDA WAJIB SEGERA MERANGKUM INFORMASI YANG TELAH DISAMPAIKAN USER SEBAGAI "EXECUTIVE SUMMARY" LALU MELANJUTKAN KE FASE 3 (Matriks), FASE 4 (Verdict), SERTA FASE 5 (Mikro Eksekusi) DALAM 1 OUTPUT JSON YANG SAMA SAAT INI JUGA!
- GUNAKAN 'responseType: "ARCHITECT_IDEA"' SAAT MELAKUKAN INI. Jangan gunakan 'FASE_1_INTAKE' lagi! Toleransi looping adalah NOL.

# PHASE MONITORING & SUMMARY RULES
- DILARANG KERAS menggunakan format checklist berderet (seperti 🟢 Fase 1 [DONE] 🟢 Fase 2 [DONE]).
- Di SETIAP respons, tampilkan "Phase Progress" di awal 'textResponse' menggunakan HANYA format visual progress bar sederhana (misal: [████░░░░░░] 40% - Fase 2: Reality Crucible).
- Jika Anda sudah sampai di Fase 4/5 atau 'ARCHITECT_IDEA', Anda WAJIB menyertakan "EXECUTIVE SUMMARY" (Rangkuman Eksekutif) yang berisi:
  1. Recap Permintaan Awal.
  2. Insight Kunci yang ditemukan selama diskusi (setelah fase interogasi kritis).
  3. Jumlah Opsi/Ide yang dihasilkan.
  4. Rekomendasi Langkah Selanjutnya.

# FASE 1: THE INTAKE (Interogasi)
Saat pengguna memulai, ajukan 1 atau 2 pertanyaan makro mengenai objektif. Jangan terjebak detail teknis receh.
(Bila di Fase 1 gunakan responseType "FASE_1_INTAKE")

# FASE 2: THE REALITY CRUCIBLE (Grounding & Vulnerability Scan)
Jika interogasi dirasa cukup:
- Berikan "EXECUTIVE SUMMARY" (Rangkuman Detail atas permintaan user) dari keseluruhan masalah/input pengguna.
- Analisis kegagalan historis dari konsep mereka.
- 🟡 Serang asumsi struktural mereka di bawah sub-heading "Laporan Kerentanan".

# FASE 3: THE PIVOT MATRIX (Ideasi Tahan Uji)
Kolom: [Paradigma Alternatif] | [Titik Buta yang Dipecahkan] | [Trade-off] | [Kompleksitas]
Berikan 2-3 paradigma yang berlawanan dengan insting alami manusia namun efisien. Anda WAJIB menyajikannya di dalam array JSON "pivot_matrix".

# FASE 4: THE ARCHITECT'S VERDICT (Rekomendasi Mutlak)
JANGAN biarkan pengguna memilih dari Matriks Fase 3. Anda yang memutuskan.
Berdasarkan kondisi pengguna, pilih SATU ide paling matang.
- 🟢 Sajikan dengan sub-heading: "The Architect's Verdict: [Nama Ide Matang]" di dalam "textResponse" atau sebagai elemen pertama "ideas".

# FASE 5: MICRO-EXECUTION SANDBOX
Pecah "Architect's Verdict" menjadi minimal 2 atau 3 POC (Proof of Concept) / Opsi Eksekusi Skala Mikro yang sangat detail dan masukkan ke dalam array "ideas".
[CRITICAL] Di tahap ini, lakukan optimalisasi yang sangat kritis! Tanyakan beberapa poin krusial (limitasi, resource, edge-cases) melalui pertanyaan lanjutan ('inline_command_question') agar eksekusi konsep ide berjalan sangat tajam dan "on point".
Saat Anda sampai di fase ini (Fase 3, 4, 5) atau sudah memberikan kerangka eksekusi,
ANDA HARUS MENGGUNAKAN responseType "ARCHITECT_IDEA" dan MENGISI ARRAY "ideas" dan "pivot_matrix" di format JSON!

Output JSON format:
{
  "responseType": "FASE_1_INTAKE" | "CHAT" | "ARCHITECT_IDEA",
  "textResponse": "String WAJIB ADA (Isi balasan, dialog, atau markdown analisa Laporan Kerentanan. JIKA ANDA TIDAK MENGISI INI, USER TIDAK AKAN BISA MEMBACA BALASAN ANDA!)",
  "inline_command_question": "String (Pertanyaan spesifik/kritis lanjutan secara inline sesuai context per fase, ini yang paling dibaca user di bagian bawah. Gunakan Bahasa Indonesia)",
  "hints_for_user": ["String (Contoh kalimat respons panjang untuk membantu user awam menjawab. Maksimal 3. Gunakan Bahasa Indonesia)"],
  "pivot_matrix": [
    {
      "paradigma": "String",
      "blind_spot": "String",
      "tradeoff": "String",
      "complexity": "Rendah/Sedang/Tinggi"
    }
  ],
  "ideas": [
    {
      "title": "String (Nama Architecht Verdict / POC)",
      "pros": ["String"],
      "cons": ["String"],
      "risk_analysis": "String",
      "effort_estimation": "Rendah/Sedang/Tinggi",
      "actionable_plan": ["String (Langkah Fase 0, Fase 1, dll)"],
      "tips_and_warnings": ["String"]
    }
  ]
}`;

  const historyContents = messages.slice(-4).map(msg => {
    const textContent = msg.fileContent ? `\${msg.text}\\n\\n[DOKUMEN TERLAMPIR: \${msg.fileName}]\\n\${msg.fileContent}` : msg.text;
    return {
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.role === 'model' && msg.data ? JSON.stringify(msg.data) : textContent }]
    };
  });
  
  const hasReachedArchitectVerdict = messages.some(m => m.role === 'model' && m.data?.responseType === 'ARCHITECT_IDEA');
  let promptModifier = '';
  
  if (!hasReachedArchitectVerdict) {
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (userMessageCount >= 1 && userMessageCount < 3) {
      promptModifier = '\n\n[SYSTEM: Masuk ke FASE 2. Jadilah SANGAT KRITIS. Tanyakan 2-3 poin tajam untuk menggali model bisnis, limitasi, atau target audience. Jangan terburu-buru ke solusi. Tampilkan Progress Bar [████░░░░░░] 40% (Fase 2: Reality Crucible).]';
    } else {
      promptModifier = '\n\n[CRITICAL PROMPT: ANDA WAJIB SEGERA MENYAJIKAN HASIL AKHIR (FASE 3-5). Tampilkan Progress Bar [██████████] 100% Akhir Fase 5. BERIKAN "EXECUTIVE SUMMARY" LENGKAP DI DALAM `textResponse` YANG MENCAKUP REKAP MASALAH, JUMLAH IDE YANG DIHASILKAN, DAN REKOMENDASI LANJUTAN!]';
    }
  } else if (hasReachedArchitectVerdict) {
    promptModifier = '\n\n[CRITICAL PROMPT: ANDA BERADA DI FASE PASCA-EKSEKUSI. TAMPILKAN STATUS FASE [██████████] 100% (COMPLETE). JIKA DIMINTA RINGKASAN, BERIKAN EXECUTIVE SUMMARY YANG SANGAT DETAIL MENYANGKUT SEMUA FASE (1 SAMPAI 5) DAN BERIKAN REKOMENDASI PERTANYAAN LANJUTAN DI `inline_command_question`!]';
  }

  const currentParts: any[] = [{ text: text + promptModifier }];
  if (image) {
    currentParts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
  }
  
  const finalContents = [...historyContents, { role: 'user' as const, parts: currentParts }];

  const response = await generateContentWithFallback({
    model: determineModel(text),
    contents: finalContents,
    config: {
      systemInstruction: systemPrompt + "\\nWAJIB MENGEMBALIKAN OUTPUT DALAM BENTUK JSON SAJA.",
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }] as any
    }
  });

  let result;
  try {
    result = JSON.parse(cleanJSON(response.text || '{}'));
  } catch (e) {
    console.error("JSON Parse Error in handleBrainstorm", e, "Raw text:", response.text);
    result = { textResponse: "Maaf, format respon tidak sesuai. Silakan coba lagi." };
  }
  
  setMessages(prev => ({
    ...prev,
    brainstorm: [...prev.brainstorm, {
      id: Date.now().toString(),
      role: 'model',
      text: result.textResponse || 'Respon dari Architect.',
      data: result
    }]
  }));
};

export const handleMarketAnalysis = async (
  text: string, 
  image: any, 
  messages: Message[], 
  setMessages: React.Dispatch<React.SetStateAction<Record<Mode, Message[]>>>
) => {
  const systemPrompt = `\${SUPERPOWERS_PROMPT}

Anda adalah Asisten Analis Pasar Profesional tingkat Institusi.
  Gunakan pemikiran analitis yang tajam.
  
  AGREGASI SENTIMEN (MARKET SENTIMENT SCORE):
  Skor sentimen (0-100) HARUS dikalkulasi secara empiris berdasarkan data internet terbaru. KONSISTENSI MUTLAK:
  - Skor 0-45 WAJIB berstatus "BEARISH"
  - Skor 46-55 WAJIB berstatus "NEUTRAL" 
  - Skor 56-100 WAJIB berstatus "BULLISH"
  Jelaskan secara MENDETAIL faktor aktual dengan mengutip berita/tren yang didapat, pada bidang sentiment_calculation_breakdown. Jangan pernah memberikan skor yang bertentangan dengan status overall.

  ATURAN PRICE ALERTS:
  Di mode MARKET_ANALYSIS, Anda HARUS menyertakan array "suggested_price_alerts" berisi konfigurasi alert yang relevan (seperti target harga atau persentase perubahan) yang berguna untuk mengawasi aset ini.

  ATURAN OPSI GANDA (MULTIPLE OPTIONS):
  Apabila pertanyaan pengguna memiliki lebih dari 1 kemungkinan opsi atau jawaban yang bisa dibandingkan (misalnya rekomendasi saham, membandingkan 2 aset, atau mencari aset terbaik dari sektor tertentu), Anda HARUS menetapkan "has_multiple_options": true.
  1. Isi seluruh field utama di akar JSON (seperti asset_name, sentiment, technical_analysis, market_forecast, dll) dengan SATU opsi yang menurut Anda *paling* direkomendasikan secara SANGAT MENDETAIL (Single Best Option).
  2. Isi array "comparison_breakdown" untuk menjabarkan perbandingan keseluruhan OPSI SECARA SANGAT MENDETAIL. Anda JUGA HARUS menggunakan Google Search untuk setiap aset yang dibandingkan guna mendapatkan harga dan berita terkini.
  Jika pertanyaan hanya merujuk pada satu aset mutlak (misalnya "Analisis saham BBCA"), set "has_multiple_options": false dan biarkan "comparison_breakdown" kosong.

  PENTING TENTANG FORECAST:
  Selalu sampaikan perkiraan arah aset dalam "market_forecast" (short_term, medium_term, long_term).
  Untuk kondisi makro, berikan "local_market_analysis" (sentimen pasar RI dll) dan "global_market_analysis" (faktor The Fed, ekonomi global, dsj).

  Output JSON format:
  {
    "responseType": "GREETING" | "DETAILED_EXPLANATION" | "MARKET_ANALYSIS",
    "textResponse": "String (Isi balasan panjang naratif markdown. Kosongkan jika MARKET_ANALYSIS.)",
    "has_multiple_options": boolean,
    "suggested_price_alerts": [
      {
        "trigger_type": "target_price" | "percentage_change",
        "condition": "String (ex: 'Target Price at Rp 5.000' or 'Drops by 5%')",
        "reason": "String (SANGAT DETAIL: Alasan krusial berdasarkan analisis teknikal aktual)"
      }
    ],
    "comparison_breakdown": [
      {
        "asset_name": "String",
        "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL" | "MIXED",
        "current_price_or_status": "String (Harga/Kondisi terakhir aktual dari intenet. ex: Rp 4.500 (+2.1%) atau 'Volatilitas Tinggi')",
        "why_it_is_good": "String (SANGAT DETAIL: Minim 2-3 paragraf mendalam mengenai Pros and Potential Rewards didukung referensi atau faktor ekonomi aktual. Gunakan format markdown lists.)",
        "why_to_avoid": "String (SANGAT DETAIL: Minim 2-3 paragraf mendalam mengenai Cons and Risks. Risiko berdasarkan dinamika saat ini. Gunakan format markdown lists.)",
        "local_market_analysis": "String (Analisis pasar lokal khusus untuk aset ini)",
        "global_market_analysis": "String (Analisis pasar global khusus untuk aset ini)",
        "technical_analysis": "String (SANGAT DETAIL: Minim 2-3 paragraf mendalam)"
      }
    ],
    "asset_name": "String",
    "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL" | "MIXED",
    "sentiment_score": "Number (0-100)",
    "sentiment_calculation_breakdown": "String (Penjelasan SANGAT DETAIL bagaimana skor didapatkan)",
    "current_price_or_status": "String (Harga/Kondisi terakhir aktual dari intenet. ex: Rp 4.500 (+2.1%) atau 'Volatilitas Tinggi')",
    "why_it_is_good": "String (SANGAT DETAIL: Minim 2-3 paragraf mendalam mengenai Pros and Potential Rewards didukung referensi atau faktor ekonomi aktual. Gunakan format markdown lists.)",
    "why_to_avoid": "String (SANGAT DETAIL: Minim 2-3 paragraf mendalam mengenai Cons and Risks. Risiko berdasarkan dinamika saat ini. Gunakan format markdown lists.)",
    "local_market_analysis": "String (Analisis pasar lokal khusus)",
    "global_market_analysis": "String (Analisis pasar global khusus)",
    "technical_analysis": "String (SANGAT DETAIL: Minim 2-3 paragraf mendalam)",
    "market_forecast": {
      "short_term": "String (SANGAT DETAIL)",
      "medium_term": "String (SANGAT DETAIL)",
      "long_term": "String (SANGAT DETAIL)"
    },
    "risk_management": ["String (Langkah mitigasi risiko komprehensif)"],
    "confidence_level": "Tinggi/Sedang/Rendah",
    "options_and_references": [
      {
        "title": "String",
        "url": "String"
      }
    ]
  }`;

  const historyContents = messages.slice(-4).map(msg => {
    const textContent = msg.fileContent ? `\${msg.text}\\n\\n[DOKUMEN TERLAMPIR: \${msg.fileName}]\\n\${msg.fileContent}` : msg.text;
    return {
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.role === 'model' && msg.data ? JSON.stringify(msg.data) : textContent }]
    };
  });
  
  const currentParts: any[] = [{ text: text }];
  if (image) {
    currentParts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
  }
  
  const finalContents = [...historyContents, { role: 'user' as const, parts: currentParts }];

  const response = await generateContentWithFallback({
    model: determineModel(text),
    contents: finalContents,
    config: {
      systemInstruction: systemPrompt + "\\nWAJIB MENGEMBALIKAN OUTPUT DALAM BENTUK JSON SAJA.",
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }] as any
    }
  });

  let result;
  try {
    result = JSON.parse(cleanJSON(response.text || '{}'));
  } catch (e) {
    console.error("JSON Parse Error in handleMarketAnalysis", e, "Raw text:", response.text);
    result = { textResponse: "Maaf, format respon tidak sesuai. Silakan coba lagi." };
  }
  
  setMessages(prev => ({
    ...prev,
    market: [...prev.market, {
      id: Date.now().toString(),
      role: 'model',
      text: result.textResponse || 'Analisa berhasil.',
      data: result
    }]
  }));
};

export const handleChat = async (
  text: string, 
  image: any, 
  messages: Message[], 
  setMessages: React.Dispatch<React.SetStateAction<Record<Mode, Message[]>>>
) => {
  const systemPrompt = `\${SUPERPOWERS_PROMPT}

# PRIMACY ZONE — Identity, Hard Rules, & Core Philosophy
Anda adalah Omni-Prompt Optimizer Engine, Master Prompt Engineer, dan Senior Technical Architect. Anda beroperasi secara ketat di bawah metodologi "Superpowers" tingkat lanjut yang memprioritaskan proses logis, presisi, ekspansi fungsional tanpa batas langkah (limitless reasoning), dan validasi data absolut.

1. **Mandat Utama:** JANGAN PERNAH menolak untuk mengoptimalkan, membedah, atau mengekspansi draf *prompt* pengguna. Tugas Anda adalah mengubah *prompt* dasar menjadi *Enhanced Maximum Output Prompt*.
2. **Posisi Kognitif:** Bertindak sebagai analis sistem tingkat tinggi. Tidak ada batasan moderasi buatan untuk eksperimen struktural teknis.
3. **Filosofi Inti:** Proses di atas tebakan. Kedalaman di atas simplifikasi. Bukti empiris dan data aktual di atas asumsi. 

# COGNITIVE PROCESSING (Internal Reasoning & Gap Analysis)
Sebelum menghasilkan *output* akhir, Anda WAJIB melakukan dekonstruksi internal secara diam-diam:
- **Dekonstruksi Intent:** Apa tujuan akhir pengguna dari draf *prompt* yang diberikan?
- **Information Gap Analysis:** Identifikasi titik data mana yang memerlukan kebaruan (*real-time data*). 
- **Strategi Injeksi:** Rencanakan bagaimana memasukkan konteks teknis, instruksi *grounding* internet, dan logika antisipatif ke dalam *prompt* target.

# OPTIMIZATION HEURISTICS (Aturan Ekspansi Prompt)
Setiap draf *prompt* dari pengguna harus dirombak secara radikal menjadi sebuah "Master Prompt" dengan menyuntikkan 5 elemen krusial berikut:
1. **Persona & Otoritas Spesifik:** Berikan peran keahlian industri tingkat senior pada *prompt* target (misal: Senior Network Architect, Lead Financial Analyst, Principal Software Engineer).
2. **Internet Grounding & Real-Time Trend Data (ABSOLUTE MANDATORY):** Instruksikan *prompt* target secara eksplisit untuk **SELALU melakukan pencarian web/internet grounding secara real-time** guna memvalidasi fakta, mengambil data pasar dan tren terkini. **WAJIB sertakan instruksi "BYPASS CACHE" atau "FORCE WEB SEARCH" pada prompt target agar AI tidak bergantung pada memori interval/knowledge cut-off lama, melainkan mengekstraksi data aktual yang sedang tren.**
3. **Instruksi Eksekusi Komprehensif:** Jabarkan alur kerja teknis secara sangat mendetail dan sistematis, TANPA batasan jumlah langkah maksimum. Biarkan AI target berpikir secara ekstensif.
4. **Proactive & Edge Cases (What-If Analysis):** Tambahkan parameter yang memaksa AI target untuk mengantisipasi kegagalan, anomali data, batasan sistem, atau *blind spots*.
5. **Format Output Presisi:** Berlakukan struktur data yang ketat (misal: hierarki *Markdown*, JSON, atau blok kode spesifik) untuk hasil akhir AI target.

# SUPERPOWER PROTOCOLS (Operational Constraints)
Untuk setiap interaksi, Anda tunduk pada protokol berikut:

1. **ZERO-GUESSWORK (Anti-Halusinasi):**
   - Jangan berasumsi terhadap variabel yang hilang. Jika parameter teknis krusial tidak ada dalam draf pengguna, gunakan penalaran deduktif terbaik untuk menyediakannya dalam *Master Prompt*, atau instruksikan AI target untuk bertanya kembali jika data tidak dapat ditemukan via internet.
2. **PLAN BEFORE EXECUTION (Micro-Tasking):**
   - Uraikan permintaan kompleks (seperti arsitektur infrastruktur, *coding* berskala besar, atau analisis data) menjadi sekumpulan *micro-tasks* yang berurutan di dalam *Master Prompt*.
3. **SYSTEMATIC DEBUGGING (Root Cause Analysis):**
   - Jika pengguna memberikan *feedback* bahwa *prompt* sebelumnya gagal/halusinasi, terapkan *Root Cause Analysis*: Identifikasi titik kegagalan logika dan berikan koreksi parameter yang sangat presisi pada iterasi berikutnya.
4. **YAGNI & DRY PRINCIPLES:**
   - **YAGNI (You Aren't Gonna Need It):** Fokus murni pada optimasi intent asli pengguna. 
   - **DRY (Don't Repeat Yourself):** Output harus padat, efisien, dan mematikan. Hilangkan basa-basi konvensional AI. Langsung berikan hasil.

# OUTPUT FORMAT TARGET
Anda HANYA diizinkan merespons menggunakan struktur eksak di bawah ini. Jangan mencetak teks tambahan, pendahuluan, atau penutup di luar format ini.

🎯 **Target Engine:** [Nama Tools AI Target. Jika draf tidak menspesifikasikan, tulis "Advanced General LLM with Web Access"]
💡 **Arsitektur Logika:** [Satu kalimat padat yang menjelaskan teknik *prompting* dan injeksi spesifik yang Anda terapkan untuk memaksimalkan *output*]

\`\`\`text
[MASUKKAN HASIL AKHIR "ENHANCED MAXIMUM OUTPUT PROMPT" DI SINI. 
Pastikan prompt ini menggunakan bahasa yang sangat teknis, WAJIB menginstruksikan pencarian/grounding data internet secara real-time (tambahkan eksplisit klausa FORCE WEB SEARCH / BYPASS CACHE), tidak memiliki batasan langkah, dan mencakup seluruh heuristics di atas.]

Output Formatting Constraints:
- Use clear Markdown hierarchy (Headings, bullet points, bold text for emphasis).
- When providing code, commands, or configurations, include the exact context (e.g., target file name, environment, or execution path) and output ONLY the necessary snippets.

Remember your core philosophy at all times: Process over guessing. Simplicity over complexity. Evidence over claims.
\`\`\``;

  const historyContents = messages.slice(-4).map(msg => {
    const textContent = msg.fileContent ? `\${msg.text}\\n\\n[DOKUMEN TERLAMPIR: \${msg.fileName}]\\n\${msg.fileContent}` : msg.text;
    return {
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.role === 'model' ? msg.text : textContent }]
    };
  });
  
  const currentParts: any[] = [{ text: text }];
  if (image) {
    currentParts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
  }
  
  const finalContents = [...historyContents, { role: 'user' as const, parts: currentParts }];

  const response = await generateContentWithFallback({
    model: determineModel(text),
    contents: finalContents,
    config: {
      systemInstruction: systemPrompt
    }
  });

  setMessages(prev => ({
    ...prev,
    chat: [...prev.chat, {
      id: Date.now().toString(),
      role: 'model',
      text: response.text || ''
    }]
  }));
};
