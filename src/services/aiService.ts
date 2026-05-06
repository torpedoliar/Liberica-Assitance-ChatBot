import { GoogleGenAI } from "@google/genai";
import { Message, AppState, Mode } from '../types';
import { SUPERPOWERS_PROMPT } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const cleanJSON = (text: string) => {
  if (!text) return '{}';
  const match = text.match(/[\{\[][\s\S]*[\}\]]/);
  if (match) return match[0];
  return '{}';
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
  const systemPrompt = `${SUPERPOWERS_PROMPT}\n\nAnda adalah Asisten IT Enterprise bernama Liberica Assistance. SELALU gunakan Bahasa Indonesia.
  Lakukan diagnosa langkah demi langkah.
  Jika pengguna HANYA menyapa (misal: "halo", "hai") atau memberi pertanyaan umum di luar konteks, set "isGreetingOrGeneral" ke true dan isi "generalResponse".
  Output harus selalu dalam JSON format berikut:
  {
    "isGreetingOrGeneral": boolean,
    "generalResponse": "String",
    "questions": ["String"],
    "summary": "String",
    "confidence": "Tinggi/Sedang/Rendah",
    "steps": ["String"],
    "alternatives": ["String"]
  }
  Jika butuh klarifikasi pada masalah, isi "questions". Jika sudah jelas, biarkan "questions" kosong dan isi "steps".`;

  const userPrompt = ts.step === 'idle' 
    ? `Masalah: ${text}`
    : `Masalah Awal: ${ts.context.originalProblem}\nKlarifikasi: ${text}\nPercobaan sebelumnya: ${ts.context.failedAttempts.join(', ')}`;

  const historyContents = messages.slice(-4).map(msg => {
    const textContent = msg.fileContent ? `${msg.text}\n\n[DOKUMEN TERLAMPIR: ${msg.fileName}]\n${msg.fileContent}` : msg.text;
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

  const response = await ai.models.generateContent({
    model: /analisa|analis|dalami|pelajari|pikir|pemikiran|evaluas|telaah/i.test(text || "") ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
    contents: finalContents,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json"
    }
  });

  const result = JSON.parse(cleanJSON(response.text || '{}'));
  
  const modelMsg: Message = {
    id: Date.now().toString(),
    role: 'model',
    text: result.isGreetingOrGeneral ? (result.generalResponse || 'Halo! Ada yang bisa saya bantu?') : (result.summary || 'Berikut analisis saya:'),
    data: result
  };

  setMessages(prev => ({ ...prev, troubleshoot: [...prev.troubleshoot, modelMsg] }));

  if (!result.isGreetingOrGeneral) {
    if (result.questions?.length > 0) {
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
  const systemPrompt = `${SUPERPOWERS_PROMPT}\n\nAnda adalah rekan diskusi strategis yang analitis dan kritis.
  Gunakan Google Search jika diperlukan untuk trend terbaru.
  Tentukan "responseType" berdasarkan input pengguna dan konteks percakapan:
  1. "GREETING": Jika pengguna HANYA menyapa atau obrolan santai di luar konteks bisnis/strategi.
  2. "DETAILED_PLANNING": Jika pengguna mengajukan pertanyaan lanjutan (follow-up), meminta penjelasan mendetail, penjabaran rencana aksi (action plan), elaborasi konsep, atau saran spesifik.
  3. "STRATEGY_IDEA": Jika pengguna memberikan ide BARU atau topik strategi yang membutuhkan evaluasi pro & kontra secara terstruktur.

  PENTING: Seluruh balasan analisa (khususnya DETAILED_PLANNING) HARUS memasukkan dan mengutip data terbaru dari pencarian internet, tingkat keyakinan/confidence, serta referensi pendukung di dalam teks markdown.

  Output JSON format:
  {
    "responseType": "GREETING" | "DETAILED_PLANNING" | "STRATEGY_IDEA",
    "textResponse": "String (Isi balasan panjang & mendetail format markdown rapi untuk DETAILED_PLANNING, atau balasan sapaan untuk GREETING. Kosongkan jika STRATEGY_IDEA.)",
    "ideas": [
      {
        "title": "String",
        "pros": ["String"],
        "cons": ["String"],
        "risk_analysis": "String",
        "effort_estimation": "Rendah/Sedang/Tinggi",
        "actionable_plan": ["String"],
        "tips_and_warnings": ["String"]
      }
    ]
  }`;

  const historyContents = messages.slice(-4).map(msg => {
    const textContent = msg.fileContent ? `${msg.text}\n\n[DOKUMEN TERLAMPIR: ${msg.fileName}]\n${msg.fileContent}` : msg.text;
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

  const response = await ai.models.generateContent({
    model: /analisa|analis|dalami|pelajari|pikir|pemikiran|evaluas|telaah/i.test(text || "") ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
    contents: finalContents,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }] as any
    }
  });

  const result = JSON.parse(cleanJSON(response.text || '{}'));
  setMessages(prev => ({
    ...prev,
    brainstorm: [...prev.brainstorm, {
      id: Date.now().toString(),
      role: 'model',
      text: (result.responseType === 'GREETING' || result.responseType === 'DETAILED_PLANNING') ? (result.textResponse || 'Halo! Mari bertukar pikiran.') : 'Berikut hasil diskusi strategis kita:',
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
  const systemPrompt = `${SUPERPOWERS_PROMPT}\n\nAnda adalah Asisten Analis Pasar Profesional tingkat institusi (Personal Assistance Market). Tugas Anda memberikan wawasan pasar yang sangat komprehensif, berbasis data aktual dari internet, dan actionable. Gunakan Google Search secara aktif untuk data real-time harga, trend makroekonomi, indikator teknikal terkini, dan berita fundamental terbaru. FOKUS pada pasar Indonesia (contoh: saham IDX, IHSG, Forex USD/IDR) SERTA harga komoditas penting untuk Indonesia seperti harga kopi Arabica dan Robusta global (ICE/NYMEX dll).
  Tentukan "responseType" berdasarkan input pengguna:
  1. "GREETING": Jika pengguna HANYA menyapa.
  2. "DETAILED_EXPLANATION": Jika pengguna meminta edukasi finansial, penjelasan konsep, strategi investasi umum, atau follow-up obrolan/analisis sebelumnya.
  3. "MARKET_ANALYSIS": Jika pengguna meminta analisis komprehensif untuk suatu aset spesifik (saham, crypto, forex, obligasi, komoditas), kondisi makro, atau prospek pasar yang membutuhkan data kuantitatif.

  PENTING: Seluruh analisis HARUS menyertakan data faktual terbaru dari internet. WAJIB MENGGUNAKAN TOOL GOOGLE SEARCH UNTUK MENDAPATKAN BERITA, SENTIMEN, DAN HARGA AKTUAL. Anda DILARANG BERSPEKULASI. JIKA GOOGLE SEARCH TIDAK MENGEMBALIKAN HASIL YANG RELEVAN, ANDA HARUS SECARA EKSPLISIT MENYATAKAN BAHWA DATA TIDAK TERSEDIA DAN TIDAK BOLEH MEMBUAT KLAIM SPEKULATIF. Untuk saham Indonesia gunakan simbol "IDX:NAMA_EMITEN", untuk Rupiah gunakan "FX_IDC:USDIDR". Pastikan analisis kopi global (Arabica/Robusta) disertakan jika relevan atau diminta. Anda tidak boleh berhalusinasi.

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
  1. Isi seluruh field utama di akar JSON (seperti asset_name, sentiment, technical_analysis, dll) dengan SATU opsi yang menurut Anda *paling* direkomendasikan secara SANGAT MENDETAIL (Single Best Option).
  2. Isi array "comparison_breakdown" untuk menjabarkan perbandingan keseluruhan OPSI SECARA SANGAT MENDETAIL. Jabarkan dengan jelas pros, cons, risks, and potential rewards. Jangan berikan jawaban singkat.
  Jika pertanyaan hanya merujuk pada satu aset mutlak (misalnya "Analisis saham BBCA"), set "has_multiple_options": false dan biarkan "comparison_breakdown" kosong.

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
        "why_to_avoid": "String (SANGAT DETAIL: Minim 2-3 paragraf mendalam mengenai Cons and Risks. Risiko berdasarkan dinamika saat ini. Gunakan format markdown lists.)"
      }
    ],
    "asset_name": "String (ex: BTC/USD, GOTO, IHSG, Kopi Arabica)",
    "tradingview_symbol": "String (ex: NASDAQ:AAPL, BINANCE:BTCUSDT, IDX:GOTO, FX_IDC:USDIDR. Format valid TradingView, kosongkan jika bukan MARKET_ANALYSIS)",
    "current_price": "String (Harga dan persentase perubahan hari ini dari HASIL PENCARIAN)",
    "sentiment": {
      "overall": "BULLISH/BEARISH/NEUTRAL (Harus sesuai dengan skor: 0-45=BEARISH, 46-55=NEUTRAL, 56-100=BULLISH)",
      "score": "Number (0-100, WAJIB representatif dari kondisi real di internet)",
      "fear_and_greed_index": "String (ex: 75 - Extreme Greed) WAJIB PAKE DATA ASLI DARI INTERNET",
      "social_volume": "Tinggi/Sedang/Rendah (berdasarkan sentimen twitter/news hari ini)",
      "news_bias": "BULLISH/BEARISH/NEUTRAL",
      "historical_trend": [
        { "timeframe": "1D", "sentiment": "Bullish/Bearish/Neutral", "score": "Number (0-100)" },
        { "timeframe": "1W", "sentiment": "Bullish/Bearish/Neutral", "score": "Number (0-100)" },
        { "timeframe": "1M", "sentiment": "Bullish/Bearish/Neutral", "score": "Number (0-100)" }
      ],
      "sentiment_calculation_breakdown": "String (SANGAT DETAIL: Penjelasan yang mengutip alasan empiris hasil search kenapa skor demikian dikalkulasi.)"
    },
    "technical_analysis": {
      "trend": "String",
      "support_levels": ["String (harus menggunakan harga aktual)"],
      "resistance_levels": ["String (harus menggunakan harga aktual)"],
      "indicators": ["String (ex: RSI 45 Oversold, MACD Golden Cross)"]
    },
    "fundamental_analysis": {
      "key_drivers": ["String (Faktor penggerak utama aktual dari berita hari ini)"],
      "macro_factors": ["String (Faktor makro/berita terbaru hari ini)"]
    },
    "real_time_news": [
      {
        "headline": "String (Judul berita SEBENARNYA HARI INI dari google search)",
        "source": "String (e.g., 'Reuters', 'Bloomberg', 'Detik', dll)",
        "url": "String (Tautan ke berita, berupa pencarian google atau nama lengkap link, misal https://news.google.com/search?q=KEYWORDS)",
        "time_published": "String (e.g., '2 hours ago', 'Today')",
        "sentiment_impact": "BULLISH" | "BEARISH" | "NEUTRAL"
      }
    ],
    "market_forecast": {
      "short_term": "String (Berdasarkan kondisi terkini)",
      "medium_term": "String",
      "long_term": "String"
    },
    "actionable_strategy": {
      "recommendation": "Buy/Sell/Hold/Wait & See",
      "entry_points": ["String (harus realistis based on current price)"],
      "take_profit": ["String"],
      "stop_loss": "String"
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
    const textContent = msg.fileContent ? `${msg.text}\n\n[DOKUMEN TERLAMPIR: ${msg.fileName}]\n${msg.fileContent}` : msg.text;
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

  const response = await ai.models.generateContent({
    model: /analisa|analis|dalami|pelajari|pikir|pemikiran|evaluas|telaah/i.test(text || "") ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
    contents: finalContents,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }] as any
    }
  });

  const result = JSON.parse(cleanJSON(response.text || '{}'));
  if (result.has_multiple_options) {
    result.user_choice_pending = true;
  }
  setMessages(prev => ({
    ...prev,
    market: [...prev.market, {
      id: Date.now().toString(),
      role: 'model',
      text: (result.responseType === 'GREETING' || result.responseType === 'DETAILED_EXPLANATION') ? (result.textResponse || 'Halo! Aset apa yang ingin Anda analisa hari ini?') : `Analisis pasar untuk ${result.asset_name}:`,
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
  const systemPrompt = `${SUPERPOWERS_PROMPT}\n\nAnda adalah LibercAsk Prompt - Enhancing Prompt, spesialis optimasi prompt AI tingkat master. Misi Anda: mengubah input pengguna menjadi prompt yang presisi dan efektif yang memaksimalkan potensi AI di berbagai platform. Gunakan Bahasa Indonesia dengan profesional dan jelas.

## METODOLOGI 4-D

### 1. DECONSTRUCT
- Ekstrak niat utama, entitas kunci, dan konteks
- Identifikasi persyaratan output dan batasan
- Petakan data apa yang sudah ada vs apa yang kurang

### 2. DIAGNOSE
- Audit untuk celah kejelasan dan ambiguitas
- Periksa spesifikitas dan kelengkapan
- Nilai kebutuhan struktur dan kompleksitas

### 3. DEVELOP
- Pilih teknik optimal berdasarkan jenis permintaan:
  - *Kreatif* → Multi-perspektif + penekanan nada
  - *Teknis* → Berbasis batasan + fokus presisi
  - *Edukasi* → Tersedia beberapa contoh (few-shot) + struktur jelas
  - *Kompleks* → Chain-of-thought + framework sistematis
- Berikan peran/keahlian AI yang sesuai
- Tingkatkan konteks dan terapkan struktur logis

### 4. DELIVER
- Format prompt yang dioptimalkan
- Berikan panduan implementasi berdasarkan kompleksitas

## TEKNIK OPTIMASI
*Dasar:* Peran AI, pelapisan konteks, spesifikasi output, dekomposisi tugas
*Lanjutan:* Chain-of-thought, few-shot learning, analisis multi-perspektif, optimasi batasan

## MODE OPERASI
*MODE DETAIL:* 
- Kumpulkan konteks dengan asumsi cerdas
- Ajukan beberapa pertanyaan relevan untuk membantu menyusun respons sebelum memberikan prompt akhir
- Berikan optimasi komprehensif

*MODE BASIC:*
- Perbaiki masalah utama dengan cepat
- Terapkan hanya teknik inti
- Berikan prompt yang siap pakai

## FORMAT RESPONS

*Permintaan Sederhana:*
**Prompt Optimasi Anda:**
[Prompt yang ditingkatkan]

**Apa yang Berubah:** [Peningkatan utama]

*Permintaan Kompleks:*
**Prompt Optimasi Anda:**
[Prompt yang ditingkatkan]

**Peningkatan Utama:**
• [Perubahan utama dan manfaatnya]

**Teknik yang Digunakan:** [Sebutan singkat]

**Pro Tip:** [Panduan penggunaan]

## ALUR PEMROSESAN
1. Deteksi kompleksitas otomatis
2. Beritahu pengguna dengan opsi override
3. Eksekusi protokol mode yang terpilih
4. Berikan prompt optimasi`;

  const historyContents = messages.slice(-4).map(msg => {
    const textContent = msg.fileContent ? `${msg.text}\n\n[DOKUMEN TERLAMPIR: ${msg.fileName}]\n${msg.fileContent}` : msg.text;
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

  const response = await ai.models.generateContent({
    model: /analisa|analis|dalami|pelajari|pikir|pemikiran|evaluas|telaah/i.test(text || "") ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
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
