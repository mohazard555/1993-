import React from 'react';
import { Clock, BookText, CaseSensitive } from 'lucide-react';

interface TextAnalysisProps {
  text: string;
}

const TextAnalysis: React.FC<TextAnalysisProps> = ({ text }) => {
  if (!text) return null;

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const readingTime = Math.ceil(wordCount / 140); // Avg 140 WPM for Arabic

  const Metric: React.FC<{ icon: React.ReactNode, value: string | number, label: string }> = ({ icon, value, label }) => (
    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full text-sm text-gray-700 dark:text-gray-200">
      {icon}
      <span><strong>{value}</strong> {label}</span>
    </div>
  );

  return (
    <div className="mt-4 flex flex-wrap gap-3 border-t border-black/10 dark:border-white/10 pt-4">
       <h3 className="w-full text-base font-bold text-gray-800 dark:text-white mb-1">تحليل النص:</h3>
      <Metric icon={<BookText size={16} />} value={wordCount} label="كلمة" />
      <Metric icon={<CaseSensitive size={16} />} value={charCount} label="حرفًا" />
      <Metric icon={<Clock size={16} />} value={`≈ ${readingTime} دقيقة`} label="قراءة" />
    </div>
  );
};

export default TextAnalysis;
