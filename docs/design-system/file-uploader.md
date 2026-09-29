---
name: 5mins-file-uploader
description: File upload drop zone for 5Mins.ai - two sizes (L full-width, S 180px), five states (Enabled, Hover, Error with a single message line, Uploading with circular progress, Filled with the file name and a Change File button). Use for any file input, drag-and-drop zone, CSV import, document or media upload.
---

# FileUploader Component

> **Figma source:** Library (`EC26cSVe9KNTCWXvYovakw`) — light `11921:6366` / dark `11546:1560` (verified 2026-07-03; earlier baseline `11362-1265`)  
> **React + TypeScript** · **Iconsax icons**

> **Updated 2026-09-29 (verified against code):** frontmatter description updated (single error line, no Preview); `onChangeFile` is only called from Filled; the stale 8px button radius, token names and hover override now match `FileUploader.css`; the Preview button section and the outdated full-component sketch are removed; the progress track is `var(--border)`; the recipes compile against the real props.

> **Updated 2026-09-29 (aligned to prototype usage):** the built component takes a single `errorMessage` (not `errors[]`), has no `onPreview` or Preview button, adds an `icon` prop, uses `ExportCurve` / `ClipboardText` glyphs, draws the Error border in `--text-error` over an 8% danger tint, gives the outlined button a 12px radius and uses a 16px main gap on L. Props, States, Sizes, Icons and Gotchas below now match `src/components/FileUploader/FileUploader.tsx`.

## Usage

**Intent:** a drop zone that lets the user drag in or pick one file, then shows its progress and the file that is held.

**Use when**
- A form or modal needs one file: a lesson file, a course resource, an image, a CSV for bulk invite, a certificate or evidence file.

**Don't use when**
- The resource is a link → use InputField with `type="url"` ([doc](input.md))
- Several files must be picked at once → not supported; the component takes the first file of a drop or pick

**Do**
- Drive `state` from the parent: `'Filled'` once a file is held, `'Error'` with `errorMessage` when validation fails, `'Uploading'` with `progress` while it uploads.
- Restrict file types with `accept`, and show the accepted types and size limit in the label hint above the zone (e.g. "(PDF, DOCX • max. 50MB)").
- Use size `L` (full width) by default; use `S` (180px) in a narrow column beside other fields.
- Pass `icon` to show the media type in Enabled (e.g. a video or audio glyph) and `fileIcon` to show a file-type thumbnail once Filled.
- Clear the held file in `onChangeFile`; in the Filled state "Change File" calls it before reopening the picker. In Uploading, "Change File" only reopens the picker and does not call `onChangeFile`.

**Don't**
- Don't hard-code hex values; use tokens.
- Don't fix the L width to the Figma canvas width (900px); it is `100%`.
- Don't show the Uploading state without `progress`; it renders a static 0% ring.

**Canonical spec:** radius `var(--radius-sm)` (12px). L: width 100%, min height 240px, padding `var(--space-l)` (24px), gap `var(--space-m)` (16px), 40px icon, body 14px / 1.5. S: width 180px, min height 260px, padding `var(--space-m)` (16px), 32px icon, body 12px / 1.2. Border dashed `--border-elevated` (solid when Filled), `--border-hover` + `--input-background` on hover or drag, `--text-error` on error. Body text `--text-secondary`; error text Medium `--text-error`. Button: 1px `--text-primary` border, radius `var(--radius-sm)` (12px), padding `var(--space-s) var(--space-m)` (8px 16px), Bold, hover `--button-outline-fill-hover` with `--text-button-hover`. Progress ring 64px, `--primary-500` on `--border`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11921:6366` / dark `11546:1560`.

**Prototype:** `src/components/FileUploader/FileUploader.tsx` (named and default export)
- `size`: `'L' | 'S'` (default `'L'`); `state`: `'Enabled' | 'Hover' | 'Error' | 'Uploading' | 'Filled'` (uncontrolled if omitted)
- `accept`, `onFileSelect(file)`, `onChangeFile()`
- `fileName`, `progress`, `errorMessage`
- `icon` (Enabled/Hover glyph), `fileIcon` (Filled thumbnail), `className`

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| FileUploader | _to be mapped by engineering_ | | |

---

## Props

```tsx
type FileUploaderSize  = 'L' | 'S';
type FileUploaderState = 'Enabled' | 'Hover' | 'Error' | 'Uploading' | 'Filled';

