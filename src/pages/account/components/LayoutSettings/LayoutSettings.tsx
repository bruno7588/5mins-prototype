import { useRef, useState } from 'react'
import { Brush2, GalleryAdd } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Toggle from '@/components/Toggle/Toggle'
import './LayoutSettings.css'

/* Account & Settings > Layout (Figma Account - Settings 8998:24001).
   Select Logo / Select Image open the file picker and preview the chosen file locally.
   Prefix: acl- */

/** A hidden file input behind a Select button; the chosen image previews via an object URL. */
function useImagePicker() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const input = (accept: string) => (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (src) URL.revokeObjectURL(src)
        setSrc(URL.createObjectURL(file))
        e.target.value = ''
      }}
    />
  )
  return { src, open: () => inputRef.current?.click(), input }
}

function LogoSlot({ label, mode }: { label: string; mode: 'light' | 'dark' }) {
  const picker = useImagePicker()
  return (
    <div className="acl-logo">
      <div className="acl-logo__field">
        <span className="acl-logo__label">{label}</span>
        <div className={`acl-logo__preview acl-logo__preview--${mode}`}>
          {picker.src ? <img src={picker.src} alt={label} /> : <span>Company Name</span>}
        </div>
      </div>
      <Button onClick={picker.open}>Select Logo</Button>
      {picker.input('image/png,image/jpeg,image/svg+xml')}
    </div>
  )
}

function LayoutSettings() {
  const [workspaceHome, setWorkspaceHome] = useState(false)
  const thumbnail = useImagePicker()

  return (
    <div className="acl-body">
      <section className="acl-card acl-card--row">
        <div className="acl-head">
          <h3 className="acl-title">Make Your Workspace as default home page</h3>
          <p className="acl-text">
            Turning this ON will make Your Workspace the default home page for all users inside your
            company. This would help them easily access assigned courses and assigned content.
          </p>
        </div>
        <div className="acl-toggle">
          <Toggle
            checked={workspaceHome}
            onChange={(e) => setWorkspaceHome(e.target.checked)}
            aria-label="Make Your Workspace the default home page"
          />
        </div>
      </section>

      <section className="acl-card">
        <div className="acl-head">
          <h3 className="acl-title">Upload your brand logo</h3>
          <p className="acl-text">
            Upload a 404 x 104 px horizontal image, PNG format recommended. This logo will appear in
            the top left corner of our platform. Dark mode version of the logo shows up on course
            certificates.
          </p>
        </div>
        <div className="acl-logos">
          <LogoSlot label="Logo in light mode" mode="light" />
          <LogoSlot label="Logo in dark mode" mode="dark" />
        </div>
      </section>

      <section className="acl-card">
        <div className="acl-head">
          <h3 className="acl-title">Theme colours</h3>
          <p className="acl-text">Select the colours that best represent your brand style.</p>
        </div>
        <div className="acl-theme">
          <div className="acl-theme__swatches" aria-hidden="true">
            <span className="acl-swatch acl-swatch--background" />
            <span className="acl-swatch acl-swatch--text" />
            <span className="acl-swatch acl-swatch--accent" />
          </div>
          <span className="acl-text">5Mins Theme</span>
        </div>
        {/* Theme editing isn't built yet: dimmed and inert, not a decoy. */}
        <Button icon={<Brush2 size={20} color="currentColor" variant="Linear" />} disabled className="ui-disabled">
          Customise Theme
        </Button>
      </section>

      <section className="acl-card">
        <h3 className="acl-title">Lesson thumbnail image</h3>
        <div className="acl-thumb">
          <div className="acl-thumb__preview">
            {thumbnail.src ? (
              <img src={thumbnail.src} alt="Lesson thumbnail" />
            ) : (
              <GalleryAdd size={32} color="currentColor" variant="Linear" />
            )}
          </div>
          <div className="acl-thumb__info">
            <p className="acl-text">
              Upload a 256 x 256 px image, PNG or JPEG format. This image shows up in your lesson
              thumbnails.
            </p>
            <Button onClick={thumbnail.open}>Select Image</Button>
          </div>
          {thumbnail.input('image/png,image/jpeg')}
        </div>
      </section>
    </div>
  )
}

export default LayoutSettings
