// Generar sonido de alarma usando Web Audio API
export const playAlarmSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Crear osciladores para un sonido de alarma distintivo
    const duration = 1.5; // segundos
    const currentTime = audioContext.currentTime;

    // Primer tono
    const oscillator1 = audioContext.createOscillator();
    const gainNode1 = audioContext.createGain();

    oscillator1.connect(gainNode1);
    gainNode1.connect(audioContext.destination);

    oscillator1.frequency.value = 800; // Hz
    oscillator1.type = 'sine';

    gainNode1.gain.setValueAtTime(0, currentTime);
    gainNode1.gain.linearRampToValueAtTime(0.3, currentTime + 0.1);
    gainNode1.gain.linearRampToValueAtTime(0, currentTime + 0.5);

    oscillator1.start(currentTime);
    oscillator1.stop(currentTime + 0.5);

    // Segundo tono (más agudo)
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);

      oscillator2.frequency.value = 1000; // Hz
      oscillator2.type = 'sine';

      const time = audioContext.currentTime;
      gainNode2.gain.setValueAtTime(0, time);
      gainNode2.gain.linearRampToValueAtTime(0.3, time + 0.1);
      gainNode2.gain.linearRampToValueAtTime(0, time + 0.5);

      oscillator2.start(time);
      oscillator2.stop(time + 0.5);
    }, 500);

    // Tercer tono (repetición del primero)
    setTimeout(() => {
      const oscillator3 = audioContext.createOscillator();
      const gainNode3 = audioContext.createGain();

      oscillator3.connect(gainNode3);
      gainNode3.connect(audioContext.destination);

      oscillator3.frequency.value = 800; // Hz
      oscillator3.type = 'sine';

      const time = audioContext.currentTime;
      gainNode3.gain.setValueAtTime(0, time);
      gainNode3.gain.linearRampToValueAtTime(0.3, time + 0.1);
      gainNode3.gain.linearRampToValueAtTime(0, time + 0.5);

      oscillator3.start(time);
      oscillator3.stop(time + 0.5);
    }, 1000);

  } catch (error) {
    console.error('Error reproduciendo sonido:', error);
  }
};

// Sonido de notificación suave (para notificaciones normales)
export const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 600;
    oscillator.type = 'sine';

    const currentTime = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.3);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.3);
  } catch (error) {
    console.error('Error reproduciendo sonido:', error);
  }
};
