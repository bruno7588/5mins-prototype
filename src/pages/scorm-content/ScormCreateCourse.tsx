import { useState } from 'react'
import PageHeader from './components/PageHeader/PageHeader'
import ContentList from './components/ContentList/ContentList'
import type { ContentItem } from './components/ContentList/ContentList'
import AddContentSidebar from './components/AddContentSidebar/AddContentSidebar'
import type { ScormFile } from './components/ScormDrawer/ScormDrawer'

function ScormCreateCourse() {
  const [scormItems, setScormItems] = useState<ContentItem[]>([])
  const [addedScormIds, setAddedScormIds] = useState<Set<number>>(new Set())

  const handleAddScorm = (file: ScormFile) => {
    const newItem: ContentItem = {
      id: file.id,
      type: 'SCORM',
      title: file.fileName,
      metadata: 'Lesson · Instructor name · 4min',
      thumbnail: '',
      thumbColor: file.thumbColor,
    }
    setScormItems(prev => [...prev, newItem])
    setAddedScormIds(prev => new Set(prev).add(file.id))
  }

  const handleRemoveScorm = (id: number) => {
    setScormItems(prev => prev.filter(item => item.id !== id))
    setAddedScormIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <>
      <PageHeader />
      <div className="app-content-area">
        <main className="main-content">
          <ContentList extraItems={scormItems} onDeleteExtra={handleRemoveScorm} />
        </main>
        <AddContentSidebar
          addedScormIds={addedScormIds}
          onAddScorm={handleAddScorm}
          onRemoveScorm={handleRemoveScorm}
        />
      </div>
    </>
  )
}

export default ScormCreateCourse
