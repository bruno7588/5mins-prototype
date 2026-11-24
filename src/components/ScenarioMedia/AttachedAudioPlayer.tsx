import { useRef, useState } from 'react'
import { Add, Backward10Seconds, Forward10Seconds, PauseCircle, PlayCircle } from 'iconsax-react'
import Slider from '@/components/Slider/Slider'
import Tooltip from '@/components/Tooltip/Tooltip'

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
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); seek(0) }}
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
      <Slider
        aria-label="Audio position"
        min={0}
        max={duration || 1}
        step={0.1}
        value={time}
        onChange={seek}
        className="scfield-audio__track"
      />
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

