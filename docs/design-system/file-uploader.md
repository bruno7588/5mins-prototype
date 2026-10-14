---
name: 5mins-file-uploader
description: File upload drop zone for 5Mins.ai - two sizes (L full-width, S 180px), five states (Enabled, Hover, Error with a bulleted message list, Uploading with circular progress, Filled with the file name; one "Select File" button in every state). Use for any file input, drag-and-drop zone, CSV import, document or media upload.
---

# File uploader

A drop zone that lets the user drag in or pick one file, then shows its progress and the file that is held. React + TypeScript, Iconsax icons.

**Code:** `import FileUploader from '@/components/FileUploader/FileUploader'` (named and default export)
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, `11546:1560`
**Last verified:** 2026-09-29

## Usage

**Intent:** a drop zone that lets the user drag in or pick one file, then shows its progress and the file that is held.

**Use when**
- A form or modal needs one file: a lesson file, a course resource, an image, a CSV for bulk invite, a certificate or evidence file.

**Don't use when**
- The resource is a link → use InputField with `type="url"` ([doc](input.md))
- Several files must be picked at once → not supported; the component takes the first file of a drop or pick

**Do**
- Drive `state` from the parent: `'Filled'` once a file is held, `'Error'` with `errorMessage` (one string, or an array for several) when validation fails, `'Uploading'` with `progress` while it uploads.
- Restrict file types with `accept`, and show the accepted types and size limit in the label hint above the zone (e.g. "(PDF, DOCX • max. 50MB)").
- Use size `L` (full width) by default; use `S` (180px) in a narrow column beside other fields.
- Pass `icon` to show the media type in Enabled (e.g. a video or audio glyph) and `fileIcon` to show a file-type thumbnail once Filled.
- Clear the held file in `onChangeFile`; in the Filled state "Select File" calls it before reopening the picker. In other states it only reopens the picker.

**Don't**
- Don't hard-code hex values; use tokens (`var(--danger-500)`, not `#df1642`).
- Don't fix the L width to the Figma canvas width (900px); it is `100%`. The Figma fixed value is design canvas only.
- Don't show the Uploading state without `progress`; it renders a static 0% ring.

**Canonical spec:** radius `var(--radius-sm)` (12px). L: width 100%, min height 240px, padding `var(--space-l)` (24px), gap `var(--space-ml)` (20px), icon-to-text gap 16px, 40px icon, body 14px / 1.5. S: width 180px, min height 260px, padding `var(--space-m)` (16px), gap 16px (24px when Filled), icon-to-text gap 8px, 32px icon, body 12px / 1.4 (1.2 when Uploading or Filled). Border dashed `--border-elevated` (solid when Filled), `--border-hover` + `--input-background` on hover or drag, `--danger-500` over a 16% Danger-500 wash on error. Body text `--text-secondary`; error list Regular `--text-error` (14px / 1.5 L, 12px / 1.2 S), "+N errors" 12px. Button "Select File": 1px `--border-elevated`, radius 12px, padding 10px 20px (L) / 8px 16px (S), Bold `--text-primary`; hover `--button-outline-fill-hover` with `--primary-button-background-hover`. Progress ring 64px, `--primary-600` on `--border`.

## Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Size | L / S | `size` | `'L'` (default) / `'S'` | same casing |
| State | Enabled / Hover / Error / Uploading / Filled | `state` | `'Enabled'` / `'Hover'` / `'Error'` / `'Uploading'` / `'Filled'` | controlled; omit for uncontrolled. Hover also comes from CSS `:hover` and drag-over |
| State | Focus | n/a | CSS `:focus-visible` | cyan ring on the zone and button |
| Info (slot) | body content | `icon`, `fileName`, `fileIcon` | ReactNode / string / ReactNode | content depends on state |
| Info2 (slot) | body content | `icon`, `fileName`, `fileIcon` | as above | |
| Progress (text) | "72%" | `progress` | 0-100 | Uploading |
| Error message (text) | "Error message here!" | `errorMessage` | string or string[] | Error; the "+N errors" line is fixed sample text |

