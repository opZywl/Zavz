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
      className={`group relative w-full rounded-2xl overflow-hidden border transition-all duration-fast flex flex-row h-[190px] shadow-ds ${
        isEmpty
          ? 'bg-ink-900 border-white/[0.04] hover:border-white/[0.08] cursor-default'
          : 'bg-ink-900 border-white/[0.06] hover:border-[var(--accent-500)]/30 cursor-pointer hover:shadow-[0_4px_24px_var(--accent-shadow-light)]'
      }`}
      onClick={() => !isEmpty && onAction?.(item)}
    >
      {/* Left: Image + Category Overlay */}
      <div className="relative w-[145px] shrink-0 overflow-hidden">
        {hasImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-900)]/50 to-ink-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-ink-900" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-end p-4">
          <span
            className="text-white font-black text-[18px] leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {item.category}
          </span>
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        {isEmpty ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-gray-600 font-medium tracking-wide">Coming Soon</span>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3
                  className="text-white font-bold text-[13px] leading-snug group-hover:text-[var(--accent-100)] transition-colors line-clamp-2"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {item.title}
                </h3>
                {item.date && (
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap shrink-0 mt-0.5">
                    {item.date}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3 mt-1.5 group-hover:text-gray-400 transition-colors">
                {item.description}
              </p>
            </div>

            <button
              type="button"
              className="w-full bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white text-[11px] font-bold py-2 rounded-lg transition-all duration-fast active:scale-[0.97] mt-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-400)]"
            >
              {item.linkText}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
