import React from 'react';

export function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`nav-btn font-mono uppercase tracking-widest text-xs font-bold border-2 ${
        active 
          ? 'bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] border-[var(--color-sys-ink)] shadow-[4px_4px_0_var(--color-sys-ink)]' 
          : 'text-[var(--color-sys-ink)] border-transparent hover:border-[var(--color-sys-ink)] hover:bg-[var(--color-sys-bg)] hover:shadow-[4px_4px_0_var(--color-sys-ink)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
