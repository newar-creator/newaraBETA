
export const playWaterDrop = () => {
  try {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    // Frequency sweep for a nice "plop" sound
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(10, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {}
};

export const playExternalBubble = () => {
  try {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {}
};

export const playSuccessSound = () => {
  try {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();
    
    const playNote = (freq: number, start: number, duration: number, volume = 0.1) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    playNote(523.25, now, 0.4, 0.1); // C5
    playNote(659.25, now + 0.1, 0.4, 0.1); // E5
    playNote(783.99, now + 0.2, 0.6, 0.15); // G5
    playNote(1046.50, now + 0.3, 0.8, 0.1); // C6
  } catch (e) {}
};

export const playErrorSound = () => {
  try {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
};

export const playGong = () => {
  try {
    const audio = new Audio('/kahoot-gong.mp3');
    audio.volume = 0.2;
    audio.play().catch(e => {
      // Fallback to synthetic gong if file not found or blocked
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 2);

      osc.type = 'square';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 2);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 2);
    });
  } catch (e) {}
};

export const playTick = () => {
  try {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
}

export const playWhoosh = () => {
  try {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3500, ctx.currentTime + 0.4);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (e) {}
}

export const playCheer = () => {
  playSuccessSound();
}

let musicAudio: HTMLAudioElement | null = null;
let syntheticMusicInterval: any = null;
let syntheticContext: any = null;

export const playMinigameMusic = () => {
  if (musicAudio || syntheticMusicInterval) return;
  
  musicAudio = new Audio();
  // Using a more reliable royalty free loop if possible, but synthetic is safer
  musicAudio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'; 
  musicAudio.loop = true;
  musicAudio.volume = 0.08;
  
  musicAudio.play().catch(e => {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    syntheticContext = new AudioContextClass();
    if (syntheticContext.state === 'suspended') syntheticContext.resume();
    
    const notes = [329.63, 392.00, 440.00, 523.25, 587.33]; // E4, G4, A4, C5, D5
    let index = 0;
    
    syntheticMusicInterval = setInterval(() => {
      if (!syntheticContext) return;
      try {
        const osc = syntheticContext.createOscillator();
        const gain = syntheticContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[index % notes.length], syntheticContext.currentTime);
        
        gain.gain.setValueAtTime(0, syntheticContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, syntheticContext.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, syntheticContext.currentTime + 0.8);
        
        osc.connect(gain);
        gain.connect(syntheticContext.destination);
        osc.start();
        osc.stop(syntheticContext.currentTime + 1);
        index++;
      } catch (e) {}
    }, 400);
  });
};

export const stopMinigameMusic = () => {
  if (musicAudio) {
    musicAudio.pause();
    musicAudio.currentTime = 0;
    musicAudio = null;
  }
  if (syntheticMusicInterval) {
    clearInterval(syntheticMusicInterval);
    syntheticMusicInterval = null;
  }
  if (syntheticContext) {
    syntheticContext.close();
    syntheticContext = null;
  }
};
