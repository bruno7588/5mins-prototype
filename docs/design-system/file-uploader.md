# FileUploader Component

> **Figma source:** Library node `11362-1265`  
> **React + TypeScript** · **Iconsax icons**

---

## Props

```tsx
type FileUploaderSize  = 'L' | 'S';
type FileUploaderState = 'Enabled' | 'Hover' | 'Error' | 'Uploading' | 'Filled';

interface FileUploaderProps {
  size?         : FileUploaderSize;          // default: 'L'
  state?        : FileUploaderState;         // controlled; omit for uncontrolled
  fileName?     : string;                    // shown in Filled state
  progress?     : number;                    // 0–100, shown in Uploading state
  errorMessage? : string;                    // shown in Error state
  onFileSelect? : (file: File) => void;      // fired on drop or file picker select
  onChangeFile? : () => void;                // fired when "Change File" is clicked
  onPreview?    : () => void;                // fired when "Preview" is clicked
  accept?       : string;                    // e.g. ".pdf,.csv"
  className?    : string;
}
```

---

## States & Visual Rules

| State | Border style | Border color | Background | Icon |
|-------|-------------|--------------|------------|------|
| `Enabled` | dashed | `#454c5e` | transparent | `CloudAdd` Linear |
| `Hover` | dashed | `#9ea4b3` | `rgba(69,76,94,0.16)` | `CloudAdd` Linear |
| `Error` | dashed | `#df1642` | `rgba(223,22,66,0.16)` | `CloudAdd` Linear, red |
| `Uploading` | dashed | `#454c5e` | `rgba(69,76,94,0.16)` | 64px circular progress |
| `Filled` | **solid** | `#383d4c` | `rgba(69,76,94,0.16)` | `ClipboardText` Bold |

---

## Sizes

| | L | S |
|---|---|---|
| Width | `100%` | `180px` |
| Min-height | `240px` | `260px` |
| Padding | `24px` | `16px` |
| Icon | `40×40px` | `32×32px` |
| Main gap | `16px` (Error: `24px`) | `16px` (Error+Filled: `24px`) |
| Body font | `14px / 1.5` | `12px / 1.2` |
| Button font | `14px Bold` | `12px Bold` |

---

## Design Tokens

```css
--border:                          #383d4c;               /* Filled solid */
--border-elevated:                 #454c5e;               /* Enabled/Uploading dashed */
--border-hover:                    #9ea4b3;               /* Hover dashed */
--danger:                          #df1642;               /* Error border */
--input-background:                rgba(69,76,94,0.16);   /* tinted bg */
--text-primary:                    #f9f9fa;               /* button labels */
--text-secondary:                  #bfc2cc;               /* body copy, filename */
--text-error:                      #e95c7b;               /* error message */
--primary-button-background-hover: #33e2f7;               /* hover btn border+text */
--text-button-hover:               #33e2f7;
--sm:  12px;   /* outer border-radius */
--s:    8px;   /* button border-radius */
--m:   16px;   /* S padding / gap */
--l:   24px;   /* L padding / gap */
```

---

## Button Variants

### Outlined — "Select File" / "Change File"
```css
border: 1px solid var(--text-primary, #f9f9fa);
border-radius: 8px;
padding: 8px 16px;
background: transparent;
color: var(--text-primary, #f9f9fa);
font: 700 14px/1.5 'Poppins';   /* S: 12px/1.4 */
```
**Hover state override** (only when component `state === 'Hover'`):
```css
background: rgba(0,206,230,0.16);
border-color: var(--primary-button-background-hover, #33e2f7);
color: var(--text-button-hover, #33e2f7);
```

### Text — "Preview"
```css
background: none;  border: none;  padding: 8px 16px;
font: 700 14px/1.5 'Poppins';
color: var(--text-primary, #f9f9fa);       /* L */
color: var(--text-secondary, #bfc2cc);     /* S — muted */
```

---

## Circular Progress (Uploading)

Pure SVG, no external lib needed. Ring: `r=26`, `strokeWidth=4`, `64×64px`.

```tsx
const CircularProgress = ({ pct }: { pct: number }) => {
  const r = 26, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 64, height: 64 }}>
      <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(69,76,94,0.32)" strokeWidth="4" />
        <circle cx="32" cy="32" r={r} fill="none"
          stroke="var(--primary, #00cee6)" strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round" />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Poppins'", fontSize: 14, color: 'var(--text-secondary, #bfc2cc)',
      }}>{pct}%</span>
    </div>
  );
};
```

