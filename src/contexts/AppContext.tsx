import { createContext, useContext, ReactNode } from 'react';
import { useLogger, LogEntry } from '../hooks/useLogger';
import { useTheme, Theme } from '../hooks/useTheme';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  // Logger
  logs: LogEntry[];
  addLog: (level: LogEntry['level'], message: string) => LogEntry;
  info: (message: string) => LogEntry;
  success: (message: string) => LogEntry;
  warning: (message: string) => LogEntry;
  error: (message: string) => LogEntry;
  clearLogs: () => void;

  // Theme
  currentTheme: string;
  theme: Theme;
  setTheme: (themeName: string) => void;
  setCustomTheme: (theme: Theme) => void;
  presetThemes: Record<string, Theme>;

  // User preferences
  nickname: string;
  setNickname: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const logger = useLogger();
  const themeManager = useTheme();
  const [nickname, setNickname] = useLocalStorage<string>('nickname', '');

  const value: AppContextType = {
    ...logger,
    ...themeManager,
    nickname,
    setNickname,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
