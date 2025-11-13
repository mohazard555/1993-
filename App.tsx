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

// ==========================================
// PUBLIC GIST CONFIGURATION
// ==========================================
// The user should replace the empty string with their public Gist's "Raw" URL.
// IMPORTANT: The Gist content should be a JSON object with a structure similar to AppData.
// Example URL: 'https://gist.githubusercontent.com/username/gistid/raw/filename.json'
export const PUBLIC_GIST_RAW_URL = 'https://gist.githubusercontent.com/mohazard555/2dddbc12618c36beaf6e03bbcf7331c8/raw/ce16b2c93002f2c290f5815e4c235206a1ceb735/samproai-data.json'; 


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
  siteLogoUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pbllNaW4gbWVldCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjM2I4MmY2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOGI1ODkzIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZmlsbD0idXJsKCNncmFkKSIgZD0iTTEyOCAwQzU3LjMxMiAwIDAgNTcuMzEyIDAgMTI4czU3LjMxMiAxMjggMTI4IDEyOGMxNS45ODQgMCAzMS4xMjUtMi44NjcgNDUuMjgxLTguMjY2TDE2MC4xNTYgMTkzYy05LjA4NiA0LjA2My0xOS4yNjUgNi4zMTMtMjkuODkxIDYuMzEzLTM4LjM1OCAwLTY5LjQzOC0zMS4wOC02OS40MzgtNjkuNDM4cy0zMS4wOC02OS40MzcgNjkuNDM4LTY5LjQzN0M5OC40MSA2MC40MzggODUuMjUgNzEuMjY1IDc4LjcxOCA4NS4xODdsMTguMTg4IDMxLjUwMWMzLjY2NC03LjYwMiA5LjY0MS0xMy41ODIgMTcuMjQyLTE3LjI0MmwzMS41LTE4LjE4OEMxNDEuMjY1IDcyLjQ0MSAxMjguNDI2IDYwLjQzNyAxMTIgNjAuNDM3Yy0zNC4wMDggMC02MS41NDcgMjcuNTM5LTYxLjU0NyA2MS41NDdzMjcuNTM5IDYxLjU0NyA2MS41NDcgNjEuNTQ3YzE2LjM1MiAwIDMxLjA5NC02LjM1MiA0MS45ODQtMTYuNzVsMTcuNjg4IDI5LjUyM0MxNTcuMjY1IDIxNS4yMSA3IDE5Ni41NiAyMjguMzI4IDE3My4yNjYgMjQzLjE0IDU4LjQ0MSAxNzMuMjY1IDI4LjM1MiAxMjggMHptNzAuOTg0IDEwMS40NTNjLTguOTYgNS4xNjQtMTYuMjgxIDEyLjQ4NC0yMS40NDEgMjEuNDQxbC0xNC40MjItMjUuMDA0Yy43MDMtLjQyMiAxLjQxNC0uODI4IDIuMTE3LTEuMjg5IDguODMyLTUuMTAyIDE5LjUyMy02LjUwOCAzMC4zMDQtMy45NDUgMTAuNzY2IDIuNTU5IDE5LjM5OCA5Ljk2MSAyMy40MDYgMTkuODk4IDQuMDEyIDkuOTM4IDIuODggMjEuMTgtMy4zNTIgMzAuMTE3bC0yNS4wMDQgMTQuNDIxYy04Ljk2IDUuMTY0LTE5Ljc5NyA2LjM1Mi0zMC4xMTcgMy4zNTItOS45MzgtNC4wMDgtMTcuMzQ4LTEyLjYzMy0xOS44OTgtMjMuNDA2bC0zNi4yMzQgMjAuOTE4YzEyLjg3NSAyMi4zMDggMzcuNTM5IDMxLjgxMiA2MC40MjIgMjIuNTk0IDIyLjg4My05LjIyMyAzNi4wMzEtMzIuNzE0IDI5LjYwMi01Ni4xNDRjLTYuNDItMjMuNDMxLTI5LjkxNC0zNi41NzgtNTMuMzM2LTMwLjE1OCAxLjYwMi0yLjc3MyAzLjQyMi01LjQyNiA1LjQzLTcuOTc3bDI4LjEyNS00OC43MTFjNS42NTYgOS43OTcgOC42NzIgMjAuODYzIDguNjcyIDMyLjQ1MyAwIDUuOTY1LS44MjQgMTEuNzUtMi4zNTIgMTcuMjY2em0tOTUuODMyIDQuMjY2YzAtMTMuNDAzIDQuNDE0LTI2LjA0NyAxMi4xNzItMzYuMjM0bDIwLjkxOCAzNi4yMzRjLTkuMjE5IDIyLjg4My0zMi43MTUgMzYuMDMxLTU2LjE0NSAyOS42MDItMjMuNDMtNi40MjYtMzYuNTc4LTI5LjkxOC0zMC4xNTYtNTMuMzQ4IDYuNDItMjMuNDMgMjkuOTItMzYuNTc4IDUzLjM0OC0zMC4xNTYgMi43NzMgMS42MDUgNS40MjYgMy40MjIgNy45NzcgNS40M2wtNDguNzE5IDI4LjEyNWM5Ljc5NyA1LjY1NiAyMC44NjMgOC42NjggMzIuNDUzIDguNjY4IDUuOTY1IDAgMTEuNzUtLjgyIDE3LjI2Ni0yLjM1MmwtMjIuNDg0IDM4Ljk1M0M3NC44MTIgMTYyLjI1IDYyLjYwOSAxNDkuNSA2Mi4xMDkgMTMyLjk2OXptNTIuNTMxIDE4LjUyM2MtOS44MzYgNS42ODgtMTYuNzUgMTUuODEtMTYuNzUgMjcuNDUzIDAgMTcuMjgxIDEzLjk2OSAzMS4yNSAzMS4yNSAzMS4yNSAxMS42NDEgMCAyMS43NjYtNi45MTQgMjcuNDUzLTE2Ljc1bC0yMC45MjItMzYuMjMyYy0zLjc4MS02LjU0My0xMC41NDctMTEuMDc0LTE4LjQyNi0xMS4wNzQtLjExMyAwLS4yMjcuMDEyLS4zNC4wMDRsLTQuMDMxIDIyLjAyYy0uNDQ5IDIuNDQxLTEuNzc3IDQuNTY2LTMuNzU0IDUuOTE4em00NS4xNzIgMzYuNjA1Yy0xLjM1NSAyLjM0OC0zLjIzIDQuMjUtNS40MyA1Ljc0Mmw0OC43MTkgMjguMTI5Yy0zLjQ0NS01Ljg3NS02LjI0Mi0xMi4wNzQtOC4yOTctMTguNTQzTDE2MC4zMTIgMTg4LjE0NHptLTM3LjQ4NC02NC44NjdjLS41MTIgMC0xLjAyMy4wNy0xLjUyMy4yMDNsMjIuMDIzIDQuMDM1Yy4yMTUtLjExMy40My0uMjE1LjY0MS0uMzQ0IDYuNTQzLTMuNzggMTEuMDc0LTEwLjU0NyAxMS4wNzQtMTguNDI2IDAtLjExMy0uMDEyLS4yMjctLjAwNC0uMzM2bC0zNi4yMzQtMjAuOTIxYy01LjY4OC05LjgzNi0xNS44MTItMTYuNzUtMjcuNDUzLTE2Ljc1cy0yMS43NjYgNi45MTQtMjcuNDUzIDE2Ljc1Yy01LjY4OCA5LjgzMi02LjkxNCAyMS43NjYtMi44OTEgMzIuMzU5bDM4Ljk1My0yMi40ODRjLTYuMDM1LTEuOTY1LTEyLjQwMi0yLjk2NS0xOC45MDYtMi45NjUtMTMuNDAzIDAtMjYuMDQ3IDQuNDE4LTM2LjIzNCAxMi4xNzJsMzYuMjM0IDIwLjkxOGM5LjIyMyAyMi44ODcgMzIuNzE1IDIwLjYxNCA1Ni4xNDUgMjkuNjA1IDIyLjg4MyA2LjQyNiAzNC4xNDgtMjkuOTE0IDMwLjE1Mi01My4zNDQtNi40MjItMjMuNDI2LTI5LjkyMi0zNi41NzQtNTMuMzQ0LTMwLjE1Mi0xLjU5OCAyLjc3My0zLjQxOCAxMS4zMjgtNS40MjYgNy45NzdMNDMuMTg3IDExMy44MmMtNS42NTYtOS43OTctOC42NjgtMjAuODYzLTguNjY4LTMyLjQ1MiwgMC01Ljk2NS44MjQtMTEuNzUgMi4zNTItMTcuMjY2bDIyLjQ4NCAzOC45NTNDODIuNzM0IDk0LjI4MSA5NC45MzcgMTA3IDExMi41IDEwN2M2LjUwNCAwIDEyLjkxOC0xLjA0MyAxOC45MDYtMi45NjVsLTIwLjkxOCAzNi4yMzRjNS42ODggOS44MzYgMTUuODEgOS43NSAyNy40NTMgMTYuNzV6Ii8+PC9zdmc+",
  siteName: "ذكاء النصوص AI",
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
  siteLogoUrl: string;
  siteName: string;
}> = ({ onSettingsClick, onLogoClick, isAuthenticated, hasAds, onAdsClick, siteLogoUrl, siteName }) => (
    <header className="text-center py-8 md:py-12 relative">
    <ThemeToggle />
     <div onClick={onLogoClick} className="inline-flex flex-col items-center gap-2 cursor-pointer select-none">
        <img src={siteLogoUrl} alt="Logo" className="h-16 md:h-20 w-auto" />
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">{siteName}</h1>
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
  const [showSaveNotification, setShowSaveNotification] = useState<boolean>(false);
  
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

  // Effect to fetch public data from Gist on startup
  useEffect(() => {
    const fetchAndMergePublicData = async () => {
      // Only run if the URL has been configured by the developer.
      if (!PUBLIC_GIST_RAW_URL || PUBLIC_GIST_RAW_URL.trim() === '') {
          console.info("Public Gist URL is not configured. App will use local data only.");
          return;
      }

      try {
        // Fetch the latest data from the public Gist. 'no-store' is a good practice,
        // and appending a timestamp query param ("cache-busting") ensures that
        // we bypass any intermediate caches (like CDNs) and get the absolute latest data.
        const cacheBustedUrl = `${PUBLIC_GIST_RAW_URL.split('?')[0]}?_=${new Date().getTime()}`;
        const response = await fetch(cacheBustedUrl, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Gist fetch failed with status: ${response.status}`);
        }
        const gistData = await response.json();

        // The Gist is the single source of truth for shared/public data.
        // We merge it carefully to avoid overwriting user-specific local data.
        setAppData(currentLocalData => ({
          ...currentLocalData, // Retains user's local 'results' and 'savedResults'.
          customAds: gistData.customAds || [], // Overwrites ads with the version from the Gist.
        }));

      } catch (error) {
        console.error('Failed to load or process public data from Gist. The app will continue with local data.', error);
        // Optional: show a toast/notification to the user about the failure.
      }
    };

    fetchAndMergePublicData();
  }, []); // The empty dependency array ensures this runs only once when the app starts.

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
        // Attempt to parse a more specific error message from the API response
        try {
            // Check for our custom "not found" error first
            if (error.message.includes("AI API Key not found")) {
                errorMessage = 'خطأ في الإعدادات: مفتاح API للذكاء الاصطناعي غير موجود. يرجى مراجعة المسؤول.';
                return; // Early return
            }

            // Look for a JSON string within the error message
            const jsonMatch = error.message.match(/\{.*\}/s);
            if (jsonMatch) {
                const errorObj = JSON.parse(jsonMatch[0]);
                const apiError = errorObj.error || errorObj;
                const code = apiError.code || 'N/A';
                let msg = apiError.message || 'No specific message.';

                // Make specific error messages more user-friendly
                if (msg.includes("API key not valid")) {
                  msg = "مفتاح API المستخدم غير صالح. يرجى التحقق منه في الإعدادات.";
                } else if (code === 503 || msg.toLowerCase().includes('overloaded')) {
                  msg = "النموذج перевантажений حاليًا. يرجى المحاولة مرة أخرى بعد قليل.";
                }

                errorMessage = `فشل الاتصال بالخدمة (خطأ ${code}): ${msg}`;
            } else if (error.message.includes('API Key') || error.message.includes('entity was not found')) {
                 errorMessage = 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً. قد يكون مفتاح API غير صالح أو أن الخدمة محظورة.';
            } else {
                 errorMessage = `عذراً، حدث خطأ غير متوقع: ${error.message}`;
            }
        } catch (parseError) {
             errorMessage = `عذراً، حدث خطأ غير متوقع: ${error.message}`;
        }
      }
      setAppData(prev => ({...prev, results: { ...prev.results, [service]: errorMessage }}));
    } finally {
      setGeneratingService(null);
    }
  }, [generationRequest]);

  const handleAdFinished = useCallback(() => {
    setShowAdModal(false);
    const postUrl = appConfig.adSettings.postAdUrl;
    // FIX: Add a `typeof` check to ensure `postUrl` is a string before calling `.trim()`.
    // This prevents runtime errors if the value from localStorage is not a string and resolves the TS error.
    if (typeof postUrl === 'string' && postUrl.trim()) {
        let url = postUrl.trim();
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }
        try {
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            if (!newWindow) {
                console.warn('Popup blocked or failed to open.');
            }
        } catch (e) {
            console.error("Error opening post-ad URL:", e);
        }
    }
    fetchAiResult();
  }, [fetchAiResult, appConfig]);

  const startAdFlow = useCallback(() => {
    if(appConfig.adSettings.videoUrls.length === 0 || appConfig.adSettings.videoUrls[0] === '') {
        handleAdFinished();
        return;
    }
    const randomAdUrl = appConfig.adSettings.videoUrls[Math.floor(Math.random() * appConfig.adSettings.videoUrls.length)];
    setCurrentAdUrl(randomAdUrl);
    setShowAdModal(true);
  }, [appConfig, handleAdFinished]);

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

  const handleSaveResult = useCallback((serviceType: ServiceType, prompt: string, result: string) => {
      try {
        const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const serviceTitle = SERVICE_CONFIGS[serviceType].title.replace(/[\s\/]/g, '_');
        const date = new Date().toISOString().split('T')[0];
        link.download = `نتيجة_${serviceTitle}_${date}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
          console.error("File download failed:", error);
          alert("فشل تحميل الملف.");
      }

      const newSavedResult = {
          id: crypto.randomUUID(),
          serviceType,
          prompt,
          result,
          timestamp: new Date().toISOString(),
      };
      setAppData(prev => ({...prev, savedResults: [newSavedResult, ...prev.savedResults]}));
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 2500);
  }, []);


  const handleSubscribed = useCallback(() => {
    setIsSubscribed(true);
    localStorage.setItem('isUserSubscribed', 'true');
    setShowSubscriptionModal(false);
    startAdFlow();
  }, [startAdFlow]);
  
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
          siteLogoUrl={appConfig.siteLogoUrl}
          siteName={appConfig.siteName}
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
        publicGistUrl={PUBLIC_GIST_RAW_URL}
      />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        contactInfo={appConfig.developerInfo.contact}
        developerName={appConfig.developerInfo.name}
      />
      {showSaveNotification && (
          <div className="fixed bottom-5 right-5 bg-green-600 text-white py-3 px-5 rounded-xl shadow-lg z-[100] animate-pulse">
              👍 تم حفظ النتيجة بنجاح!
          </div>
      )}
    </div>
  );
};

export default App;