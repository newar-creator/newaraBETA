
const getCtx = () => {
  const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
  if (!AudioContextClass) return null;
  if (!(window as any)._newara_audio_ctx) {
    (window as any)._newara_audio_ctx = new AudioContextClass();
  }
  return (window as any)._newara_audio_ctx as AudioContext;
};

export const playWaterDrop = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
};

export const playExternalBubble = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
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
    const ctx = getCtx();
    if (!ctx) return;
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
    const ctx = getCtx();
    if (!ctx) return;
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

export const playGong = async () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();

    console.log("Playing synthesized Kahoot-style gong");
    const now = ctx.currentTime;
    
    // To recreate the deep, metallic Kahoot gong, we use multiple oscillators
    // with non-integer harmonic relationships for that "clash" effect.
    const frequencies = [
      { f: 108.00, type: 'triangle' as OscillatorType, vol: 0.15 }, // Slightly tuned fundamental
      { f: 162.81, type: 'sine' as OscillatorType, vol: 0.1 },     
      { f: 231.08, type: 'sine' as OscillatorType, vol: 0.08 },    
      { f: 309.13, type: 'sine' as OscillatorType, vol: 0.05 },    
      { f: 438.00, type: 'sine' as OscillatorType, vol: 0.03 }     
    ];

    frequencies.forEach(({ f, type, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(f, now);
      // Slight pitch drift for a more organic sound
      osc.frequency.exponentialRampToValueAtTime(f * 0.99, now + 3);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 3);
    });

    // Impact punch (low frequency pulse)
    const punch = ctx.createOscillator();
    const punchGain = ctx.createGain();
    punch.type = 'sine';
    punch.frequency.setValueAtTime(80, now);
    punch.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    punchGain.gain.setValueAtTime(0.3, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    punch.connect(punchGain);
    punchGain.connect(ctx.destination);
    punch.start(now);
    punch.stop(now + 0.2);

    // Metallic "crack" (short filtered noise)
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, now);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

  } catch (e) {
    console.warn("Could not play synthesized gong", e);
  }
};

export const playTick = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
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
    const ctx = getCtx();
    if (!ctx) return;
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
