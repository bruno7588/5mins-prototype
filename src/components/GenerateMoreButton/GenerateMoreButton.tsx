import Button from '@/components/Button/Button'
import SparkleIcon from '@/components/icons/SparkleIcon'

interface GenerateMoreButtonProps {
  poolSize: number
  maxPoolSize?: number
  onGenerate: () => void
}

const MAX_POOL = 30

/* The DS AI-Outlined button (buttons.md): gradient stroke, gradient label,
   transparent at rest. */
function GenerateMoreButton({ poolSize, maxPoolSize = MAX_POOL, onGenerate }: GenerateMoreButtonProps) {
  const atMax = poolSize >= maxPoolSize

  return (
    <Button
      semantic="ai"
      variant="outlined"
      /* The label gradient is background-clip: text, which an SVG cannot take — so
         the sparkle paints its own, from the same two stops. */
      icon={<SparkleIcon size={20} gradient />}
      onClick={onGenerate}
      disabled={atMax}
      title={atMax ? `Maximum pool size reached (${maxPoolSize} questions)` : undefined}
    >
      Create With AI (+6)
    </Button>
  )
}

export default GenerateMoreButton
