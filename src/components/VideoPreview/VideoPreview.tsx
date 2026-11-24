import { useEffect, useRef, useState } from 'react'
import { Backward10Seconds, Forward10Seconds, PauseCircle, PlayCircle } from 'iconsax-react'
import Slider from '@/components/Slider/Slider'
import { ExitFullScreenIcon, FullScreenIcon } from '@/components/icons/PlayerIcons'
import './VideoPreview.css'

const clock = (secs: number) => {
  const s = Math.floor(secs)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * An uploaded video the admin can play to check it is the right one, as a 200 x 292
 * tile (Add a New Video's drop zone, the Scenario media field): the picture in the middle of the tile with back 10, play and forward 10 over it, and
 * a scrub bar with the elapsed time along the bottom.
 */
function VideoPreview({
  src,
  name,
  fullScreen = false,
}: {
  src: string
  name: string
  /** Adds a full screen button after the time, for a preview too small to judge the clip. */
  fullScreen?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [isFull, setIsFull] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFull(!!frameRef.current && document.fullscreenElement === frameRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void frameRef.current?.requestFullscreen?.()
  }
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) void v.play()
    else v.pause()
  }

  const seek = (to: number) => {
    const v = ref.current
    if (!v || !v.duration) return
    v.currentTime = Math.max(0, Math.min(v.duration, to))
    setTime(v.currentTime)
  }

  return (
    <div className={`vpreview${playing ? ' vpreview--playing' : ''}`} ref={frameRef}>
      <div className="vpreview__stage">
        <video
          ref={ref}
          className="vpreview__video"
          src={src}
          playsInline
          preload="metadata"
          aria-label={name}
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
        <div className={`vpreview__controls${playing ? ' vpreview__controls--playing' : ''}`}>
          <button type="button" className="vpreview__btn" aria-label="Back 10 seconds" onClick={() => seek(time - 10)}>
            <Backward10Seconds size={24} color="currentColor" variant="Linear" />
          </button>
          <button type="button" className="vpreview__btn" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle}>
            {playing ? (
              <PauseCircle size={40} color="currentColor" variant="Bold" />
            ) : (
              <PlayCircle size={40} color="currentColor" variant="Bold" />
            )}
          </button>
          <button type="button" className="vpreview__btn" aria-label="Forward 10 seconds" onClick={() => seek(time + 10)}>
            <Forward10Seconds size={24} color="currentColor" variant="Linear" />
          </button>
        </div>
      </div>
      <div className="vpreview__bar">
        <Slider
          aria-label="Video position"
          min={0}
          max={duration || 1}
          step={0.1}
          value={time}
          onChange={seek}
          className="vpreview__track"
        />
        <span className="vpreview__time">{clock(time)}</span>
        {fullScreen ? (
          <button type="button" className="vpreview__btn vpreview__full" aria-label={isFull ? 'Exit full screen' : 'Full screen'} onClick={toggleFull}>
            {isFull ? <ExitFullScreenIcon /> : <FullScreenIcon />}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default VideoPreview
