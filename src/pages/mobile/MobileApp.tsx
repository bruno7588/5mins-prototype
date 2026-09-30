import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImportCurve } from 'iconsax-react'
import PhoneFrame from '@/components/mobile/PhoneFrame/PhoneFrame'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import MobileTopNav from '@/components/mobile/TopNav/TopNav'
import MobileTabNav, { type MobileTab } from '@/components/mobile/TabNav/TabNav'
import { getAllPrograms } from '@/pages/programs/programStore'
import ForYouScreen from './ForYouScreen'
import WorkspaceScreen from './WorkspaceScreen'
import ProgramScreen from './ProgramScreen'
import LessonFeedScreen from './LessonFeedScreen'
import LessonSheet from './LessonSheet'
import WebViewScreen from './WebViewScreen'
import deepDivePage from '@/assets/for-you/webview-deep-dive.png'
import resourcePage from '@/assets/for-you/webview-resource.png'
import { feedLessons } from '@/pages/for-you/feedItems'

/**
 * Mobile app prototype shell (Figma scaffold 7632:8501) — the app chrome inside
 * the phone frame with an empty content area. Tab screens get filled in as the
 * mobile pages are built.
 */
function MobileApp() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<MobileTab>('home')
  const [homeChip, setHomeChip] = useState('For You')
  const [progressChip, setProgressChip] = useState('My Team')
  /** Detail screens push over the tabs rather than leaving the phone frame. */
  const [openProgramId, setOpenProgramId] = useState<string | null>(null)
  /** The lessons feed opens over the Home tab; `sheetIndex` is its open "more" sheet. */
  const [feedIndex, setFeedIndex] = useState<number | null>(null)
  const [sheetIndex, setSheetIndex] = useState<number | null>(null)
  /** A link from the sheet, open in the in-app web view; back returns to the sheet. */
  const [webView, setWebView] = useState<{ url: string; kind: 'deep-dive' | 'resource' } | null>(null)
  const { toasts, show: showToast } = useToast()

  const openProgram = openProgramId
    ? getAllPrograms().find((p) => p.id === openProgramId)
    : undefined

  const header = (() => {
    if (webView) {
      return (
        <MobileTopNav
          variant="detail"
          title="Resource"
          onBack={() => setWebView(null)}
        />
      )
    }
    if (feedIndex !== null) {
      return <MobileTopNav variant="lesson-feed" pointsLabel="45 Pt" onBack={() => setFeedIndex(null)} />
    }
    if (openProgram) {
      return <MobileTopNav variant="detail" title="Program" onBack={() => setOpenProgramId(null)} />
    }
    switch (tab) {
      case 'home':
        return (
          <MobileTopNav
            variant="home"
            notificationDot
            chips={[
              { label: 'For You', active: homeChip === 'For You', onClick: () => setHomeChip('For You') },
              {
                label: 'Your Workspace',
                active: homeChip === 'Your Workspace',
                onClick: () => setHomeChip('Your Workspace'),
              },
            ]}
          />
        )
      case 'search':
        return <MobileTopNav variant="search" />
      case 'progress':
        return (
          <MobileTopNav
            variant="chips"
            chips={[
              { label: 'My Team', active: progressChip === 'My Team', onClick: () => setProgressChip('My Team') },
              {
                label: 'My Progress',
                active: progressChip === 'My Progress',
                onClick: () => setProgressChip('My Progress'),
              },
            ]}
          />
        )
      case 'feed':
        return <MobileTopNav variant="title" title="Feed" />
      case 'profile':
        return <MobileTopNav variant="profile" name="Anthony Wallace" role="Customer Support Specialist" />
    }
  })()

  return (
    <PhoneFrame
      header={header}
      overlayHeader={feedIndex !== null && !webView}
      overlay={
        <>
          {sheetIndex !== null ? (
            <LessonSheet
              hidden={!!webView}
              lesson={feedLessons[sheetIndex]}
              onClose={() => setSheetIndex(null)}
              onOpenLink={(url, kind) => setWebView({ url, kind })}
              onDownload={() => showToast('success', 'Downloading...', undefined, ImportCurve)}
            />
          ) : null}
          <ToastContainer toasts={toasts} />
        </>
      }
      footer={
        <MobileTabNav
          active={tab}
          onNavigate={(next) => {
            setOpenProgramId(null)
            setFeedIndex(null)
            setSheetIndex(null)
            setWebView(null)
            setTab(next)
          }}
        />
      }
      onExit={() => navigate('/content-library')}
    >
      {webView ? (
        <WebViewScreen
          url={webView.url}
          image={webView.kind === 'deep-dive' ? deepDivePage : resourcePage}
          width={webView.kind === 'deep-dive' ? 617 : 468}
        />
      ) : null}
      {!webView && feedIndex !== null ? (
        <LessonFeedScreen
          lessons={feedLessons}
          startIndex={feedIndex}
          sheetIndex={sheetIndex}
          onMore={setSheetIndex}
          onIndexChange={setFeedIndex}
        />
      ) : null}
      {feedIndex === null && openProgram ? <ProgramScreen program={openProgram} /> : null}
      {feedIndex === null && !openProgram && tab === 'home' && homeChip === 'For You' ? (
        <ForYouScreen onOpenLesson={(i) => setFeedIndex(i % feedLessons.length)} />
      ) : null}
      {feedIndex === null && !openProgram && tab === 'home' && homeChip === 'Your Workspace' ? (
        <WorkspaceScreen onOpenProgram={setOpenProgramId} />
      ) : null}
      {/* The remaining tab screens land here as they are built. */}
    </PhoneFrame>
  )
}

export default MobileApp
