import { useRef, useState, type ReactNode } from 'react'
import { ArrowDown2, DocumentText, Eye, GalleryAdd, Video, VolumeHigh } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import Collapse from '@/components/Collapse/Collapse'
import Dropdown from '@/components/Dropdown/Dropdown'
import FileUploader from '@/components/FileUploader/FileUploader'
import InputField from '@/components/InputField/InputField'
import LessonResourcesTab from '@/components/LessonResourcesTab/LessonResourcesTab'
import QuizTab from '@/components/QuizTab/QuizTab'
import SparkleIcon from '@/components/icons/SparkleIcon'
import type { CourseResource } from '@/components/ResourceCard/resources'
import { nextLessonResourceId } from '@/data/lessonResources'
import type { ContentRow } from '@/pages/your-courses/components/ContentTable/ContentTable'
import lessonThumb from '@/assets/programs/course-thumbs/course-thumb-2.jpg'
import audioThumb from '@/assets/lesson-upload/audio-thumbnail.png'
import youtubeLogo from '@/assets/lesson-upload/youtube.svg'
import loomLogo from '@/assets/lesson-upload/loom.svg'
import synthesiaLogo from '@/assets/lesson-upload/synthesia.svg'
import tiktokLogo from '@/assets/lesson-upload/tiktok.svg'
import vimeoLogo from '@/assets/lesson-upload/vimeo.png'
import '@/components/LessonEditorModal/LessonEditorModal.css'
import './NewLessonModal.css'

export type NewLessonKind = 'video' | 'audio' | 'document' | 'link'

type FileKind = Exclude<NewLessonKind, 'link'>

type Tab = 'quiz' | 'resources' | 'skills' | 'category'

/* Per-kind copy and file rules, from Figma Your Content 5935:28129 (video),
   5936:29170 (audio) and 5936:29318 (document). */
const FILE_KINDS: Record<FileKind, {
  title: string
  plural: string
  icon: ReactNode
  accept: string
  guidelines: string[]
  thumbFallback: string
  rowType: string
}> = {
  video: {
    title: 'Add video',
    plural: 'videos',
    icon: <Video size={40} color="var(--text-secondary)" variant="Linear" />,
    accept: '.mp4,.mkv,.m4v,.mov,video/*',
    guidelines: [
      'Upload videos in .mp4, .mkv, .m4v, or .mov formats.',
      'Keep the video size under 1GB.',
      'The recommended resolution is 720px x 1200px.',
      'Vertical (portrait) videos with an aspect ratio of 9:16 are preferred.',
      'Horizontal videos will have padding on top and bottom to fit in portrait mode',
    ],
    thumbFallback: 'an automatically generated thumbnail',
    rowType: 'Video',
  },
  audio: {
    title: 'Add audio',
    plural: 'audio',
    icon: <VolumeHigh size={40} color="var(--text-secondary)" variant="Linear" />,
    accept: '.mp3,.m4a,.wav,audio/*',
    guidelines: [
      'Upload audio in .mp3, .m4a, or .wav formats.',
      'Clear speech and a quiet background make it easier to follow on the go.',
    ],
    thumbFallback: 'a default lesson thumbnail',
    rowType: 'Audio',
  },
  document: {
    title: 'Add document',
    plural: 'documents',
    icon: <DocumentText size={40} color="var(--text-secondary)" variant="Linear" />,
    accept: '.pdf,.docx,.pptx,.xlsx',
    guidelines: [
      'Upload documents in .pdf, .docx, .pptx, or .xlsx formats.',
      'The AI extracts the content and generates quiz questions you can review, edit or add to after publishing.',
    ],
    thumbFallback: 'the first page of the document as the lesson thumbnail',
    rowType: 'PDF',
  },
}

const LINK_SOURCES = [
  { name: 'Youtube', logo: youtubeLogo, width: 23 },
  { name: 'Loom', logo: loomLogo, width: 20 },
  { name: 'Synthesia', logo: synthesiaLogo, width: 24 },
  { name: 'TikTok', logo: tiktokLogo, width: 14 },
  { name: 'Vimeo', logo: vimeoLogo, width: 20 },
]

const LINK_TYPES = [
  { value: 'video', label: 'Video' },
  { value: 'article', label: 'Article' },
]

const isUrl = (value: string) => /^https?:\/\/\S+\.\S+/.test(value.trim())

interface NewLessonModalProps {
  kind: NewLessonKind
  onClose: () => void
  onPublish: (lesson: ContentRow) => void
}

/**
 * Add Content → the full-screen form for a new video, audio, document or external
 * link lesson, in its default (empty) state. The filled version of the same screen
 * is LessonEditorModal, whose layout classes this reuses.
 */
