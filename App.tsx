import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ServiceType, AppConfig, AppData } from './types';
import { SERVICE_CONFIGS } from './constants';
import ServiceCard from './components/ServiceCard';
import SubscriptionModal from './components/SubscriptionModal';
import AdModal from './components/AdModal';
import { generateText } from './services/geminiService';
import { Zap, LockKeyhole, Settings, Sun, Moon, X, Megaphone } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import CustomAdCard from './components/CustomAdCard';
import ContactModal from './components/ContactModal';

// Default configuration, used if nothing is in localStorage
const DEFAULT_CONFIG: AppConfig = {
  login: {
    enabled: true,
    username: 'admin',
    password: 'password',
  },
  subscriptionUrl: 'https://www.youtube.com/channel/UC-lHJZR3Gqxm24_Vd_AJ5Yw',
  adSettings: {
    videoUrls: [
      'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
      'https://www.youtube.com/embed/QH2-TGUlwu4?autoplay=1&mute=1',
      'https://www.youtube.com/embed/xvFZjo5PgG0?autoplay=1&mute=1',
    ],
    duration: 25,
    postAdUrl: '',
  },
  developerInfo: {
    name: 'Ahmad',
    url: 'https://www.linkedin.com/in/ahmad-rd555/',
    contact: {
      email: 'contact@example.com',
      whatsapp: '+1234567890',
      telegram: 'developer_username',
    },
  },
  siteLogoUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FBBF24' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'/%3E%3C/svg%3E",
};

const DEFAULT_APP_DATA: AppData = {
  results: {
    [ServiceType.GENERAL]: null,
    [ServiceType.POEM]: null,
    [ServiceType.STORY]: null,
    [ServiceType.HOROSCOPE]: null,
    [ServiceType.PERSONALITY_ANALYSIS]: null,
    [ServiceType.SUMMARY]: null,
    [ServiceType.WRITING_IMPROVER]: null,
    [ServiceType.IDEA_GENERATOR]: null,
    [ServiceType.EMAIL_WRITER]: null,
    [ServiceType.CV_WRITER]: null,
    [ServiceType.SOCIAL_MEDIA_POST]: null,
    [ServiceType.RELATIONSHIP_ANALYSIS]: null,
    [ServiceType.QUIZ]: null,
    [ServiceType.NAME_GENERATOR]: null,
    [ServiceType.QUOTE_OF_THE_DAY]: null,
    [ServiceType.DREAM_ANALYSIS]: null,
    [ServiceType.VIDEO_IDEA_GENERATOR]: null,
    [ServiceType.LYRIC_GENERATOR]: null,
    [ServiceType.QUOTE_GENERATOR]: null,
    [ServiceType.DIALOGUE_GENERATOR]: null,
    [ServiceType.EXAM_GENERATOR]: null,
    [ServiceType.CONCEPT_EXPLAINER]: null,
    [ServiceType.PROJECT_ANALYSIS]: null,
    [ServiceType.TEXT_ANALYSIS]: null,
  },
  customAds: [],
  savedResults: [],
};

// Function to load config from localStorage and merge with defaults
const loadConfig = (): AppConfig => {
  try {
    const savedConfig = localStorage.getItem('appConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      // Deep merge sensitive parts
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        login: { ...DEFAULT_CONFIG.login, ...parsed.login },
        adSettings: { ...DEFAULT_CONFIG.adSettings, ...parsed.adSettings },
        developerInfo: { 
          ...DEFAULT_CONFIG.developerInfo, 
          ...parsed.developerInfo,
          contact: {
            ...DEFAULT_CONFIG.developerInfo.contact,
            ...(parsed.developerInfo?.contact || {})
          }
        },
      };
    }
  } catch (error) {
    console.error("Failed to parse config from localStorage", error);
  }
  return DEFAULT_CONFIG;
};

