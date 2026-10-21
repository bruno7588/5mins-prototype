interface AIImageIconProps {
  size?: number
  /** All strokes: frame, sun, hills and sparkle. */
  color?: string
  className?: string
}

/**
 * "AI image": the Iconsax gallery frame with an AI sparkle in its open top-right corner,
 * for picking or generating an image with AI. Library `Icons` set, Name=AI image,
 * Type=linear (`12540:5697`); there is no Bold variant.
 */
function AIImageIcon({ size = 24, color = 'currentColor', className }: AIImageIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.252 0.695312C19.3151 0.434969 19.6849 0.434971 19.748 0.695312L20.2617 2.81348C20.3725 3.27029 20.7297 3.62751 21.1865 3.73828L23.3047 4.25195C23.565 4.3151 23.565 4.68491 23.3047 4.74805L21.1865 5.26172C20.7297 5.37249 20.3725 5.72971 20.2617 6.18652L19.748 8.30469C19.6849 8.56503 19.3151 8.56503 19.252 8.30469L18.7383 6.18652C18.6275 5.72971 18.2703 5.37249 17.8135 5.26172L15.6953 4.74805C15.435 4.6849 15.435 4.31509 15.6953 4.25195L17.8135 3.73828C18.2703 3.62751 18.6275 3.27029 18.7383 2.81348L19.252 0.695312Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V10"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.66992 18.95L7.59992 15.64C8.38992 15.11 9.52992 15.17 10.2399 15.78L10.5699 16.07C11.3499 16.74 12.6099 16.74 13.3899 16.07L17.5499 12.5C18.3299 11.83 19.5899 11.83 20.3699 12.5L21.9999 13.9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default AIImageIcon
