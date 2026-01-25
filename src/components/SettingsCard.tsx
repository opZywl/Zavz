import { useState } from "react";
import {
  Bolt,
  ChevronDown,
  FileArchive,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

const SettingsCard = () => {
  const [expanded, setExpanded] = useState(true);
  const [wrapper, setWrapper] = useState("lunar");

  return (
    <div className="flex h-full flex-col gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4 text-blue-400" />
              JVM Arguments
            </div>
            <input
              className="mt-3 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 outline-none"
              placeholder="-Xmx4G -XX:+UseG1GC"
            />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bolt className="h-4 w-4 text-blue-400" />
              Injection Method
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <button
                className="rounded-xl border border-blue-500/40 bg-blue-500/20 px-3 py-2 text-blue-200"
                type="button"
              >
                Standard
              </button>
              <button
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-400"
                type="button"
              >
                Manual Map
              </button>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-400">
            <label className="flex items-center justify-between">
              Auto-close after inject
              <input className="h-4 w-4" type="checkbox" />
            </label>
            <label className="flex items-center justify-between">
              Random window title
              <input className="h-4 w-4" type="checkbox" />
            </label>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-blue-400" />
              FDP Client Loader
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Selecionar arquivo .jar do cliente.
            </p>
            <button
              className="mt-3 flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm"
              type="button"
            >
              <span className="truncate text-zinc-300">
                fdpclient/release.jar
              </span>
              <FileArchive className="h-4 w-4 text-blue-400" />
            </button>

            <div className="mt-4 flex flex-col gap-2 text-xs text-zinc-400">
              <p>Wrapper</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`rounded-xl border px-3 py-2 ${
                    wrapper === "lunar"
                      ? "border-blue-500/40 bg-blue-500/20 text-blue-200"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                  onClick={() => setWrapper("lunar")}
                  type="button"
                >
                  Lunar Client
                </button>
                <button
                  className={`rounded-xl border px-3 py-2 ${
                    wrapper === "badlion"
                      ? "border-blue-500/40 bg-blue-500/20 text-blue-200"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                  onClick={() => setWrapper("badlion")}
                  type="button"
                >
                  Badlion Client
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <button
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-300"
                type="button"
              >
                Change Path
              </button>
              <button
                className="rounded-xl border border-blue-500/40 bg-blue-500/20 px-3 py-2 text-blue-200"
                type="button"
              >
                Save Config
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsCard;
