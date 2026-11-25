import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { createPortal } from 'react-dom'
import { Backward10Seconds, Forward10Seconds, PauseCircle, PlayCircle } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import { ExitFullScreenIcon, FullScreenIcon } from '@/components/icons/PlayerIcons'
import { ToastSpinner } from '@/components/Toast/Toast'
import { toEmbedUrl, type ScenarioMediaData } from '@/data/scenarioMedia'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import AttachedAudioPlayer from './AttachedAudioPlayer'
import './ScenarioMedia.css'
/* The audio player's styles live with the admin field it was built for. */
import './ScenarioMediaField.css'

interface Props {
  media: ScenarioMediaData
  /**
   * Where playback was left, in seconds, shared by every place the same media shows
   * (the brief card, the web details panel, the mobile sheet), so it picks up there.
   */
  position?: MutableRefObject<number>
}

type State = 'loading' | 'ready' | 'failed' | 'unsupported'

const NOUN = { image: 'image', audio: 'audio', video: 'video' } as const
const SKIP = 10

const clock = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * Scenario media (DES-371): the image, audio clip or video on a situational test's
 * brief.
 *
 * Video carries the 5Mins player's controls: back 10 seconds, play or pause, forward 10
 * seconds over the picture; under it a progress bar (no scrubbing) with the time
 * remaining and full screen; in full screen, a close. Audio is the same player the admin
 * sees in the Scenario media field (AttachedAudioPlayer): the Mint pill with the live
 * waveform, without the remove control.
 * Nothing autoplays. The media is fitted inside a slot of fixed maximum height and
 * never cropped. When it can't load or play, the slot says so and points to the brief;
 * nothing around it is blocked.
 */
