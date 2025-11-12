
import React from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onSubscribed: () => void;
  subscriptionUrl: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onSubscribed, subscriptionUrl }) => {
  if (!isOpen) return null;

  const handleSubscribeClick = () => {
    window.open(subscriptionUrl, '_blank');
    onSubscribed();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">خطوة واحدة متبقية!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          لعرض النتيجة، يرجى الاشتراك أولاً. انقر على الزر أدناه للاشتراك، وبعدها سيبدأ إعلان قصير ثم تظهر نتيجتك.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={handleSubscribeClick}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-full transition-transform duration-300 hover:scale-105"
          >
            الاشتراك والمتابعة
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;