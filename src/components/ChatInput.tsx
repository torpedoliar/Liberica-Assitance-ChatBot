import React, { useState, useRef } from 'react';
import { X, Mic, Paperclip, ArrowUp, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleAttachment } from '../utils/fileUpload';
import { getPlaceholder } from '../constants';
import { Mode } from '../types';

interface ChatInputProps {
  currentMode: Mode;
  isProcessing: boolean;
  onSubmit: (typedText: string, image: {base64: string, mimeType: string, dataUrl: string} | null, file: {name: string, content: string} | null) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ currentMode, isProcessing, onSubmit }) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<{base64: string, mimeType: string, dataUrl: string} | null>(null);
  const [attachedFile, setAttachedFile] = useState<{name: string, content: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachmentSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleAttachment(file, setAttachedImage, setAttachedFile, (fileName, err) => console.error(`Error parsing ${fileName}`, err));
  };

  const clearAttachment = () => {
    setAttachedImage(null);
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung fitur input suara.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.start();
  };

  const handleSubmit = () => {
    if ((!inputText.trim() && !attachedImage && !attachedFile) || isProcessing) return;
    
    onSubmit(inputText.trim(), attachedImage, attachedFile);
    setInputText('');
    clearAttachment();
  };

  return (
    <div className="input-area relative">
      <AnimatePresence>
        {(attachedImage || attachedFile) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-3 p-2 bg-[var(--color-sys-bg)] border border-[var(--color-sys-line)] rounded-xl mb-2"
          >
            {attachedImage ? (
              <img src={attachedImage.dataUrl} className="w-12 h-12 object-cover border border-[var(--color-sys-line)] rounded-lg" />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center border border-[var(--color-sys-line)] rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
            )}
            <span className="text-xs font-semibold font-mono line-clamp-1 flex-1">
              {attachedFile ? attachedFile.name : 'IMG_ATTACHED'}
            </span>
            <button onClick={clearAttachment} className="p-1.5 hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] rounded-lg transition-colors border border-[var(--color-sys-line)]">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center gap-3">
        <input 
          type="text" value={inputText} onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
          placeholder={getPlaceholder(currentMode)}
          className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm md:text-base py-2 placeholder:opacity-50"
        />
        <div className="flex items-center gap-1">
          <input type="file" ref={fileInputRef} onChange={handleAttachmentSelection} className="hidden" accept=".txt,.csv,.md,.pdf,.docx,image/*" />
          <button onClick={startRecording} className={`p-2 rounded-xl transition-all border border-[var(--color-sys-line)] ${isRecording ? 'animate-pulse bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)]' : 'hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)]'}`}>
            <Mic className="w-5 h-5" />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] border border-[var(--color-sys-line)] transition-all">
            <Paperclip className="w-5 h-5" />
          </button>
          <button onClick={handleSubmit} disabled={isProcessing || (!inputText.trim() && !attachedImage && !attachedFile)} className="bg-[var(--color-sys-ink)] rounded-xl hover:bg-[var(--color-sys-bg)] hover:text-[var(--color-sys-ink)] border border-[var(--color-sys-ink)] disabled:opacity-50 text-[var(--color-sys-bg)] p-2.5 transition-all shadow-[4px_4px_0_var(--color-sys-ink)] active:translate-y-1 active:shadow-none">
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