function ScenarioMedia({ media, position }: Props) {
  const [state, setState] = useState<State>('loading')
  /* Bumped by Try Again, to load the source afresh. */
  const [attempt, setAttempt] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const playerRef = useRef<HTMLVideoElement & HTMLAudioElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  /* The image opens in an overlay on the scrim, not browser full screen. */
  const [zoomed, setZoomed] = useState(false)
  const zoomRef = useRef<HTMLDivElement>(null)
  useOverlayA11y(zoomRef, zoomed, { onEscape: () => setZoomed(false) })

  useEffect(() => {
    const onChange = () => setFullscreen(!!frameRef.current && document.fullscreenElement === frameRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void frameRef.current?.requestFullscreen?.()
  }

  const togglePlay = () => {
    const player = playerRef.current
    if (!player) return
    if (player.paused) void player.play()
    else player.pause()
  }

  const seek = (to: number) => {
    const player = playerRef.current
    if (!player) return
    player.currentTime = Math.min(Math.max(0, to), player.duration || 0)
  }

  const noun = NOUN[media.kind]
  const problem =
    state === 'unsupported'
      ? `This ${noun} can't play on this device. The brief below describes the situation.`
      : media.kind === 'image'
        ? "This image can't load right now. The brief below describes the situation."
        : `This ${noun} can't play right now. The brief below describes the situation.`

  const playerProps = {
    ref: playerRef,
    src: media.src,
    preload: 'metadata' as const,
    'aria-label': media.name,
    onLoadedMetadata: () => {
      const player = playerRef.current
      if (!player) return
      if (position && position.current > 0) player.currentTime = position.current
      setDuration(player.duration || 0)
      setCurrent(player.currentTime)
      setState('ready')
    },
    /* Kept current as it plays or is scrubbed, rather than saved on the way out: the
       next place the media shows can mount before this one has gone (the brief card is
       still sliding out when the panel appears). */
    onTimeUpdate: () => {
      const player = playerRef.current
      if (!player) return
      setCurrent(player.currentTime)
      if (position && !player.ended) position.current = player.currentTime
    },
    onPlay: () => setPlaying(true),
    onPause: () => {
      const player = playerRef.current
      setPlaying(false)
      if (player && position) position.current = player.ended ? 0 : player.currentTime
    },
    /* A clip that has ended reopens stopped at the start. */
    onEnded: () => {
      setPlaying(false)
      if (position) position.current = 0
    },
    onError: () => {
      /* 4 = MEDIA_ERR_SRC_NOT_SUPPORTED: the format, not the connection. */
      setState(playerRef.current?.error?.code === 4 ? 'unsupported' : 'failed')
    },
  }

  /* Audio: the admin's player, so author and learner hear it the same way (Bruno,
     2026-11-24). */
  if (media.kind === 'audio') {
    return (
      <div className="scmedia scmedia--audio">
        <AttachedAudioPlayer src={media.src} />
      </div>
    )
  }

  /* A pasted link plays in its provider's own player (YouTube, Loom, Vimeo): none of the
     5Mins controls, and no remembered position, apply to it. */
  if (media.kind === 'video' && media.embed) {
    return (
      <div className="scmedia scmedia--embed">
        <iframe
          className="scmedia__embed"
          src={toEmbedUrl(media.src)}
          title="Scenario video"
          allow="fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      </div>
    )
  }

  if (state === 'failed' || state === 'unsupported') {
    return (
      <div className={`scmedia scmedia--${media.kind} scmedia--problem`} role="alert">
        <p className="scmedia__message">{problem}</p>
        {state === 'failed' ? (
          <Button
            variant="text"
            size="sm"
            onClick={() => {
              setState('loading')
              setAttempt((a) => a + 1)
            }}
          >
            Try Again
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={`scmedia scmedia--${media.kind}${playing ? ' scmedia--playing' : ''}`}
      ref={frameRef}
      key={attempt}
    >
      {media.kind === 'video' ? (
        <>
          {/* The picture is the play / pause target, as in the lesson player. */}
          <video className="scmedia__video" playsInline onClick={togglePlay} {...playerProps} />
          <div className="scmedia__shade" aria-hidden="true" />
          {fullscreen ? (
            <CloseButton
              variant="fullscreen"
              className="scmedia__close"
              ariaLabel="Exit full screen"
              onClick={toggleFullscreen}
            />
          ) : null}
          <div className="scmedia__centre">
            <button type="button" className="scmedia__ctrl" aria-label="Back 10 seconds" onClick={() => seek(current - SKIP)}>
              <Backward10Seconds size={32} color="currentColor" variant="Linear" />
            </button>
            <button type="button" className="scmedia__ctrl" aria-label={playing ? 'Pause' : 'Play'} onClick={togglePlay}>
              {playing ? (
                <PauseCircle size={48} color="currentColor" variant="Bold" />
              ) : (
                <PlayCircle size={48} color="currentColor" variant="Bold" />
              )}
            </button>
            <button type="button" className="scmedia__ctrl" aria-label="Forward 10 seconds" onClick={() => seek(current + SKIP)}>
              <Forward10Seconds size={32} color="currentColor" variant="Linear" />
            </button>
          </div>
          <div className="scmedia__bar">
            {/* Shows progress only: the bar is not a scrubber (Bruno, 2026-11-24). Moving
                through the clip is the 10-second skips. Figma 17024:90676. */}
            <div
              className="scmedia__progress"
              role="progressbar"
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={duration ? Math.round((current / duration) * 100) : 0}
            >
              <span className="scmedia__progressfill" style={{ width: `${duration ? (current / duration) * 100 : 0}%` }} />
            </div>
            <span className="scmedia__time" aria-label="Time remaining">
              {clock(duration - current)}
            </span>
            <button
              type="button"
              className="scmedia__round"
              aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
              onClick={toggleFullscreen}
            >
              {fullscreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
            </button>
          </div>
        </>
      ) : (
        <button type="button" className="scmedia__imagebtn" aria-label="View image full screen" onClick={() => setZoomed(true)}>
          <img
            className="scmedia__image"
            src={media.src}
            alt={media.name}
            onLoad={() => setState('ready')}
            onError={() => setState('failed')}
          />
        </button>
      )}
      {zoomed
        ? createPortal(
            /* Over the phone screen in the mobile app, over the page on web. */
            <div
              ref={zoomRef}
              className="scmedia-zoom"
              role="dialog"
              aria-modal="true"
              aria-label={media.name}
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setZoomed(false)
              }}
            >
              <CloseButton
                variant="fullscreen"
                className="scmedia-zoom__close"
                ariaLabel="Close image"
                onClick={() => setZoomed(false)}
              />
              <img className="scmedia-zoom__image" src={media.src} alt={media.name} />
            </div>,
            frameRef.current?.closest('.m-phone__screen') ?? document.body,
          )
        : null}
      {state === 'loading' ? (
        <div className="scmedia__loading" role="status">
          <ToastSpinner size={24} />
          <span>Loading {noun}...</span>
        </div>
      ) : null}
    </div>
  )
}

export default ScenarioMedia
