import { useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import InjectorCard from "./components/InjectorCard";
import SettingsCard from "./components/SettingsCard";
import Dashboard from "./components/Dashboard";
import ConsoleLogs, { LogEntry } from "./components/ConsoleLogs";
import LoadingScreen from "./components/LoadingScreen";

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
  const [target, setTarget] = useState("javaw.exe");
  const [customTarget, setCustomTarget] = useState(false);
  const [dllPath, setDllPath] = useState("");
  const [watcherEnabled, setWatcherEnabled] = useState(false);
  const [settings, setSettings] = useState<InjectorSettings>(defaultSettings);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState({
    active: false,
    title: "Iniciando",
    subtitle: "",
    status: "",
  });

  const resolveErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "string") {
      return error;
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (error && typeof error === "object" && "message" in error) {
      return String((error as { message?: string }).message ?? fallback);
    }
    return fallback;
  };

  const isAbsolutePath = (value: string) =>
    /^[a-zA-Z]:\\/.test(value) || value.startsWith("\\\\") || value.startsWith("/");

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => [...prev, { timestamp: new Date(), type, message }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    addLog('Logs cleared', 'info');
  }, [addLog]);

  useEffect(() => {
    const setup = async () => {
      try {
        const stored = await invoke<InjectorSettings>("get_settings");
        const merged = { ...defaultSettings, ...stored };
        if (merged.injectionMethod === "manual_map") {
          merged.injectionMethod = "standard";
          addLog(
            "Manual Map ainda não está disponível. Método ajustado para Standard.",
            "warning",
          );
        }
        setSettings(merged);
        addLog('Configurações carregadas com sucesso', 'success');
      } catch (error) {
        console.error("Falha ao carregar configurações:", error);
        addLog('Erro ao carregar configurações', 'error');
      }
    };

    setup();
    addLog('YZY Injector v2 inicializado', 'info');
  }, [addLog]);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    listen<string>("watcher-status", (event) => {
      setStatus(event.payload);

      // Add log entry based on status
      if (
        event.payload.toLowerCase().includes('injetada') ||
        event.payload.toLowerCase().includes('sucesso')
      ) {
        addLog(event.payload, 'success');
        setLoading((prev) => ({ ...prev, active: false }));
      } else if (event.payload.includes('erro') || event.payload.includes('Falha')) {
        addLog(event.payload, 'error');
        setLoading((prev) => ({ ...prev, active: false }));
      } else if (event.payload.includes('Injetando')) {
        setLoading({
          active: true,
          title: "Injetando DLL",
          subtitle: `Processo alvo: ${target}`,
          status: event.payload,
        });
      } else {
        addLog(event.payload, 'info');
      }
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch((error) => {
        console.error("Falha ao assinar eventos:", error);
        addLog('Erro ao configurar event listener', 'error');
      });

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [addLog, target]);

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

  const handleInject = async () => {
    if (!dllPath) {
      const msg = "Selecione uma DLL antes de injetar.";
      setStatus(msg);
      addLog(msg, 'warning');
      return;
    }

    if (!isAbsolutePath(dllPath)) {
      const msg =
        "Caminho da DLL inválido. Use o botão 'Procurar DLL' para selecionar o arquivo completo.";
      setStatus(msg);
      addLog(msg, 'warning');
      return;
    }

    setLoading({
      active: true,
      title: "Injetando DLL",
      subtitle: `Processo alvo: ${target}`,
      status: "Verificando processo e preparando ambiente...",
    });
    addLog(`Iniciando injeção em ${target}...`, 'info');
    addLog(
      `Método: ${settings.injectionMethod === 'manual_map' ? 'Standard (fallback)' : 'Standard'}`,
      'info',
    );

    try {
      const injectionMethod =
        settings.injectionMethod === "manual_map"
          ? "standard"
          : settings.injectionMethod;
      const response = await invoke<string>("inject_dll", {
        request: {
          target,
          dllPath,
          method: injectionMethod,
        },
      });
      setStatus(response);
      addLog(response, 'success');

      if (settings.autoClose) {
        addLog('Auto-close ativado, fechando aplicação...', 'info');
        await getCurrentWindow().close();
      }
    } catch (error) {
      const errorMsg = resolveErrorMessage(error, "Falha ao injetar DLL.");
      setStatus(errorMsg);
      addLog(errorMsg, 'error');
    } finally {
      setLoading((prev) => ({ ...prev, active: false }));
    }
  };

  const handleWatcherToggle = async () => {
    if (!dllPath) {
      const msg = "Selecione uma DLL antes de ativar o watcher.";
      setStatus(msg);
      addLog(msg, 'warning');
      return;
    }

    try {
      setLoading({
        active: true,
        title: watcherEnabled ? "Encerrando watcher" : "Ativando watcher",
        subtitle: `Monitorando: ${target}`,
        status: watcherEnabled
          ? "Finalizando rotina de monitoramento..."
          : "Preparando observador de processo...",
      });
      const injectionMethod =
        settings.injectionMethod === "manual_map"
          ? "standard"
          : settings.injectionMethod;
      if (watcherEnabled) {
        await invoke("stop_watcher");
        setWatcherEnabled(false);
        setStatus("Watcher parado.");
        addLog('Watcher desativado', 'info');
      } else {
        await invoke("start_watcher", {
          request: {
            target,
            dllPath,
            method: injectionMethod,
          },
        });
        setWatcherEnabled(true);
        addLog(`Watcher iniciado - Monitorando ${target}`, 'success');
      }
    } catch (error) {
      const errorMsg = resolveErrorMessage(error, "Falha ao iniciar watcher.");
      setStatus(errorMsg);
      addLog(errorMsg, 'error');
    } finally {
      setLoading((prev) => ({ ...prev, active: false }));
    }
  };

  const handleSaveSettings = async () => {
    try {
      await invoke<string>("save_settings", { settings });
      setSaveMessage("Configurações salvas com sucesso.");
      addLog('Configurações salvas', 'success');
    } catch (error) {
      const errorMsg = resolveErrorMessage(error, "Falha ao salvar config.");
      setSaveMessage(errorMsg);
      addLog(errorMsg, 'error');
    }
  };

  return (
    <>
      <Dashboard
        status={status}
        watcherActive={watcherEnabled}
        injectionMethod="Standard (LoadLibrary)"
        target={target}
      >
        {/* Main Injector Card - Spans 8 columns */}
        <div className="lg:col-span-8">
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
        </div>

        {/* Settings Card - Spans 4 columns */}
        <div className="lg:col-span-4">
          <SettingsCard
            onSave={handleSaveSettings}
            onSettingsChange={setSettings}
            saveMessage={saveMessage}
            settings={settings}
          />
        </div>

        {/* Console Logs - Spans full width */}
        <div className="lg:col-span-12">
          <ConsoleLogs logs={logs} onClear={clearLogs} />
        </div>
      </Dashboard>

      <LoadingScreen
        active={loading.active}
        status={loading.status}
        subtitle={loading.subtitle}
        title={loading.title}
      />
    </>
  );
};

export default App;
