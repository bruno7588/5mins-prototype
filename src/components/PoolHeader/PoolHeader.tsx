import { Add, TickCircle } from 'iconsax-react'
import { getCoverageTier } from '../RatioBar/RatioBar'
import DrawCountDropdown from '../DrawCountDropdown/DrawCountDropdown'
import GenerateMoreButton from '../GenerateMoreButton/GenerateMoreButton'
import InfoIcon from '../icons/InfoIcon'
import './PoolHeader.css'

interface PoolHeaderProps {
  poolSize: number
  drawCount: number
  maxPoolSize: number
  onDrawCountChange: (value: number) => void
  onAddManual: () => void
  addManualDisabled: boolean
  onGenerate: () => void
}

const VARIETY_LABEL: Record<string, string> = {
  strong: 'Excellent variety',
  good: 'Good variety',
  weak: 'Low variety',
  static: 'No variety',
}

const RECOMMENDATION: Record<string, string> = {
  strong: '',
  good: 'Recommended for most lessons.',
  weak: 'Consider adding more questions.',
  static: 'All learners see the same questions in the same order.',
}

function PoolHeader({ poolSize, drawCount, maxPoolSize, onDrawCountChange, onAddManual, addManualDisabled, onGenerate }: PoolHeaderProps) {
  const tier = getCoverageTier(poolSize, drawCount)

  return (
    <div className="pool-header">
      <div className="pool-header-row1">
        <div className="pool-header-title-area">
          <h3 className="pool-header-title">Question Bank</h3>
          <span className="pool-header-count">({poolSize})</span>
        </div>
        <div className="pool-header-actions">
          <button
            className="pool-header-add-manual"
            onClick={onAddManual}
            disabled={addManualDisabled}
          >
            <Add size={20} color="currentColor" />
            Add Question Manually
          </button>
          <GenerateMoreButton
            poolSize={poolSize}
            maxPoolSize={maxPoolSize}
            onGenerate={onGenerate}
          />
        </div>
      </div>

      {poolSize > 0 && (
        <div className="pool-header-row2">
          <span className="pool-header-draw-text">Each attempt shows</span>
          <DrawCountDropdown
            value={drawCount}
            max={poolSize}
            onChange={onDrawCountChange}
          />
          <span className="pool-header-draw-text">
            out of <strong>{poolSize}</strong> questions, randomly chosen
          </span>
        </div>
      )}

      {poolSize > 0 && (
        <div className={`pool-header-coverage pool-header-coverage--${tier}`}>
          {tier === 'good' || tier === 'strong' ? (
            <TickCircle size={16} color="currentColor" variant="Linear" />
          ) : (
            <InfoIcon size={16} color="currentColor" />
          )}
          <span>
            {VARIETY_LABEL[tier]}
            {(tier === 'strong' || tier === 'good') && <> · Each learner receives a different random selection</>}
            {RECOMMENDATION[tier] && <> · {RECOMMENDATION[tier]}</>}
          </span>
        </div>
      )}
    </div>
  )
}

export default PoolHeader
