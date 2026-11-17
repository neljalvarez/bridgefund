/** Optional 8-bit sound effects. Disabled by default; generated with WebAudio (no files). */
type Cue = "click" | "success" | "unlock" | "coin";

const NOTES: Record<Cue, [number, number][]> = {
  click: [[660, 0.04]],
  coin: [[988, 0.06], [1319, 0.12]],
  success: [[523, 0.07], [659, 0.07], [784, 0.12]],
  unlock: [[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.2]],
};

let ctx: AudioContext | null = null;

export function playCue(cue: Cue, enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new AC();
    let t = ctx.currentTime;
    for (const [freq, dur] of NOTES[cue]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  } catch {
    /* audio unavailable — ignore */
  }
}
