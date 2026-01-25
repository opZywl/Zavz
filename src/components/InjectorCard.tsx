import { useMemo, useRef } from "react";
import {
  FileInput,
  FolderOpen,
  Power,
  SwitchCamera,
  Terminal,
} from "lucide-react";

interface InjectorCardProps {
  status: string;
  target: string;
  customTarget: boolean;
  dllPath: string;
  watcherEnabled: boolean;
  onTargetChange: (value: string) => void;
  onCustomTargetChange: (value: boolean) => void;
  onDllPathChange: (value: string) => void;
  onInject: () => void;
  onWatcherToggle: () => void;
}

const InjectorCard = ({
  status,
  target,
  customTarget,
  dllPath,
  watcherEnabled,
  onTargetChange,
  onCustomTargetChange,
  onDllPathChange,
  onInject,
  onWatcherToggle,
}: InjectorCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStatus = useMemo(
    () => status || "Waiting for process...",
    [status],
  );

  const resolveFilePath = (file?: File | null) => {
    if (!file) {
      return;
    }
    const maybePath = (file as File & { path?: string }).path;
    onDllPathChange(maybePath ?? file.name);
  };

  return (
    <div className="flex h-full flex-col gap-5 rounded-[18px] border border-zinc-800 bg-zinc-900/80 p-6">
      <div className="rounded-[16px] bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1f2937] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-300">
              Injector Core
            </p>
            <h2 className="text-2xl font-semibold text-white">
              YZY Injector Hub
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs text-zinc-200">
            <Terminal className="h-4 w-4 text-[#4677FF]" />
            {currentStatus}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
          <label className="text-sm text-zinc-400" htmlFor="target">
            Target process
          </label>
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
            <SwitchCamera className="h-5 w-5 text-[#4677FF]" />
            <input
              className="w-full bg-transparent text-sm text-zinc-100 outline-none"
              disabled={!customTarget}
              id="target"
              onChange={(event) => onTargetChange(event.target.value)}
              placeholder="javaw.exe"
              value={target}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <span>Custom target</span>
            <button
              className={`rounded-full px-3 py-1 transition ${
                customTarget
                  ? "bg-[#4677FF]/20 text-[#4677FF]"
                  : "bg-zinc-800 text-zinc-500"
              }`}
              onClick={() => onCustomTargetChange(!customTarget)}
              type="button"
            >
              {customTarget ? "On" : "Off"}
            </button>
          </div>
        </div>
        <div
          className="rounded-2xl border border-dashed border-zinc-700 bg-black/30 p-4"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            resolveFilePath(event.dataTransfer.files?.[0]);
          }}
          role="presentation"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-300">Drag & Drop DLL</p>
            <FileInput className="h-5 w-5 text-[#4677FF]" />
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            {dllPath || "Nenhuma DLL selecionada."}
          </p>
          <input
            ref={inputRef}
            accept=".dll"
            className="hidden"
            onChange={(event) => resolveFilePath(event.target.files?.[0])}
            type="file"
          />
          <button
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 hover:border-[#4677FF]/40"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <FolderOpen className="h-4 w-4" />
            Browse DLL
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4 text-xs text-zinc-400">
          <div className="flex items-center justify-between">
            <p>Watcher Mode</p>
            <button
              className={`rounded-full px-3 py-1 text-xs transition ${
                watcherEnabled
                  ? "bg-[#4677FF]/30 text-[#4677FF]"
                  : "bg-zinc-800 text-zinc-500"
              }`}
              onClick={onWatcherToggle}
              type="button"
            >
              {watcherEnabled ? "Active" : "Inactive"}
            </button>
          </div>
          <p className="mt-3 text-[11px] text-zinc-500">
            Auto-inject ao detectar o processo alvo.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4 text-xs text-zinc-400">
          <p>DLL selecionada</p>
          <p className="mt-3 truncate text-sm font-semibold text-white">
            {dllPath || "Sem arquivo selecionado"}
          </p>
        </div>
      </div>

      <div className="mt-auto rounded-2xl border border-zinc-800 bg-gradient-to-r from-[#4677FF] to-[#3B82F6] px-6 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-100/70">
              Ready to inject
            </p>
            <p className="text-lg font-semibold text-white">
              Target: {target}
            </p>
          </div>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-950/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-950/40 md:w-auto"
            onClick={onInject}
            type="button"
          >
            <Power className="h-5 w-5" />
            Inject
          </button>
        </div>
      </div>
    </div>
  );
};

export default InjectorCard;
