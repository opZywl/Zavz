import React from 'react';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  imageUrl?: string;
  linkText: string;
  url?: string;
}

interface NewsCardProps {
  item: NewsItem;
  onAction?: (item: NewsItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, onAction }) => {
  return (
    <div
      className="group relative w-full rounded-xl overflow-hidden bg-[#131316] border border-white/5 hover:border-[var(--accent-500)]/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_20px_var(--accent-shadow-light)] flex flex-row h-[180px]"
      onClick={() => onAction?.(item)}
    >
      {/* Left: Image + Category Overlay */}
      <div className="relative w-[140px] shrink-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${item.imageUrl})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/60 to-[#131316]" />
        {/* Category text */}
        <div className="absolute inset-0 flex items-end p-4">
          <span className="text-white font-black text-lg leading-tight drop-shadow-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {item.category}
          </span>
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        {/* Top: Title + Date */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-bold text-sm leading-tight group-hover:text-[var(--accent-100)] transition-colors line-clamp-2">
              {item.title}
            </h3>
            <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap shrink-0 mt-0.5">
              {item.date}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3 mt-2 group-hover:text-gray-300 transition-colors">
            {item.description}
          </p>
        </div>

        {/* Bottom: Button */}
        <button className="w-full bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white text-xs font-bold py-2 rounded-lg transition-all shadow-md active:scale-95 mt-3">
          {item.linkText}
        </button>
      </div>
    </div>
  );
};
