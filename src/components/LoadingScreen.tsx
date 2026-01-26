interface LoadingScreenProps {
  active: boolean;
  title: string;
  subtitle?: string;
  status?: string;
}

const LoadingScreen = ({ active, title, subtitle, status }: LoadingScreenProps) => {
  if (!active) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-blue-500/30 shadow-lg shadow-blue-500/10">
          <span className="text-2xl font-semibold text-white">YZY</span>
        </div>
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Loading Mode</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>}

        <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-[#22d3ee] via-[#3b82f6] to-[#6366f1]" />
        </div>

        <div className="mt-4 text-xs text-zinc-500">
          {status ?? "Preparando ambiente de injeção..."}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