---

## Icons (Iconsax)

```tsx
import { CloudAdd, ClipboardText } from 'iconsax-react';

<CloudAdd size={40} color="var(--text-secondary, #bfc2cc)" variant="Linear" />  // Enabled/Hover
<CloudAdd size={40} color="var(--danger, #df1642)"         variant="Linear" />  // Error
<ClipboardText size={40} color="var(--text-secondary, #bfc2cc)" variant="Bold" /> // Filled
// S size: use size={32} instead of 40
```

---

## Full Component

```tsx
import React, { useCallback, useRef, useState } from 'react';
import { CloudAdd, ClipboardText } from 'iconsax-react';

type FileUploaderSize  = 'L' | 'S';
type FileUploaderState = 'Enabled' | 'Hover' | 'Error' | 'Uploading' | 'Filled';

interface FileUploaderProps {
  size?: FileUploaderSize;
  state?: FileUploaderState;
  fileName?: string;
  progress?: number;
  errorMessage?: string;
  onFileSelect?: (file: File) => void;
  onChangeFile?: () => void;
  onPreview?: () => void;
  accept?: string;
  className?: string;
}

export function FileUploader({
  size = 'L',
  state: controlledState,
  fileName = 'nameofthedocument.csv',
  progress = 0,
  errorMessage = 'Error message here!',
  onFileSelect,
  onChangeFile,
  onPreview,
  accept,
  className,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalState, setInternalState] = useState<FileUploaderState>('Enabled');
  const [isDragging, setIsDragging] = useState(false);
  const state = controlledState ?? internalState;
  const isL = size === 'L';

  const getBorderColor = () => {
    if (state === 'Error')                  return 'var(--danger, #df1642)';
    if (state === 'Hover' || isDragging)    return 'var(--border-hover, #9ea4b3)';
    if (state === 'Filled')                 return 'var(--border, #383d4c)';
    return 'var(--border-elevated, #454c5e)';
  };

  const getBackground = () => {
    if (state === 'Error')    return 'rgba(223,22,66,0.16)';
    if (state === 'Enabled')  return 'transparent';
    return 'var(--input-background, rgba(69,76,94,0.16))';
  };

  const mainGap = (state === 'Error' || (state === 'Filled' && !isL))
    ? 'var(--l, 24px)' : 'var(--m, 16px)';

  const iconSize   = isL ? 40 : 32;
  const bodySize   = isL ? '14px' : '12px';
  const bodyLineH  = isL ? '1.5' : '1.2';
  const btnSize    = isL ? '14px' : '12px';
  const btnLineH   = isL ? '1.5' : '1.4';

  const openPicker = () => { onChangeFile?.(); inputRef.current?.click(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect?.(file);
    if (!controlledState) setInternalState('Filled');
    e.target.value = '';
  };

  const handleDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    onFileSelect?.(file);
    if (!controlledState) setInternalState('Filled');
  }, [onFileSelect, controlledState]);

  const r = 26, circ = 2 * Math.PI * r;

  const OutlinedBtn = ({ label, hover, onClick }: { label: string; hover?: boolean; onClick?: () => void }) => (
    <button onClick={onClick} style={{
      border: `1px solid ${hover ? 'var(--primary-button-background-hover, #33e2f7)' : 'var(--text-primary, #f9f9fa)'}`,
      borderRadius: 'var(--s, 8px)', padding: '8px 16px',
      background: hover ? 'rgba(0,206,230,0.16)' : 'transparent',
      fontFamily: "'Poppins', sans-serif", fontWeight: 700,
      fontSize: btnSize, lineHeight: btnLineH,
      color: hover ? 'var(--text-button-hover, #33e2f7)' : 'var(--text-primary, #f9f9fa)',
      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    }}>{label}</button>
  );

  const TextBtn = ({ label, muted, onClick }: { label: string; muted?: boolean; onClick?: () => void }) => (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', padding: '8px 16px',
      fontFamily: "'Poppins', sans-serif", fontWeight: 700,
      fontSize: btnSize, lineHeight: btnLineH,
      color: muted ? 'var(--text-secondary, #bfc2cc)' : 'var(--text-primary, #f9f9fa)',
      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    }}>{label}</button>
  );

  return (
    <div
      className={className}
      role="button" tabIndex={0}
      aria-label="File upload drop zone"
      onKeyDown={e => e.key === 'Enter' && state !== 'Uploading' && state !== 'Filled' && openPicker()}
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
      onClick={state !== 'Uploading' && state !== 'Filled' ? openPicker : undefined}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: mainGap,
        border: `1px ${state === 'Filled' ? 'solid' : 'dashed'} ${getBorderColor()}`,
        borderRadius: 'var(--sm, 12px)', background: getBackground(),
        padding: isL ? 'var(--l, 24px)' : 'var(--m, 16px)',
        width: isL ? '100%' : '180px', minHeight: isL ? '240px' : '260px',
        boxSizing: 'border-box', transition: 'border-color 0.15s, background 0.15s',
        cursor: state === 'Uploading' ? 'default' : 'pointer',
      }}
    >
      <input ref={inputRef} type="file" accept={accept}
        aria-label="Upload file" onChange={handleFileChange}
        style={{ display: 'none' }} />

      {/* ENABLED / HOVER */}
      {(state === 'Enabled' || state === 'Hover') && (<>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
          <CloudAdd size={iconSize} color="var(--text-secondary, #bfc2cc)" variant="Linear" />
          <p style={{ fontFamily: "'Poppins'", fontSize: bodySize, fontWeight: 400, lineHeight: bodyLineH,
            color: 'var(--text-secondary, #bfc2cc)', textAlign: 'center', margin: 0 }}>
            Drag and drop file here or click to upload
          </p>
        </div>
        <OutlinedBtn label="Select File" hover={state === 'Hover'}
          onClick={e => { (e as any).stopPropagation?.(); openPicker(); }} />
      </>)}

      {/* ERROR */}
      {state === 'Error' && (<>
        <CloudAdd size={iconSize} color="var(--danger, #df1642)" variant="Linear" />
        <p style={{ fontFamily: "'Poppins'", fontSize: isL ? '16px' : '12px', fontWeight: 500,
          lineHeight: bodyLineH, color: 'var(--text-error, #e95c7b)', textAlign: 'center',
          margin: 0, whiteSpace: 'nowrap' }}>{errorMessage}</p>
        <OutlinedBtn label="Select File" onClick={openPicker} />
      </>)}

      {/* UPLOADING */}
      {state === 'Uploading' && (<>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 64, height: 64 }}>
            <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(69,76,94,0.32)" strokeWidth="4" />
              <circle cx="32" cy="32" r={r} fill="none" stroke="var(--primary, #00cee6)"
                strokeWidth="4" strokeDasharray={circ}
                strokeDashoffset={circ - (progress / 100) * circ} strokeLinecap="round" />
            </svg>
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontFamily: "'Poppins'", fontSize: 14,
              color: 'var(--text-secondary, #bfc2cc)' }}>{progress}%</span>
          </div>
          <p style={{ fontFamily: "'Poppins'", fontSize: bodySize, fontWeight: 400,
            lineHeight: bodyLineH, color: 'var(--text-secondary, #bfc2cc)',
            textAlign: 'center', margin: 0, whiteSpace: 'nowrap' }}>Uploading file...</p>
        </div>
        <OutlinedBtn label="Change File" onClick={openPicker} />
      </>)}

      {/* FILLED */}
      {state === 'Filled' && (<>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
          <ClipboardText size={iconSize} color="var(--text-secondary, #bfc2cc)" variant="Bold" />
          <p style={{ fontFamily: "'Poppins'", fontSize: bodySize, fontWeight: 400,
            lineHeight: bodyLineH, color: 'var(--text-secondary, #bfc2cc)',
            textAlign: 'center', margin: 0, wordBreak: 'break-all' }}>{fileName}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: isL ? 'row' : 'column',
          alignItems: 'center', gap: isL ? 24 : 'var(--m, 16px)' }}>
          {isL  && <TextBtn label="Preview" onClick={onPreview} />}
          <OutlinedBtn label="Change File" onClick={openPicker} />
          {!isL && <TextBtn label="Preview" muted onClick={onPreview} />}
        </div>
      </>)}
    </div>
  );
}
```

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
const [state, setState]     = useState<FileUploaderState>('Enabled');
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
  onPreview={() => window.open(previewUrl)}
/>
```

### Error after validation
```tsx
<FileUploader
  state="Error"
  errorMessage="File exceeds 10MB limit."
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
- **`errorMessage` only renders in `state="Error"`** — the prop is ignored otherwise.
- **"Preview" placement differs by size** — L: left of "Change File"; S: below it (muted grey).
- **Drag-over mimics Hover styling** — `isDragging` overrides border to `--border-hover`.
- **Always use design tokens, not raw hex** — `var(--danger, #df1642)` not `#df1642`.
