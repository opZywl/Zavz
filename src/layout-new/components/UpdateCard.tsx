import React from 'react';

export const UpdateCard = () => {
  return (
    <div className="w-full relative h-[140px] rounded-xl overflow-hidden bg-gradient-to-r from-[var(--accent-700)] to-[var(--accent-600)] shadow-xl cursor-pointer hover:scale-[1.02] transition-all duration-300 group">
       {/* Dark overlay for contrast */}
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--accent-500-30)] via-transparent to-transparent"></div>
       
       <div className="relative p-5 flex flex-col h-full">
          <div className="flex justify-end">
              <span className="bg-[#0f0f11]/80 backdrop-blur px-2 py-1 rounded text-xs text-[var(--accent-100)] font-bold tracking-wide border border-[var(--accent-500-20)]">
                  07/02/2026
              </span>
          </div>
          
          <div className="mt-auto">
            <h2 className="text-2xl font-black text-white mb-1 tracking-tight group-hover:translate-x-1 transition-transform">ZAVZ Injector v2.1.0</h2>
            <div className="h-1 w-12 bg-white/20 rounded-full group-hover:w-full transition-all duration-700"></div>
          </div>
       </div>
    </div>
  );
};