// Function to load app data from localStorage
const loadAppData = (): AppData => {
    try {
        const savedData = localStorage.getItem('appData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            // Ensure all keys from default are present
            return {
                ...DEFAULT_APP_DATA,
                ...parsed,
                results: { ...DEFAULT_APP_DATA.results, ...parsed.results }
            };
        }
    } catch (error) {
        console.error("Failed to parse app data from localStorage", error);
    }
    return DEFAULT_APP_DATA;
}

const playNotificationSound = () => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.start(audioContext.currentTime);

        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.error("Could not play sound", e);
    }
};


// ==========================================
// LOGIN COMPONENT
// ==========================================
const Login: React.FC<{ onLoginSuccess: () => void; onCancel: () => void; config: AppConfig['login'] }> = ({ onLoginSuccess, onCancel, config }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === config.username && password === config.password) {
      setError('');
      localStorage.setItem('isAuthenticated', 'true');
      onLoginSuccess();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-gradient-to-br from-gray-900 via-slate-900 to-black p-4">
      <div className="w-full max-w-sm mx-auto">
        <form onSubmit={handleLogin} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-black/10 dark:border-white/10 relative">
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 left-4 p-2 text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-purple-500/20 rounded-full mb-3"><LockKeyhole className="w-8 h-8 text-purple-400 dark:text-purple-300" /></div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">تسجيل الدخول</h1>
            <p className="text-gray-600 dark:text-gray-400">الرجاء إدخال بيانات الاعتماد للمتابعة</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">اسم المستخدم</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 bg-gray-200/50 dark:bg-gray-700/50 border border-gray-400 dark:border-gray-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">كلمة المرور</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-200/50 dark:bg-gray-700/50 border border-gray-400 dark:border-gray-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition" required />
          </div>
          {error && <p className="text-red-500 dark:text-red-400 text-center mb-4">{error}</p>}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-full transition-all duration-300">دخول</button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// HEADER & THEME TOGGLE
// ==========================================
const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  
    useEffect(() => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }, [theme]);
  
    const toggleTheme = () => {
      setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
  
    return (
      <button
        onClick={toggleTheme}
        className="absolute top-4 left-4 p-3 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon className="w-6 h-6 text-slate-800" /> : <Sun className="w-6 h-6 text-white" />}
      </button>
    );
  };

const Header: React.FC<{ 
  onSettingsClick: () => void; 
  onLogoClick: () => void; 
  isAuthenticated: boolean; 
  hasAds: boolean;
  onAdsClick: () => void;
}> = ({ onSettingsClick, onLogoClick, isAuthenticated, hasAds, onAdsClick }) => (
    <header className="text-center py-8 md:py-12 relative">
    <ThemeToggle />
    <div onClick={onLogoClick} className="inline-flex items-center gap-4 cursor-pointer select-none">
      <Zap className="w-12 h-12 md:w-16 md:h-16 text-yellow-500 dark:text-yellow-300 animate-pulse" />
      <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 dark:from-purple-400 dark:via-pink-400 dark:to-yellow-400">
        ذكاء النصوص AI
      </h1>
    </div>
    <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg">
      خدمات نصية إبداعية بين يديك، مدعومة بالذكاء الاصطناعي
    </p>
    <div className="absolute top-4 right-4 flex items-center gap-2">
        {hasAds && (
            <button
                onClick={onAdsClick}
                className="p-3 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                aria-label="عرض الإعلانات"
                title="عرض الإعلانات المتاحة"
            >
                <Megaphone className="w-6 h-6 text-slate-800 dark:text-white" />
            </button>
        )}
        {isAuthenticated && (
          <button 
            onClick={onSettingsClick} 
            className="p-3 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
            aria-label="الإعدادات"
          >
            <Settings className="w-6 h-6 text-slate-800 dark:text-white" />
          </button>
        )}
    </div>
  </header>
);

