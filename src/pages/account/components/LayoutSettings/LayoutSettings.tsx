import { useRef, useState } from 'react'
import { Brush2, Eye } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CompanyImageMotion from '@/components/CompanyImageMotion/CompanyImageMotion'
import Toggle from '@/components/Toggle/Toggle'
import AddImageModal from '@/pages/add-content/components/AddImageModal/AddImageModal'
import { useCompanyDefaults } from '@/data/companyDefaults'
import { setCompanyDefault, setCompanyUpload, useCompanyImage, validateCompanyImage } from '@/data/companyImage'
import ThumbnailPreviewModal from './ThumbnailPreviewModal'
import './LayoutSettings.css'

/* Account & Settings > Layout (Figma Account - Settings 8998:24001).
   Select Logo opens the file picker and previews the chosen file locally. The company
   image is the tenant's shared one (src/data/companyImage.ts), changed through the
   shared image picker modal.
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
  const company = useCompanyImage()
  // The default images, each playing its shader in the picker.
  const liveDefaults = useCompanyDefaults().map((d) => ({ id: d.id, src: d.src, overlay: <CompanyImageMotion defaultId={d.id} /> }))
  const [pickerOpen, setPickerOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

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
        <h3 className="acl-title">Company image</h3>
        <div className="acl-thumb">
          <span className="acl-thumb__media">
            <img className="acl-thumb__preview" src={company.src} alt="Company image" width={96} height={96} />
            <CompanyImageMotion />
          </span>
          <div className="acl-thumb__info">
            <p className="acl-text">
              Upload a 512 x 512 px image, PNG or JPEG format. This image shows up in your lesson
              thumbnails and company avatar
            </p>
            <div className="acl-thumb__actions">
              <Button onClick={() => setPickerOpen(true)}>Change Image</Button>
              <Button
                variant="outlined"
                icon={<Eye size={20} color="currentColor" variant="Linear" />}
                onClick={() => setPreviewOpen(true)}
              >
                Preview
              </Button>
            </div>
          </div>
        </div>
        <AddImageModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title="Change company image"
          tabs={['upload', 'defaults']}
          upload={{
            accept: '.png,.jpg,.jpeg',
            helpText: 'Drag or upload a 512 x 512 px PNG or JPEG, smaller than 9 MB.',
            validate: validateCompanyImage,
          }}
          onSelect={setCompanyUpload}
          defaultImages={liveDefaults}
          selectedDefaultId={company.image.kind === 'default' ? company.image.id : undefined}
          onSaveDefault={setCompanyDefault}
        />
        <ThumbnailPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
      </section>
    </div>
  )
}

export default LayoutSettings
