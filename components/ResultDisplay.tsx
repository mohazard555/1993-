import React, { useState, useEffect } from 'react';
import { Clipboard, Check, Save, Share2, Trash2, Volume2, VolumeX } from 'lucide-react';
import TextAnalysis from './TextAnalysis';

interface ResultDisplayProps {
  text: string;
  onSave: () => void;
  onClear: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ text, onSave, onClear }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

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
      alert('المشاركة غير مدعومة على هذا المتصفح.');
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
      // By not setting a specific voice, we allow the browser to use its default
      // voice selection logic, which often automatically detects the language of the text.
      // This provides better support for multiple languages as requested.
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
      };

      // Ensure voices are loaded before speaking, as it can be async on some browsers
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = () => {
            speechSynthesis.speak(utterance);
        };
      } else {
        speechSynthesis.speak(utterance);
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
         <button
            onClick={handleShare}
            className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            aria-label="مشاركة النص"
            title="مشاركة النص"
          >
           <Share2 className="w-5 h-5 text-slate-800 dark:text-white" />
        </button>
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
