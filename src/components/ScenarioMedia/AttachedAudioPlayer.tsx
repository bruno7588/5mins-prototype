import { useEffect, useMemo, useRef, useState } from 'react'
import { Add, Backward10Seconds, Forward10Seconds, PauseCircle, PlayCircle } from 'iconsax-react'
import Tooltip from '@/components/Tooltip/Tooltip'

/* The waveform is the clip's own, and it moves to the clip's own sound, the way the
   ElevenLabs UI waveforms and wavesurfer-style players do it (Bruno, 2026-11-24: a CSS
   loop looked unrealistic):
   - shape: the file is decoded once and its loudness is measured in one slice per bar, so quiet
     passages are short bars and loud ones tall;
   - motion: while it plays, an analyser reads the sound coming out and each bar swells
     with the energy in its own slice of the spectrum, so silence is still and speech
     moves. Nothing loops. */
/* Bar geometry from the ElevenLabs UI AudioScrubber (its waveform.tsx defaults; Bruno,
   2026-11-24): bars 3px wide, 1px apart, never shorter than 4px, centred on the
   track. The ends are fully rounded, as 5Mins rounds things, where ElevenLabs uses 1px. The CSS (.scfield-audio__bar) carries the same numbers. The
   track is as wide as the drawer leaves it, so the number of bars is however many
   4px steps fit. */
const BAR_STEP = 4

/* Until the file is decoded (or if it cannot be), the Figma waveform's seven-bar shape
   (Your Content 3503:43456), repeated along the track. */
const SHAPE = [25, 50, 88, 63, 100, 63, 25]
const placeholder = (bars: number) =>
  Array.from({ length: bars }, (_, n) => Math.round(SHAPE[n % 7] * [1, 0.7, 0.85, 0.6][Math.floor(n / 7) % 4]))

/** Loudness of each slice of the clip, as a share of the track's height. */
function peaksOf(buffer: AudioBuffer, BARS: number): number[] {
  const data = buffer.getChannelData(0)
  const size = Math.max(1, Math.floor(data.length / BARS))
  const step = Math.max(1, Math.floor(size / 2000))
  const rms = Array.from({ length: BARS }, (_, b) => {
    let sum = 0
    let count = 0
    for (let i = b * size; i < (b + 1) * size && i < data.length; i += step) {
      sum += data[i] * data[i]
      count++
    }
    return Math.sqrt(sum / Math.max(1, count))
  })
  const max = Math.max(...rms, 1e-4)
  /* A gentle curve lifts the quiet parts so they stay visible; 12% is the shortest bar. */
  return rms.map((v) => Math.max(12, Math.round((v / max) ** 0.7 * 100)))
}

/* How far a bar swings while the clip plays. At rest the tallest bar fills 1 / MAX_SCALE
   of the track, so a peak has room to grow to the full height without leaving the pill. */
const MIN_SCALE = 0.3
const MAX_SCALE = 1.6
/* The shortest a bar is ever drawn, at rest (CSS min-height) and in motion. */
const MIN_BAR_PX = 4

/* Which slice of the spectrum each bar listens to: spread over the bins speech lives in
   (about 350Hz to 7kHz), shuffled so neighbouring bars do not move as one. */
const binOf = (n: number) => 2 + ((n * 7) % 40)

const AudioCtx: typeof AudioContext | undefined =
  typeof window === 'undefined' ? undefined : window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

