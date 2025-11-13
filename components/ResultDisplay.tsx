
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clipboard, Check, Save, Share2, Trash2, Volume2, VolumeX } from 'lucide-react';
import TextAnalysis from './TextAnalysis';

interface ResultDisplayProps {
  text: string;
  onSave: () => void;
  onClear: () => void;
}

const WhatsAppIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.846 6.106l-1.054 3.858 3.996-1.052z"/>
    </svg>
);
const FacebookIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89H8.078v-2.89h2.359v-2.193c0-2.325 1.423-3.596 3.5-3.596 1.002 0 1.863.074 2.113.107v2.583h-1.528c-1.13 0-1.35.536-1.35 1.322v1.734h2.867l-.372 2.89h-2.495V21.878A10.003 10.003 0 0022 12z"/>
    </svg>
);
const TelegramIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-sky-500">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm7.153 8.332l-2.072 9.73c-.228 1.074-1.01 1.34-1.91  .833l-4.228-3.13-2.035 1.95c-.22.22-.407.407-.832.407l.228-4.32 7.76-7.008c.325-.286-.098-.445-.523-.16L6.52 13.368l-4.13-1.28c-1.055-.325-1.055-1.01.21-1.517l13.064-5.02c.87-.333 1.592.193 1.33 1.21z"/>
    </svg>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ text, onSave, onClear }) => {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Cleanup effect to stop speech synthesis when the component unmounts.
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'نتيجة من ذكاء النصوص AI',
          text: text,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const handleSpeak = useCallback(() => {
    if (!text || text.trim() === '') return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const startSpeech = () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(v => v.lang === 'ar-SA') || voices.find(v => v.lang.startsWith('ar'));
      
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      } else {
        console.warn('No Arabic voice found. Using browser default for ar-SA.');
      }
      
      utterance.onend = () => setIsSpeaking(false);
      
      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        alert('عذراً، حدث خطأ أثناء محاولة قراءة النص. قد لا يكون هناك صوت عربي متاح على جهازك أو أن هناك مشكلة في محرك الصوت.');
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      startSpeech();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        startSpeech();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [isSpeaking, text]);


  return (
    <div className="mt-6 p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">النتيجة:</h3>
        <div className="flex items-center gap-1 relative">
          <button onClick={handleSpeak} title={isSpeaking ? "إيقاف القراءة" : "قراءة النص"} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
            {isSpeaking ? <VolumeX size={20} className="text-red-500" /> : <Volume2 size={20} className="text-blue-500" />}
          </button>
          <button onClick={handleCopy} title="نسخ" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
            {copied ? <Check size={20} className="text-green-500" /> : <Clipboard size={20} />}
          </button>
          <button onClick={onSave} title="حفظ" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
            <Save size={20} />
          </button>
          <button onClick={handleShare} title="مشاركة" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
            <Share2 size={20} />
          </button>
          <button onClick={onClear} title="مسح" className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
            <Trash2 size={20} />
          </button>

          {showShareMenu && (
             <div ref={shareMenuRef} className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl z-10 p-2 space-y-1">
                <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"><WhatsAppIcon/> واتساب</a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=none&quote=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"><FacebookIcon/> فيسبوك</a>
                <a href={`https://t.me/share/url?url=none&text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"><TelegramIcon/> تيليجرام</a>
            </div>
          )}
        </div>
      </div>
      <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-lg leading-relaxed bg-white/30 dark:bg-black/20 p-4 rounded-lg max-h-96 overflow-y-auto">
        {text}
      </div>
      <TextAnalysis text={text} />
    </div>
  );
};

export default ResultDisplay;
