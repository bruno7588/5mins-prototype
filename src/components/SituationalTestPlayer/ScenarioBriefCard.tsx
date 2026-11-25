import { useState, type ReactNode, type SyntheticEvent } from 'react'
import { DocumentText } from 'iconsax-react'
import Button from '@/components/Button/Button'
import type { ScenarioMediaData } from '@/data/scenarioMedia'
import audioThumb from '@/assets/scenario-media/audio-thumbnail.png'
import './ScenarioBriefCard.css'

const clock = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * The scenario kept within reach at the top of every question (DES-371): a thumbnail
 * of the media, the brief's title, and View Brief. In the app it opens the brief sheet;
 * on web it opens the details panel, and the card shows only while that panel is closed.
 */
function ScenarioBriefCard({ media, title, onOpen }: { media?: ScenarioMediaData; title: string; onOpen: () => void }) {
  const [duration, setDuration] = useState(0)
  const onMeta = (e: SyntheticEvent<HTMLMediaElement>) => setDuration(e.currentTarget.duration || 0)

  let thumb: ReactNode
  if (media?.kind === 'image') {
    thumb = <img className="scbrief__img" src={media.src} alt="" />
  } else if (media?.kind === 'video') {
    thumb = <video className="scbrief__img" src={media.src} preload="metadata" muted playsInline onLoadedMetadata={onMeta} />
  } else if (media?.kind === 'audio') {
    thumb = (
      <>
        <img className="scbrief__img" src={audioThumb} alt="" />
        <audio src={media.src} preload="metadata" onLoadedMetadata={onMeta} />
      </>
    )
  } else {
    thumb = <DocumentText size={24} color="var(--text-secondary)" variant="Linear" />
  }

  return (
    <div className="scbrief">
      <div className="scbrief__thumb" aria-hidden="true">
        {thumb}
        {duration ? <span className="scbrief__time">{clock(duration)}</span> : null}
      </div>
      <div className="scbrief__text">
        <p className="scbrief__title">{title}</p>
      </div>
      <Button variant="outlined" size="sm" onClick={onOpen}>
        View Brief
      </Button>
    </div>
  )
}

export default ScenarioBriefCard
