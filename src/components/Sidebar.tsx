import React from 'react';
import { History, X, Bookmark, Sparkles } from 'lucide-react';
import { Mode } from '../types';

interface SidebarProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  sessionUser: any;
  savedSessions: any[];
  currentSessionId: string | null;
  loadSession: (sessionData: any) => void;
  togglePinSession: (session: any, e: React.MouseEvent) => void;
  handleStartNew: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  showSidebar,
  setShowSidebar,
  sessionUser,
  savedSessions,
  currentSessionId,
  loadSession,
  togglePinSession,
  handleStartNew
}) => {
  if (!showSidebar) return null;

  return (
    <div className="w-64 max-w-full bg-[var(--color-sys-bg)] border-r border-[var(--color-sys-line)] flex flex-col h-full absolute lg:relative z-20 transition-all duration-300 left-0">
      <div className="p-4 border-b border-[var(--color-sys-line)] flex justify-between items-center">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 font-mono">
          <History className="w-4 h-4" /> Logs
        </h2>
        <button onClick={() => setShowSidebar(false)} className="lg:hidden p-1 hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)]">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto w-full p-2 space-y-1">
        {!sessionUser && (
          <div className="text-center p-4 text-xs font-mono font-bold opacity-60">
            <p>AUTH REQUIRED</p>
          </div>
        )}
        {sessionUser && savedSessions.length === 0 && (
          <div className="text-center p-4 text-xs font-mono font-bold opacity-60">
            <p>NO LOGS FOUND</p>
          </div>
        )}
        {savedSessions.map((session: any) => (
          <div key={session.id} className={`w-full text-left flex flex-col p-3 rounded-xl transition-all text-sm gap-1 group border ${currentSessionId === session.id ? 'border-[var(--color-sys-ink)] shadow-[4px_4px_0_var(--color-sys-ink)]' : 'border-transparent hover:border-[var(--color-sys-line)]'}`}>
            <div className="flex items-start justify-between gap-2">
              <button onClick={() => loadSession(session)} className="flex-1 text-left">
                <span className={`font-mono font-semibold line-clamp-1 transition-colors`}>
                  {session.title || 'UNTITLED'}
                </span>
              </button>
              <button 
                 onClick={(e) => togglePinSession(session, e)} 
                 className={`p-1 transition-colors shrink-0 ${session.isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)]'}`}
                 title={session.isPinned ? "Unpin session" : "Pin session"}
              >
                <Bookmark className={`w-4 h-4 ${session.isPinned ? 'fill-current' : ''}`} />
              </button>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-widest flex items-center gap-1 opacity-60">
              {session.currentMode} <span className="opacity-50">•</span> {new Date(session.updatedAt?.toMillis() || Date.now()).toLocaleDateString('id-ID')}
            </span>
          </div>
        ))}
      </div>
      {sessionUser && (
         <div className="p-4 border-t border-[var(--color-sys-line)]">
            <button onClick={handleStartNew} className="w-full py-2 border border-[var(--color-sys-line)] rounded-xl text-[var(--color-sys-ink)] hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3" /> New Session
            </button>
         </div>
      )}
    </div>
  );
};
