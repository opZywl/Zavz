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
  const isEmpty = !item.title && !item.description;
  const hasImage = !!item.imageUrl;

  return (
    <div
      className={`group relative w-full rounded-xl overflow-hidden border transition-all duration-300 shadow-lg flex flex-row h-[170px] ${
        isEmpty
          ? 'bg-[#131316]/60 border-white/[0.03] cursor-default'
          : 'bg-[#131316] border-white/5 hover:border-[var(--accent-500)]/40 cursor-pointer hover:shadow-[0_0_20px_var(--accent-shadow-light)]'
      }`}
      onClick={() => !isEmpty && onAction?.(item)}
    >
      {/* Left: Image + Category Overlay */}
      <div className="relative w-[130px] shrink-0 overflow-hidden">
        {hasImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-900)] to-[#0a0a0c]" />
        )}
        {/* Gradient fade into content */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#131316]" />
        <div className="absolute inset-0 bg-black/30" />
        {/* Category badge */}
        <div className="absolute inset-0 flex items-end p-3">
          <span
            className="text-white font-black text-base leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {item.category}
          </span>
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white/20" />
            </div>
            <span className="text-xs text-gray-600 font-medium">Coming Soon</span>
          </div>
        ) : (
          <>
            {/* Top: Title + Date */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-white font-bold text-[13px] leading-snug group-hover:text-[var(--accent-100)] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.date && (
                  <span className="text-[9px] text-gray-500 font-mono whitespace-nowrap shrink-0 mt-0.5 bg-white/5 px-1.5 py-0.5 rounded">
                    {item.date}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3 mt-1.5 group-hover:text-gray-300 transition-colors">
                {item.description}
              </p>
            </div>

            {/* Bottom: Action Button */}
            <button className="w-full bg-white/[0.06] hover:bg-[var(--accent-600)] text-gray-300 hover:text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-95 mt-2 border border-white/5 hover:border-transparent">
              {item.linkText}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