function NewLessonModal({ kind, onClose, onPublish }: NewLessonModalProps) {
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [linkType, setLinkType] = useState('video')
  const [link, setLink] = useState('')
  const [guidelinesOpen, setGuidelinesOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('quiz')
  const [resources, setResources] = useState<CourseResource[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isLink = kind === 'link'
  const fileKind = isLink ? null : FILE_KINDS[kind]
  const canPublish = name.trim() !== '' && (isLink ? isUrl(link) : file !== null)

  const publish = () => {
    if (!canPublish) return
    onPublish({
      id: Date.now(),
      fileName: name.trim(),
      type: fileKind ? fileKind.rowType : 'External Link',
      uploadedBy: 'You',
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      thumbnail: kind === 'audio' ? audioThumb : lessonThumb,
    })
  }

  const thumbnailField = (fallback: string) => (
    <div className="lesson-editor-field">
      <span className="lesson-editor-label">Lesson thumbnail</span>
      <div className="lesson-editor-thumb-row">
        {kind === 'audio' ? (
          <div className="lesson-editor-thumb" style={{ backgroundImage: `url(${audioThumb})` }}>
            <span className="lesson-editor-thumb-preview">
              <Eye size={16} color="#FFFFFF" variant="Linear" />
            </span>
          </div>
        ) : (
          <div className="new-lesson-thumb-empty">
            <GalleryAdd size={32} color="var(--text-secondary)" variant="Linear" />
          </div>
        )}
        <div className="lesson-editor-thumb-info">
          <p className="lesson-editor-thumb-copy">
            Upload image or generate with AI. If you don't add one, we'll use {fallback}.
          </p>
          <Button variant="outlined-2" icon={<SparkleIcon size={20} variant="Linear" color="currentColor" />}>
            Add Thumbnail
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="lesson-editor-overlay" role="dialog" aria-modal="true" aria-label={fileKind ? fileKind.title : 'Add external link'}>
      <CloseButton variant="fullscreen" onClick={onClose} className="lesson-editor-close" />

      <div className="lesson-editor-content">
        <div className="lesson-editor-header">
          <div className="lesson-editor-header-row">
            <div className="new-lesson-headline">
              <h2 className="lesson-editor-title">{fileKind ? fileKind.title : 'Add external link'}</h2>
              {isLink && (
                <p className="new-lesson-subtitle">
                  Add videos from YouTube, Loom, Synthesia, TikTok or blog/article links.{' '}
                  <a
                    href="https://help.5mins.ai/articles/4066007-lesson-types#izrzck83q7y"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Learn how it works
                  </a>
                </p>
              )}
            </div>
            <div className="lesson-editor-header-actions">
              <SparkleIcon size={24} gradient />
              <Button disabled={!canPublish} onClick={publish}>
                Publish Lesson
              </Button>
            </div>
          </div>
        </div>

        {fileKind && (
          /* One bordered container: the header row toggles, the list eases open
             inside the same border. */
          <div className="new-lesson-guidelines">
            <button
              type="button"
              className={`new-lesson-guidelines__toggle${guidelinesOpen ? ' new-lesson-guidelines__toggle--open' : ''}`}
              aria-expanded={guidelinesOpen}
              onClick={() => setGuidelinesOpen((o) => !o)}
            >
              <span className="new-lesson-guidelines__title">Guidelines for uploading {fileKind.plural}</span>
              <ArrowDown2 size={20} color="var(--text-secondary)" />
            </button>
            <Collapse open={guidelinesOpen}>
              <ul className="new-lesson-guidelines__list">
                {fileKind.guidelines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Collapse>
          </div>
        )}

        {fileKind ? (
          <div className="lesson-editor-body">
            <FileUploader
              size="S"
              className="new-lesson-uploader"
              state={file ? 'Filled' : 'Enabled'}
              fileName={file?.name}
              accept={fileKind.accept}
              icon={fileKind.icon}
              onFileSelect={setFile}
            />
            <div className="lesson-editor-fields">
              <InputField
                label="Name of the lesson"
                placeholder="Add a name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="lesson-editor-field">
                <span className="lesson-editor-label">File name</span>
                <div className="lesson-editor-file-input">
                  <span className={`lesson-editor-file-name${file ? '' : ' new-lesson-file-placeholder'}`}>
                    {file ? file.name : 'Select a file to upload'}
                  </span>
                  <button
                    type="button"
                    className="lesson-editor-change-file"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {file ? 'Change File' : 'Select File'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept={fileKind.accept}
                    onChange={(e) => {
                      const picked = e.target.files?.[0]
                      if (picked) setFile(picked)
                      e.target.value = ''
                    }}
                  />
                </div>
              </div>
              {thumbnailField(fileKind.thumbFallback)}
            </div>
          </div>
        ) : (
          /* Figma 5936:29443: a single column, no uploader. */
          <div className="new-lesson-link-fields">
            <InputField
              label="Name of the lesson"
              placeholder="Add a name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Dropdown label="Type" options={LINK_TYPES} value={linkType} onChange={setLinkType} />
            <div className="new-lesson-link-group">
              <InputField
                label="Embed a link"
                placeholder="Paste a link here..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
              <div className="new-lesson-sources">
                <span>Paste a link from:</span>
                {LINK_SOURCES.map((s) => (
                  <span key={s.name} className="new-lesson-source">
                    <img src={s.logo} width={s.width} height={s.width === 20 ? 20 : 16} alt="" />
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
            {thumbnailField('the image from the link as lesson thumbnail')}
          </div>
        )}

        <div className="lesson-editor-tabs" role="tablist">
          {([
            ['quiz', 'Quiz'],
            ['resources', 'Resources'],
            ['skills', 'Skills'],
            ['category', 'Add to Category'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`lesson-editor-tab${tab === key ? ' lesson-editor-tab--active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
              {key === 'resources' && resources.length > 0 && (
                <span className="lesson-editor-tab__count">{resources.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="lesson-editor-tab-content">
          {tab === 'quiz' && <QuizTab isNew aiAvailable={!isLink} />}
          {tab === 'resources' && (
            <LessonResourcesTab
              resources={resources}
              isNew
              onAdd={(resource) => setResources((prev) => [...prev, { ...resource, id: nextLessonResourceId() }])}
              onRemove={(resource) => setResources((prev) => prev.filter((r) => r.id !== resource.id))}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default NewLessonModal