// ==========================================
// MAIN APP COMPONENT
// ==========================================
const App: React.FC = () => {
  const [appConfig, setAppConfig] = useState<AppConfig>(loadConfig);
  const [appData, setAppData] = useState<AppData>(loadAppData);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!appConfig.login.enabled || localStorage.getItem('isAuthenticated') === 'true');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [showAdModal, setShowAdModal] = useState<boolean>(false);
  const [currentAdUrl, setCurrentAdUrl] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceType | null>(ServiceType.GENERAL);
  
  const [generatingService, setGeneratingService] = useState<ServiceType | null>(null);
  const [generationRequest, setGenerationRequest] = useState<{ service: ServiceType; prompt: string } | null>(null);
  
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const clickTimeoutRef = useRef<number | null>(null);
  const adsSectionRef = useRef<HTMLElement>(null);
  
  // Effect to handle config changes
  useEffect(() => {
    localStorage.setItem('appConfig', JSON.stringify(appConfig));
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    if (favicon && appConfig.siteLogoUrl) {
      favicon.href = appConfig.siteLogoUrl;
    }
  }, [appConfig]);
  
  // Effect to handle app data changes
  useEffect(() => {
    localStorage.setItem('appData', JSON.stringify(appData));
  }, [appData]);

  useEffect(() => {
    const subscribed = localStorage.getItem('isUserSubscribed') === 'true';
    setIsSubscribed(subscribed);
  }, []);

  const handleLoginSuccess = () => {
      setIsAuthenticated(true);
      setShowLogin(false);
  };
  
  const handleAdsIconClick = () => {
    adsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogoClick = useCallback(() => {
    if (!appConfig.login.enabled) return;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    const newClickCount = logoClickCount + 1;
    setLogoClickCount(newClickCount);

    if (newClickCount >= 5) {
      setShowLogin(true);
      setLogoClickCount(0);
    } else {
      clickTimeoutRef.current = window.setTimeout(() => {
        setLogoClickCount(0);
      }, 1500); // Reset after 1.5 seconds of inactivity
    }
  }, [logoClickCount, appConfig.login.enabled]);
  
  const fetchAiResult = useCallback(async () => {
    if (!generationRequest) return;
  
    const { service, prompt } = generationRequest;
    const config = SERVICE_CONFIGS[service];
    const fullPrompt = `${config.promptPrefix}${prompt}`;
    
    try {
      const resultText = await generateText(fullPrompt);
      setAppData(prev => ({...prev, results: { ...prev.results, [service]: resultText }}));
      playNotificationSound();
      setGenerationRequest(null); // Clear request only on SUCCESS
    } catch (error) {
      console.error("Failed to fetch AI result:", error);
      let errorMessage = 'عذراً، حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى لاحقاً.';
      if (error instanceof Error) {
        if (error.message.includes('API_KEY is not configured')) {
            errorMessage = 'خطأ في الإعدادات: مفتاح API للذكاء الاصطناعي غير موجود. يرجى مراجعة المسؤول.';
        } else if (error.message.includes('API Key') || error.message.includes('entity was not found')) {
            errorMessage = 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً بسبب مشكلة في الإعدادات. قد يكون مفتاح API غير صالح أو أن الخدمة محظورة.';
        } else {
            errorMessage = `عذراً، حدث خطأ غير متوقع: ${error.message}`;
        }
      }
      setAppData(prev => ({...prev, results: { ...prev.results, [service]: errorMessage }}));
    } finally {
      setGeneratingService(null);
    }
  }, [generationRequest]);

  const startAdFlow = useCallback(() => {
    if(appConfig.adSettings.videoUrls.length === 0) {
        handleAdFinished();
        return;
    }
    const randomAdUrl = appConfig.adSettings.videoUrls[Math.floor(Math.random() * appConfig.adSettings.videoUrls.length)];
    setCurrentAdUrl(randomAdUrl);
    setShowAdModal(true);
  }, [appConfig.adSettings.videoUrls]);

  const handleGenerate = useCallback((serviceType: ServiceType, prompt: string) => {
    setGeneratingService(serviceType);
    setGenerationRequest({ service: serviceType, prompt });
    setAppData(prev => ({ ...prev, results: { ...prev.results, [serviceType]: null } }));

    if (isSubscribed) {
      startAdFlow();
    } else {
      setShowSubscriptionModal(true);
    }
  }, [isSubscribed, startAdFlow]);
  
  const handleClearResult = (serviceType: ServiceType) => {
      setAppData(prev => ({...prev, results: {...prev.results, [serviceType]: null}}));
  };

  const handleSaveResult = (serviceType: ServiceType, prompt: string, result: string) => {
      const newSavedResult = {
          id: crypto.randomUUID(),
          serviceType,
          prompt,
          result,
          timestamp: new Date().toISOString(),
      };
      setAppData(prev => ({...prev, savedResults: [newSavedResult, ...prev.savedResults]}));
      // Optionally show a notification
  };


  const handleSubscribed = useCallback(() => {
    setIsSubscribed(true);
    localStorage.setItem('isUserSubscribed', 'true');
    setShowSubscriptionModal(false);
    startAdFlow();
  }, [startAdFlow]);

  const handleAdFinished = useCallback(() => {
    setShowAdModal(false);
    if (appConfig.adSettings.postAdUrl) {
      window.open(appConfig.adSettings.postAdUrl, '_blank');
    }
    fetchAiResult();
  }, [fetchAiResult, appConfig.adSettings.postAdUrl]);
  
  const handleToggleService = (serviceType: ServiceType) => {
    setActiveService(prev => (prev === serviceType ? null : serviceType));
  };
  
  if (showLogin && appConfig.login.enabled) {
    return <Login onLoginSuccess={handleLoginSuccess} onCancel={() => setShowLogin(false)} config={appConfig.login} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gradient-to-br from-gray-900 via-slate-900 to-black text-slate-800 dark:text-white font-sans p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        <Header 
          onSettingsClick={() => setIsSettingsOpen(true)} 
          onLogoClick={handleLogoClick}
          isAuthenticated={isAuthenticated}
          hasAds={appData.customAds.length > 0}
          onAdsClick={handleAdsIconClick}
        />

        {appData.customAds.length > 0 && (
          <section ref={adsSectionRef} className="mb-8 lg:mb-12">
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-white">إعلانات خاصة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {appData.customAds.map(ad => (
                <CustomAdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </section>
        )}

        <main className="flex flex-col gap-4">
          {Object.values(SERVICE_CONFIGS).map(config => (
            <ServiceCard
              key={config.type}
              config={config}
              onGenerate={handleGenerate}
              isLoading={generatingService === config.type}
              result={appData.results[config.type]}
              onClearResult={handleClearResult}
              onSaveResult={handleSaveResult}
              isActive={activeService === config.type}
              onToggle={() => handleToggleService(config.type)}
            />
          ))}
        </main>

        <footer className="text-center text-gray-500 dark:text-gray-500 py-8 mt-8 space-y-2">
          <p>
            تم التطوير بواسطة 
            <a href={appConfig.developerInfo.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition"> {appConfig.developerInfo.name} </a> 
            باستخدام واجهة Gemini API
          </p>
          <button onClick={() => setIsContactModalOpen(true)} className="text-sm text-indigo-500 dark:text-indigo-400 hover:underline">
            تواصل مع المطور
          </button>
        </footer>
      </div>

      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onSubscribed={handleSubscribed} 
        subscriptionUrl={appConfig.subscriptionUrl}
      />
      <AdModal
        isOpen={showAdModal}
        adUrl={currentAdUrl}
        onAdFinished={handleAdFinished}
        duration={appConfig.adSettings.duration}
      />
       <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        appData={appData}
        setAppData={setAppData}
        config={appConfig}
        setConfig={setAppConfig}
      />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        contactInfo={appConfig.developerInfo.contact}
        developerName={appConfig.developerInfo.name}
      />
    </div>
  );
};

export default App;