interface FileUploaderProps {
  size?         : FileUploaderSize;          // default: 'L'
  state?        : FileUploaderState;         // controlled; omit for uncontrolled
  fileName?     : string;                    // shown in Filled state
  progress?     : number;                    // 0 to 100, shown in Uploading state
  errorMessage? : string;                    // Error state: a single message line
  onFileSelect? : (file: File) => void;      // fired on drop or file picker select
  onChangeFile? : () => void;                // fired when "Change File" is clicked in Filled
  accept?       : string;                    // e.g. ".pdf,.csv"
  icon?         : ReactNode;                 // Enabled/Hover: replaces the upload icon, e.g. a video or audio glyph
  fileIcon?     : ReactNode;                 // Filled: replaces the icon, e.g. a 40px type thumbnail (gap to filename becomes 16px)
  className?    : string;
}
```

---

## States & Visual Rules

| State | Border style | Border color | Background | Icon |
|-------|-------------|--------------|------------|------|
| `Enabled` | dashed | `--border-elevated` | transparent | `ExportCurve` Linear |
| `Hover` | dashed | `--border-hover` | `--input-background` | `ExportCurve` Linear |
| `Error` | dashed | `--text-error` | danger tint at 8% (no token yet) | `ExportCurve` Linear, `--danger-500` |
| `Uploading` | dashed | `--border-elevated` | `--input-background` | 64px circular progress |
| `Filled` | **solid** | `--border-elevated` | `--input-background` | `ClipboardText` Bold (or `fileIcon`) |

---

## Sizes

| | L | S |
|---|---|---|
| Width | `100%` | `180px` |
| Min-height | `240px` | `260px` |
| Padding | `24px` | `16px` |
| Icon | `40×40px` | `32×32px` |
| Main gap | `16px` (Error: `24px`) | `16px` (Filled and Error: `24px`) |
| Body font | `14px / 1.5` | `12px / 1.2` |
| Button font | `14px Bold` | `12px Bold` |

---

## Design Tokens

```css
--border-elevated:                 #383d4c;               /* Filled solid */
--border-elevated:                 #383d4c;               /* Enabled/Uploading dashed */
--border-hover:                    #9ea4b3;               /* Hover dashed */
--border:                          #2d313d;               /* Uploading progress-ring track */
--text-error:                      #e95c7b;               /* Error border */
--input-background:                rgba(69,76,94,0.16);   /* tinted bg */
--text-primary:                    #f9f9fa;               /* button labels */
--text-secondary:                  #bfc2cc;               /* body copy, filename */
--text-error:                      #e95c7b;               /* error message */
--button-outline-fill-hover:       /* per mode */         /* hover button fill */
--text-button-hover:               #008393;             /* hover button border + label; light; dark: #00CEE6 */
--radius-sm:  12px;   /* outer border-radius AND button border-radius */
--space-m:    16px;   /* S padding, main gap, button side padding */
--space-l:    24px;   /* L padding */
```

---

## Button Variants

### Outlined — "Select File" / "Change File"
```css
border: 1px solid var(--text-primary);
border-radius: var(--radius-sm);   /* 12px */
padding: var(--space-s) var(--space-m);   /* 8px 16px */
background: transparent;
color: var(--text-primary);
font: 700 14px/1.5 'Poppins';   /* S: 12px/1.4 */
```
**Hover** (when the button itself is hovered, or the whole zone is in `state === 'Hover'` or being dragged over):
```css
background: var(--button-outline-fill-hover);
border-color: var(--text-button-hover);
color: var(--text-button-hover);
```
**Pressed:** transparent fill, border and label `--primary-button-background-pressed`.

---

## Circular Progress (Uploading)

Pure SVG, no external lib needed. Ring: `r=26`, `strokeWidth=4`, `64×64px`.

```tsx
const CircularProgress = ({ pct }: { pct: number }) => {
  const r = 26, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 64, height: 64 }}>
      <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle cx="32" cy="32" r={r} fill="none"
          stroke="var(--primary-500)" strokeWidth="4"
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

---

## Icons (Iconsax)

```tsx
import { ExportCurve, ClipboardText } from 'iconsax-react';

<ExportCurve size={40} color="var(--text-secondary)" variant="Linear" />  // Enabled/Hover (or the `icon` prop)
<ExportCurve size={40} color="var(--danger-500)"     variant="Linear" />  // Error
<ClipboardText size={40} color="var(--text-secondary)" variant="Bold" /> // Filled (or the `fileIcon` prop)
// S size: use size={32} instead of 40
```

---

## Full Component

> **Superseded, see Usage.** The earlier inline-styled sketch (with `errors[]`, `onPreview` and a Preview button) has been removed because it did not match the built component. Use `src/components/FileUploader/FileUploader.tsx` with `FileUploader.css` as the reference.

---

## Usage Recipes

### Uncontrolled (simplest)
```tsx
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

---

## Gotchas

- **L width = `100%`, not `900px`** — the Figma fixed value is design canvas only.
- **`progress` required in Uploading** — omitting it renders a static `0%` ring.
- **`errorMessage` only renders in `state="Error"`**: one Medium line in `--text-error` (16px L / 12px S).
- **No "Preview" button in the built component**: Filled shows only "Change File".
- **Drag-over mimics Hover styling** — `isDragging` overrides border to `--border-hover`.
- **Always use design tokens, not raw hex** — `var(--danger-500)` not `#df1642`.
