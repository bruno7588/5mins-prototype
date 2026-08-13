/**
 * Crisp dashed border for quiz receivers (exact 4px dash, 1.5px thick).
 *
 * CSS `border: dashed` can't set a dash length, and an SVG mask/background image
 * rasterises blurry. A real inline SVG renders as a vector at native resolution,
 * so the dash stays sharp at any size. The stroke is centred on the element edge
 * with width 3 → the outer half is clipped, leaving 1.5px visible. Stroke colour
 * comes from CSS (`.ql-dash rect`) so it stays theme-aware and can react to the
 * receiver's hover/active state. Radius matches the receivers' --radius-sm (12).
 */
function DashedBorder() {
  return (
    <svg className="ql-dash" width="100%" height="100%" aria-hidden="true">
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx="12"
        ry="12"
        fill="none"
        strokeWidth="3"
        strokeDasharray="4"
      />
    </svg>
  )
}

export default DashedBorder