- **Figma only:** the `Info` / `Info2` slots as free containers (text and icons inside a slot cannot be component properties); no Disabled variant.
- **Code only:** `onFileSelect(file)`, `onChangeFile()`, `accept`, `icon` (Enabled/Hover glyph), `fileIcon` (Filled thumbnail), `className`.

```tsx
type FileUploaderSize  = 'L' | 'S';
type FileUploaderState = 'Enabled' | 'Hover' | 'Error' | 'Uploading' | 'Filled';

interface FileUploaderProps {
  size?         : FileUploaderSize;          // default: 'L'
  state?        : FileUploaderState;         // controlled; omit for uncontrolled
  fileName?     : string;                    // shown in Filled state
  progress?     : number;                    // 0 to 100, shown in Uploading state
  errorMessage? : string | string[];         // Error state: up to three bullets, then "+N errors"
  onFileSelect? : (file: File) => void;      // fired on drop or file picker select
  onChangeFile? : () => void;                // fired when "Select File" is clicked in Filled
  accept?       : string;                    // e.g. ".pdf,.csv"
  icon?         : ReactNode;                 // Enabled/Hover: replaces the upload icon, e.g. a video or audio glyph
  fileIcon?     : ReactNode;                 // Filled: replaces the icon, e.g. a 40px type thumbnail (gap to filename becomes 16px)
  className?    : string;
}
```

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| FileUploader | _to be mapped by engineering_ | | |

## Anatomy

- Zone: dashed (solid when Filled) border, radius 12px, icon, body text, one "Select File" button.
- Icon: 40px (L) / 32px (S) Iconsax, or a 64px circular progress ring while Uploading.
- Button: outlined "Select File", the only label in every state. There is no Preview button.

### Icons (Iconsax)

```tsx
import { DocumentUpload, DocumentText } from 'iconsax-react';

<DocumentUpload size={40} color="var(--text-secondary)" variant="Linear" />  // Enabled/Hover (or the `icon` prop)
<DocumentUpload size={40} color="var(--text-error)"     variant="Linear" />  // Error
<DocumentText size={40} color="var(--text-secondary)" variant="Bold" />        // Filled (or the `fileIcon` prop)
// S size: use size={32} instead of 40
```

### Circular progress (Uploading)

Pure SVG, no external lib needed. Ring: `r=26`, `strokeWidth=4`, `64×64px`, `--primary-600` arc on a `--border` track.

```tsx
const CircularProgress = ({ pct }: { pct: number }) => {
  const r = 26, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 64, height: 64 }}>
      <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle cx="32" cy="32" r={r} fill="none"
          stroke="var(--primary-600)" strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round" />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Poppins'", fontSize: 14, color: 'var(--text-secondary)',
      }}>{pct}%</span>
    </div>
  );
};
```

### Button: outlined "Select File"

```css
border: 1px solid var(--border-elevated);
border-radius: var(--radius-sm);   /* 12px */
padding: var(--space-ssm) var(--space-ml);   /* L 10px 20px; S var(--space-s) var(--space-m), 8px 16px */
background: transparent;
color: var(--text-primary);
font: 700 14px/1.5 'Poppins';   /* S: 12px/1.4 */
```

## Sizes

| | L | S |
|---|---|---|
| Width | `100%` | `180px` |
| Min-height | `240px` | `260px` |
| Padding | `24px` | `16px` |
| Icon | `40×40px` | `32×32px` |
| Main gap | `20px` | `16px` (Filled: `24px`) |
| Icon-to-text gap | `16px` | `8px` |
| Body font | `14px / 1.5` | `12px / 1.4` (Uploading, Filled: `1.2`) |
| Button font | `14px Bold` | `12px Bold` |

## States

