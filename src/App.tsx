import { useEffect, useMemo, useState } from "react";
import { Activity, Settings, ShieldCheck } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import InjectorCard from "./components/InjectorCard";
import SettingsCard from "./components/SettingsCard";
import logo from "./assets/branding/logo.svg";

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

const defaultSettings: InjectorSettings = {
  jvmArgs: "",
  injectionMethod: "standard",
  autoClose: false,
  randomWindowTitle: false,
  fdpJarPath: "fdpclient/release.jar",
  fdpWrapper: "lunar",
};

const App = () => {
  const [status, setStatus] = useState("Waiting for process...");
  const [statusTimestamp, setStatusTimestamp] = useState<Date | null>(null);
  const [target, setTarget] = useState("javaw.exe");
  const [customTarget, setCustomTarget] = useState(false);
  const [dllPath, setDllPath] = useState("");
  const [watcherEnabled, setWatcherEnabled] = useState(false);
  const [settings, setSettings] = useState<InjectorSettings>(defaultSettings);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const stored = await invoke<InjectorSettings>("get_settings");
        setSettings((prev) => ({ ...prev, ...stored }));
      } catch (error) {
        console.error("Falha ao carregar configurações:", error);
      }
    };

    setup();
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    listen<string>("watcher-status", (event) => {
      setStatus(event.payload);
      setStatusTimestamp(new Date());
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch((error) => {
        console.error("Falha ao assinar eventos:", error);
      });

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  useEffect(() => {
    if (!settings.randomWindowTitle) {
      return;
    }

    const randomToken = Math.random().toString(36).slice(2, 7).toUpperCase();
    getCurrentWindow()
      .setTitle(`YZY Injector v2 • ${randomToken}`)
      .catch((error) => {
        console.error("Falha ao atualizar título da janela:", error);
      });
  }, [settings.randomWindowTitle]);

  const statusMeta = useMemo(() => {
    if (!statusTimestamp) {
      return "Status sincronizado";
    }
    return `Atualizado em ${statusTimestamp.toLocaleTimeString()}`;
  }, [statusTimestamp]);

  const handleInject = async () => {
    if (!dllPath) {
      setStatus("Selecione uma DLL antes de injetar.");
      return;
    }

    try {
      const response = await invoke<string>("inject_dll", {
        request: {
          target,
          dllPath,
          method: settings.injectionMethod,
        },
      });
      setStatus(response);
      setStatusTimestamp(new Date());

      if (settings.autoClose) {
        await getCurrentWindow().close();
      }
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Falha ao injetar DLL.",
      );
      setStatusTimestamp(new Date());
    }
  };

  const handleWatcherToggle = async () => {
    if (!dllPath) {
      setStatus("Selecione uma DLL antes de ativar o watcher.");
      return;
    }

    try {
      if (watcherEnabled) {
        await invoke("stop_watcher");
        setWatcherEnabled(false);
        setStatus("Watcher parado.");
      } else {
        await invoke("start_watcher", {
          request: {
            target,
            dllPath,
            method: settings.injectionMethod,
          },
        });
        setWatcherEnabled(true);
      }
      setStatusTimestamp(new Date());
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Falha ao iniciar watcher.",
      );
      setStatusTimestamp(new Date());
    }
  };

  const handleSaveSettings = async () => {
    try {
      await invoke<string>("save_settings", { settings });
      setSaveMessage("Configurações salvas com sucesso.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Falha ao salvar config.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              alt="YZY Injector logo"
              className="h-12 w-12"
              src={logo}
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                YZY Injector v2
              </p>
              <h1 className="text-2xl font-semibold text-white">
                Bem-vindo de volta, Zywl.
              </h1>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4677FF]/20 text-[#4677FF]">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{status}</p>
                <p className="text-xs text-zinc-500">{statusMeta}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-[#4677FF]" />
              Watcher {watcherEnabled ? "Ativo" : "Inativo"}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2">
            <div className="h-9 w-9 rounded-full bg-[#4677FF]/30" />
            <div>
              <p className="text-sm font-semibold">Zywl</p>
              <p className="text-xs text-zinc-400">Microsoft</p>
            </div>
            <button
              className="ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 hover:text-[#4677FF]"
              type="button"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className="grid flex-1 grid-cols-1 gap-6 rounded-[20px] border border-zinc-800 bg-black/30 p-6 lg:grid-cols-[1.35fr_0.65fr]">
          <InjectorCard
            customTarget={customTarget}
            dllPath={dllPath}
            onCustomTargetChange={setCustomTarget}
            onDllPathChange={setDllPath}
            onInject={handleInject}
            onTargetChange={setTarget}
            onWatcherToggle={handleWatcherToggle}
            status={status}
            target={target}
            watcherEnabled={watcherEnabled}
          />
          <div className="flex h-full flex-col gap-6">
            <SettingsCard
              onSave={handleSaveSettings}
              onSettingsChange={setSettings}
              saveMessage={saveMessage}
              settings={settings}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                <p className="text-xs text-zinc-500">Target ativo</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {target}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Customizado: {customTarget ? "Sim" : "Não"}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                <p className="text-xs text-zinc-500">Método de injeção</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {settings.injectionMethod === "manual_map"
                    ? "Manual Map"
                    : "Standard"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Auto-close: {settings.autoClose ? "Ativo" : "Inativo"}
                </p>
              </div>
              <div className="col-span-2 rounded-2xl border border-zinc-800 bg-gradient-to-br from-[#4677FF]/30 via-[#4677FF]/10 to-zinc-900 p-4">
                <p className="text-xs text-zinc-300">Watcher status</p>
                <p className="mt-2 text-base font-semibold text-white">
                  {status}
                </p>
                <p className="mt-1 text-xs text-zinc-400">{statusMeta}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
