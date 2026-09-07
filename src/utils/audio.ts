/**
 * Audio synthesis for realistic, tactile abacus bead clicks.
 * Uses Web Audio API without external audio assets.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function isAudioEnabled(): boolean {
  return soundEnabled;
}

export function setAudioEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // Audio auto-resume may fail until user gesture
    });
  }
  return audioCtx;
}

/**
 * Play a tactile wooden abacus bead click
 * @param pitchModulation Pitch variance based on bead index or rod
 */
export function playBeadClick(pitchModulation: number = 1): void {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Create a subtle dual-layer click (sharp transient + wooden body resonance)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Wood body frequency ~ 650Hz to 1200Hz
    const baseFreq = 780 * Math.max(0.6, Math.min(1.8, pitchModulation));
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.035);

    // Bandpass filter for wooden cavity resonance
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq, now);
    filter.Q.setValueAtTime(4.0, now);

    // Fast decay envelope
    gainNode.gain.setValueAtTime(0.09, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch {
    // Audio failures should not break interactions
  }
}

/**
 * Play a chime or success tone for correct practice answer
 */
export function playSuccessChime(): void {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.07;
      const duration = 0.28;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.07, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.01);
    });
  } catch {
    // Graceful silence
  }
}
