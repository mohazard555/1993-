import React from 'react';
import { CustomAd } from '../types';
import { ExternalLink } from 'lucide-react';

interface CustomAdCardProps {
  ad: CustomAd;
}

const CustomAdCard: React.FC<CustomAdCardProps> = ({ ad }) => {
  return (
    <a 
      href={ad.link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 border border-black/10 dark:border-white/10"
    >
      <div className="relative">
        <img src={ad.image} alt={ad.name} className="w-full h-32 object-cover" />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
        <ExternalLink className="absolute top-2 right-2 w-5 h-5 text-white/70 group-hover:text-white transition-opacity" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 dark:text-white truncate">{ad.name}</h3>
        {ad.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{ad.description}</p>}
      </div>
    </a>
  );
};

export default CustomAdCard;