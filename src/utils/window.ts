import { getCurrentWindow } from '@tauri-apps/api/window';

export const minimizeWindow = async () => {
  try {
    const appWindow = getCurrentWindow();
    await appWindow.minimize();
  } catch (error) {
    console.error('Failed to minimize window:', error);
  }
};

export const maximizeWindow = async () => {
  try {
    const appWindow = getCurrentWindow();
    await appWindow.toggleMaximize();
  } catch (error) {
    console.error('Failed to maximize window:', error);
  }
};

export const closeWindow = async () => {
  try {
    const appWindow = getCurrentWindow();
    await appWindow.close();
  } catch (error) {
    console.error('Failed to close window:', error);
  }
};
