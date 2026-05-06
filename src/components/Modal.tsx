import React from 'react';

export function Modal({ show, onClose, title, type, icon, children }: { show: boolean, onClose: () => void, title: string, type: 'warning' | 'info', icon: React.ReactNode, children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--color-sys-ink)] opacity-50" onClick={onClose} />
      <div className="bg-[var(--color-sys-bg)] border border-[var(--color-sys-ink)] rounded-2xl w-full max-w-md relative z-10 fade-in-up shadow-[8px_8px_0_var(--color-sys-ink)] p-6">
        <div className="pb-4 mb-4 flex items-center gap-4 border-b border-[var(--color-sys-line)]">
          <div className="w-12 h-12 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest font-serif italic">{title}</h3>
            <p className="text-xs font-mono opacity-60 mt-1 uppercase">Liberica Protocol v1.2</p>
          </div>
        </div>
        <div className="py-2">
          {children}
        </div>
      </div>
    </div>
  );
}
