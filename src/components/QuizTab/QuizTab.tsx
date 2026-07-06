import { useState } from 'react'
import { Add } from 'iconsax-react'
import Checkbox from '../Checkbox/Checkbox'
import { mockQuestions } from '../../data/mockQuestions'
import type { Question } from '../../data/mockQuestions'
import PoolHeader from '../PoolHeader/PoolHeader'
import QuestionCard from '../QuestionCard/QuestionCard'
import QuestionDrawer from '../QuestionDrawer/QuestionDrawer'
import AIGenerateDrawer from '../AIGenerateDrawer/AIGenerateDrawer'
import './QuizTab.css'

interface QuizTabState {
  poolEnabled: boolean
  aiQuizzesOptIn: boolean
  drawCount: number
  questions: Question[]
  editingQuestionId: string | null
  addingNew: boolean
  showAIDrawer: boolean
}

const MAX_POOL_SIZE = 30

function EmptyStateIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Decorative confetti top-left */}
      <rect x="8" y="14" width="8" height="8" rx="2" transform="rotate(-15 8 14)" fill="#E0E1E5"/>
      <rect x="4" y="24" width="5" height="5" rx="1.5" transform="rotate(10 4 24)" fill="#D1D3D9"/>
      {/* Decorative confetti bottom-right */}
      <rect x="58" y="50" width="8" height="8" rx="2" transform="rotate(162 58 50)" fill="#E0E1E5"/>
      <rect x="62" y="42" width="5" height="5" rx="1.5" transform="rotate(-16 62 42)" fill="#D1D3D9"/>
      {/* Main document card */}
      <rect x="17" y="10" width="38" height="46" rx="6" fill="#F0F1F3" stroke="#E0E1E5" strokeWidth="1"/>
      {/* Text lines */}
      <rect x="24" y="20" width="24" height="3" rx="1.5" fill="#D1D3D9"/>
      <rect x="24" y="27" width="18" height="3" rx="1.5" fill="#D1D3D9"/>
      <rect x="24" y="34" width="21" height="3" rx="1.5" fill="#D1D3D9"/>
      <rect x="24" y="41" width="16" height="3" rx="1.5" fill="#D1D3D9"/>
      {/* Question mark badge */}
      <circle cx="46" cy="46" r="12" fill="#BFC2CC"/>
      <text x="46" y="52" textAnchor="middle" fontSize="16" fontWeight="700" fontFamily="Poppins, sans-serif" fill="white">?</text>
    </svg>
  )
}

interface QuizTabProps {
  isNew?: boolean
  hasGeneratedQuizzes?: boolean
  onAIOptInChange?: (optedIn: boolean) => void
}

