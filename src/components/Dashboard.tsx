import { ReactNode } from 'react';
import { Activity, Shield } from 'lucide-react';

interface DashboardProps {
  children: ReactNode;
  status: string;
  watcherActive: boolean;
  injectionMethod: string;
  target: string;
}

const Dashboard = ({
  children,
  status,
  watcherActive,
  injectionMethod,
  target,
}: DashboardProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(70,119,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.05),transparent_50%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-blue-500/20 shadow-lg shadow-accent/20">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
                    YZY INJECTOR
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Painel de Injeção Profissional
                  </h1>
                </div>
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                Controle total do injetor, com status em tempo real e modo watcher automático.
              </p>
            </div>

            {/* Status Card */}
            <div className="glass flex min-w-[280px] items-center gap-4 rounded-2xl border border-zinc-800 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-blue-500/20">
                <Activity
                  className={`h-5 w-5 ${
                    watcherActive ? 'animate-pulse text-green-400' : 'text-accent'
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-zinc-500">Status do Sistema</p>
                <p className="text-sm font-semibold text-white">{status}</p>
              </div>
              {watcherActive && (
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              )}
            </div>
          </div>

          {/* Info Pills */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs">
              <span className="text-zinc-500">Alvo:</span>{' '}
              <span className="font-semibold text-accent">{target}</span>
            </div>
            <div className="rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs">
              <span className="text-zinc-500">Método:</span>{' '}
              <span className="font-semibold text-white">{injectionMethod}</span>
            </div>
            <div className="rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs">
              <span className="text-zinc-500">Watcher:</span>{' '}
              <span
                className={`font-semibold ${
                  watcherActive ? 'text-green-400' : 'text-zinc-400'
                }`}
              >
                {watcherActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <main className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <span>YZY Injector v2.0.0</span>
            </div>
            <div className="flex gap-6">
              <a
                href="https://github.com/opZywl"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-accent"
              >
                GitHub
              </a>
              <span className="text-zinc-700">•</span>
              <span>Made with 💙 by opZywl</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
