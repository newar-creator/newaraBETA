
export const playWaterDrop = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  // Frecuencia que sube rápido para imitar una gota
  oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2);
};

// Alternativa usando una URL externa de alta calidad
export const playExternalBubble = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
  audio.volume = 0.4;
  audio.play().catch(e => console.log("Audio play blocked until interaction"));
};
