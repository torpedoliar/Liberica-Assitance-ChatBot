import React, { useState, useRef, useEffect } from 'react';
import { 
  X, ShieldAlert, CheckCircle2, History, Info, 
  Wrench, Lightbulb, TrendingUp, Sparkles, Shield
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { db, handleFirestoreError, OperationType } from './firebase';
import { Mode, Message, AppState } from './types';
import { NavButton } from './components/NavButton';
import { Modal } from './components/Modal';
import { TickerTape } from 'react-ts-tradingview-widgets';

import { handleTroubleshoot, handleBrainstorm, handleMarketAnalysis, handleChat } from './services/aiService';
import { useSessions } from './hooks/useSessions';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ChatInput } from './components/ChatInput';
import { AINews } from './components/AINews';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [currentMode, setCurrentMode] = useState<Mode>('news');
  const [messages, setMessages] = useState<Record<Mode, Message[]>>({
    troubleshoot: [], brainstorm: [], market: [], chat: [], news: [], admin: []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const [appState, setAppState] = useState<AppState>({
    troubleshoot: {
      step: 'idle',
      context: { originalProblem: '', clarifications: '', failedAttempts: [] }
    }
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const pendingMarketChoiceMsg = messages.market.find(m => m.data?.has_multiple_options && m.data?.user_choice_pending);

  const handleMarketChoice = (choice: 'single' | 'compare') => {
    if (!pendingMarketChoiceMsg) return;
    setMessages(prev => ({
      ...prev,
      market: prev.market.map(m => {
        if (m.id === pendingMarketChoiceMsg.id) {
          return {
            ...m,
            data: {
              ...m.data,
              user_choice_pending: false,
              user_chooses_compare: choice === 'compare'
            }
          };
        }
        return m;
      })
    }));
  };

  const {
    sessionUser, isAdminUser, savedSessions, isSessionLoaded, pendingSessionData,
    currentSessionId, setCurrentSessionId, showRestoreModal, setShowRestoreModal,
    setPendingSessionData, setIsSessionLoaded, handleLogin, fetchSavedSessions,
    saveSession, togglePinSession
  } = useSessions(messages, appState, currentMode, showSafetyModal);

  const handleLogout = async () => {
    try {
      const { auth } = await import('./firebase');
      await auth.signOut();
      if (currentMode === 'admin') {
        setCurrentMode('news');
      }
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  // Keep-alive ping to prevent the container from sleeping or timing out if left idle
  useEffect(() => {
    const keepAlive = setInterval(() => {
      fetch('/').catch(() => {});
    }, 4 * 60 * 1000); // Trigger a light network request every 4 minutes 
    return () => clearInterval(keepAlive);
  }, []);

  const handleRestore = () => {
    if (pendingSessionData) {
      try {
        const parsedMsgs = JSON.parse(pendingSessionData.messages || '{}');
        const parsedState = JSON.parse(pendingSessionData.appState || '{}');
        const savedMode = pendingSessionData.currentMode || 'troubleshoot';
        
        setMessages({
          troubleshoot: parsedMsgs.troubleshoot || [],
          brainstorm: parsedMsgs.brainstorm || [],
          market: parsedMsgs.market || [],
          chat: parsedMsgs.chat || [],
          news: parsedMsgs.news || [],
          admin: parsedMsgs.admin || []
        });
        if (parsedState.troubleshoot) setAppState({ troubleshoot: parsedState.troubleshoot });
        setCurrentMode(savedMode as Mode);
      } catch (e) {
        console.error('Error parsing restored data', e);
      }
    }
    setShowRestoreModal(false);
    setPendingSessionData(null);
    setIsSessionLoaded(true);
  };

  const handleStartNew = () => {
    if (isProcessing) {
      console.warn("Tunggu AI selesai berpikir sebelum memulai obrolan baru.");
      return;
    }
    setShowRestoreModal(false);
    setPendingSessionData(null);
    setIsSessionLoaded(true);
    setCurrentSessionId(null);
    setMessages({ troubleshoot: [], brainstorm: [], market: [], chat: [], news: [], admin: [] });
    setAppState({ troubleshoot: { step: 'idle', context: { originalProblem: '', clarifications: '', failedAttempts: [] } } });
  };

  const loadSession = (sessionData: any) => {
    if (isProcessing) {
      console.warn("Tunggu AI selesai berpikir sebelum berpindah riwayat obrolan.");
      return;
    }
    try {
      const parsedMsgs = JSON.parse(sessionData.messages || '{}');
      const parsedState = JSON.parse(sessionData.appState || '{}');
      const savedMode = sessionData.currentMode || 'troubleshoot';
      
      setMessages({
        troubleshoot: parsedMsgs.troubleshoot || [],
        brainstorm: parsedMsgs.brainstorm || [],
        market: parsedMsgs.market || [],
        chat: parsedMsgs.chat || [],
        news: parsedMsgs.news || [],
        admin: parsedMsgs.admin || []
      });
      if (parsedState.troubleshoot) setAppState({ troubleshoot: parsedState.troubleshoot });
      setCurrentMode(savedMode as Mode);
      setCurrentSessionId(sessionData.id);
      setShowSidebar(false);
    } catch (err) {
      console.error("Error parsing session data", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, currentMode, isProcessing]);

  const handleSendMessage = async (typedText: string, image: any, file: any) => {
    let promptText = typedText;
    if (file) promptText += `\n\n[DOKUMEN TERLAMPIR: ${file.name}]\n${file.content.substring(0, 50000)}`;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: typedText,
      image: image?.dataUrl,
      fileName: file?.name,
      fileContent: file?.content?.substring(0, 50000)
    };

    setMessages(prev => ({ ...prev, [currentMode]: [...prev[currentMode], userMsg] }));
    setIsProcessing(true);

    try {
      if (currentMode === 'troubleshoot') {
        await handleTroubleshoot(promptText, image, messages.troubleshoot, appState.troubleshoot, setMessages, setAppState);
      } else if (currentMode === 'brainstorm') {
        await handleBrainstorm(promptText, image, messages.brainstorm, setMessages);
      } else if (currentMode === 'market') {
        await handleMarketAnalysis(promptText, image, messages.market, setMessages);
      } else {
        await handleChat(promptText, image, messages.chat, setMessages);
      }
    } catch (error: any) {
      console.error(error);
      let errorText = 'Maaf, terjadi kesalahan teknis. Silakan coba lagi.';
      if (error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 429) {
        errorText = 'Maaf, kuota API Gemini saat ini telah habis atau sedang sibuk. Mohon tunggu beberapa saat sebelum mencoba lagi.';
      }
      const errorMsg: Message = { id: Date.now().toString() + '-err', role: 'model', text: errorText };
      setMessages(prev => ({ ...prev, [currentMode]: [...prev[currentMode], errorMsg] }));
    } finally {
      setIsProcessing(false);
    }
  };

  const renameSession = async () => {
    const title = prompt("Ubah nama chat ini:", "Chat baru");
    if(title && sessionUser && currentSessionId) {
      try {
        await setDoc(doc(db, 'users', sessionUser.uid, 'sessions', currentSessionId), { 
          title,
          updatedAt: serverTimestamp()
        }, { merge: true });
        fetchSavedSessions();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'users');
      }
    } else if (!sessionUser) {
      alert('Silakan Sign In terlebih dahulu.');
    }
  };

  if (!isSessionLoaded) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-sys-bg)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-sys-ink)]"></div>
      </div>
    );
  }

  if (isSessionLoaded && !sessionUser) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-sys-bg)] text-[var(--color-sys-ink)] items-center justify-center p-4 text-center">
        <Shield className="w-16 h-16 mb-6" />
        <h1 className="text-3xl font-black font-mono tracking-widest uppercase mb-4">Akses Dibatasi</h1>
        <p className="text-gray-600 mb-8 max-w-md font-mono text-sm leading-relaxed">Silakan masuk menggunakan akun Anda untuk menggunakan Liberica Assistance.</p>
        <button 
          onClick={handleLogin}
          className="px-6 py-3 bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] rounded-xl font-mono tracking-widest uppercase font-bold text-sm shadow-[4px_4px_0_var(--color-sys-bg),6px_6px_0_var(--color-sys-ink)] hover:translate-y-1 hover:shadow-none transition-all"
        >
          Sign In dengan Google
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-sys-bg)] text-[var(--color-sys-ink)]">
      <Header 
        showSidebar={showSidebar} setShowSidebar={setShowSidebar}
        currentMode={currentMode} setCurrentMode={setCurrentMode}
        setShowInfoModal={setShowInfoModal} sessionUser={sessionUser}
        handleLogin={handleLogin} handleLogout={handleLogout}
      />

      {currentMode === 'market' && (
        <div className="w-full shrink-0 border-b border-[var(--color-sys-ink)] bg-[#131722]">
           <div className="h-[46px] pointer-events-auto">
             {/* Dynamic import of TickerTape to avoid SSR/build issues if any, but since it's Vite client side, direct is fine. */}
             <TickerTape colorTheme="dark" displayMode="regular" isTransparent={true} showSymbolLogo={true} symbols={[
                { proName: "IDX:COMPOSITE", title: "IHSG" },
                { proName: "FX_IDC:USDIDR", title: "USD/IDR" },
                { proName: "BINANCE:BTCUSDT", title: "BTC/USDT" },
                { proName: "OANDA:XAUUSD", title: "Gold" },
                { proName: "PEPPERSTONE:COFFEE", title: "Coffee" },
                { proName: "IDX:BBCA", title: "BCA" },
                { proName: "IDX:BBRI", title: "BRI" },
                { proName: "IDX:BMRI", title: "Mandiri" },
             ]} />
           </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar 
          showSidebar={showSidebar} setShowSidebar={setShowSidebar}
          sessionUser={sessionUser} savedSessions={savedSessions}
          currentSessionId={currentSessionId} loadSession={loadSession}
          togglePinSession={togglePinSession} handleStartNew={handleStartNew}
          isProcessing={isProcessing}
        />

        <main className="flex-1 overflow-hidden relative flex flex-col items-center">
          {currentMode === 'news' ? (
            <div className="flex-1 w-full overflow-y-auto pb-20">
              <AINews />
            </div>
          ) : currentMode === 'admin' ? (
            <div className="flex-1 w-full overflow-y-auto pb-20">
              <AdminDashboard sessionUser={sessionUser} />
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 w-full max-w-5xl overflow-y-auto px-4 py-8 space-y-6 scroll-smooth hide-scrollbar">
                <MessageList 
                  messages={messages[currentMode]} 
                  currentMode={currentMode} 
                  renameSession={renameSession} 
                />
                {isProcessing && <ProcessingStatus />}
              </div>

              <div className="w-full max-w-4xl px-4 pb-6 pt-2 shrink-0">
                <div className="border border-[var(--color-sys-ink)] bg-white text-[var(--color-sys-ink)] rounded-xl px-4 py-3 mb-4 flex items-center justify-center gap-3 shadow-[4px_4px_0_var(--color-sys-ink)]">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest font-mono text-center">Jangan lampirkan data rahasia. Gunakan Dummy Data.</p>
                </div>

                <ChatInput 
                  currentMode={currentMode} 
                  isProcessing={isProcessing} 
                  onSubmit={handleSendMessage} 
                />
              </div>
            </>
          )}
        </main>
      </div>

      <nav className="lg:hidden shrink-0 border-t-2 border-[var(--color-sys-ink)] p-4 flex overflow-x-auto gap-4 bg-[var(--color-sys-bg)] z-30 hide-scrollbar pb-6">
        <NavButton active={currentMode === 'troubleshoot'} onClick={() => setCurrentMode('troubleshoot')} icon={<Wrench className="w-4 h-4 shrink-0" />} label="Solusi" />
        <NavButton active={currentMode === 'brainstorm'} onClick={() => setCurrentMode('brainstorm')} icon={<Lightbulb className="w-4 h-4 shrink-0" />} label="Diskusi" />
        <NavButton active={currentMode === 'market'} onClick={() => setCurrentMode('market')} icon={<TrendingUp className="w-4 h-4 shrink-0" />} label="Market" />
        <NavButton active={currentMode === 'chat'} onClick={() => setCurrentMode('chat')} icon={<Sparkles className="w-4 h-4 shrink-0" />} label="Prompting" />
        <NavButton active={currentMode === 'news'} onClick={() => setCurrentMode('news')} icon={<Info className="w-4 h-4 shrink-0" />} label="AI News" />
        {isAdminUser && <NavButton active={currentMode === 'admin'} onClick={() => setCurrentMode('admin')} icon={<Shield className="w-4 h-4 shrink-0" />} label="Admin" />}
      </nav>

      <Modal show={!!pendingMarketChoiceMsg && currentMode === 'market'} onClose={() => {}} title="Analysis Options" type="info" icon={<TrendingUp />}>
        <div className="space-y-5 text-center">
          <p className="text-sm text-slate-600 leading-relaxed">
            Multiple options are available based on your request. Would you prefer to view a single best tailored option or compare all available options?
          </p>
          <div className="flex gap-3">
            <button onClick={() => handleMarketChoice('single')} className="flex-1 py-3 border border-[var(--color-sys-ink)] rounded-xl bg-[var(--color-sys-bg)] hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] text-[var(--color-sys-ink)] font-mono text-xs uppercase tracking-widest font-bold transition-all">
              View Single Best Option
            </button>
            <button onClick={() => handleMarketChoice('compare')} className="flex-1 py-3 bg-[var(--color-sys-ink)] rounded-xl hover:bg-black text-[var(--color-sys-bg)] text-xs font-mono uppercase tracking-widest font-bold border border-[var(--color-sys-ink)] shadow-[4px_4px_0_var(--color-sys-ink)] transition-all">
              Compare All Options
            </button>
          </div>
        </div>
      </Modal>

      <Modal show={showRestoreModal} onClose={() => {}} title="Lanjutkan Sesi?" type="info" icon={<History />}>
        <div className="space-y-5 text-center">
          <p className="text-sm text-slate-600 leading-relaxed">
            Kami menemukan riwayat obrolan Anda sebelumnya. Ingin melanjutkannya?
          </p>
          <div className="flex gap-3">
            <button onClick={handleStartNew} className="flex-1 py-3 border border-[var(--color-sys-ink)] rounded-xl bg-[var(--color-sys-bg)] hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] text-[var(--color-sys-ink)] font-mono text-xs uppercase tracking-widest font-bold transition-all">
              Mulai Baru
            </button>
            <button onClick={handleRestore} className="flex-1 py-3 bg-[var(--color-sys-ink)] rounded-xl hover:bg-black text-[var(--color-sys-bg)] text-xs font-mono uppercase tracking-widest font-bold border border-[var(--color-sys-ink)] shadow-[4px_4px_0_var(--color-sys-ink)] transition-all">
              Ya, Lanjutkan
            </button>
          </div>
        </div>
      </Modal>

      <Modal show={showSafetyModal} onClose={() => setShowSafetyModal(false)} title="Safety Instruction" type="warning" icon={<ShieldAlert />}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">Sebelum menggunakan <strong>Liberica Assistance</strong>, harap perhatikan pedoman keamanan berikut:</p>
          <div className="p-3 bg-[var(--color-sys-bg)] border border-[var(--color-sys-ink)] rounded-xl shadow-[4px_4px_0_var(--color-sys-ink)] flex gap-3 text-red-600">
            <X className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed uppercase font-bold font-mono tracking-wider">Dilarang keras mengunggah data rahasia perusahaan (Credentials, Source Code, Data Finansial).</p>
          </div>
          <div className="p-3 bg-[var(--color-sys-bg)] border border-[var(--color-sys-ink)] rounded-xl shadow-[4px_4px_0_var(--color-sys-ink)] flex gap-3 text-green-600 mt-4">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed uppercase font-bold font-mono tracking-wider">Gunakan Use Case umum atau Dummy Data jika perlu mencontohkan struktur data.</p>
          </div>
          <button onClick={() => setShowSafetyModal(false)} className="w-full py-3 mt-6 bg-[var(--color-sys-ink)] rounded-xl text-[var(--color-sys-bg)] font-mono text-xs uppercase tracking-widest font-bold border border-[var(--color-sys-ink)] shadow-[4px_4px_0_var(--color-sys-ink)] hover:bg-black transition-all">
            Saya Mengerti & Setuju
          </button>
        </div>
      </Modal>

      <Modal show={showInfoModal} onClose={() => setShowInfoModal(false)} title="Informasi Aplikasi" type="info" icon={<Info />}>
        <div className="space-y-5">
          <div className="p-4 border border-[var(--color-sys-line)] rounded-xl">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 opacity-60">Tujuan Aplikasi</h4>
            <p className="text-sm font-sans leading-relaxed">Liberica Assistance dirancang sebagai suite AI enterprise untuk membantu profesional dalam troubleshooting teknis, brainstorming strategis, dan analisis pasar real-time.</p>
          </div>
          <div className="p-4 border border-[var(--color-sys-line)] rounded-xl">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 opacity-60">Peringatan</h4>
            <p className="text-sm font-sans leading-relaxed">AI dapat menghasilkan informasi tidak akurat. Selalu verifikasi langkah kritis sebelum implementasi di lingkungan produksi.</p>
          </div>
          <div className="p-4 border border-[var(--color-sys-line)] rounded-xl bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] mt-4 text-center">
            <p className="text-xs font-mono font-bold mb-1 uppercase tracking-widest">Created by Yohanes O. Rizky & Bagastyo Indrastoto</p>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 italic font-serif mt-2">"Setiap langkah kecil akan berdampak pada perubahan yang besar"</p>
          </div>
        </div>
      </Modal>

      {/* Background blobs removed for cleaner tech UI */}
      <div className="hidden bg-indigo-100 bg-amber-100 rounded-full blur-3xl pointer-events-none -z-10" />
    </div>
  );
}
