import { useMemo, useState } from "react";
import {
  FileInput,
  FolderOpen,
  Power,
  SwitchCamera,
  Terminal,
} from "lucide-react";

interface InjectorCardProps {
  status: string;
  onStatusChange: (value: string) => void;
}

const statusLabels = [
  "Waiting for process...",
  "Processo encontrado. Injetando...",
  "Injected!",
];

const InjectorCard = ({ status, onStatusChange }: InjectorCardProps) => {
  const [customTarget, setCustomTarget] = useState(false);
  const [target, setTarget] = useState("javaw.exe");
  const [dllPath, setDllPath] = useState("");

  const currentStatus = useMemo(
    () => statusLabels.find((label) => label === status) ?? statusLabels[0],
    [status],
  );

  return (
    <div className="flex h-full flex-col gap-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Injector Core
          </p>
          <h2 className="text-2xl font-semibold">Process Selector</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-400">
          <Terminal className="h-4 w-4" />
          {currentStatus}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <label className="text-sm text-zinc-400" htmlFor="target">
            Target process
          </label>
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
            <SwitchCamera className="h-5 w-5 text-blue-400" />
            <input
              className="w-full bg-transparent text-sm text-zinc-100 outline-none"
              disabled={!customTarget}
              id="target"
              onChange={(event) => setTarget(event.target.value)}
              placeholder="javaw.exe"
              value={target}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <span>Custom target</span>
            <button
              className={`rounded-full px-3 py-1 transition ${
                customTarget
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-zinc-800 text-zinc-500"
              }`}
              onClick={() => setCustomTarget((prev) => !prev)}
              type="button"
            >
              {customTarget ? "On" : "Off"}
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-300">Drag & Drop DLL</p>
            <FileInput className="h-5 w-5 text-blue-400" />
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            {dllPath || "Nenhuma DLL selecionada."}
          </p>
          <button
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 hover:border-blue-500/40"
            onClick={() => setDllPath("C:/injector/cheat.dll")}
            type="button"
          >
            <FolderOpen className="h-4 w-4" />
            Browse DLL
          </button>
        </div>
      </div>

      <div className="mt-auto rounded-2xl border border-zinc-800 bg-gradient-to-r from-blue-500 to-blue-400 px-6 py-4">
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
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-950/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-950/30 md:w-auto"
            onClick={() =>
              onStatusChange(
                status === statusLabels[2] ? statusLabels[0] : statusLabels[2],
              )
            }
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
