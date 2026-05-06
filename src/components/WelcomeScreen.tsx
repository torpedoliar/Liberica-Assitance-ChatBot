import React from 'react';
import { Mode } from '../types';
import { Wrench, Lightbulb, TrendingUp, MessageSquare, Sparkles } from 'lucide-react';
import { MarketOverview } from 'react-ts-tradingview-widgets';

export function WelcomeScreen({ mode }: { mode: Mode }) {
  const content = {
    troubleshoot: { title: "Solusi Cerdas IT", sub: "Diagnosis teknis langkah demi langkah untuk sistem enterprise Anda.", icon: <Wrench className="w-10 h-10" /> },
    brainstorm: { title: "Strategi & Ide", sub: "Temukan celah dan inovasi baru melalui diskusi terstruktur.", icon: <Lightbulb className="w-10 h-10" /> },
    market: { title: "Wawasan Pasar", sub: "Analisis tren, sentimen, dan pergerakan aset secara real-time.", icon: <TrendingUp className="w-10 h-10" /> },
    chat: { title: "Master Prompting", sub: "Transform vague requests into precise, effective prompts.", icon: <MessageSquare className="w-10 h-10" /> }
  };

  if (mode === 'chat') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 w-full">
        <div className="bg-[var(--color-sys-bg)] border-2 border-[var(--color-sys-ink)] rounded-2xl p-8 max-w-2xl w-full text-left shadow-[8px_8px_0_var(--color-sys-ink)]">
          <div className="flex items-center gap-4 mb-8">
            <Sparkles className="w-10 h-10" />
            <h2 className="text-4xl font-bold font-serif italic uppercase flex-1">LibercAsk Prompt</h2>
          </div>
          <div className="markdown-body">
            <p className="text-sm md:text-base leading-relaxed mb-6">Halo! Saya LibercAsk, asisten optimasi prompt AI Anda. Saya mengubah permintaan Anda menjadi prompt yang presisi dan efektif untuk hasil yang maksimal.</p>
            <p className="font-bold mb-2">Apa yang perlu saya ketahui:</p>
            <ul className="list-disc pl-5 font-mono text-sm max-w-xl mb-6 opacity-80 space-y-1">
              <li>TARGET AI: ChatGPT, Claude, Gemini, atau Lainnya</li>
              <li>GAYA PROMPT: DETAIL (Tanya konteks) atau BASIC (Optimasi kilat)</li>
            </ul>
            <p className="font-bold mb-2">Contoh penggunaan:</p>
            <ul className="list-disc pl-5 font-mono text-sm max-w-xl mb-8 opacity-80 space-y-1">
              <li>"DETAIL menggunakan ChatGPT — Tuliskan email penawaran produk"</li>
              <li>"BASIC menggunakan Claude — Tolong perbaiki summary CV saya"</li>
            </ul>
            <p className="mt-6 border-t border-[var(--color-sys-line)] pt-4 tracking-widest font-bold text-[11px] uppercase opacity-70">
              Kirimkan draft prompt/ide Anda, lalu saya akan perbaiki menjadi luar biasa.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'market') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 w-full fade-in-up">
        <div className="text-center mb-8">
          <div className="mb-4 flex items-center justify-center opacity-80">
            {React.cloneElement(content[mode].icon as React.ReactElement<any>, { className: 'w-12 h-12' })}
          </div>
          <h2 className="text-3xl md:text-4xl font-serif italic mb-3 capitalize font-semibold">{content[mode].title}</h2>
          <p className="font-mono text-xs opacity-60 uppercase tracking-widest max-w-lg mx-auto">{content[mode].sub}</p>
        </div>
        
        <div className="w-full max-w-4xl h-[450px] border-2 border-[var(--color-sys-ink)] rounded-2xl overflow-hidden shadow-[8px_8px_0_var(--color-sys-ink)]">
             <MarketOverview 
             colorTheme="light" 
             height="100%" 
             width="100%" 
             showFloatingTooltip 
             tabs={[
               {
                 title: "Overview",
                 originalTitle: "Overview",
                 symbols: [
                   { s: "IDX:COMPOSITE", d: "IHSG" },
                   { s: "FX_IDC:USDIDR", d: "USD/IDR" },
                   { s: "BINANCE:BTCUSDT", d: "BTC/USDT" },
                   { s: "OANDA:XAUUSD", d: "Gold" },
                   { s: "PEPPERSTONE:COFFEE", d: "Coffee" }
                 ]
               },
               {
                 title: "Indonesia Stocks",
                 originalTitle: "Indonesia Stocks",
                 symbols: [
                   { s: "IDX:BBCA", d: "BCA" },
                   { s: "IDX:BBRI", d: "BRI" },
                   { s: "IDX:BMRI", d: "Mandiri" },
                   { s: "IDX:TLKM", d: "Telkom Indonesia" },
                   { s: "IDX:ASII", d: "Astra International" },
                   { s: "IDX:GOTO", d: "GoTo" }
                 ]
               }
             ]} 
           />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center fade-in-up">
      <div className="mb-6 flex items-center justify-center opacity-80">
        {React.cloneElement(content[mode].icon as React.ReactElement<any>, { className: 'w-16 h-16' })}
      </div>
      <h2 className="text-4xl md:text-5xl font-serif italic mb-4 capitalize font-semibold">{content[mode].title}</h2>
      <p className="font-mono text-sm opacity-60 uppercase tracking-widest max-w-md mx-auto">{content[mode].sub}</p>
    </div>
  );
}
