import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mode } from "../types";
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ListChecks,
  Zap,
  Globe,
  BarChart2,
  Activity,
  TrendingUp,
  Clock,
  MessageSquare,
  Newspaper,
  Bell,
  BellRing,
  ExternalLink,
  LineChart,
} from "lucide-react";
import { useState } from "react";
import {
  AdvancedRealTimeChart,
  TickerTape,
  TechnicalAnalysis,
  SymbolInfo,
  Timeline,
  CompanyProfile,
} from "react-ts-tradingview-widgets";

export function RichResponse({ data, mode, onHintClick }: { data: any; mode: Mode; onHintClick?: (text: string) => void }) {
  const [activeAlerts, setActiveAlerts] = useState<Record<string, boolean>>({});

  const handleSetAlert = (alertKey: string) => {
    setActiveAlerts((prev) => ({
      ...prev,
      [alertKey]: true,
    }));
    // Simulate notification
    setTimeout(() => {
      alert(
        `Simulation: Alert triggered for "${alertKey.split("-")[0]}"! Criteria met.`,
      );
    }, 5000); // Trigger after 5 seconds to demonstrate notification
  };

  if (
    data?.isGreetingOrGeneral ||
    data?.responseType === "GREETING" ||
    data?.responseType === "DETAILED_PLANNING" ||
    data?.responseType === "DETAILED_EXPLANATION"
  ) {
    return (
      <div className="bento-grid">
        <div className="md:col-span-12 bento-card bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] border-none p-6 md:p-8 rounded-xl relative overflow-hidden shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-sys-bg)] opacity-5 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-sys-bg)] opacity-5 rounded-full -translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10">
            {data?.responseType === "DETAILED_PLANNING" && (
              <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-[var(--color-sys-bg)]/20 pb-4">
                <ListChecks className="w-5 h-5 opacity-80" />
                <h3 className="text-xl md:text-2xl font-bold tracking-tight font-serif italic uppercase break-words">
                  Strategic Planning
                </h3>
              </div>
            )}
            {data?.responseType === "DETAILED_EXPLANATION" && (
              <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-[var(--color-sys-bg)]/20 pb-4">
                <Globe className="w-5 h-5 opacity-80" />
                <h3 className="text-xl md:text-2xl font-bold tracking-tight font-serif italic uppercase break-words">
                  Market Insight
                </h3>
              </div>
            )}
            {(data?.responseType === "GREETING" ||
              data?.isGreetingOrGeneral) && (
              <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-[var(--color-sys-bg)]/20 pb-4">
                <MessageSquare className="w-5 h-5 opacity-80" />
                <h3 className="text-xl md:text-2xl font-bold tracking-tight font-serif italic uppercase break-words">
                  Conversation
                </h3>
              </div>
            )}
            <div className="max-w-none">
              <Markdown remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-2xl md:text-3xl font-serif italic mb-6 mt-8 pb-3 border-b border-[var(--color-sys-bg)]/20 text-[var(--color-sys-bg)] leading-tight"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-xl md:text-2xl font-bold mb-5 mt-10 text-[var(--color-sys-bg)] flex items-center gap-3 before:content-[''] before:w-2 before:h-8 before:bg-emerald-500 before:rounded-full"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-sm font-mono tracking-widest uppercase mb-4 mt-8 text-amber-400 border-l-2 border-amber-400 pl-3"
                      {...props}
                    />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4
                      className="text-base font-bold mb-3 mt-6 text-emerald-300"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="my-6 space-y-3 bg-[var(--color-sys-bg)]/5 p-5 md:p-6 rounded-xl border border-[var(--color-sys-bg)]/10"
                      {...props}
                    />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className="list-decimal list-outside ml-4 md:ml-6 my-6 space-y-4 bg-[var(--color-sys-bg)]/5 p-5 md:p-6 rounded-xl border border-[var(--color-sys-bg)]/10 text-[var(--color-sys-bg)]"
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li
                      className="pl-1 md:pl-2 leading-relaxed marker:text-emerald-500"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="mb-5 leading-relaxed text-[var(--color-sys-bg)]/80 text-sm md:text-base font-sans"
                      {...props}
                    />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong
                      className="font-bold text-[var(--color-sys-bg)] bg-[var(--color-sys-bg)]/10 px-1.5 py-0.5 rounded-md mx-0.5"
                      {...props}
                    />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-emerald-500 pl-5 py-3 italic bg-[var(--color-sys-bg)]/5 rounded-r-xl my-8 text-[var(--color-sys-bg)]/90 font-serif text-lg"
                      {...props}
                    />
                  ),
                  code: ({
                    node,
                    inline,
                    className,
                    children,
                    ...props
                  }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline ? (
                      <div className="rounded-xl overflow-hidden my-6 border border-[var(--color-sys-bg)]/10 bg-[#000]">
                        {match && (
                          <div className="bg-[#111] px-4 py-2 text-xs font-mono text-slate-400 border-b border-white/5 uppercase tracking-widest">
                            {match[1]}
                          </div>
                        )}
                        <pre className="p-4 overflow-x-auto">
                          <code
                            className="font-mono text-sm text-emerald-300"
                            {...props}
                          >
                            {children}
                          </code>
                        </pre>
                      </div>
                    ) : (
                      <code
                        className="bg-[var(--color-sys-bg)]/10 px-1.5 py-0.5 rounded-md font-mono text-xs md:text-sm text-emerald-300 mx-0.5"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  a: ({ node, ...props }) => (
                    <a
                      className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-400 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr
                      className="my-10 border-[var(--color-sys-bg)]/10"
                      {...props}
                    />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-8 rounded-xl border border-[var(--color-sys-bg)]/10">
                      <table className="w-full text-sm text-left" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead
                      className="text-xs uppercase bg-[var(--color-sys-bg)]/10 text-[var(--color-sys-bg)]"
                      {...props}
                    />
                  ),
                  th: ({ node, ...props }) => (
                    <th
                      className="px-6 py-4 font-mono tracking-widest"
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td
                      className="px-6 py-4 border-t border-[var(--color-sys-bg)]/10 bg-[var(--color-sys-bg)]/5 text-[var(--color-sys-bg)]/80"
                      {...props}
                    />
                  ),
                }}
              >
                {data.textResponse ||
                  data.generalResponse ||
                  "Memproses respons..."}
              </Markdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "troubleshoot") {
    return (
      <div className="bento-grid">
        <div className="md:col-span-12 bento-card bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] border-none rounded-xl mb-2 p-6 md:p-8 relative overflow-hidden shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-sys-bg)] opacity-5 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-sys-bg)] opacity-5 rounded-full -translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[var(--color-sys-bg)]/30 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <ShieldAlert className="w-6 h-6 opacity-80 shrink-0" />
                <h3 className="text-xl md:text-2xl font-bold tracking-tight font-serif italic uppercase break-words">
                  Diagnosis & Solusi
                </h3>
              </div>
              {data.confidence && (
                <span className="px-4 py-1.5 border text-xs font-mono font-bold uppercase tracking-widest rounded-full flex items-center justify-center bg-[var(--color-sys-bg)] text-[var(--color-sys-ink)]">
                  Confidence: {data.confidence}
                </span>
              )}
            </div>
            <p className="opacity-90 text-sm md:text-base font-sans leading-relaxed">
              {data.summary}
            </p>
          </div>
        </div>

        {data.questions?.length > 0 && (
          <div className="md:col-span-12 bento-card border border-amber-200 bg-amber-50/50 text-amber-950 rounded-xl p-5 mb-2">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-4 h-4" /> Butuh Klarifikasi Tambahan
            </h4>
            <ul className="space-y-3">
              {data.questions.map((q: string, i: number) => (
                <li
                  key={i}
                  className="text-sm font-sans opacity-90 border-b border-dashed border-amber-200 pb-2 flex gap-2"
                >
                  <span className="text-amber-500 mt-0.5">•</span> {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.steps?.length > 0 && (
          <div className="md:col-span-7 bento-card border-2 border-[var(--color-sys-ink)] bg-white rounded-xl shadow-[4px_4px_0_var(--color-sys-ink)] p-6">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest opacity-60 mb-5 flex items-center gap-2">
              <ListChecks className="w-4 h-4" /> Recommended Steps
            </h4>
            <div className="space-y-4">
              {data.steps.map((step: string, i: number) => (
                <div key={i} className="flex gap-4 items-start group">
                  <span className="w-6 h-6 rounded bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm font-sans leading-relaxed flex-1 border-b border-dashed border-[var(--color-sys-line)] pb-3">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.alternatives?.length > 0 && (
          <div className="md:col-span-5 bento-card bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-xl p-6">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-700 mb-5 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Alternatif
            </h4>
            <ul className="space-y-4">
              {data.alternatives.map((alt: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 shrink-0 bg-indigo-400 rounded-full mt-2" />
                  <span className="text-sm font-sans leading-relaxed border-b border-indigo-100 border-dashed pb-3 block w-full">
                    {alt}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.inline_command_question && (
          <div className="md:col-span-12 mt-4 p-5 border-l-4 border-amber-500 bg-amber-50/50 rounded-r-xl shadow-sm">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-2">
               Tindakan Selanjutnya / Penutup
            </h4>
            <div className="text-[var(--color-sys-ink)] font-semibold text-lg leading-relaxed font-serif italic">
              {data.inline_command_question}
            </div>
          </div>
        )}

        {data.hints_for_user && data.hints_for_user.length > 0 && (
          <div className="md:col-span-12 mt-2 flex flex-col gap-2">
            <p className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest px-1 mb-1">💡 Keterangan Petunjuk (Hints):</p>
            <p className="text-[11px] text-slate-500 px-1 mb-3">Pilih salah satu jawaban di bawah ini (klik untuk kirim), atau ketik jawaban Anda sendiri di kolom chat.</p>
            <div className="flex flex-wrap gap-2">
              {data.hints_for_user.map((hint: string, index: number) => (
                <div 
                  key={index} 
                  onClick={() => onHintClick && onHintClick(hint)}
                  className="px-3 py-2 bg-slate-100 hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] border border-slate-200 hover:border-transparent rounded-lg text-sm font-sans text-slate-700 cursor-pointer transition-colors shadow-sm active:scale-95"
                >
                  "{hint}"
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === "brainstorm") {
    if (!data.textResponse && (!data.ideas || data.ideas.length === 0)) {
      const fallbackText = data.text || data.message || data.response || data.textResponse || (typeof data === 'object' ? JSON.stringify(data, null, 2) : "Saya butuh informasi lebih lanjut untuk menyusun strategi yang tepat.");
      return (
        <div className="bento-card">
          <div className="markdown-body text-sm md:text-base leading-relaxed  text-[var(--color-sys-ink)]">
            {typeof fallbackText === 'string' && fallbackText.startsWith('{') ? (
               <pre className="text-xs bg-slate-100 p-2 rounded">{fallbackText}</pre>
            ) : (
               <Markdown remarkPlugins={[remarkGfm]} components={{ table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="w-full text-sm text-left" {...props} /></div>, th: ({node, ...props}) => <th className="bg-slate-100 p-2 border" {...props} />, td: ({node, ...props}) => <td className="p-2 border" {...props} /> }}>{fallbackText}</Markdown>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {data.textResponse && (
          <div className="bento-card">
            <div className="markdown-body text-sm md:text-base leading-relaxed ">
              <Markdown remarkPlugins={[remarkGfm]} components={{ table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="w-full text-sm text-left" {...props} /></div>, th: ({node, ...props}) => <th className="bg-slate-100 p-2 border" {...props} />, td: ({node, ...props}) => <td className="p-2 border" {...props} /> }}>{data.textResponse}</Markdown>
            </div>
          </div>
        )}
        
        {data.pivot_matrix && data.pivot_matrix.length > 0 && (
          <div className="bento-card overflow-x-auto">
            <h4 className="text-xl font-serif italic mb-4 text-[var(--color-sys-ink)]">
              Fase 3: The Pivot Matrix
            </h4>
            <table className="w-full text-sm text-left border-collapse border border-[var(--color-sys-line)]">
              <thead className="bg-slate-100 uppercase text-xs font-mono tracking-widest text-[var(--color-sys-ink)]">
                <tr>
                  <th className="p-3 border border-[var(--color-sys-line)]">Paradigma Alternatif</th>
                  <th className="p-3 border border-[var(--color-sys-line)]">Titik Buta Dipecahkan</th>
                  <th className="p-3 border border-[var(--color-sys-line)]">Trade-off</th>
                  <th className="p-3 border border-[var(--color-sys-line)] w-32">Kompleksitas</th>
                </tr>
              </thead>
              <tbody>
                {data.pivot_matrix.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 border border-[var(--color-sys-line)] font-bold text-[var(--color-sys-ink)]">{row.paradigma}</td>
                    <td className="p-3 border border-[var(--color-sys-line)]">{row.blind_spot}</td>
                    <td className="p-3 border border-[var(--color-sys-line)]">{row.tradeoff}</td>
                    <td className="p-3 border border-[var(--color-sys-line)]">
                      <span className={`px-2 py-1 rounded-sm text-[10px] font-mono tracking-wider uppercase font-bold ${
                        String(row.complexity).toLowerCase().includes('tinggi') 
                          ? 'bg-rose-100 text-rose-700' 
                          : String(row.complexity).toLowerCase().includes('rendah') 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {row.complexity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data.ideas && data.ideas.length > 0 && (
          <div className="bento-grid space-y-4">
            <div className="md:col-span-12">
              <h4 className="text-xl font-serif italic mb-2 mt-4 text-[var(--color-sys-ink)]">
                Fase Akhir: Architect's Verdict & Opsi Eksekusi
              </h4>
            </div>
            {data.ideas.map((idea: any, i: number) => (
              <div
                key={i}
                className="md:col-span-12 bento-grid mb-4 border-2 border-[var(--color-sys-ink)] bg-white p-6 rounded-xl shadow-[4px_4px_0_var(--color-sys-ink)]"
              >
                <div className="md:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-dashed border-[var(--color-sys-line)] pb-4 mb-4 gap-4">
                  <h4 className="text-2xl font-bold font-serif italic uppercase">
                    {idea.title}
                  </h4>
                  <div className="flex gap-2 items-center flex-wrap">
                    {idea.effort_estimation && (
                      <span
                        className={`px-4 py-1.5 border text-xs font-mono font-bold uppercase tracking-widest rounded-full flex items-center justify-center ${
                          String(idea.effort_estimation)
                            .toLowerCase()
                            .includes("rendah")
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : String(idea.effort_estimation)
                                  .toLowerCase()
                                  .includes("tinggi")
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-slate-100 text-slate-800 border-slate-300"
                        }`}
                      >
                        Effort: {idea.effort_estimation}
                      </span>
                    )}
                  </div>
                </div>

                {idea.risk_analysis && (
                  <div className="md:col-span-12 mb-2 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-3 h-3" /> Rekomendasi/Analisa Risiko
                    </h4>
                    <p className="text-sm font-sans leading-relaxed opacity-90">
                      {idea.risk_analysis}
                    </p>
                  </div>
                )}

                <div className="md:col-span-6 bento-card border border-emerald-200 bg-emerald-50/30 text-emerald-950 rounded-xl p-5">
                  <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Keuntungan
                    (Pros)
                  </h5>
                  <ul className="space-y-3">
                    {idea.pros?.map((p: string, j: number) => (
                      <li
                        key={j}
                        className="text-sm font-sans leading-relaxed opacity-90 flex gap-2"
                      >
                        <span className="text-emerald-500 mt-0.5">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-6 bento-card border border-rose-200 bg-rose-50/30 text-rose-950 rounded-xl p-5">
                  <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" /> Tantangan
                    (Cons)
                  </h5>
                  <ul className="space-y-3">
                    {idea.cons?.map((c: string, j: number) => (
                      <li
                        key={j}
                        className="text-sm font-sans leading-relaxed opacity-90 flex gap-2"
                      >
                        <span className="text-rose-500 mt-0.5">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-12 bento-card bg-[#222] text-[#fff] border-none rounded-xl p-6 mt-4">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2">
                    <ListChecks className="w-4 h-4" /> Actionable Plan
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {idea.actionable_plan?.map((step: string, j: number) => (
                      <div
                        key={j}
                        className="bg-[#333] p-4 flex gap-3 rounded-lg border border-[#444] hover:border-emerald-500/50 transition-colors"
                      >
                        <span className="opacity-50 font-mono font-bold text-[10px] bg-black/40 px-2 py-1 rounded h-fit">
                          {j + 1}
                        </span>
                        <p className="text-xs font-mono opacity-90 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {data.inline_command_question && (
          <div className="mt-6 p-5 border-l-4 border-amber-500 bg-amber-50/50 rounded-r-xl shadow-sm">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600 mb-2 flex items-center gap-2">
               Pertanyaan Lanjutan
            </h4>
            <div className="text-[var(--color-sys-ink)] font-semibold text-lg leading-relaxed font-serif italic">
              {data.inline_command_question}
            </div>
          </div>
        )}

        {data.hints_for_user && data.hints_for_user.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest px-1 mb-1">💡 Keterangan Petunjuk (Hints):</p>
            <p className="text-[11px] text-slate-500 px-1 mb-3">Pilih salah satu jawaban di bawah ini (klik untuk kirim), atau ketik jawaban Anda sendiri di kolom chat.</p>
            <div className="flex flex-wrap gap-2">
              {data.hints_for_user.map((hint: string, index: number) => (
                <div 
                  key={index} 
                  onClick={() => onHintClick && onHintClick(hint)}
                  className="px-3 py-2 bg-slate-100 hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] border border-slate-200 hover:border-transparent rounded-lg text-sm font-sans text-slate-700 cursor-pointer transition-colors shadow-sm active:scale-95"
                >
                  "{hint}"
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === "market") {
    if (data.user_choice_pending) {
      return (
        <div className="bento-card border-none bg-indigo-50 text-indigo-950 rounded-xl flex items-center justify-center p-8">
          <p className="text-sm font-mono animate-pulse">
            Waiting for your preference...
          </p>
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
                <h3 className="text-xl md:text-2xl font-bold tracking-tight font-serif italic uppercase break-words">
                  Comparison Breakdown
                </h3>
              </div>
            </div>
            <p className="opacity-80 text-sm font-mono leading-relaxed">
              Here is the detailed breakdown comparing each option with its
              pros, cons, risks, and potential rewards:
            </p>
          </div>

          {data.comparison_breakdown.map((item: any, i: number) => (
            <div
              key={i}
              className="md:col-span-12 bento-grid mb-6 border-2 border-[var(--color-sys-ink)] bg-white p-6 rounded-xl shadow-[4px_4px_0_var(--color-sys-ink)]"
            >
              <div className="md:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-dashed border-[var(--color-sys-line)] pb-4 mb-4 gap-4">
                <h4 className="text-2xl font-bold font-serif italic uppercase">
                  {item.asset_name}
                </h4>
                <div className="flex gap-2 items-center flex-wrap">
                  {item.current_price_or_status && (
                    <span className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-mono rounded-full font-bold">
                      {item.current_price_or_status}
                    </span>
                  )}
                  <span
                    className={`px-4 py-1.5 border text-xs font-mono font-bold uppercase tracking-widest rounded-full flex items-center justify-center ${
                      item.sentiment === "BULLISH"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : item.sentiment === "BEARISH"
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : "bg-slate-100 text-slate-800 border-slate-300"
                    }`}
                  >
                    {item.sentiment || "NEUTRAL"}
                  </span>
                </div>
              </div>
              <div className="md:col-span-6 bento-card border border-emerald-200 bg-emerald-50/30 text-emerald-950 rounded-xl p-5 hover:shadow-md transition-shadow">
                <h5 className="text-xs font-mono font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pros &
                  Potential Rewards
                </h5>
                <div className="text-sm font-sans leading-relaxed opacity-90 markdown-body prose-sm prose-emerald max-w-none">
                  <Markdown remarkPlugins={[remarkGfm]}>{item.why_it_is_good}</Markdown>
                </div>
              </div>
              <div className="md:col-span-6 bento-card border border-rose-200 bg-rose-50/30 text-rose-950 rounded-xl p-5 hover:shadow-md transition-shadow">
                <h5 className="text-xs font-mono font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> Cons & Risks
                </h5>
                <div className="text-sm font-sans leading-relaxed opacity-90 markdown-body prose-sm prose-rose max-w-none">
                  <Markdown remarkPlugins={[remarkGfm]}>{item.why_to_avoid}</Markdown>
                </div>
              </div>

              {/* Local & Global Macro Analysis for Item */}
              {(item.local_market_analysis || item.global_market_analysis) && (
                <div className="md:col-span-12 grid md:grid-cols-2 gap-4 mt-2">
                  {item.local_market_analysis && (
                    <div className="bento-card border border-amber-200 bg-amber-50/50 text-amber-950 rounded-xl p-5">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-amber-700">
                        <Globe className="w-4 h-4" /> Local Market Analysis
                      </h4>
                      <p className="text-sm font-sans leading-relaxed opacity-90 break-words">
                        {item.local_market_analysis}
                      </p>
                    </div>
                  )}
                  {item.global_market_analysis && (
                    <div className="bento-card border border-indigo-200 bg-indigo-50/50 text-indigo-950 rounded-xl p-5">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-indigo-700">
                        <Globe className="w-4 h-4" /> Global Market Analysis
                      </h4>
                      <p className="text-sm font-sans leading-relaxed opacity-90 break-words">
                        {item.global_market_analysis}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Forecast for Item */}
              {item.market_forecast && (
                <div className="md:col-span-12 bento-card border-none bg-indigo-50 text-indigo-950 rounded-xl p-5 mt-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest mb-4 flex items-center gap-2 opacity-60">
                    <LineChart className="w-4 h-4" /> Forecast
                  </h4>
                  <ul className="text-sm font-sans leading-relaxed space-y-3">
                    {item.market_forecast.short_term && (
                      <li className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3">
                        <span className="font-mono font-bold uppercase text-[10px] opacity-70 w-24 pt-1 shrink-0">
                          Short Term
                        </span>
                        <span>{item.market_forecast.short_term}</span>
                      </li>
                    )}
                    {item.market_forecast.medium_term && (
                      <li className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3">
                        <span className="font-mono font-bold uppercase text-[10px] opacity-70 w-24 pt-1 shrink-0">
                          Medium Term
                        </span>
                        <span>{item.market_forecast.medium_term}</span>
                      </li>
                    )}
                    {item.market_forecast.long_term && (
                      <li className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3">
                        <span className="font-mono font-bold uppercase text-[10px] opacity-70 w-24 pt-1 shrink-0">
                          Long Term
                        </span>
                        <span>{item.market_forecast.long_term}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
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
              <TickerTape
                colorTheme="dark"
                displayMode="adaptive"
                symbols={[
                  {
                    proName: data.tradingview_symbol,
                    title: data.asset_name || data.tradingview_symbol,
                  },
                ]}
              />
            </div>
            <div className="bento-card p-0 rounded-xl overflow-hidden h-[450px] bg-[#131722] border-none">
              <AdvancedRealTimeChart
                symbol={data.tradingview_symbol}
                theme="dark"
                autosize
                height="100%"
                width="100%"
                hide_side_toolbar={false}
                allow_symbol_change={false}
                save_image={false}
              />
            </div>
          </div>
        )}

        {/* Header & Current Status */}
        <div className="md:col-span-12 bento-card bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] border-none rounded-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[var(--color-sys-bg)] pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <Globe className="w-6 h-6 opacity-80 shrink-0" />
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight font-serif italic uppercase break-words">
                {data.asset_name}
              </h3>
              <span className="px-3 py-1 border border-[var(--color-sys-bg)] font-mono text-sm ">
                {data.current_price}
              </span>
            </div>
            <div className="flex flex-col items-end gap-2 md:gap-3">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end justify-center">
                  <span
                    className={`px-4 py-1.5 text-[10px] md:text-xs font-mono font-bold uppercase border rounded shadow-sm ${
                      (data.sentiment?.overall || data.market_sentiment)
                        ?.toLowerCase()
                        .includes("bullish")
                        ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-400"
                        : (data.sentiment?.overall || data.market_sentiment)
                              ?.toLowerCase()
                              .includes("bearish")
                          ? "bg-rose-900/40 border-rose-500/50 text-rose-400"
                          : "bg-slate-800 border-slate-600 text-amber-400"
                    }`}
                  >
                    {data.sentiment?.overall ||
                      data.market_sentiment ||
                      "NEUTRAL"}
                  </span>
                  {data.confidence_level && (
                    <span className="text-[9px] font-mono uppercase tracking-widest opacity-50 mt-1">
                      Confidence: {data.confidence_level}
                    </span>
                  )}
                </div>

                {(data.sentiment?.score || data.sentiment_score) && (
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 56 56"
                      >
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
                          strokeDashoffset={
                            150.79 -
                            (Math.max(
                              0,
                              Math.min(
                                100,
                                Number(
                                  data.sentiment?.score || data.sentiment_score,
                                ),
                              ),
                            ) /
                              100) *
                              150.79
                          }
                          strokeLinecap="round"
                          className={`${
                            Number(
                              data.sentiment?.score || data.sentiment_score,
                            ) >= 56
                              ? "text-emerald-400"
                              : Number(
                                    data.sentiment?.score ||
                                      data.sentiment_score,
                                  ) <= 45
                                ? "text-rose-400"
                                : "text-amber-400"
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
            <div
              className="mb-6 p-5 border border-[var(--color-sys-bg)] rounded-xl bg-[var(--color-sys-ink)] shadow-inner"
              style={{ boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)" }}
            >
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Sentiment Indicators
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-dashed border-[var(--color-sys-bg)] pb-2">
                    <span className="text-xs font-mono opacity-70 flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" /> Fear & Greed Index
                    </span>
                    <span className="text-xs font-sans font-bold">
                      {data.sentiment.fear_and_greed_index || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-dashed border-[var(--color-sys-bg)] pb-2">
                    <span className="text-xs font-mono opacity-70 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" /> Social Volume
                    </span>
                    <span className="text-xs font-sans font-bold opacity-90">
                      {data.sentiment.social_volume || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-dashed border-[var(--color-sys-bg)] pb-2">
                    <span className="text-xs font-mono opacity-70 flex items-center gap-2">
                      <Newspaper className="w-3 h-3" /> News Bias
                    </span>
                    <span className="text-xs font-sans font-bold opacity-90">
                      {data.sentiment.news_bias || "-"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Historical Trend
                  </span>
                  <div className="space-y-2 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-[var(--color-sys-bg)] before:opacity-30">
                    {data.sentiment.historical_trend?.map(
                      (ht: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 relative z-10"
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 border-[var(--color-sys-ink)] flex items-center justify-center ${
                              ht.sentiment?.toLowerCase().includes("bullish")
                                ? "bg-emerald-500"
                                : ht.sentiment
                                      ?.toLowerCase()
                                      .includes("bearish")
                                  ? "bg-rose-500"
                                  : "bg-slate-500"
                            }`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-sys-ink)]" />
                          </div>
                          <div className="flex-1 flex justify-between items-center bg-black/20 px-3 py-1.5 rounded border border-[var(--color-sys-bg)] border-opacity-30">
                            <span className="text-[10px] font-mono uppercase tracking-widest">
                              {ht.timeframe}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-sans font-bold opacity-90">
                                {ht.sentiment}
                              </span>
                              <span className="text-[10px] font-mono opacity-50">
                                ({ht.score})
                              </span>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {data.sentiment.sentiment_calculation_breakdown && (
                <div className="mt-6 pt-5 border-t border-dashed border-[var(--color-sys-bg)] border-opacity-30">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 mb-3 flex items-center gap-2">
                    <BarChart2 className="w-3 h-3" /> Sentiment Score Breakdown
                  </h4>
                  <div className="text-xs font-sans leading-relaxed opacity-90 markdown-body prose-sm prose-invert max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {data.sentiment.sentiment_calculation_breakdown}
                    </Markdown>
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
                  <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-1">
                    Curent Trend
                  </span>
                  <p className="text-sm font-sans">
                    {data.technical_analysis?.trend || "-"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-1">
                      Support
                    </span>
                    <ul className="space-y-1">
                      {data.technical_analysis?.support_levels?.map(
                        (lvl: string, i: number) => (
                          <li key={i} className="text-xs font-mono">
                            - {lvl}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-1">
                      Resistance
                    </span>
                    <ul className="space-y-1">
                      {data.technical_analysis?.resistance_levels?.map(
                        (lvl: string, i: number) => (
                          <li key={i} className="text-xs font-mono">
                            - {lvl}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
                <div className="pt-2 border-t border-dashed border-[var(--color-sys-bg)]">
                  <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-2">
                    Key Indicators
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {data.technical_analysis?.indicators?.map(
                      (ind: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 border border-dashed border-[var(--color-sys-bg)] text-[10px] font-mono"
                        >
                          {ind}
                        </span>
                      ),
                    )}
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
                  <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-2">
                    Key Drivers
                  </span>
                  <ul className="space-y-2">
                    {data.fundamental_analysis?.key_drivers?.map(
                      (driver: string, i: number) => (
                        <li
                          key={i}
                          className="text-sm font-sans flex gap-2 leading-relaxed"
                        >
                          <div className="w-1.5 h-1.5 shrink-0 bg-[var(--color-sys-bg)] mt-1.5" />{" "}
                          <span>{driver}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <div className="pt-2 border-t border-dashed border-[var(--color-sys-bg)]">
                  <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block mb-2">
                    Macro Factors
                  </span>
                  <ul className="space-y-2">
                    {data.fundamental_analysis?.macro_factors?.map(
                      (factor: string, i: number) => (
                        <li
                          key={i}
                          className="text-sm font-sans flex gap-2 leading-relaxed"
                        >
                          <div className="w-1.5 h-1.5 shrink-0 bg-[var(--color-sys-bg)] mt-1.5 opacity-50" />{" "}
                          <span>{factor}</span>
                        </li>
                      ),
                    )}
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
                  href={
                    news.url ||
                    `https://www.google.com/search?tbm=nws&q=${encodeURIComponent(news.headline)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col md:flex-row justify-between items-start md:items-center gap-2 p-3 hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] border-b border-dashed border-[var(--color-sys-line)] last:border-0 transition-colors rounded"
                >
                  <div className="flex-1">
                    <h5 className="text-sm font-bold font-sans group-hover:underline underline-offset-2 break-words">
                      {news.headline}
                    </h5>
                    <div className="flex items-center gap-3 mt-1.5 opacity-70 flex-wrap">
                      <span className="text-[10px] font-mono uppercase tracking-widest bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">
                        {news.source}
                      </span>
                      <span className="text-[10px] font-mono">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {news.time_published}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 md:mt-0 shrink-0">
                    <span
                      className={`px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-widest rounded border ${
                        news.sentiment_impact === "BULLISH"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : news.sentiment_impact === "BEARISH"
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : "bg-slate-100 text-slate-800 border-slate-300"
                      }`}
                    >
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
        {data.actionable_strategy &&
          data.actionable_strategy.recommendation && (
            <div className="md:col-span-12 bento-card bg-[#ecfdf5] text-emerald-950 border-none rounded-xl mt-4">
              <div className="flex justify-between items-start mb-4 border-b border-emerald-100 pb-4">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> AI Strategic Recommendation
                </h4>
                <span
                  className={`px-4 py-1.5 text-xs font-mono font-bold uppercase border ${
                    data.actionable_strategy?.recommendation
                      ?.toLowerCase()
                      .includes("buy")
                      ? "bg-emerald-900 text-#ecfdf5 border-emerald-900"
                      : data.actionable_strategy?.recommendation
                            ?.toLowerCase()
                            .includes("sell")
                        ? "bg-rose-900 text-rose-50 border-rose-900"
                        : "bg-amber-900 text-amber-50 border-amber-900"
                  }`}
                >
                  {data.actionable_strategy?.recommendation}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-3 border border-emerald-200 rounded-lg">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1 opacity-60 block">
                    Entry Points
                  </span>
                  <ul className="space-y-1">
                    {data.actionable_strategy?.entry_points?.map(
                      (ep: string, i: number) => (
                        <li
                          key={i}
                          className="text-sm font-mono break-words leading-relaxed"
                        >
                          - {ep}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <div className="bg-white p-3 border border-emerald-200 rounded-lg">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1 opacity-60 block">
                    Take Profit
                  </span>
                  <ul className="space-y-1">
                    {data.actionable_strategy?.take_profit?.map(
                      (tp: string, i: number) => (
                        <li
                          key={i}
                          className="text-sm font-mono text-emerald-700 break-words leading-relaxed"
                        >
                          - {tp}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <div className="bg-white p-3 border border-rose-200 rounded-lg">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1 text-rose-500 block">
                    Stop Loss
                  </span>
                  <p className="text-sm font-mono text-rose-800 break-words leading-relaxed">
                    {data.actionable_strategy?.stop_loss}
                  </p>
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
              <li
                key={i}
                className="text-xs font-sans leading-relaxed border-b border-dashed border-rose-200 pb-2"
              >
                - {risk}
              </li>
            ))}
          </ul>
        </div>

        {/* Local & Global Macro Analysis */}
        {(data.local_market_analysis || data.global_market_analysis) && (
          <div className="md:col-span-12 grid md:grid-cols-2 gap-4 mt-2 mb-2">
            {data.local_market_analysis && (
              <div className="bento-card border border-amber-200 bg-amber-50/50 text-amber-950 rounded-xl p-5">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-amber-700">
                  <Globe className="w-4 h-4" /> Local Market Analysis
                </h4>
                <p className="text-sm font-sans leading-relaxed opacity-90 break-words">
                  {data.local_market_analysis}
                </p>
              </div>
            )}
            {data.global_market_analysis && (
              <div className="bento-card border border-indigo-200 bg-indigo-50/50 text-indigo-950 rounded-xl p-5">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-indigo-700">
                  <Globe className="w-4 h-4" /> Global Market Analysis
                </h4>
                <p className="text-sm font-sans leading-relaxed opacity-90 break-words">
                  {data.global_market_analysis}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Forecast */}
        {data.market_forecast && (
          <div className="md:col-span-12 bento-card border-none bg-indigo-50 text-indigo-950 rounded-xl">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 opacity-60">
              Market Forecast
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white border border-indigo-100 rounded-xl p-4">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-2 block opacity-60">
                  Jangka Pendek
                </span>
                <p className="text-sm leading-relaxed">
                  {data.market_forecast.short_term}
                </p>
              </div>
              <div className="bg-white border border-indigo-100 rounded-xl p-4">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-2 block opacity-60">
                  Jangka Menengah
                </span>
                <p className="text-sm leading-relaxed">
                  {data.market_forecast.medium_term}
                </p>
              </div>
              <div className="bg-white border border-indigo-100 rounded-xl p-4">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-2 block opacity-60">
                  Jangka Panjang
                </span>
                <p className="text-sm leading-relaxed">
                  {data.market_forecast.long_term}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Price Alerts */}
        {data.suggested_price_alerts &&
          data.suggested_price_alerts.length > 0 && (
            <div className="md:col-span-12 bento-card border border-amber-200 bg-amber-50 text-amber-950 rounded-xl p-5 mb-6">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2">
                <BellRing className="w-4 h-4" /> Suggested Price Alerts
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {data.suggested_price_alerts.map((alert: any, i: number) => {
                  const alertKey = `${data.asset_name}-${alert.trigger_type}-${i}`;
                  const isActive = activeAlerts[alertKey];

                  return (
                    <div
                      key={i}
                      className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="mb-4">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest mb-2 block opacity-50 text-amber-600">
                          {alert.trigger_type?.replace("_", " ")}
                        </span>
                        <h5 className="font-bold text-amber-900 mb-2 font-mono ">
                          {alert.condition || alert.value}
                        </h5>
                        <p className="text-xs font-sans leading-relaxed opacity-80">
                          {alert.reason}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSetAlert(alertKey)}
                        disabled={isActive}
                        className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-bold font-mono uppercase tracking-widest transition-all ${
                          isActive
                            ? "bg-amber-100 text-amber-600 border border-amber-200 opacity-70 cursor-not-allowed"
                            : "bg-amber-900 text-amber-50 hover:bg-amber-800 shadow-[2px_2px_0_1px_rgba(120,53,15,1)] border border-amber-900 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                        }`}
                      >
                        <Bell
                          className={`w-4 h-4 ${isActive ? "animate-none" : ""}`}
                        />
                        {isActive ? "Alert Active" : "Set Alert"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* References */}
        <div className="md:col-span-12 bento-card bg-[var(--color-sys-bg)] text-[var(--color-sys-ink)] border-[var(--color-sys-line)] rounded-xl">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 opacity-60">
            Opsi & Referensi
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.options_and_references?.map((opt: any, i: number) => {
              if (typeof opt === "string") {
                return (
                  <span
                    key={i}
                    className="px-3 py-1 text-[10px] font-mono border border-dashed border-[var(--color-sys-ink)] opacity-70 hover:opacity-100 transition-opacity uppercase"
                  >
                    {opt}
                  </span>
                );
              }
              return (
                <a
                  key={i}
                  href={opt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-[10px] font-mono border border-[var(--color-sys-ink)] bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] hover:bg-transparent hover:text-[var(--color-sys-ink)] hover:border-dashed transition-all uppercase flex items-center gap-1"
                >
                  {opt.title} <Globe className="w-3 h-3" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "chat") {
    const content = typeof data === "string" ? data : data?.text || "";
    const handleCopy = () => {
      navigator.clipboard.writeText(content);
      setActiveAlerts((prev) => ({ ...prev, copied: true }));
      setTimeout(() => {
        setActiveAlerts((prev) => ({ ...prev, copied: false }));
      }, 2000);
    };

    return (
      <div className="bento-grid">
        <div className="md:col-span-12 bento-card bg-[#1a1a1a] border border-[#333] rounded-xl p-0 relative overflow-hidden flex flex-col group">
          <div className="bg-[#2a2a2a] border-b border-[#444] p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                Enhanced Prompt
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#444] hover:bg-[#555] active:bg-[#666] border border-[#555] rounded text-xs font-mono text-white transition-colors cursor-pointer"
            >
              {activeAlerts["copied"] ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Full Output
                </>
              )}
            </button>
          </div>
          <div className="p-5 md:p-6 overflow-x-auto text-[var(--color-sys-bg)]">
            <div className="markdown-body prose-sm prose-invert max-w-none">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => (
                    <p
                      className="mb-4 text-sm md:text-base leading-relaxed text-slate-300"
                      {...props}
                    />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-white" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="list-disc list-inside mb-4 space-y-2 text-slate-300"
                      {...props}
                    />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className="list-decimal list-inside mb-4 space-y-2 text-slate-300"
                      {...props}
                    />
                  ),
                  code: ({
                    node,
                    inline,
                    className,
                    children,
                    ...props
                  }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline ? (
                      <div className="rounded-xl overflow-hidden my-4 border border-[#444] bg-[#0a0a0a]">
                        <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#333] flex justify-between items-center">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                            {match ? match[1] : "text"}
                          </span>
                        </div>
                        <pre className="p-4 overflow-x-auto whitespace-pre-wrap break-words">
                          <code
                            className="font-mono text-sm text-emerald-300"
                            {...props}
                          >
                            {children}
                          </code>
                        </pre>
                      </div>
                    ) : (
                      <code
                        className="bg-[#2a2a2a] px-1 py-0.5 rounded font-mono text-xs text-emerald-300"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </Markdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bento-card">
      <p className="leading-relaxed font-mono text-sm ">
        {data?.text || ""}
      </p>
    </div>
  );
}
