import React, { useState } from 'react';
// FIX: Corrected import to make ServiceType available as a value at runtime, not just a type, and removed redundant aliased import.
import { type ServiceConfig, ServiceType } from '../types';
import Spinner from './Spinner';
import ResultDisplay from './ResultDisplay';
import { ChevronDown } from 'lucide-react';


interface ServiceCardProps {
  config: ServiceConfig;
  onGenerate: (serviceType: ServiceType, prompt: string) => void;
  isLoading: boolean;
  result: string | null;
  onClearResult: (serviceType: ServiceType) => void;
  onSaveResult: (serviceType: ServiceType, prompt: string, result: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ config, onGenerate, isLoading, result, onClearResult, onSaveResult, isActive, onToggle }) => {
  const [inputValue, setInputValue] = useState('');
  const [dateValue, setDateValue] = useState(() => new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalPrompt = inputValue;
    // FIX: Replaced aliased `AppServiceType` with `ServiceType` for consistency after fixing imports.
    if (config.type === ServiceType.HOROSCOPE) {
      if (!inputValue || !dateValue) return;
      finalPrompt = `${inputValue} بتاريخ ${dateValue}`;
    }

    if (finalPrompt.trim()) {
      onGenerate(config.type, finalPrompt);
    }
  };
  
  const isSubmitDisabled = () => {
    if (isLoading) return true;
    // FIX: Replaced aliased `AppServiceType` with `ServiceType` for consistency after fixing imports.
    if (config.type === ServiceType.HOROSCOPE) {
      return !inputValue.trim() || !dateValue.trim();
    }
    return !inputValue.trim();
  }


  const renderInput = () => {
    const commonClasses = "w-full p-3 bg-gray-200/50 dark:bg-gray-700/50 border border-gray-400 dark:border-gray-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 transition";
    const focusClasses = {
        [ServiceType.GENERAL]: "focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-cyan-500 dark:focus:border-cyan-400",
        [ServiceType.POEM]: "focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500 dark:focus:border-pink-400",
        [ServiceType.HOROSCOPE]: "focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400",
    }
    const getFocusClass = (type: ServiceType) => focusClasses[type] || focusClasses[ServiceType.GENERAL];


    // FIX: Replaced aliased `AppServiceType` with `ServiceType` for consistency after fixing imports.
    if (config.type === ServiceType.HOROSCOPE) {
      return (
        <div className="space-y-3">
            <select
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={`${commonClasses} ${getFocusClass(config.type)}`}
              required
            >
              <option value="" disabled>{config.placeholder}</option>
              {config.options?.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className={`${commonClasses} ${getFocusClass(config.type)}`}
                required
              />
        </div>
      )
    }

    switch (config.inputType) {
      case 'textarea':
        return (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={config.placeholder}
            className={`w-full h-32 ${commonClasses} ${getFocusClass(config.type)}`}
            required
          />
        );
      case 'select':
        return (
          <select
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`${commonClasses} ${getFocusClass(config.type)}`}
            required
          >
            <option value="" disabled>{config.placeholder}</option>
            {config.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'text':
      default:
        return (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={config.placeholder}
            className={`${commonClasses} ${getFocusClass(config.type)}`}
            required
          />
        );
    }
  };

  return (
    <div className={`bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border transition-all duration-300 ${isActive ? 'border-cyan-500/50' : 'border-black/10 dark:border-white/10'}`}>
      {/* Header - Clickable Toggle */}
      <div onClick={onToggle} className="flex items-center justify-between p-6 cursor-pointer">
          <div className="flex items-center gap-4">
              {config.icon}
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{config.title}</h2>
          </div>
          <ChevronDown className={`w-6 h-6 text-slate-800 dark:text-white transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isActive ? 'max-h-[1000px]' : 'max-h-0'}`}>
        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex-grow">
                {renderInput()}
            </div>
            <button
              type="submit"
              disabled={isSubmitDisabled()}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                  <span className='flex items-center gap-2'><span className="animate-pulse">🤖</span> جاري التفكير...</span>
              ) : 'توليد النتيجة'}
            </button>
          </form>
          {result && (
            <ResultDisplay 
              text={result} 
              onClear={() => onClearResult(config.type)} 
              onSave={() => onSaveResult(config.type, inputValue, result)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;