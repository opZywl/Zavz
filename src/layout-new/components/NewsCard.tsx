import React from 'react';
import { Shield, Palette, Globe, Zap, Fingerprint, Layout } from 'lucide-react';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  imageUrl?: string;
  linkText: string;
}

interface NewsCardProps {
  item: NewsItem;
  onAction?: (item: NewsItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, onAction }) => {
  
  // Helper to render icon based on category/id
  const getIcon = () => {
    switch (item.category) {
      case 'Security':
      case 'Protection':
        return <Fingerprint size={24} className="text-[var(--accent-400)]" />;
      case 'Interface':
        return <Palette size={24} className="text-[var(--accent-400)]" />;
      case 'Proxy':
        return <Globe size={24} className="text-[var(--accent-400)]" />;
      case 'Alts':
      case 'Marketplace':
        return <Zap size={24} className="text-[var(--accent-400)]" />;
      case 'Website':
      case 'Platform':
        return <Layout size={24} className="text-[var(--accent-400)]" />;
      default:
        return <Shield size={24} className="text-[var(--accent-400)]" />;
    }
  };

  return (
    <div 
      className="group relative w-full h-full min-h-[180px] rounded-xl overflow-hidden bg-[#18181b] border border-white/5 hover:border-[var(--accent-500)] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_20px_var(--accent-shadow-light)]"
      onClick={() => {
        if (onAction) {
            onAction(item);
        }
      }}
    >
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-20"
        style={{ backgroundImage: `url(${item.imageUrl})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/80 to-transparent" />

      {/* Content Container */}
      <div className="relative h-full p-5 flex flex-col justify-between z-10">
        
        {/* Top Row: Category Icon & Date */}
        <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
                 <div className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-[var(--accent-500-20)] group-hover:border-[var(--accent-500-30)] transition-colors">
                    {getIcon()}
                 </div>
                 <span className="text-xs font-bold text-gray-400 group-hover:text-[var(--accent-400)] transition-colors mt-1 ml-1">
                    {item.category}
                 </span>
            </div>
            <span className="text-[10px] font-mono text-gray-500 bg-black/40 px-2 py-1 rounded border border-white/5">
                {item.date}
            </span>
        </div>

        {/* Bottom Row: Title, Desc, Button */}
        <div className="space-y-3 mt-2">
            <div>
                <h3 className="text-white font-bold text-base leading-tight group-hover:text-[var(--accent-100)] transition-colors">
                    {item.title}
                </h3>
                <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mt-1 group-hover:text-gray-300">
                    {item.description}
                </p>
            </div>
            
            <button 
              className="w-full bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white text-xs font-bold py-2 rounded transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
                {item.linkText}
            </button>
        </div>
      </div>
    </div>
  );
};