const formatTime = (secs: number) => {
  const s = Math.floor(secs)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** The compact player: rewind, play, forward, a scrub bar and the length. `onRemove`
 *  adds the remove control. Recovered from the per-question Attach Media (2026-11-24). */
export default function AttachedAudioPlayer({ src, onRemove }: { src: string; onRemove?: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [time, setTime] = useState(0)
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null)
  const waveRef = useRef<HTMLDivElement>(null)
  const [bars, setBars] = useState(0)

  /* As many bars as fit the track, kept right if the drawer is resized. */
  useEffect(() => {
    const el = waveRef.current
    if (!el) return
    const fit = () => setBars(Math.max(0, Math.floor((el.clientWidth + 1) / BAR_STEP)))
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const peaks = useMemo(() => (buffer ? peaksOf(buffer, bars) : placeholder(bars)), [buffer, bars])
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const barRefs = useRef<(HTMLSpanElement | null)[]>([])
  const frame = useRef(0)

  const context = () => {
    if ((!ctxRef.current || ctxRef.current.state === 'closed') && AudioCtx) ctxRef.current = new AudioCtx()
    return ctxRef.current
  }

  /* The clip's real shape. */
  useEffect(() => {
    let cancelled = false
    const ctx = context()
    if (!ctx) return
    fetch(src)
      .then((res) => res.arrayBuffer())
      .then((bytes) => ctx.decodeAudioData(bytes))
      .then((buffer) => {
        if (!cancelled) setBuffer(buffer)
      })
      .catch(() => {
        /* Not decodable here: the placeholder shape stays. */
      })
    return () => {
      cancelled = true
    }
  }, [src])

  const still = () => {
    cancelAnimationFrame(frame.current)
    for (const bar of barRefs.current) if (bar) bar.style.transform = ''
  }

  /* The bars follow the sound: listen to what is playing and size each bar by the
     energy in its slice of the spectrum, every frame. */
  const listen = () => {
    const audio = audioRef.current
    const ctx = context()
    if (!audio || !ctx) return
    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      /* How quickly a bar follows the sound. Each reading keeps this share of the last
         one, so the bar moves (1 - share) of the way to the new level per reading:
         0.4 at first, slowed by 20% to 0.32, then another 20% to 0.256 (Bruno,
         2026-11-24). */
      analyser.smoothingTimeConstant = 0.744
      ctx.createMediaElementSource(audio).connect(analyser)
      analyser.connect(ctx.destination)
      analyserRef.current = analyser
    }
    void ctx.resume()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const analyser = analyserRef.current
    const levels = new Uint8Array(analyser.frequencyBinCount)
    /* Each bar's resting height, to the fraction of a pixel, read once before they move. */
    const rest = barRefs.current.map((bar) => (bar ? parseFloat(getComputedStyle(bar).height) : 0))
    const tick = () => {
      analyser.getByteFrequencyData(levels)
      barRefs.current.forEach((bar, n) => {
        if (!bar) return
        /* Exaggerated on purpose (Bruno, 2026-11-24): the level is pushed up and
           curved so quiet stays low and loud leaps, and the bar runs from 0.3 of its
           height in silence to 1.6 on a peak. */
        const level = Math.min(1, (levels[binOf(n)] / 255) * 1.25) ** 1.6
        /* The 4px floor holds while it plays too: a bar never shrinks to less than 4px,
           whatever its resting height. */
        const floor = Math.max(MIN_SCALE, MIN_BAR_PX / (rest[n] || MIN_BAR_PX))
        bar.style.transform = `scaleY(${Math.max(floor, MIN_SCALE + level * (MAX_SCALE - MIN_SCALE)).toFixed(3)})`
      })
      frame.current = requestAnimationFrame(tick)
    }
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(tick)
  }

  /* On the way out, stop listening and release the audio engine. The refs are cleared
     too: React's development double-mount runs this once before the player is used, and
     a closed engine left in place would swallow the sound. */
  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      void ctxRef.current?.close()
      ctxRef.current = null
      analyserRef.current = null
    },
    [],
  )

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) void audio.play()
    else audio.pause()
  }

  const seek = (to: number) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    audio.currentTime = Math.max(0, Math.min(audio.duration, to))
    setTime(audio.currentTime)
  }

  return (
    <div className="scfield-audio">
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => {
          setPlaying(true)
          listen()
        }}
        onPause={() => {
          setPlaying(false)
          still()
        }}
        onEnded={() => {
          setPlaying(false)
          still()
          seek(0)
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      <div className="scfield-audio__controls">
        {/* No tooltips here: the three icons are familiar enough on their own (Bruno,
            2026-11-24). Each keeps its aria-label. */}
        <button type="button" className="scfield-iconbtn" aria-label="Rewind 10 seconds" onClick={() => seek(time - 10)}>
          <Backward10Seconds size={20} color="var(--text-primary)" variant="Bold" />
        </button>
        <button type="button" className="scfield-iconbtn" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle}>
          {playing
            ? <PauseCircle size={32} color="var(--text-primary)" variant="Bold" />
            : <PlayCircle size={32} color="var(--text-primary)" variant="Bold" />}
        </button>
        <button type="button" className="scfield-iconbtn" aria-label="Forward 10 seconds" onClick={() => seek(time + 10)}>
          <Forward10Seconds size={20} color="var(--text-primary)" variant="Bold" />
        </button>
      </div>
      {/* Progress is the waveform itself (Bruno, 2026-11-24): the bars up to the playhead
          are the primary text colour, the rest are white at 64%, and while it plays they
          move with the sound. A range input lies over it, so it is still dragged,
          clicked and keyed like a slider. */}
      <div ref={waveRef} className={`scfield-audio__wave${playing ? ' scfield-audio__wave--playing' : ''}`}>
        {peaks.map((h, n) => (
          <span
            key={n}
            ref={(el) => {
              barRefs.current[n] = el
            }}
            className={`scfield-audio__bar${duration && n / peaks.length < time / duration ? ' scfield-audio__bar--played' : ''}`}
            style={{ height: `${(h / MAX_SCALE).toFixed(1)}%` }}
          />
        ))}
        <input
          className="scfield-audio__seek"
          type="range"
          aria-label="Audio position"
          min={0}
          max={duration || 1}
          step={0.1}
          value={time}
          onChange={(e) => seek(Number(e.target.value))}
        />
      </div>
      <span className="scfield-audio__duration">{formatTime(duration)}</span>
      {onRemove && (
        <Tooltip icon={false} text="Remove media" alignment="End">
          <button type="button" className="scfield-iconbtn scfield-iconbtn--remove" aria-label="Remove media" onClick={onRemove}>
            <Add size={20} color="currentColor" style={{ transform: 'rotate(45deg)' }} />
          </button>
        </Tooltip>
      )}
    </div>
  )
}

