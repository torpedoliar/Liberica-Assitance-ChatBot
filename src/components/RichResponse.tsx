import React from 'react';
import Markdown from 'react-markdown';
import { Mode } from '../types';
import { ShieldAlert, CheckCircle2, AlertCircle, ListChecks, Zap, Globe, BarChart2, Activity, TrendingUp, Clock, MessageSquare, Newspaper, Bell, BellRing, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { AdvancedRealTimeChart, TickerTape, TechnicalAnalysis, SymbolInfo, Timeline, CompanyProfile } from 'react-ts-tradingview-widgets';

export function RichResponse({ data, mode }: { data: any, mode: Mode }) {
  const [activeAlerts, setActiveAlerts] = useState<Record<string, boolean>>({});

  const handleSetAlert = (alertKey: string) => {
    setActiveAlerts(prev => ({
      ...prev,
      [alertKey]: true
    }));
    // Simulate notification
    setTimeout(() => {
      alert(`Simulation: Alert triggered for "${alertKey.split('-')[0]}"! Criteria met.`);
    }, 5000); // Trigger after 5 seconds to demonstrate notification
  };

  if (data?.isGreetingOrGeneral || data?.responseType === 'GREETING' || data?.responseType === 'DETAILED_PLANNING' || data?.responseType === 'DETAILED_EXPLANATION') {
    return (
      <div className="bento-card bg-[var(--color-sys-bg)] rounded-xl p-6 border-2 border-[var(--color-sys-ink)] shadow-[4px_4px_0_#000]">
        <div className="text-sm md:text-base text-[var(--color-sys-ink)] leading-relaxed whitespace-pre-wrap markdown-body">
          <Markdown>{data.textResponse || data.generalResponse}</Markdown>
        </div>
      </div>
    );
  }

  if (mode === 'troubleshoot') {
    return (
      <div className="bento-grid">
        <div className="md:col-span-12 bento-card border-l-[8px] border-[var(--color-sys-ink)] rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold uppercase tracking-widest text-sm font-sans underline">Ringkasan Analisis</h3>
            <span className="px-3 py-1 bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] text-[10px] font-mono font-bold uppercase">Akurasi: {data.confidence}</span>
          </div>
          <p className="leading-relaxed font-mono text-sm">{data.summary}</p>
        </div>

        {data.questions?.length > 0 && (
          <div className="md:col-span-12 bento-card bg-amber-50 text-amber-900 border-amber-900 rounded-xl">
            <h4 className="text-xs font-bold uppercase font-mono tracking-widest mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Butuh Klarifikasi
            </h4>
            <ul className="space-y-2">
              {data.questions.map((q: string, i: number) => (
                <li key={i} className="text-sm font-mono border-b border-amber-200 pb-2 border-dashed">• {q}</li>
              ))}
            </ul>
          </div>
        )}

        {data.steps?.length > 0 && (
          <div className="md:col-span-7 bento-card rounded-xl">
            <h4 className="text-xs font-bold uppercase font-mono tracking-widest opacity-60 mb-4 flex items-center gap-2">
              <ListChecks className="w-4 h-4" /> Panduan Langkah
            </h4>
            <div className="space-y-4">
              {data.steps.map((step: string, i: number) => (
                <div key={i} className="flex gap-4 group">
                  <span className="w-6 h-6 bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] font-mono font-bold flex items-center justify-center text-[10px] shrink-0">{i + 1}</span>
                  <p className="text-sm font-sans leading-relaxed pt-0.5 border-b border-dashed border-[var(--color-sys-line)] pb-2 flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.alternatives?.length > 0 && (
          <div className="md:col-span-5 bento-card bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] border-none rounded-xl">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 mb-4">Opsi Alternatif</h4>
            <ul className="space-y-3">
              {data.alternatives.map((alt: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <Zap className="w-4 h-4 opacity-50 shrink-0 mt-0.5" />
                  <span className="text-xs font-mono opacity-80 leading-relaxed border-b border-[var(--color-sys-bg)] border-dashed pb-2">{alt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'brainstorm') {
    return (
      <div className="space-y-4">
        {data.ideas?.map((idea: any, i: number) => (
          <div key={i} className="bento-grid mb-4">
            <div className="md:col-span-12 bento-card bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] border-none rounded-xl">
              <div className="flex justify-between items-start mb-4 border-b border-[var(--color-sys-bg)] pb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60">Konsep Strategis</span>
                <span className="px-3 py-1 border border-[var(--color-sys-bg)] text-[10px] font-mono font-bold uppercase">Estimasi: {idea.effort_estimation}</span>
              </div>
              <h3 className="flex items-start gap-2 text-2xl font-serif italic mb-2 uppercase">{idea.title}</h3>
              <p className="opacity-80 text-sm font-mono leading-relaxed mb-4">{idea.risk_analysis}</p>
            </div>
            
            <div className="md:col-span-6 bento-card bg-emerald-50 text-emerald-900 border-emerald-900 rounded-xl">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3">Keuntungan</h4>
              <ul className="space-y-2">
                {idea.pros?.map((p: string, j: number) => (
                  <li key={j} className="text-xs font-mono border-b border-emerald-200 border-dashed pb-2 flex gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-6 bento-card bg-rose-50 text-rose-900 border-rose-900 rounded-xl">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3">Tantangan</h4>
              <ul className="space-y-2">
                {idea.cons?.map((c: string, j: number) => (
                  <li key={j} className="text-xs font-mono border-b border-rose-200 border-dashed pb-2 flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-12 bento-card bg-[#222] text-[#fff] border-none rounded-xl">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 mb-4">Action Plan</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {idea.actionable_plan?.map((step: string, j: number) => (
                  <div key={j} className="bg-[#333] p-4 flex gap-3 rounded-lg border border-[#444]">
                    <span className="opacity-50 font-mono font-bold text-xs">{j + 1}.</span>
                    <p className="text-xs font-mono opacity-80 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (mode === 'market') {
    if (data.user_choice_pending) {
       return (
         <div className="bento-card border-none bg-indigo-50 text-indigo-950 rounded-xl flex items-center justify-center p-8">
            <p className="text-sm font-mono animate-pulse">Waiting for your preference...</p>
         </div>
       );
    }

    if (data.user_chooses_compare && data.comparison_breakdown?.length > 0) {
       return (
         <div className="bento-grid">
            <div className="md:col-span-12 bento-card bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] border-none rounded-xl">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-[var(--color-sys-bg)] pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <ListChecks className="w-6 h-6 opacity-80 shrink-0" />
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight font-serif italic uppercase break-words">Comparison Breakdown</h3>
                  </div>
               </div>
               <p className="opacity-80 text-sm font-mono leading-relaxed">Here is the detailed breakdown comparing each option with its pros, cons, risks, and potential rewards:</p>
            </div>

            {data.comparison_breakdown.map((item: any, i: number) => (
               <div key={i} className="md:col-span-12 bento-grid mb-6 border-2 border-[var(--color-sys-ink)] bg-white p-6 rounded-xl shadow-[4px_4px_0_var(--color-sys-ink)]">
                  <div className="md:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-dashed border-[var(--color-sys-line)] pb-4 mb-4 gap-4">
                     <h4 className="text-2xl font-bold font-serif italic uppercase">{item.asset_name}</h4>
                     <div className="flex gap-2 items-center flex-wrap">
                        {item.current_price_or_status && (
                           <span className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-mono rounded-full font-bold">
                              {item.current_price_or_status}
                           </span>
                        )}
                        <span className={`px-4 py-1.5 border text-xs font-mono font-bold uppercase tracking-widest rounded-full flex items-center justify-center ${
                           item.sentiment === 'BULLISH' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                           item.sentiment === 'BEARISH' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                           'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                           {item.sentiment || 'NEUTRAL'}
                        </span>
                     </div>
                  </div>
                  <div className="md:col-span-6 bento-card border border-emerald-200 bg-emerald-50/30 text-emerald-950 rounded-xl p-5 hover:shadow-md transition-shadow">
                     <h5 className="text-xs font-mono font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600"/> Pros & Potential Rewards</h5>
                     <div className="text-sm font-sans leading-relaxed opacity-90 markdown-body prose-sm prose-emerald max-w-none">
                        <Markdown>{item.why_it_is_good}</Markdown>
                     </div>
                  </div>
                  <div className="md:col-span-6 bento-card border border-rose-200 bg-rose-50/30 text-rose-950 rounded-xl p-5 hover:shadow-md transition-shadow">
                     <h5 className="text-xs font-mono font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-600"/> Cons & Risks</h5>
                     <div className="text-sm font-sans leading-relaxed opacity-90 markdown-body prose-sm prose-rose max-w-none">
                        <Markdown>{item.why_to_avoid}</Markdown>
                     </div>
                  </div>
               </div>
            ))}
         </div>
       );
    }

    return (
      <div className="bento-grid">
        {/* Ticker Tape & Advanced Live Chart */}
        {data.tradingview_symbol && (
           <div className="md:col-span-12 flex flex-col gap-4">
             <div className="bento-card p-0 rounded-xl overflow-hidden h-[40px] bg-[#131722] border-none">
                <TickerTape colorTheme="dark" displayMode="adaptive" symbols={[{ proName: data.tradingview_symbol, title: data.asset_name || data.tradingview_symbol }]} />
             </div>
             <div className="bento-card p-0 rounded-xl overflow-hidden h-[450px] bg-[#131722] border-none">
                <AdvancedRealTimeChart symbol={data.tradingview_symbol} theme="dark" autosize height="100%" width="100%" hide_side_toolbar={false} allow_symbol_change={false} save_image={false} />
             </div>
           </div>
        )}

        {/* Header & Current Status */}
        <div className="md:col-span-12 bento-card bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] border-none rounded-xl">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[var(--color-sys-bg)] pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <Globe className="w-6 h-6 opacity-80 shrink-0" />
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight font-serif italic uppercase break-words">{data.asset_name}</h3>
                <span className="px-3 py-1 border border-[var(--color-sys-bg)] font-mono text-sm whitespace-pre-wrap">{data.current_price}</span>
              </div>
              <div className="flex flex-col items-end gap-2 md:gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end justify-center">
                    <span className={`px-4 py-1.5 text-[10px] md:text-xs font-mono font-bold uppercase border rounded shadow-sm ${
                      (data.sentiment?.overall || data.market_sentiment)?.toLowerCase().includes('bullish') ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400' : 
                      (data.sentiment?.overall || data.market_sentiment)?.toLowerCase().includes('bearish') ? 'bg-rose-900/40 border-rose-500/50 text-rose-400' :
                      'bg-slate-800 border-slate-600 text-amber-400'
                    }`}>
                      {data.sentiment?.overall || data.market_sentiment || 'NEUTRAL'}
                    </span>
                    {data.confidence_level && <span className="text-[9px] font-mono uppercase tracking-widest opacity-50 mt-1">Confidence: {data.confidence_level}</span>}
                  </div>
                  
                  {(data.sentiment?.score || data.sentiment_score) && (
                    <div className="flex items-center gap-2">
                       <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16">
                         <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                           <circle
                             cx="28"
                             cy="28"
                             r="24"
                             stroke="currentColor"
                             strokeWidth="5"
                             fill="transparent"
                             className="text-slate-800"
                           />
                           <circle
                             cx="28"
                             cy="28"
                             r="24"
                             stroke="currentColor"
                             strokeWidth="5"
                             fill="transparent"
                             strokeDasharray={150.79}
                             strokeDashoffset={150.79 - (Math.max(0, Math.min(100, Number(data.sentiment?.score || data.sentiment_score))) / 100) * 150.79}
                             strokeLinecap="round"
                             className={`${
                               Number(data.sentiment?.score || data.sentiment_score) >= 56 ? 'text-emerald-400' : 
                               Number(data.sentiment?.score || data.sentiment_score) <= 45 ? 'text-rose-400' : 
                               'text-amber-400'
                             } transition-all duration-1000 ease-out`}
                           />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-sm md:text-base font-bold font-mono tracking-tight leading-none text-white">
                             {data.sentiment?.score || data.sentiment_score}
                           </span>
                         </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
           </div>

           {/* Granular Sentiment & Momentum */}
           {data.sentiment && (
              <div className="mb-6 p-5 border border-[var(--color-sys-bg)] rounded-xl bg-[var(--color-sys-ink)] shadow-inner" style={{ boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
                 <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2">
                   <Activity className="w-4 h-4" /> Sentiment Indicators
                 </h4>
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center border-b border-dashed border-[var(--color-sys-bg)] pb-2">
                          <span className="text-xs font-mono opacity-70 flex items-center gap-2"><TrendingUp className="w-3 h-3"/> Fear & Greed Index</span>
                          <span className="text-xs font-sans font-bold">{data.sentiment.fear_and_greed_index || '-'}</span>
                       </div>
                       <div className="flex justify-between items-center border-b border-dashed border-[var(--color-sys-bg)] pb-2">
                          <span className="text-xs font-mono opacity-70 flex items-center gap-2"><MessageSquare className="w-3 h-3"/> Social Volume</span>
                          <span className="text-xs font-sans font-bold opacity-90">{data.sentiment.social_volume || '-'}</span>
                       </div>
                       <div className="flex justify-between items-center border-b border-dashed border-[var(--color-sys-bg)] pb-2">
                          <span className="text-xs font-mono opacity-70 flex items-center gap-2"><Newspaper className="w-3 h-3"/> News Bias</span>
                          <span className="text-xs font-sans font-bold opacity-90">{data.sentiment.news_bias || '-'}</span>
                       </div>
                    </div>
                    <div>
                       <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-2 flex items-center gap-1"><Clock className="w-3 h-3"/> Historical Trend</span>
                       <div className="space-y-2 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-[var(--color-sys-bg)] before:opacity-30">
                          {data.sentiment.historical_trend?.map((ht: any, i: number) => (
                             <div key={i} className="flex items-center gap-3 relative z-10">
                                <div className={`w-5 h-5 rounded-full border-2 border-[var(--color-sys-ink)] flex items-center justify-center ${
                                   ht.sentiment?.toLowerCase().includes('bullish') ? 'bg-emerald-500' : ht.sentiment?.toLowerCase().includes('bearish') ? 'bg-rose-500' : 'bg-slate-500'
                                }`}>
                                   <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-sys-ink)]" />
                                </div>
                                <div className="flex-1 flex justify-between items-center bg-black/20 px-3 py-1.5 rounded border border-[var(--color-sys-bg)] border-opacity-30">
                                   <span className="text-[10px] font-mono uppercase tracking-widest">{ht.timeframe}</span>
                                   <div className="flex items-center gap-2">
                                      <span className="text-xs font-sans font-bold opacity-90">{ht.sentiment}</span>
                                      <span className="text-[10px] font-mono opacity-50">({ht.score})</span>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
                 
                 {data.sentiment.sentiment_calculation_breakdown && (
                   <div className="mt-6 pt-5 border-t border-dashed border-[var(--color-sys-bg)] border-opacity-30">
                     <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 mb-3 flex items-center gap-2">
                       <BarChart2 className="w-3 h-3" /> Sentiment Score Breakdown
                     </h4>
                     <div className="text-xs font-sans leading-relaxed opacity-90 markdown-body prose-sm prose-invert max-w-none">
                       <Markdown>{data.sentiment.sentiment_calculation_breakdown}</Markdown>
                     </div>
                   </div>
                 )}
              </div>
           )}

           <div className="grid md:grid-cols-2 gap-4">
              {/* Technical Analysis */}
              <div className="bg-[var(--color-sys-ink)] p-5 border border-[var(--color-sys-bg)] rounded-xl">
                 <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2">
                   <BarChart2 className="w-4 h-4" /> Technical Analysis
                 </h4>
                 <div className="space-y-4">
                    <div>
                       <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-1">Curent Trend</span>
                       <p className="text-sm font-sans">{data.technical_analysis?.trend || '-'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-1">Support</span>
                         <ul className="space-y-1">
                           {data.technical_analysis?.support_levels?.map((lvl: string, i: number) => <li key={i} className="text-xs font-mono">- {lvl}</li>)}
                         </ul>
                       </div>
                       <div>
                         <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-1">Resistance</span>
                         <ul className="space-y-1">
                           {data.technical_analysis?.resistance_levels?.map((lvl: string, i: number) => <li key={i} className="text-xs font-mono">- {lvl}</li>)}
                         </ul>
                       </div>
                    </div>
                    <div className="pt-2 border-t border-dashed border-[var(--color-sys-bg)]">
                       <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-2">Key Indicators</span>
                       <div className="flex flex-wrap gap-2">
                          {data.technical_analysis?.indicators?.map((ind: string, i: number) => (
                             <span key={i} className="px-2 py-1 border border-dashed border-[var(--color-sys-bg)] text-[10px] font-mono">{ind}</span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Fundamental Analysis */}
              <div className="bg-[var(--color-sys-ink)] p-5 border border-[var(--color-sys-bg)] rounded-xl">
                 <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2">
                   <Globe className="w-4 h-4" /> Fundamental & Macro
                 </h4>
                 <div className="space-y-4">
                    <div>
                       <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-2">Key Drivers</span>
                       <ul className="space-y-2">
                          {data.fundamental_analysis?.key_drivers?.map((driver: string, i: number) => (
                             <li key={i} className="text-sm font-sans flex gap-2 leading-relaxed"><div className="w-1.5 h-1.5 shrink-0 bg-[var(--color-sys-bg)] mt-1.5"/> <span>{driver}</span></li>
                          ))}
                       </ul>
                    </div>
                    <div className="pt-2 border-t border-dashed border-[var(--color-sys-bg)]">
                       <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-2">Macro Factors</span>
                       <ul className="space-y-2">
                          {data.fundamental_analysis?.macro_factors?.map((factor: string, i: number) => (
                             <li key={i} className="text-sm font-sans flex gap-2 leading-relaxed"><div className="w-1.5 h-1.5 shrink-0 bg-[var(--color-sys-bg)] mt-1.5 opacity-50"/> <span>{factor}</span></li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Real-Time News Feed */}
        {data.real_time_news && data.real_time_news.length > 0 && (
          <div className="md:col-span-12 bento-card bg-[var(--color-sys-bg)] text-[var(--color-sys-ink)] border border-[var(--color-sys-line)] rounded-xl p-5">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2">
              <Newspaper className="w-4 h-4" /> Real-Time News & Updates
            </h4>
            <div className="flex flex-col gap-3">
              {data.real_time_news.map((news: any, i: number) => (
                <a
                  key={i}
                  href={news.url || `https://www.google.com/search?tbm=nws&q=${encodeURIComponent(news.headline)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col md:flex-row justify-between items-start md:items-center gap-2 p-3 hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] border-b border-dashed border-[var(--color-sys-line)] last:border-0 transition-colors rounded"
                >
                  <div className="flex-1">
                    <h5 className="text-sm font-bold font-sans group-hover:underline underline-offset-2 break-words">{news.headline}</h5>
                    <div className="flex items-center gap-3 mt-1.5 opacity-70 flex-wrap">
                      <span className="text-[10px] font-mono uppercase tracking-widest bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">{news.source}</span>
                      <span className="text-[10px] font-mono"><Clock className="w-3 h-3 inline mr-1" />{news.time_published}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 md:mt-0 shrink-0">
                    <span className={`px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-widest rounded border ${
                      news.sentiment_impact === 'BULLISH' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      news.sentiment_impact === 'BEARISH' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                      'bg-slate-100 text-slate-800 border-slate-300'
                    }`}>
                      {news.sentiment_impact}
                    </span>
                    <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Strategy (From AI) */}
        {data.actionable_strategy && data.actionable_strategy.recommendation && (
        <div className="md:col-span-12 bento-card bg-[#ecfdf5] text-emerald-950 border-none rounded-xl mt-4">
           <div className="flex justify-between items-start mb-4 border-b border-emerald-100 pb-4">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                <Zap className="w-4 h-4" /> AI Strategic Recommendation
              </h4>
              <span className={`px-4 py-1.5 text-xs font-mono font-bold uppercase border ${
                 data.actionable_strategy?.recommendation?.toLowerCase().includes('buy') ? 'bg-emerald-900 text-#ecfdf5 border-emerald-900' :
                 data.actionable_strategy?.recommendation?.toLowerCase().includes('sell') ? 'bg-rose-900 text-rose-50 border-rose-900' :
                 'bg-amber-900 text-amber-50 border-amber-900'
              }`}>
                {data.actionable_strategy?.recommendation}
              </span>
           </div>
           
           <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-3 border border-emerald-200 rounded-lg">
                 <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1 opacity-60 block">Entry Points</span>
                 <ul className="space-y-1">
                   {data.actionable_strategy?.entry_points?.map((ep: string, i: number) => (
                      <li key={i} className="text-sm font-mono break-words leading-relaxed">- {ep}</li>
                   ))}
                 </ul>
              </div>
              <div className="bg-white p-3 border border-emerald-200 rounded-lg">
                 <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1 opacity-60 block">Take Profit</span>
                 <ul className="space-y-1">
                   {data.actionable_strategy?.take_profit?.map((tp: string, i: number) => (
                      <li key={i} className="text-sm font-mono text-emerald-700 break-words leading-relaxed">- {tp}</li>
                   ))}
                 </ul>
              </div>
              <div className="bg-white p-3 border border-rose-200 rounded-lg">
                 <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1 text-rose-500 block">Stop Loss</span>
                 <p className="text-sm font-mono text-rose-800 break-words leading-relaxed">{data.actionable_strategy?.stop_loss}</p>
              </div>
           </div>
        </div>
        )}

        {/* Risk Management */}
        <div className="md:col-span-12 bento-card bg-rose-50 text-rose-950 border-none rounded-xl">
           <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 opacity-60 flex items-center gap-2">
             <ShieldAlert className="w-4 h-4" /> Risk Management
           </h4>
           <ul className="space-y-3">
              {data.risk_management?.map((risk: string, i: number) => (
                 <li key={i} className="text-xs font-sans leading-relaxed border-b border-dashed border-rose-200 pb-2">
                   - {risk}
                 </li>
              ))}
           </ul>
        </div>

        {/* Forecast */}
        {data.market_forecast && (
          <div className="md:col-span-12 bento-card border-none bg-indigo-50 text-indigo-950 rounded-xl">
             <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 opacity-60">Market Forecast</h4>
             <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white border border-indigo-100 rounded-xl p-4">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-2 block opacity-60">Jangka Pendek</span>
                  <p className="text-sm leading-relaxed">{data.market_forecast.short_term}</p>
                </div>
                <div className="bg-white border border-indigo-100 rounded-xl p-4">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-2 block opacity-60">Jangka Menengah</span>
                  <p className="text-sm leading-relaxed">{data.market_forecast.medium_term}</p>
                </div>
                <div className="bg-white border border-indigo-100 rounded-xl p-4">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-2 block opacity-60">Jangka Panjang</span>
                  <p className="text-sm leading-relaxed">{data.market_forecast.long_term}</p>
                </div>
             </div>
          </div>
        )}



        {/* Suggested Price Alerts */}
        {data.suggested_price_alerts && data.suggested_price_alerts.length > 0 && (
          <div className="md:col-span-12 bento-card border border-amber-200 bg-amber-50 text-amber-950 rounded-xl p-5 mb-6">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2">
              <BellRing className="w-4 h-4" /> Suggested Price Alerts
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {data.suggested_price_alerts.map((alert: any, i: number) => {
                const alertKey = `${data.asset_name}-${alert.trigger_type}-${i}`;
                const isActive = activeAlerts[alertKey];

                return (
                  <div key={i} className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="mb-4">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-2 block opacity-50 text-amber-600">
                        {alert.trigger_type?.replace('_', ' ')}
                      </span>
                      <h5 className="font-bold text-amber-900 mb-2 font-mono whitespace-pre-wrap">{alert.condition || alert.value}</h5>
                      <p className="text-xs font-sans leading-relaxed opacity-80">{alert.reason}</p>
                    </div>
                    <button
                      onClick={() => handleSetAlert(alertKey)}
                      disabled={isActive}
                      className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-bold font-mono uppercase tracking-widest transition-all ${
                        isActive 
                          ? 'bg-amber-100 text-amber-600 border border-amber-200 opacity-70 cursor-not-allowed'
                          : 'bg-amber-900 text-amber-50 hover:bg-amber-800 shadow-[2px_2px_0_1px_rgba(120,53,15,1)] border border-amber-900 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none'
                      }`}
                    >
                      <Bell className={`w-4 h-4 ${isActive ? 'animate-none' : ''}`} />
                      {isActive ? 'Alert Active' : 'Set Alert'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* References */}
        <div className="md:col-span-12 bento-card bg-[var(--color-sys-bg)] text-[var(--color-sys-ink)] border-[var(--color-sys-line)] rounded-xl">
           <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 opacity-60">Opsi & Referensi</h4>
           <div className="flex flex-wrap gap-2">
              {data.options_and_references?.map((opt: any, i: number) => {
                 if (typeof opt === 'string') {
                    return <span key={i} className="px-3 py-1 text-[10px] font-mono border border-dashed border-[var(--color-sys-ink)] opacity-70 hover:opacity-100 transition-opacity uppercase">{opt}</span>;
                 }
                 return (
                    <a key={i} href={opt.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-[10px] font-mono border border-[var(--color-sys-ink)] bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] hover:bg-transparent hover:text-[var(--color-sys-ink)] hover:border-dashed transition-all uppercase flex items-center gap-1">
                      {opt.title} <Globe className="w-3 h-3" />
                    </a>
                 );
              })}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bento-card">
      <p className="leading-relaxed font-mono text-sm whitespace-pre-wrap">{data?.text || ''}</p>
    </div>
  );
}
