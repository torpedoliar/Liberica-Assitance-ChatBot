import React from 'react';
import { History, Coffee, Wrench, Lightbulb, TrendingUp, Sparkles, Info, Shield, LogOut } from 'lucide-react';
import { NavButton } from './NavButton';
import { Mode } from '../types';

interface HeaderProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  currentMode: Mode;
  setCurrentMode: (mode: Mode) => void;
  setShowInfoModal: (show: boolean) => void;
  sessionUser: any;
  handleLogin: () => void;
  handleLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showSidebar, setShowSidebar, currentMode, setCurrentMode, setShowInfoModal, sessionUser, handleLogin, handleLogout
}) => {
  return (
    <header className="flex items-center justify-between shrink-0 z-30 relative border-b border-[var(--color-sys-line)] p-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button onClick={() => setShowSidebar(!showSidebar)} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-sys-bg)] text-[var(--color-sys-ink)] hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] transition-all font-mono text-sm border-2 border-[var(--color-sys-ink)] rounded-xl hover:shadow-[4px_4px_0_var(--color-sys-ink)] uppercase tracking-widest font-bold">
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">Logs</span>
        </button>
        <div className="hidden sm:flex items-center border-l border-[var(--color-sys-line)] pl-4 ml-2">
          <Coffee className="w-8 h-8" />
        </div>
        <div className="flex flex-col justify-center mt-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight font-serif italic flex items-center gap-2 leading-none">
            Liberica Assistance
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-bold font-mono mt-1 opacity-60">Percepat Langkah, Tumbuh Bersama Ide Anda.</p>
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-4">
        <NavButton active={currentMode === 'troubleshoot'} onClick={() => setCurrentMode('troubleshoot')} icon={<Wrench className="w-4 h-4" />} label="Solusi" />
        <NavButton active={currentMode === 'brainstorm'} onClick={() => setCurrentMode('brainstorm')} icon={<Lightbulb className="w-4 h-4" />} label="Diskusi" />
        <NavButton active={currentMode === 'market'} onClick={() => setCurrentMode('market')} icon={<TrendingUp className="w-4 h-4" />} label="Market" />
        <NavButton active={currentMode === 'chat'} onClick={() => setCurrentMode('chat')} icon={<Sparkles className="w-4 h-4" />} label="Prompting" />
        <NavButton active={currentMode === 'news'} onClick={() => setCurrentMode('news')} icon={<Info className="w-4 h-4" />} label="AI News" />
        {sessionUser && <NavButton active={currentMode === 'admin'} onClick={() => setCurrentMode('admin')} icon={<Shield className="w-4 h-4" />} label="Admin" />}
      </nav>

      <div className="flex items-center gap-4">
        <button onClick={() => setShowInfoModal(true)} className="p-2 border-2 border-[var(--color-sys-ink)] rounded-xl hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] hover:shadow-[4px_4px_0_var(--color-sys-ink)] transition-all bg-[var(--color-sys-bg)] text-[var(--color-sys-ink)]">
          <Info className="w-5 h-5" />
        </button>
        {sessionUser ? (
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMode('admin')} className="lg:hidden p-2 border-2 border-[var(--color-sys-ink)] rounded-xl hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] hover:shadow-[4px_4px_0_var(--color-sys-ink)] transition-all bg-[var(--color-sys-bg)] text-[var(--color-sys-ink)]">
              <Shield className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] flex items-center justify-center font-bold font-mono text-sm border-2 border-[var(--color-sys-ink)] rounded-xl shadow-[4px_4px_0_var(--color-sys-ink)] uppercase">
              {sessionUser.email ? sessionUser.email[0] : 'U'}
            </div>
            <button onClick={handleLogout} title="Logout" className="p-2 border-2 border-red-600 rounded-xl hover:bg-red-600 hover:text-white hover:shadow-[4px_4px_0_#dc2626] transition-all bg-red-50 text-red-600">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="px-6 py-2 bg-[var(--color-sys-ink)] hover:bg-[var(--color-sys-bg)] hover:text-[var(--color-sys-ink)] border-2 border-[var(--color-sys-ink)] rounded-xl text-[var(--color-sys-bg)] shadow-[4px_4px_0_var(--color-sys-ink)] hover:shadow-[4px_4px_0_var(--color-sys-ink)] font-mono text-sm font-bold transition-all cursor-pointer uppercase tracking-widest">
            Auth
          </button>
        )}
      </div>
    </header>
  );
};
