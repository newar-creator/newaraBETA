
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

let gongBuffer: AudioBuffer | null = null;
export const playGong = async () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();

    if (!gongBuffer) {
      const response = await fetch(KAHOOT_GONG_DATA);
      const arrayBuffer = await response.arrayBuffer();
      gongBuffer = await ctx.decodeAudioData(arrayBuffer);
    }

    const source = ctx.createBufferSource();
    source.buffer = gongBuffer;
    const gain = ctx.createGain();
    
    // Linear fade-in of 0.02s to prevent cutting and clicks
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
  } catch (e) {
    // Simple Audio fallback if everything else fails
    try {
      const audio = new Audio(KAHOOT_GONG_DATA);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (err) {}
  }
};

const KAHOOT_GONG_DATA = "data:audio/mp3;base64,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aNzV/61PiuneslbpDjxcJjaGVRUFWgAAkKQKCAZROLfwCDGZCJpJCYAzmShRzxwOkC8wcbQYMCbNTAMJiQdUwMtRKogwp0KHyIQBQoOFpDZO80dgC4KeB7b94igesaF2vKGX+63iBMCnuZffhgBSmQhxiTjmztJmPR+mLZKGDAUjB4mHAmBa0By5sCACtgwGjqcYgZUUblYEkFhAwYjag8FAzKyENL2ArfWSAg69oQ4bE5A+V5hoUMNPwm//U6ynovkb4v01GXCoLvQTtwIHzjEFV3MHnAQ8BmTiCL1Dga+hwkDhgUIaVRxAUCPTPw45GaGEnX6Q4Sl4Kfj7Tkutz9sgcYaLcgYRpKZ3Q/k/CF/HxweqBe+AAMyoB52OcjgdhhYfTrNAKhUPV4bZQoGaxpVJEk1ERwsOYOAsEALYTbVMsRd7hwDGGmRh/ofJjBgkI9rgwhHY//uSZCEN0qYg0ht5MeRUI5oTZ0w8i1SvRG5lB5EgjmiNrCFigG/6f7bz1ujaElcJnCI4p8QeTAkwAAXIKABh5+VmNCBaDcLPloZtE0g3AIwo4EiwMRVcCVg2HKIhlQwFSyAzpEqgCgQSho4igUAFjop0R4WxspNrRof2/p4YhgO6loV/aZl9VzvoNAC8ggRh4XGco+a1CZCUDE4UCEOY8HB30jLRkJogCFIiGbOW3PIwElmMOWFmjjQi7EYQSAhqsWmhtyqUHBaWko88sqKrqv//gVH+S9qvIiRiUIG2av/+CD3qwWAUpKMQDJymeZlmBUcEgjCZxwKcgOBhZswikxw4IoR3OpAME+6nOISXCn/8LpxhwzJJV/igUY6KX8f8AmAH2yPCWwNOgc4omLcDEsREDQsLCNkvA2fAtADbgUgBrkp/8LIwBUBp4BBSJgEBRX/4YkAMGG8gJASIWNCAaSvX/C6Qn4NlIkHoiwB6In0Oi+r/8WSFkwdsLBBb0BAIoIMCh2QslC+v///hxQuUTcKMH7B6wfiK2FpE+iOQ9USIVqL7////8iRDhmh8kBAL/+5JkVwAFW2hHtm5gADEiKWPIKAAAAAGkHAAAIAAANIOAAAQBgQCADpEu+SJ3wxqDcPlQFfAKj4/8lQzlUlviYqv8VV/qWtav+WUPWv/6lDh+qkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

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
