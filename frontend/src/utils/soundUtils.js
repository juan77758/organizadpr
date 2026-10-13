// Reutilizar un contexto activado por una interacción del usuario.
let audioContext;

export const enableSound = async () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContext();
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    return audioContext.state === 'running';
  } catch (error) {
    console.error('No se pudo activar el sonido:', error);
    return false;
  }
};

// El navegador puede bloquear audio iniciado por un evento de WebSocket.
// Activarlo desde un clic o una tecla permite usarlo en avisos posteriores.
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', enableSound, { capture: true });
  window.addEventListener('keydown', enableSound, { capture: true });
}

const playTones = async (frequencies, volume) => {
  if (!(await enableSound())) return false;
  try {
    const start = audioContext.currentTime;
    frequencies.forEach((frequency, index) => {
      const time = start + index * 0.5;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.05);
      gain.gain.linearRampToValueAtTime(0, time + 0.4);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(time);
      oscillator.stop(time + 0.4);
    });
    return true;
  } catch (error) {
    console.error('Error reproduciendo sonido:', error);
    return false;
  }
};

export const playAlarmSound = () => playTones(Array(3).fill([800, 1000, 800]).flat(), 0.3);
export const playNotificationSound = () => playTones([600], 0.2);
