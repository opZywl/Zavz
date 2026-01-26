import { useState } from "react";
import {
  Bolt,
  ChevronDown,
  FileArchive,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";

type InjectionMethod = "standard" | "manual_map";
type FdpWrapper = "lunar" | "badlion";

interface InjectorSettings {
  jvmArgs: string;
  injectionMethod: InjectionMethod;
  autoClose: boolean;
  randomWindowTitle: boolean;
  fdpJarPath: string;
  fdpWrapper: FdpWrapper;
}

interface SettingsCardProps {
  settings: InjectorSettings;
  onSettingsChange: (value: InjectorSettings) => void;
  onSave: () => void;
  saveMessage: string | null;
}

const SettingsCard = ({
  settings,
  onSettingsChange,
  onSave,
  saveMessage,
}: SettingsCardProps) => {
  const [expanded, setExpanded] = useState(true);
  const updateSettings = (partial: Partial<InjectorSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  const handleJarSelect = async () => {
    const selected = await open({
      title: "Selecionar arquivo JAR",
      multiple: false,
      filters: [{ name: "JAR", extensions: ["jar"] }],
    });

    if (typeof selected === "string") {
      updateSettings({ fdpJarPath: selected });
    }
  };

  return (
    <div className="flex h-full flex-col gap-5 rounded-[18px] border border-zinc-800 bg-zinc-900/80 p-6">
      <button
        className="flex items-center justify-between text-left"
        onClick={() => setExpanded((prev) => !prev)}
        type="button"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Advanced
          </p>
          <h2 className="text-xl font-semibold">Settings & Loader</h2>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-zinc-400 transition ${
            expanded ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {expanded && (
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4 text-[#4677FF]" />
              JVM Arguments
            </div>
            <input
              className="mt-3 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 outline-none"
              placeholder="-Xmx4G -XX:+UseG1GC"
              value={settings.jvmArgs}
              onChange={(event) =>
                updateSettings({ jvmArgs: event.target.value })
              }
            />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bolt className="h-4 w-4 text-[#4677FF]" />
              Injection Method
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <button
                className={`rounded-xl border px-3 py-2 ${
                  settings.injectionMethod === "standard"
                    ? "border-[#4677FF]/40 bg-[#4677FF]/20 text-[#4677FF]"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400"
                }`}
                onClick={() => updateSettings({ injectionMethod: "standard" })}
                type="button"
              >
                Standard
              </button>
              <button
                className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/60 px-3 py-2 text-zinc-500"
                disabled
                type="button"
              >
                Manual Map <span className="ml-1 text-[10px]">(em breve)</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              Manual Map ainda não está disponível. O modo Standard usa LoadLibrary.
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4 text-xs text-zinc-400">
            <label className="flex items-center justify-between">
              Auto-close after inject
              <input
                className="h-4 w-4"
                checked={settings.autoClose}
                onChange={(event) =>
                  updateSettings({ autoClose: event.target.checked })
                }
                type="checkbox"
              />
            </label>
            <label className="flex items-center justify-between">
              Random window title
              <input
                className="h-4 w-4"
                checked={settings.randomWindowTitle}
                onChange={(event) =>
                  updateSettings({ randomWindowTitle: event.target.checked })
                }
                type="checkbox"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-[#4677FF]" />
              FDP Client Loader
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Selecionar arquivo .jar do cliente.
            </p>
            <button
              className="mt-3 flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm"
              onClick={handleJarSelect}
              type="button"
            >
              <span className="truncate text-zinc-300">
                {settings.fdpJarPath || "fdpclient/release.jar"}
              </span>
              <FileArchive className="h-4 w-4 text-[#4677FF]" />
            </button>

            <div className="mt-4 flex flex-col gap-2 text-xs text-zinc-400">
              <p>Wrapper</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`rounded-xl border px-3 py-2 ${
                    settings.fdpWrapper === "lunar"
                      ? "border-[#4677FF]/40 bg-[#4677FF]/20 text-[#4677FF]"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                  onClick={() => updateSettings({ fdpWrapper: "lunar" })}
                  type="button"
                >
                  Lunar Client
                </button>
                <button
                  className={`rounded-xl border px-3 py-2 ${
                    settings.fdpWrapper === "badlion"
                      ? "border-[#4677FF]/40 bg-[#4677FF]/20 text-[#4677FF]"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                  onClick={() => updateSettings({ fdpWrapper: "badlion" })}
                  type="button"
                >
                  Badlion Client
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <button
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-300"
                onClick={handleJarSelect}
                type="button"
              >
                Change Path
              </button>
              <button
                className="rounded-xl border border-[#4677FF]/40 bg-[#4677FF]/20 px-3 py-2 text-[#4677FF]"
                onClick={onSave}
                type="button"
              >
                Save Config
              </button>
            </div>
            {saveMessage && (
              <p className="mt-3 text-xs text-zinc-400">{saveMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsCard;
