import React from 'react';

export const ProcessingStatus = () => {
  return (
    <div className="flex justify-start fade-in-up">
      <div className="bento-card flex items-center gap-3 py-3 px-5 border-[var(--color-sys-line)]">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-[var(--color-sys-ink)] animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-[var(--color-sys-ink)] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-[var(--color-sys-ink)] animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <span className="text-xs font-bold font-mono tracking-widest uppercase">Processing...</span>
      </div>
    </div>
  );
};
