import './LessonFeedScreen.css'

interface WebViewScreenProps {
  /** Stand-in for the loaded page: a capture of the site, as in Figma. */
  image: string
  url: string
  /** Rendered width of the capture in px; wider than the screen, cropped to the centre. */
  width: number
}

/**
 * In-app web view (Figma Lessons-Feed 10757:35298 "Take a deep dive", 10757:35373
 * "Resource"): the linked page opens inside the app under a detail header, so the
 * learner comes straight back to the lesson. The prototype shows a capture of the
 * page rather than loading it, since most sites refuse to be framed.
 */
function WebViewScreen({ image, url, width }: WebViewScreenProps) {
  return (
    <div className="m-webview" role="document" aria-label={url}>
      <img className="m-webview__page" src={image} alt="" style={{ width }} />
    </div>
  )
}

export default WebViewScreen
