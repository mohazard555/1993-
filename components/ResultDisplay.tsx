import React, { useState, useEffect, useRef } from 'react';
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
        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/>
    </svg>
);
const TelegramIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-sky-500">
        <path d="M24 12c0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12 12-5.373 12-12zm-18.435-5.346l14.869 5.437c.43.161.43.772-.001.932l-3.926.963-1.64 5.345c-.114.37-.583.483-.84.195l-2.486-2.288-2.618 2.52c-.347.346-.943.041-.943-.444v-5.238l9.53-6.103c.27-.173-.03-.591-.351-.43l-11.21 4.537-3.465-1.077c-.44-.136-.44-.796 0-.932z"/>
    </svg>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ text, onSave, onClear }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (text) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [text]);

  useEffect(() => {
    // Cleanup function to stop speech synthesis when component unmounts
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (shareContainerRef.current && !shareContainerRef.current.contains(event.target as Node)) {
            setShowShareOptions(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [shareContainerRef]);


  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'نتيجة من ذكاء النصوص AI',
          text: text,
        });
      } catch (error) {
        console.error('خطأ في مشاركة النص:', error);
      }
    } else {
      setShowShareOptions(prev => !prev);
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA'; // Explicitly set language for better voice selection

      const setVoiceAndSpeak = () => {
        const voices = speechSynthesis.getVoices();
        const arabicVoice = voices.find(voice => voice.lang.startsWith('ar-'));
        
        if (arabicVoice) {
            utterance.voice = arabicVoice;
        } else {
            console.warn("No Arabic voice found on this device. Using browser's default.");
        }
        speechSynthesis.speak(utterance);
      };
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
      };
      
      // Voices might load asynchronously.
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
      } else {
        setVoiceAndSpeak();
      }
      
      setIsSpeaking(true);
    } else {
        alert("متصفحك لا يدعم ميزة قراءة النص.");
    }
  };


  return (
    <div className={`mt-4 bg-black/5 dark:bg-black/20 p-4 rounded-xl relative transition-all duration-500 ${showNotification ? 'shadow-lg shadow-cyan-500/30' : ''}`}>
      <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
         <button
            onClick={onSave}
            className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            aria-label="حفظ النتيجة"
            title="حفظ النتيجة"
          >
           <Save className="w-5 h-5 text-slate-800 dark:text-white" />
        </button>
        <div className="relative" ref={shareContainerRef}>
           <button
              onClick={handleShare}
              className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              aria-label="مشاركة النص"
              title="مشاركة النص"
            >
             <Share2 className="w-5 h-5 text-slate-800 dark:text-white" />
          </button>
          {showShareOptions && (
            <div className="absolute top-full mt-2 -left-2 bg-white dark:bg-gray-800 border dark:border-gray-600 p-2 rounded-xl shadow-xl z-20 flex flex-col gap-1 w-48">
              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" onClick={() => setShowShareOptions(false)} className="flex items-center gap-3 w-full text-right p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-800 dark:text-white">
                <WhatsAppIcon />
                <span>مشاركة عبر واتساب</span>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" onClick={() => setShowShareOptions(false)} className="flex items-center gap-3 w-full text-right p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-800 dark:text-white">
                <FacebookIcon />
                <span>مشاركة عبر فيسبوك</span>
              </a>
              <a href={`https://t.me/share/url?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" onClick={() => setShowShareOptions(false)} className="flex items-center gap-3 w-full text-right p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-800 dark:text-white">
                <TelegramIcon />
                <span>مشاركة عبر تيليجرام</span>
              </a>
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          aria-label="نسخ النص"
          title="نسخ النص"
        >
          {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Clipboard className="w-5 h-5 text-slate-800 dark:text-white" />}
        </button>
        <button
          onClick={handleSpeak}
          className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          aria-label={isSpeaking ? "إيقاف القراءة" : "قراءة النص"}
          title={isSpeaking ? "إيقاف القراءة" : "قراءة النص"}
        >
          {isSpeaking ? <VolumeX className="w-5 h-5 text-yellow-500 dark:text-yellow-400" /> : <Volume2 className="w-5 h-5 text-slate-800 dark:text-white" />}
        </button>
         <button
            onClick={onClear}
            className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            aria-label="مسح النتيجة"
            title="مسح النتيجة"
          >
           <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
        </button>
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 pt-10">النتيجة:</h3>
      <pre className="text-slate-800 dark:text-white whitespace-pre-wrap font-sans text-base">{text}</pre>
      <TextAnalysis text={text} />
    </div>
  );
};

export default ResultDisplay;