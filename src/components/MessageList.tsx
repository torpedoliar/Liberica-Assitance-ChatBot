import React from 'react';
import Markdown from 'react-markdown';
import { Download, Bookmark, FileText } from 'lucide-react';
import { Message, Mode } from '../types';
import { RichResponse } from './RichResponse';
import { exportMessageToPdf } from '../utils/exportPdf';
import { WelcomeScreen } from './WelcomeScreen';

interface MessageListProps {
  messages: Message[];
  currentMode: Mode;
  renameSession: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentMode, renameSession }) => {
  if (messages.length === 0) {
    return <WelcomeScreen mode={currentMode} />;
  }

  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in-up`}>
          <div className={`max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'bg-[var(--color-sys-bg)] text-[var(--color-sys-ink)] border-2 border-[var(--color-sys-ink)] rounded-xl p-4 font-mono shadow-[4px_4px_0_var(--color-sys-ink)] ml-8' : 'w-full mr-8'}`}>
            {msg.image && <img src={msg.image} className="mb-3 max-h-60 w-full object-cover border border-[var(--color-sys-ink)] rounded-lg" />}
            {msg.role === 'user' && msg.fileName && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-[var(--color-sys-bg)] text-[var(--color-sys-ink)] border border-[var(--color-sys-ink)] rounded-lg">
                <FileText className="w-5 h-5 opacity-80" />
                <span className="text-sm font-semibold opacity-90 line-clamp-1">{msg.fileName}</span>
              </div>
            )}
            {msg.role === 'user' && <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
            {msg.role === 'model' && (
              <div className="space-y-4">
                <div id={`msg-content-${msg.id}`}>
                  {msg.data ? (
                    <RichResponse data={msg.data} mode={currentMode} />
                  ) : (
                    <div className="bento-card">
                      <div className="markdown-body text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 pl-2 mt-2">
                  <button onClick={() => exportMessageToPdf(`msg-content-${msg.id}`, currentMode)} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest font-bold border border-[var(--color-sys-line)] rounded-lg hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] transition-all">
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </button>
                  <button onClick={renameSession} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest font-bold border border-[var(--color-sys-line)] rounded-lg hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] transition-all">
                    <Bookmark className="w-3.5 h-3.5" /> Rename
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};
