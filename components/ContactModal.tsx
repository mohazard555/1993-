import React from 'react';
import { Mail, MessageCircle, X } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  developerName?: string;
  contactInfo?: {
    email?: string;
    whatsapp?: string;
    telegram?: string;
  };
}

// A simple brand icon for whatsapp
const WhatsAppIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.846 6.106l-1.054 3.858 3.996-1.052z"/>
    </svg>
);

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, contactInfo, developerName }) => {
    if (!isOpen) return null;

    const hasContactInfo = contactInfo && (contactInfo.email || contactInfo.whatsapp || contactInfo.telegram);

    const cleanWhatsAppNumber = (num?: string) => num?.replace(/[^0-9]/g, '') || '';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 max-w-sm w-full text-center shadow-2xl relative">
                <button onClick={onClose} className="absolute top-3 right-3 p-2 text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors" aria-label="إغلاق">
                    <X size={20} />
                </button>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">تواصل مع المطور</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {developerName ? `لديك سؤال أو اقتراح لـ ${developerName}؟` : 'لديك سؤال أو اقتراح؟'}
                </p>
                
                {hasContactInfo ? (
                    <div className="space-y-3 text-right">
                        {contactInfo?.email && (
                            <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <Mail className="w-6 h-6 text-sky-500"/>
                                <span className="font-medium text-slate-800 dark:text-white">{contactInfo.email}</span>
                            </a>
                        )}
                        {contactInfo?.whatsapp && (
                            <a href={`https://wa.me/${cleanWhatsAppNumber(contactInfo.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <WhatsAppIcon />
                                <span className="font-medium text-slate-800 dark:text-white">واتساب</span>
                            </a>
                        )}
                        {contactInfo?.telegram && (
                            <a href={`https://t.me/${contactInfo.telegram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <MessageCircle className="w-6 h-6 text-blue-500"/>
                                <span className="font-medium text-slate-800 dark:text-white">تيليجرام</span>
                            </a>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">لم يتم توفير معلومات الاتصال حاليًا.</p>
                )}
            </div>
        </div>
    );
};

export default ContactModal;
