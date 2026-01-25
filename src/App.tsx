import { useState } from "react";
import { LayoutGrid, Settings } from "lucide-react";
import InjectorCard from "./components/InjectorCard";
import SettingsCard from "./components/SettingsCard";

const statusOptions = [
  "Waiting for process...",
  "Processo encontrado. Injetando...",
  "Injected!",
];

const App = () => {
  const [status, setStatus] = useState(statusOptions[0]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                YZY Injector v2
              </p>
              <h1 className="text-2xl font-semibold">Bem-vindo, Zywl.</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2">
            <div className="h-9 w-9 rounded-full bg-blue-500/30" />
            <div>
              <p className="text-sm font-semibold">Zywl</p>
              <p className="text-xs text-zinc-400">Microsoft</p>
            </div>
            <button
              className="ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 hover:text-blue-400"
              type="button"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <InjectorCard status={status} onStatusChange={setStatus} />
          </div>
          <div>
            <SettingsCard />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-blue-500/30 via-blue-500/10 to-zinc-900 p-6">
            <p className="text-sm text-zinc-300">Watcher Status</p>
            <p className="mt-2 text-lg font-semibold">{status}</p>
            <div className="mt-4 h-2 w-full rounded-full bg-zinc-800">
              <div className="h-full w-2/3 rounded-full bg-blue-500" />
            </div>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Minecraft Target</p>
            <p className="mt-2 text-lg font-semibold">javaw.exe</p>
            <p className="mt-1 text-xs text-zinc-500">Última verificação: 2s</p>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Injection Method</p>
            <p className="mt-2 text-lg font-semibold">Manual Map</p>
            <p className="mt-1 text-xs text-zinc-500">Configuração avançada ativa</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
