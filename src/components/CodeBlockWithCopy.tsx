import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const CodeBlockWithCopy = ({ inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  
  if (inline) {
    return (
      <code className="bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] px-1.5 py-0.5 rounded-md font-mono text-xs md:text-sm mx-0.5" {...props}>
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    const textToCopy = Array.isArray(children) ? children.join('') : String(children);
    navigator.clipboard.writeText(textToCopy.replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden my-4 border-2 border-[var(--color-sys-ink)] bg-slate-50 shadow-[4px_4px_0_var(--color-sys-ink)]">
      <div className="flex justify-between items-center bg-[var(--color-sys-ink)] px-4 py-2">
        <div className="text-xs font-mono text-[var(--color-sys-bg)] uppercase tracking-widest font-bold">
          {match ? match[1] : 'Prompt Output'}
        </div>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase font-bold text-[var(--color-sys-bg)] hover:text-emerald-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="!bg-slate-50 !text-[var(--color-sys-ink)] !p-5 !overflow-y-auto !max-h-[400px] !whitespace-pre-wrap !border-none !m-0 block">
        <code className="!bg-transparent !text-[var(--color-sys-ink)] font-mono text-sm break-words !p-0" {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};
