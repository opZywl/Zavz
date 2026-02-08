interface UpdateCardProps {
  version: string;
  glowEnabled?: boolean;
}

export const UpdateCard = ({ version, glowEnabled = true }: UpdateCardProps) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className={`w-full relative h-[155px] rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--accent-600)] via-[var(--accent-700)] to-[var(--accent-900)] cursor-pointer transition-all duration-300 group ${glowEnabled ? 'shadow-[0_8px_32px_var(--accent-shadow)] hover:shadow-[0_12px_40px_var(--accent-shadow)]' : 'shadow-lg hover:shadow-xl'}`}>
       {/* Radial glow */}
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[var(--accent-500)]/30 via-transparent to-transparent"></div>
       {/* Subtle noise texture */}
       <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]"></div>

       <div className="relative p-5 flex flex-col h-full">
          {/* Date badge top-right */}
          <div className="flex justify-end">
              <span className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg text-[11px] text-white/90 font-bold tracking-wide border border-white/10">
                  {dateStr}
              </span>
          </div>

          {/* Title + Underline at bottom */}
          <div className="mt-auto">
            <h2 className="text-[22px] font-black text-white tracking-tight leading-tight group-hover:translate-x-0.5 transition-transform" style={{ fontFamily: "'Poppins', sans-serif" }}>
              ZAVZ Injector {version}
            </h2>
            <div className="h-[3px] w-14 bg-white/30 rounded-full mt-2 group-hover:w-20 transition-all duration-500"></div>
          </div>
       </div>
    </div>
  );
};