| State | Border style | Border colour | Background | Icon |
|-------|-------------|--------------|------------|------|
| `Enabled` | dashed | `--border-elevated` | transparent | `DocumentUpload` Linear, `--text-secondary` |
| `Hover` | dashed | `--border-hover` | `--input-background` | `DocumentUpload` Linear; the button lights up too |
| `Error` | dashed | `--danger-500` | Danger-500 at 16% (no token yet) | `DocumentUpload` Linear, `--text-error` |
| `Uploading` | dashed | `--border-elevated` | `--input-background` | 64px circular progress |
| `Filled` | **solid** | `--border-elevated` | `--input-background` | `DocumentText` Bold (or `fileIcon`) |

- **Drag-over** mimics Hover styling: `isDragging` overrides the border to `--border-hover`.
- **Error:** `errorMessage` only renders in `state="Error"`: a bulleted Regular list in `--text-error` (14px L / 12px S), up to three items, then "+N errors" for the rest. Pass a string for one message or an array for several.

| Button state | Tokens |
|---|---|
| Rest | transparent fill, 1px `--border-elevated`, label `--text-primary` |
| Hover (the button itself is hovered, or the whole zone is in `state === 'Hover'` or being dragged over) | `background: var(--button-outline-fill-hover)`; border and label `var(--primary-button-background-hover)` |
| Pressed | transparent fill, border and label `--primary-button-background-pressed` |
| Focus-visible (zone and button) | cyan ring, `outline: 2px solid var(--primary-button-background)`, offset 2px |

## Tokens

Dark-mode resolutions shown for reference; light values resolve per mode.

```css
--border-elevated:                 #383d4c;               /* Enabled/Uploading dashed, Filled solid */
--border-hover:                    #9ea4b3;               /* Hover dashed */
--border:                          #2d313d;               /* Uploading progress-ring track */
--danger-500:                      #df1642;               /* Error border; the wash is Danger-500 at 16% */
--input-background:                rgba(69,76,94,0.16);   /* tinted bg */
--text-primary:                    #f9f9fa;               /* button labels */
--text-secondary:                  #bfc2cc;               /* body copy, filename */
--text-error:                      #e95c7b;               /* error icon and list */
--button-outline-fill-hover:       /* per mode */         /* hover button fill */
--primary-button-background-hover: /* per mode */          /* hover button border + label */
--radius-sm:  12px;   /* outer border-radius AND button border-radius */
--space-m:    16px;   /* S padding and gap, L icon-to-text gap */
--space-ml:   20px;   /* L main gap, L button side padding */
--space-l:    24px;   /* L padding */
```

## Accessibility

- The zone is `role="button"`, `tabIndex={0}`, named "File upload drop zone"; Enter opens the file picker (not while Uploading or Filled).
- The hidden file input is named "Upload file"; the visible "Select File" button opens the picker once.
- The error list is `role="alert"`.
- Zone and button show the cyan focus-visible ring (see States).

## Examples

### Uncontrolled (simplest)
```tsx
import FileUploader from '@/components/FileUploader/FileUploader'

<FileUploader
  accept=".pdf,.csv,.xlsx"
  onFileSelect={file => console.log(file.name)}
/>
```

### Controlled with upload progress
```tsx
const [state, setState]     = useState<'Enabled' | 'Uploading' | 'Filled'>('Enabled');
const [progress, setProgress] = useState(0);
const [fileName, setFileName] = useState('');

const handleSelect = async (file: File) => {
  setFileName(file.name);
  setState('Uploading');
  for (let i = 0; i <= 100; i += 10) {
    await new Promise(r => setTimeout(r, 150));
    setProgress(i);
  }
  setState('Filled');
};

<FileUploader
  state={state} fileName={fileName} progress={progress}
  onFileSelect={handleSelect}
  onChangeFile={() => { setState('Enabled'); setFileName(''); }}
/>
```

### Error after validation
```tsx
<FileUploader
  state="Error"
  errorMessage="File exceeds the 10MB limit."
  onFileSelect={handleSelect}
/>
```

### Small (side drawer / narrow column)
```tsx
<FileUploader size="S" onFileSelect={handleSelect} />
```

## Related

- [input.md](input.md) - InputField `type="url"` for links
- [buttons.md](buttons.md) - outlined button tokens
