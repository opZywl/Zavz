import { useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import InjectorCard from "./components/InjectorCard";
import SettingsCard from "./components/SettingsCard";
import Dashboard from "./components/Dashboard";
import ConsoleLogs, { LogEntry } from "./components/ConsoleLogs";

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
        setSettings((prev) => ({ ...prev, ...stored }));
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
      if (event.payload.includes('Injected')) {
        addLog(event.payload, 'success');
      } else if (event.payload.includes('erro') || event.payload.includes('Falha')) {
        addLog(event.payload, 'error');
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
  }, [addLog]);

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

    addLog(`Iniciando injeção em ${target}...`, 'info');
    addLog(`Método: ${settings.injectionMethod === 'manual_map' ? 'Manual Map' : 'Standard'}`, 'info');

    try {
      const response = await invoke<string>("inject_dll", {
        request: {
          target,
          dllPath,
          method: settings.injectionMethod,
        },
      });
      setStatus(response);
      addLog(response, 'success');

      if (settings.autoClose) {
        addLog('Auto-close ativado, fechando aplicação...', 'info');
        await getCurrentWindow().close();
      }
    } catch (error) {
      const errorMsg = error instanceof Error
        ? error.message
        : "Falha ao injetar DLL.";
      setStatus(errorMsg);
      addLog(errorMsg, 'error');
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
            method: settings.injectionMethod,
          },
        });
        setWatcherEnabled(true);
        addLog(`Watcher iniciado - Monitorando ${target}`, 'success');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Falha ao iniciar watcher.";
      setStatus(errorMsg);
      addLog(errorMsg, 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await invoke<string>("save_settings", { settings });
      setSaveMessage("Configurações salvas com sucesso.");
      addLog('Configurações salvas', 'success');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Falha ao salvar config.";
      setSaveMessage(errorMsg);
      addLog(errorMsg, 'error');
    }
  };

  return (
    <Dashboard
      status={status}
      watcherActive={watcherEnabled}
      injectionMethod={
        settings.injectionMethod === "manual_map" ? "Manual Map" : "Standard"
      }
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
  );
};

export default App;
