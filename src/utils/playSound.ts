let lastPlayAt = 0;

export function playUiSound(volume = 0.4) {
  const now = Date.now();
  if (now - lastPlayAt < 80) return;
  lastPlayAt = now;

  try {
    const audio = new Audio('/sounds/pop.wav');
    audio.volume = volume;
    void audio.play().catch(() => undefined);
  } catch {
    // ignore autoplay / missing asset
  }
}
