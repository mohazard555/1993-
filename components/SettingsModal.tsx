import React, { useState, useEffect, useRef, useId } from 'react';
import { AppConfig, AppData, CustomAd, SavedResult } from '../types';
import { saveToGist, loadFromGist, generateText } from '../services/geminiService';
import { X, FileUp, FileDown, CloudUpload, CloudDownload, Github, Settings, Database, Save, Edit, Trash2, Image as ImageIcon, Link as LinkIcon, Menu, BookOpen, PlusCircle, Wifi, CheckCircle2, XCircle } from 'lucide-react';
import Spinner from './Spinner';

// Utility function to read file as Base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

// ==========================================
// App Config Tab
// ==========================================
const AppConfigTab: React.FC<{ config: AppConfig, setConfig: (c: AppConfig) => void }> = ({ config, setConfig }) => {
    const [localConfig, setLocalConfig] = useState<AppConfig>(config);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);
    
    const handleSave = () => {
        setSaveStatus('saving');
        setConfig(localConfig);
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const keys = name.split('.');
        
        setLocalConfig(prev => {
            const newConfig = JSON.parse(JSON.stringify(prev)); // Deep copy
            let current = newConfig;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            if (keys[keys.length -1] === 'videoUrls') {
                 current[keys[keys.length - 1]] = value.split('\n');
            } else {
                current[keys[keys.length - 1]] = type === 'checkbox' ? checked : type === 'number' ? Number(value) : value;
            }
            return newConfig;
        });
    };
    
    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await toBase64(file);
            setLocalConfig(prev => ({...prev, siteLogoUrl: base64}));
        }
    };

    const FormField: React.FC<{ name: string, label: string, value: string | number, type?: string, component?: 'textarea', rows?: number }> = ({ name, label, value, type = 'text', component = 'input', rows=3 }) => {
        const id = useId();
        const commonProps = {
            id, name, value, onChange: handleInputChange,
            className: "w-full p-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-400 dark:border-gray-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        };
        return (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
                {component === 'textarea' ? <textarea {...commonProps} rows={rows} value={value.toString()} /> : <input type={type} {...commonProps} />}
            </div>
        );
    };

    return (
        <div className="space-y-6 text-right">
            <fieldset className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                <legend className="px-2 font-bold text-lg text-slate-800 dark:text-white">الإعدادات العامة</legend>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">شعار الموقع</label>
                        <div className='flex items-center gap-4'>
                            <img src={localConfig.siteLogoUrl} alt="Logo Preview" className="w-10 h-10 rounded-md bg-gray-200 dark:bg-gray-700 p-1 object-contain" />
                            <button onClick={() => logoInputRef.current?.click()} className="flex-1 text-center p-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-400 dark:border-gray-600 rounded-lg text-slate-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">تغيير الشعار</button>
                            <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                        </div>
                    </div>
                    <FormField name="siteName" label="اسم الموقع" value={localConfig.siteName} />
                    <FormField name="subscriptionUrl" label="رابط الاشتراك" value={localConfig.subscriptionUrl} />
                </div>
            </fieldset>

            <fieldset className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                <legend className="px-2 font-bold text-lg text-slate-800 dark:text-white">إعدادات تسجيل الدخول</legend>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input id="login-enabled" type="checkbox" name="login.enabled" checked={localConfig.login.enabled} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-400 dark:border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <label htmlFor="login-enabled" className="text-sm text-gray-600 dark:text-gray-300">تفعيل شاشة تسجيل الدخول</label>
                    </div>
                    {localConfig.login.enabled && <>
                        <FormField name="login.username" label="اسم المستخدم" value={localConfig.login.username} />
                        <FormField name="login.password" label="كلمة المرور" type="password" value={localConfig.login.password} />
                    </>}
                </div>
            </fieldset>

            <fieldset className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                <legend className="px-2 font-bold text-lg text-slate-800 dark:text-white">إعدادات الإعلانات</legend>
                <div className="space-y-4">
                    <FormField name="adSettings.duration" label="مدة الإعلان (بالثواني)" type="number" value={localConfig.adSettings.duration} />
                    <FormField name="adSettings.postAdUrl" label="رابط التوجيه بعد الإعلان (اختياري)" value={localConfig.adSettings.postAdUrl || ''} />
                    <FormField name="adSettings.videoUrls" label="روابط فيديوهات الإعلانات (رابط واحد في كل سطر)" component="textarea" rows={4} value={localConfig.adSettings.videoUrls.join('\n')} />
                </div>
            </fieldset>

            <fieldset className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                <legend className="px-2 font-bold text-lg text-slate-800 dark:text-white">معلومات المطور</legend>
                <div className="space-y-4">
                    <FormField name="developerInfo.name" label="اسم المطور" value={localConfig.developerInfo.name} />
                    <FormField name="developerInfo.url" label="رابط المطور" value={localConfig.developerInfo.url} />
                </div>
            </fieldset>

            <fieldset className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                <legend className="px-2 font-bold text-lg text-slate-800 dark:text-white">معلومات تواصل المطور</legend>
                <div className="space-y-4">
                    <FormField name="developerInfo.contact.email" label="البريد الإلكتروني" type="email" value={localConfig.developerInfo.contact?.email || ''} />
                    <FormField name="developerInfo.contact.whatsapp" label="رقم واتساب (مع رمز الدولة)" value={localConfig.developerInfo.contact?.whatsapp || ''} />
                    <FormField name="developerInfo.contact.telegram" label="معرف تيليجرام (بدون @)" value={localConfig.developerInfo.contact?.telegram || ''} />
                </div>
            </fieldset>


            <div className="pt-4 flex justify-end">
                <button onClick={handleSave} className="flex items-center justify-center gap-2 w-40 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-full transition disabled:bg-indigo-800">
                    {saveStatus === 'saving' ? <Spinner /> : saveStatus === 'saved' ? 'تم الحفظ!' : <><Save size={20} /> حفظ الإعدادات</>}
                </button>
            </div>
        </div>
    );
};

