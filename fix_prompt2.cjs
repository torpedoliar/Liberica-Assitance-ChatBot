const fs = require('fs');

let content = fs.readFileSync('src/services/aiService.ts', 'utf8');

// The rewrite script:
// 1. the troubleshoot prompt shouldn't contain phase 1-5 logic. So I'll just remove the phase 1-5 from troubleshoot and replace the brainstorm prompt. Wait, the original troubleshoot prompt didn't have phases.

const originalTroubleshootHints = `# HINTS & INLINE COMMAND
Di SETIAP respons (terutama saat meminta klarifikasi atau troubleshooting), Anda WAJIB memberikan:
1. \`inline_command_question\`: Satu pertanyaan spesifik lanjutan untuk memperjelas konteks masalah (misal: "Apa pesan error spesifik yang muncul di baris 42?").
2. \`hints_for_user\`: 2-3 Contoh kalimat nyata respons dari jawaban yang mungkin, agar user awam tidak kebingungan. (Contoh: "Errornya 'Null Reference Exception' di auth.ts" atau "Waktu saya klik tombol Login langsung freeze").

  Output harus selalu dalam JSON format berikut:`;

// I need to fix the generic replacement I did.
// Let's just fix it by replacing the whole # HINTS onwards inside handleTroubleshoot.
content = content.replace(/# HINTS & INLINE COMMAND[\s\S]*?Output JSON format:/, originalTroubleshootHints);

// Now let's fix handleBrainstorm prompt. First, find its location.
const brainstormIndex = content.indexOf('export const handleBrainstorm');
if (brainstormIndex !== -1) {
  const brainstormContent = content.substring(brainstormIndex);
  
  const originalBrainstormRegex = /# HINTS & INLINE COMMAND[\s\S]*?ANDA HARUS MENGGUNAKAN responseType "ARCHITECT_IDEA" dan MENGISI ARRAY "ideas" dan "pivot_matrix" di format JSON!/m;
  const newBrainstorm = `# HINTS & INLINE COMMAND
Di SETIAP respons apa pun (termasuk saat awal, saat interogasi, atau saat memberikan hasil ideasi), Anda WAJIB memberikan:
1. \`inline_command_question\`: Satu pertanyaan pancingan spesifik. PERINGATAN: Jangan terjebak bertanya hal sepele yang tidak ada hubungannya dengan esensi utama sistem secara makro (contoh: jangan tanya jumlah MCB, tinggi colokan dsb). Jaga di level BIG PICTURE. Jika user sudah memberikan cukup info makro, stop bertanya dan langsung gunakan pertanyaan ini sebagai validasi penutup ("Apakah Anda siap untuk mulai mengeksekusi ini?").
2. \`hints_for_user\`: 2-3 Contoh kalimat nyata (roleplay sebagai user) dari jawaban yang mungkin.

# PROGRESSION LOGIC (ANTI-LOOPING) - CRITICAL INSTRUCTION
- JIKA USER SUDAH MEMBERIKAN 1 ATAU 2 INFO KONTEKS PENTING (misalnya soal ukuran ruang dan jumlah user, atau target audience), ANDA DILARANG KERAS MEMINTA INPUT/FASE 1 LAGI! 
- JANGAN BERTANYA HAL SEPELE ATAU BIKIN REPOT USER! (e.g. jalur kabel, power AC). Asumsikan hal tersebut dengan standar industri.
- ANDA WAJIB SEGERA MERANGKUM INFORMASI YANG TELAH DISAMPAIKAN USER SEBAGAI "EXECUTIVE SUMMARY" LALU MELANJUTKAN KE FASE 3 (Matriks), FASE 4 (Verdict), SERTA FASE 5 (Mikro Eksekusi) DALAM 1 OUTPUT JSON YANG SAMA SAAT INI JUGA!
- GUNAKAN \`responseType: "ARCHITECT_IDEA"\` SAAT MELAKUKAN INI. Jangan gunakan \`FASE_1_INTAKE\` lagi! Toleransi looping adalah NOL.

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
Saat Anda sampai di fase ini (Fase 3, 4, 5) atau sudah memberikan kerangka eksekusi,
ANDA HARUS MENGGUNAKAN responseType "ARCHITECT_IDEA" dan MENGISI ARRAY "ideas" dan "pivot_matrix" di format JSON!`;
  
  const modifiedBrainstormContent = brainstormContent.replace(originalBrainstormRegex, newBrainstorm);
  content = content.substring(0, brainstormIndex) + modifiedBrainstormContent;
}

fs.writeFileSync('src/services/aiService.ts', content);
console.log('Fixed prompts!');
