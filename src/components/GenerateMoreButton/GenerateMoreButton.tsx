import './GenerateMoreButton.css'

interface GenerateMoreButtonProps {
  poolSize: number
  maxPoolSize?: number
  onGenerate: () => void
}

const MAX_POOL = 30

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sparkle-grad" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop style={{ stopColor: 'var(--text-button-outlined)' }} />
          <stop offset="1" style={{ stopColor: 'var(--blaze-quiz)' }} />
        </linearGradient>
      </defs>
      {/* Large sparkle */}
      <path d="M8.7 3.23C9.03 1.86 10.97 1.86 11.3 3.23L11.88 5.63C11.99 6.08 12.34 6.43 12.79 6.54L15.19 7.12C16.56 7.45 16.56 9.39 15.19 9.72L12.79 10.3C12.34 10.41 11.99 10.76 11.88 11.21L11.3 13.61C10.97 14.98 9.03 14.98 8.7 13.61L8.12 11.21C8.01 10.76 7.66 10.41 7.21 10.3L4.81 9.72C3.44 9.39 3.44 7.45 4.81 7.12L7.21 6.54C7.66 6.43 8.01 6.08 8.12 5.63L8.7 3.23Z" fill="url(#sparkle-grad)" />
      {/* Small sparkle */}
      <path d="M15.37 1.71C15.48 1.26 16.12 1.26 16.23 1.71L16.45 2.62C16.49 2.78 16.61 2.9 16.77 2.94L17.68 3.16C18.13 3.27 18.13 3.91 17.68 4.02L16.77 4.24C16.61 4.28 16.49 4.4 16.45 4.56L16.23 5.47C16.12 5.92 15.48 5.92 15.37 5.47L15.15 4.56C15.11 4.4 14.99 4.28 14.83 4.24L13.92 4.02C13.47 3.91 13.47 3.27 13.92 3.16L14.83 2.94C14.99 2.9 15.11 2.78 15.15 2.62L15.37 1.71Z" fill="url(#sparkle-grad)" />
    </svg>
  )
}

function GenerateMoreButton({ poolSize, maxPoolSize = MAX_POOL, onGenerate }: GenerateMoreButtonProps) {
  const atMax = poolSize >= maxPoolSize

  return (
    <button
      className={`generate-more-btn${atMax ? ' generate-more-btn--disabled' : ''}`}
      onClick={onGenerate}
      disabled={atMax}
      title={atMax ? `Maximum pool size reached (${maxPoolSize} questions)` : undefined}
    >
      <SparkleIcon />
      <span className="generate-more-text">Create With AI (+6)</span>
    </button>
  )
}

export default GenerateMoreButton