// ==========================================
// Content Management Tab
// ==========================================
const ContentManagementTab: React.FC<{ appData: AppData, setAppData: React.Dispatch<React.SetStateAction<AppData>> }> = ({ appData, setAppData }) => {
    const [adForm, setAdForm] = useState<Omit<CustomAd, 'id'>>({ name: '', description: '', link: '', image: '' });
    const adImageInputRef = useRef<HTMLInputElement>(null);

    const handleAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await toBase64(file);
            setAdForm(prev => ({ ...prev, image: base64 }));
        }
    };
    
    const handleAdSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adForm.name || !adForm.image) {
            alert("اسم الإعلان والصورة مطلوبان.");
            return;
        }
        const newAd: CustomAd = { ...adForm, id: crypto.randomUUID() };
        setAppData(prev => ({...prev, customAds: [...prev.customAds, newAd]}));
        setAdForm({ name: '', description: '', link: '', image: '' });
    };
    
    const deleteAd = (id: string) => {
        setAppData(prev => ({...prev, customAds: prev.customAds.filter(ad => ad.id !== id)}));
    };
    
    const deleteSavedResult = (id: string) => {
        setAppData(prev => ({...prev, savedResults: prev.savedResults.filter(r => r.id !== id)}));
    };
    
    const inputClasses = "w-full p-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-400 dark:border-gray-600 rounded-lg text-slate-800 dark:text-white";

    return (
        <div className="space-y-8">
            {/* Custom Ads Management */}
            <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Menu /> إدارة الإعلانات المخصصة</h3>
                <form onSubmit={handleAdSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input type="text" placeholder="اسم الإعلان" value={adForm.name} onChange={e => setAdForm(prev => ({...prev, name: e.target.value}))} className={inputClasses} required/>
                    <input type="text" placeholder="وصف الإعلان" value={adForm.description} onChange={e => setAdForm(prev => ({...prev, description: e.target.value}))} className={inputClasses}/>
                    <input type="url" placeholder="رابط الإعلان" value={adForm.link} onChange={e => setAdForm(prev => ({...prev, link: e.target.value}))} className={inputClasses}/>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => adImageInputRef.current?.click()} className="flex-1 text-center p-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-400 dark:border-gray-600 rounded-lg text-slate-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">{adForm.image ? "تغيير الصورة" : "رفع صورة"}</button>
                        {adForm.image && <img src={adForm.image} alt="preview" className="w-10 h-10 rounded-md" />}
                    </div>
                    <input type="file" ref={adImageInputRef} onChange={handleAdImageUpload} accept="image/*" className="hidden" />
                    <button type="submit" className="md:col-span-2 flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-full transition"><PlusCircle size={20} /> إضافة إعلان</button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {appData.customAds.map(ad => (
                        <div key={ad.id} className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-md">
                            <div className="flex items-center gap-3">
                                <img src={ad.image} alt={ad.name} className="w-8 h-8 rounded-sm object-cover" />
                                <span className="text-slate-800 dark:text-white">{ad.name}</span>
                            </div>
                            <button onClick={() => deleteAd(ad.id)} className="p-1 text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Saved Results Management */}
             <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><BookOpen /> النتائج المحفوظة</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {appData.savedResults.length > 0 ? appData.savedResults.map(item => (
                        <div key={item.id} className="bg-black/5 dark:bg-white/5 p-3 rounded-lg">
                           <div className="flex justify-between items-start">
                             <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap flex-1">{item.result.substring(0, 100)}...</p>
                             <button onClick={() => deleteSavedResult(item.id)} className="p-1 text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300"><Trash2 size={16}/></button>
                           </div>
                           <p className="text-xs text-gray-500 mt-2">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                    )) : <p className="text-gray-500 dark:text-gray-400 text-center">لا توجد نتائج محفوظة.</p>}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// Data Sync & Backup Tab
// ==========================================
interface DataManagementTabProps {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  publicGistUrl: string;
}

const DataManagementTab: React.FC<DataManagementTabProps> = ({ appData, setAppData, publicGistUrl }) => {
  const [token, setToken] = useState(localStorage.getItem('githubToken') || '');
  const [syncStatus, setSyncStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [testStatus, setTestStatus] = useState<{ state: 'idle' | 'loading' | 'success' | 'error', message: string }>({ state: 'idle', message: ''});


  useEffect(() => {
    localStorage.setItem('githubToken', token);
  }, [token]);
  
  const handleApiTest = async () => {
    setTestStatus({ state: 'loading', message: '' });
    try {
        await generateText("مرحبا"); // Simple prompt to test connectivity
        setTestStatus({ state: 'success', message: 'نجاح الاتصال! الخدمة تعمل بشكل جيد.' });
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : String(error);
        setTestStatus({ state: 'error', message: `فشل الاتصال: ${errorMessage}` });
    }
  };

  const handleSync = async (action: 'save' | 'load') => {
    if (!publicGistUrl || !token) {
      setSyncStatus({ type: 'error', message: publicGistUrl ? 'يرجى إدخال رمز GitHub.' : 'لم يتم تكوين رابط Gist في التطبيق.' });
      return;
    }
    setSyncStatus({ type: 'loading', message: action === 'save' ? 'جارٍ الحفظ...' : 'جارٍ التحميل...' });
    try {
      if (action === 'save') {
        await saveToGist(publicGistUrl, token, appData);
        setSyncStatus({ type: 'success', message: 'تم الحفظ بنجاح!' });
      } else {
        const data = await loadFromGist(publicGistUrl, token);
        setAppData(data);
        setSyncStatus({ type: 'success', message: 'تم التحميل بنجاح!' });
      }
    } catch (error) {
      console.error(error);
      setSyncStatus({ type: 'error', message: (error as Error).message });
    } finally {
      setTimeout(() => setSyncStatus({ type: 'idle', message: '' }), 3000);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = 'ai-text-app-data.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        const importedData = JSON.parse(text as string);
        setAppData(importedData);
      } catch (error) {
        alert('ملف JSON غير صالح.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-black/10 dark:border-white/10 mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2"><Github /> المزامنة عبر Gist</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">احفظ بياناتك (الإعلانات، ...) على GitHub Gist لمشاركتها مع جميع المستخدمين.</p>
        
        {publicGistUrl ? (
            <div className="mb-4 p-3 bg-black/5 dark:bg-white/10 rounded-lg text-sm text-center text-gray-600 dark:text-gray-300">
                <p>
                    <strong>Gist المستهدف للمزامنة:</strong>
                    <span className="block break-all font-mono text-xs mt-1" dir="ltr">{publicGistUrl}</span>
                </p>
            </div>
        ) : (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg text-sm text-center text-yellow-800 dark:text-yellow-200">
                <p><strong>تنبيه:</strong> لم يتم تكوين رابط Gist في كود التطبيق. المزامنة معطلة.</p>
            </div>
        )}

        <div className="space-y-4">
            <input type="password" placeholder="GitHub Personal Access Token" value={token} onChange={e => setToken(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-400 dark:border-gray-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400" />
            <div className="flex flex-col md:flex-row gap-3">
                <button onClick={() => handleSync('save')} disabled={syncStatus.type === 'loading' || !publicGistUrl} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-full transition disabled:bg-gray-500">
                {syncStatus.type === 'loading' ? <Spinner /> : <><CloudUpload size={20} /> حفظ إلى Gist</>}
                </button>
                <button onClick={() => handleSync('load')} disabled={syncStatus.type === 'loading' || !publicGistUrl} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-full transition disabled:bg-gray-500">
                {syncStatus.type === 'loading' ? <Spinner /> : <><CloudDownload size={20} /> تحميل من Gist</>}
                </button>
            </div>
        </div>

        {syncStatus.type !== 'idle' && (
          <div className={`mt-4 text-center p-2 rounded-lg text-sm ${syncStatus.type === 'success' ? 'bg-green-500/20 text-green-300' : syncStatus.type === 'error' ? 'bg-red-500/20 text-red-300' : 'hidden'}`}>
            {syncStatus.message}
          </div>
        )}
      </div>

      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-black/10 dark:border-white/10 mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Wifi /> تشخيص الاتصال</h3>
        <button onClick={handleApiTest} disabled={testStatus.state === 'loading'} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-full transition disabled:bg-purple-800">
           {testStatus.state === 'loading' ? <Spinner /> : 'اختبار اتصال API'}
        </button>
        {(testStatus.state === 'success' || testStatus.state === 'error') && (
            <div className={`mt-4 p-3 rounded-xl ${
                testStatus.state === 'success' 
                ? 'bg-green-100 dark:bg-emerald-800' 
                : 'bg-red-100 dark:bg-red-800'
            }`}>
                <div className="flex items-center justify-center gap-2">
                    {testStatus.state === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-emerald-300" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
                    )}
                    <p className={`font-medium text-sm text-center ${
                        testStatus.state === 'success' 
                        ? 'text-green-900 dark:text-emerald-100' 
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                        {testStatus.message}
                    </p>
                </div>
            </div>
        )}
      </div>

      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-black/10 dark:border-white/10">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">النسخ الاحتياطي المحلي</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-full transition">
            <FileUp size={20} /> تصدير JSON
          </button>
          <button onClick={handleImportClick} className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-full transition">
            <FileDown size={20} /> استيراد JSON
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
        </div>
      </div>
    </>
  );
}


// ==========================================
// Main Modal Component
// ==========================================
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  config: AppConfig;
  setConfig: (c: AppConfig) => void;
  publicGistUrl: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, appData, setAppData, config, setConfig, publicGistUrl }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'content' | 'data'>('config');

  if (!isOpen) return null;

  type TabId = 'config' | 'content' | 'data';

  const TabButton: React.FC<{tabId: TabId, icon: React.ReactNode, children: React.ReactNode}> = ({tabId, icon, children}) => (
     <button onClick={() => setActiveTab(tabId)} className={`flex-1 flex items-center justify-center gap-2 p-3 font-bold rounded-t-lg transition-colors ${activeTab === tabId ? 'bg-gray-200/80 dark:bg-gray-700/80 text-slate-800 dark:text-white' : 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}>
        {icon}{children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl max-w-3xl w-full shadow-2xl relative max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">الإعدادات</h2>
            <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors" aria-label="إغلاق">
                <X className="w-6 h-6 text-slate-800 dark:text-white" />
            </button>
        </header>

        <div className="flex border-b border-black/10 dark:border-white/10">
            <TabButton tabId="config" icon={<Settings />}>إعدادات التطبيق</TabButton>
            <TabButton tabId="content" icon={<Menu />}>إدارة المحتوى</TabButton>
            <TabButton tabId="data" icon={<Database />}>المزامنة والنسخ الاحتياطي</TabButton>
        </div>
        
        <div className="p-6 overflow-y-auto">
            {activeTab === 'config' && <AppConfigTab config={config} setConfig={setConfig} />}
            {activeTab === 'content' && <ContentManagementTab appData={appData} setAppData={setAppData} />}
            {activeTab === 'data' && <DataManagementTab appData={appData} setAppData={setAppData} publicGistUrl={publicGistUrl} />}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;