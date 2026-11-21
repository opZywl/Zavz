interface UpdateCardProps {
  version: string;
  glowEnabled?: boolean;
}

export const UpdateCard = ({ version, glowEnabled = true }: UpdateCardProps) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      className={`w-full relative h-[155px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group border border-white/[0.08] bg-ink-900 ${glowEnabled ? 'shadow-[0_8px_32px_var(--accent-shadow)] hover:shadow-[0_12px_40px_var(--accent-shadow)]' : 'shadow-ds hover:shadow-ds-md'}`}
    >
      {/* Portfolio-style: monochrome base + selective purple wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-700)]/35 via-transparent to-transparent" />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--accent-500)]/15 blur-2xl" />
      <div className="absolute inset-0 shadow-ds-inset pointer-events-none" />

      <div className="relative p-5 flex flex-col h-full">
        <div className="flex justify-end">
          <span className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg text-[11px] text-white/90 font-bold tracking-wide border border-white/10">
            {dateStr}
          </span>
        </div>

        <div className="mt-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper-300 mb-1">
            Release
          </p>
          <h2
            className="text-[22px] font-black text-white tracking-tight leading-tight group-hover:translate-x-0.5 transition-transform"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Injector {version}
          </h2>
          <div className="h-[3px] w-14 bg-[var(--accent-500)]/70 rounded-full mt-2 group-hover:w-20 transition-all duration-500" />
        </div>
      </div>
    </div>
  );
};