function QuizTab({ isNew = false, hasGeneratedQuizzes = false, onAIOptInChange }: QuizTabProps) {
  const [state, setState] = useState<QuizTabState>({
    poolEnabled: hasGeneratedQuizzes,
    aiQuizzesOptIn: true,
    drawCount: 2,
    questions: hasGeneratedQuizzes ? mockQuestions : [],
    editingQuestionId: null,
    addingNew: false,
    showAIDrawer: false,
  })

  const poolSize = state.questions.length

  // Change draw count
  const handleDrawCountChange = (value: number) => {
    setState(s => ({ ...s, drawCount: Math.min(value, s.questions.length) }))
  }

  // Edit question
  const handleStartEdit = (questionId: string) => {
    setState(s => ({ ...s, editingQuestionId: questionId, addingNew: false }))
  }

  const handleSaveEdit = (updated: Question) => {
    setState(s => ({
      ...s,
      questions: s.questions.map(q => q.id === updated.id ? updated : q),
      editingQuestionId: null,
    }))
  }

  const handleCloseDrawer = () => {
    setState(s => ({ ...s, editingQuestionId: null, addingNew: false }))
  }

  // Delete question
  const handleDelete = (questionId: string) => {
    setState(s => {
      const newQuestions = s.questions.filter(q => q.id !== questionId)
      const newDrawCount = Math.min(s.drawCount, newQuestions.length || 1)
      return {
        ...s,
        questions: newQuestions,
        drawCount: newDrawCount,
        poolEnabled: newQuestions.length > 0,
        editingQuestionId: s.editingQuestionId === questionId ? null : s.editingQuestionId,
      }
    })
  }

  // Add new question
  const handleStartAdd = () => {
    setState(s => ({ ...s, addingNew: true, editingQuestionId: null }))
  }

  const handleSaveNew = (question: Question) => {
    setState(s => ({
      ...s,
      questions: [...s.questions, question],
      addingNew: false,
      poolEnabled: true,
    }))
  }

  // AI Generate drawer
  const handleGenerateMore = () => {
    setState(s => ({ ...s, showAIDrawer: true }))
  }

  const handleAIDrawerComplete = (savedQuestions: Question[]) => {
    setState(s => ({
      ...s,
      showAIDrawer: false,
      questions: [...s.questions, ...savedQuestions],
      poolEnabled: s.questions.length + savedQuestions.length > 0,
    }))
  }

  // Toggle AI quizzes opt-in (questions generated after publish + processing)
  const handleAICheckbox = () => {
    setState(s => {
      const next = !s.aiQuizzesOptIn
      onAIOptInChange?.(next)
      return { ...s, aiQuizzesOptIn: next }
    })
  }

  // New lesson empty state — checkbox banner
  if (!state.poolEnabled && isNew) {
    return (
      <div className="quiz-tab">
        <div className="quiz-tab-empty-banner" onClick={handleAICheckbox}>
          <Checkbox checked={state.aiQuizzesOptIn} />
          <div className="quiz-tab-empty-banner-content">
            <div className="quiz-tab-empty-banner-title">
              Generate AI Quizzes
            </div>
            <p className="quiz-tab-empty-banner-desc">
              Once the lesson is published and processed, we will generate a bank of 6 questions that you can review and edit
            </p>
          </div>
        </div>
        <button className="quiz-tab-add-manual" onClick={handleStartAdd}>
          Add Question Manually
          <Add size={20} color="var(--text-primary)" />
        </button>

        {/* Create new question drawer */}
        {state.addingNew && (
          <QuestionDrawer
            onSave={handleSaveNew}
            onClose={handleCloseDrawer}
          />
        )}
      </div>
    )
  }

  // Existing lesson with no questions — empty pool state
  if (!state.poolEnabled && !isNew) {
    return (
      <div className="quiz-tab">
        <PoolHeader
          poolSize={0}
          drawCount={state.drawCount}
          maxPoolSize={MAX_POOL_SIZE}
          onDrawCountChange={handleDrawCountChange}
          onAddManual={handleStartAdd}
          addManualDisabled={state.addingNew}
          onGenerate={handleGenerateMore}
        />

        <div className="quiz-tab-empty-state">
          <EmptyStateIllustration />
          <div className="quiz-tab-empty-state-info">
            <h3 className="quiz-tab-empty-state-title">No questions yet</h3>
            <p className="quiz-tab-empty-state-desc">
              Build a question bank so each learner receives a different set of questions on the same lesson. Create with AI or add your own manually.
            </p>
          </div>
        </div>

        {/* Create new question drawer */}
        {state.addingNew && (
          <QuestionDrawer
            onSave={handleSaveNew}
            onClose={handleCloseDrawer}
          />
        )}

        {/* AI Generate drawer */}
        {state.showAIDrawer && (
          <AIGenerateDrawer
            onComplete={handleAIDrawerComplete}
          />
        )}
      </div>
    )
  }

  // Populated state
  return (
    <div className="quiz-tab">
      <PoolHeader
        poolSize={poolSize}
        drawCount={state.drawCount}
        maxPoolSize={MAX_POOL_SIZE}
        onDrawCountChange={handleDrawCountChange}
        onAddManual={handleStartAdd}
        addManualDisabled={state.addingNew || poolSize >= MAX_POOL_SIZE}
        onGenerate={handleGenerateMore}
      />

      <div className="quiz-tab-question-list">
        {state.questions.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              onEdit={() => handleStartEdit(q.id)}
              onDelete={() => handleDelete(q.id)}
            />
        ))}
      </div>

      {/* Edit / Create new question drawer */}
      {(state.editingQuestionId || state.addingNew) && (() => {
        const editQuestion = state.editingQuestionId
          ? state.questions.find(q => q.id === state.editingQuestionId)
          : undefined
        if (state.editingQuestionId && !editQuestion) return null
        return (
          <QuestionDrawer
            question={editQuestion}
            onSave={state.editingQuestionId ? handleSaveEdit : handleSaveNew}
            onClose={handleCloseDrawer}
          />
        )
      })()}

      {/* AI Generate drawer */}
      {state.showAIDrawer && (
        <AIGenerateDrawer
          onComplete={handleAIDrawerComplete}
        />
      )}
    </div>
  )
}

export default QuizTab
