import { useMemo, useState } from 'react'
import { Add, ArchiveMinus, ArrowRotateLeft, DocumentUpload, Edit2, Trash } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import EmptyState from '@/components/EmptyState/EmptyState'
import RowActionsMenu, { type RowMenuItem } from '@/components/RowActionsMenu/RowActionsMenu'
import Search from '@/components/Search/Search'
import Table, { type Column } from '@/components/Table/Table'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import Toggle from '@/components/Toggle/Toggle'
import SectionHeader from '@/pages/your-courses/components/SectionHeader/SectionHeader'
import emptyBox from '@/assets/empty-state-illustrations/empty-box.svg'
import noResults from '@/assets/empty-state-illustrations/no-results.svg'
import {
  deleteCourse,
  deleteProvider,
  durationLabel,
  retrainingLabel,
  setAllowOneOffs,
  setCourseArchived,
  setProviderArchived,
  useExternalTraining,
  type ExternalCourse,
  type ExternalProvider,
} from '@/data/externalTraining'
import CourseDrawer from './CourseDrawer'
import ProviderModal from './ProviderModal'
import ApprovedListCsvModal from './ApprovedListCsvModal'
import './ExternalTraining.css'

/* Account & Settings > External Training (DES-336 Phase 1, DEV-4740).
   The tenant's approved list: the one-off setting, approved courses and approved
   providers. Only full admins reach this tab (D21). Prefix: aet- */

type Confirm =
  | { kind: 'archive-course' | 'delete-course'; course: ExternalCourse }
  | { kind: 'archive-provider' | 'delete-provider'; provider: ExternalProvider }

const icon = (I: typeof Edit2) => <I size={20} color="var(--text-primary)" variant="Linear" />

function ExternalTraining() {
  const { courses, providers, records, allowOneOffs } = useExternalTraining()
  const { toasts, show: showToast } = useToast()
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [courseDrawer, setCourseDrawer] = useState<{ course: ExternalCourse | null } | null>(null)
  const [providerModal, setProviderModal] = useState<{ provider: ExternalProvider | null } | null>(null)
  const [csvOpen, setCsvOpen] = useState(false)
  const [confirm, setConfirm] = useState<Confirm | null>(null)

  const courseRecords = (id: string) => records.filter((r) => r.courseId === id).length
  const providerRecords = (id: string) => records.filter((r) => r.providerId === id).length
  const providerCourses = (id: string) => courses.filter((c) => c.providerIds.includes(id)).length
  const providerName = (id: string) => providers.find((p) => p.id === id)?.name ?? ''

  const visibleCourses = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses
      .filter((c) => showArchived || !c.archived)
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) => Number(a.archived) - Number(b.archived) || a.name.localeCompare(b.name))
  }, [courses, query, showArchived])

  const visibleProviders = useMemo(
    () =>
      providers
        .filter((p) => showArchived || !p.archived)
        .sort((a, b) => Number(a.archived) - Number(b.archived) || a.name.localeCompare(b.name)),
    [providers, showArchived],
  )

  /* Archive when it has records, delete when it has none (D4). */
  const menuFor = (archived: boolean, count: number): RowMenuItem[] => [
    { key: 'edit', label: 'Edit', icon: icon(Edit2) },
    archived
      ? { key: 'unarchive', label: 'Unarchive', icon: icon(ArrowRotateLeft) }
      : count > 0
        ? { key: 'archive', label: 'Archive', icon: icon(ArchiveMinus) }
        : { key: 'delete', label: 'Delete', icon: <Trash size={20} color="currentColor" variant="Linear" />, danger: true },
  ]

  const onCourseAction = (key: string, course: ExternalCourse) => {
    if (key === 'edit') setCourseDrawer({ course })
    if (key === 'archive') setConfirm({ kind: 'archive-course', course })
    if (key === 'delete') setConfirm({ kind: 'delete-course', course })
    if (key === 'unarchive') {
      setCourseArchived(course.id, false)
      showToast('success', `${course.name} unarchived`)
    }
  }

  const onProviderAction = (key: string, provider: ExternalProvider) => {
    if (key === 'edit') setProviderModal({ provider })
    if (key === 'archive') setConfirm({ kind: 'archive-provider', provider })
    if (key === 'delete') setConfirm({ kind: 'delete-provider', provider })
    if (key === 'unarchive') {
      setProviderArchived(provider.id, false)
      showToast('success', `${provider.name} unarchived`)
    }
  }

  const courseColumns: Column<ExternalCourse>[] = [
    {
      key: 'name',
      header: 'Course',
      width: '1 0 220px',
      render: (c) => (
        <span className="aet-name">
          <span>{c.name}</span>
          {c.archived && <Badge type="informative" icon={false} label="Archived" />}
        </span>
      ),
    },
    {
      key: 'providers',
      header: 'Providers',
      width: '1 0 200px',
      render: (c) => c.providerIds.map(providerName).filter(Boolean).join(', ') || '–',
    },
    { key: 'duration', header: 'Duration', width: '0 0 112px', render: (c) => durationLabel(c.duration) },
    { key: 'retraining', header: 'Retraining', width: '0 0 160px', render: (c) => retrainingLabel(c.retrainingMonths) },
    { key: 'records', header: 'Records', width: '0 0 88px', render: (c) => courseRecords(c.id) },
    {
      key: 'actions',
      header: '',
      width: '0 0 56px',
      align: 'center',
      cellClassName: 'is-overflow',
      render: (c) => (
        <RowActionsMenu
          ariaLabel={`Actions for ${c.name}`}
          items={menuFor(c.archived, courseRecords(c.id))}
          onSelect={(key) => onCourseAction(key, c)}
        />
      ),
    },
  ]

  const providerColumns: Column<ExternalProvider>[] = [
    {
      key: 'name',
      header: 'Provider',
      width: '1 0 220px',
      render: (p) => (
        <span className="aet-name">
          <span>{p.name}</span>
          {p.archived && <Badge type="informative" icon={false} label="Archived" />}
        </span>
      ),
    },
    { key: 'courses', header: 'Courses', width: '0 0 112px', render: (p) => providerCourses(p.id) },
    { key: 'records', header: 'Records', width: '0 0 88px', render: (p) => providerRecords(p.id) },
    {
      key: 'actions',
      header: '',
      width: '0 0 56px',
      align: 'center',
      cellClassName: 'is-overflow',
      render: (p) => (
        <RowActionsMenu
          ariaLabel={`Actions for ${p.name}`}
          items={menuFor(p.archived, providerRecords(p.id))}
          onSelect={(key) => onProviderAction(key, p)}
        />
      ),
    },
  ]

  const coursesEmpty = courses.length === 0
  const providersEmpty = providers.length === 0

  /* ── Confirm dialog copy ── */
  const dialog = (() => {
    if (!confirm) return null
    if (confirm.kind === 'archive-course') {
      const n = courseRecords(confirm.course.id)
      return {
        title: `Archive ${confirm.course.name}?`,
        body: `It won't be offered for new records or uploads. Its ${n} record${n === 1 ? '' : 's'} stay on people's profiles and still show when they're due.`,
        cta: 'Archive Course',
        danger: false,
        run: () => {
          setCourseArchived(confirm.course.id, true)
          showToast('success', `${confirm.course.name} archived`)
        },
      }
    }
    if (confirm.kind === 'delete-course') {
      return {
        title: `Delete ${confirm.course.name}?`,
        body: "It has no records. It's removed from the approved list and can't be recovered.",
        cta: 'Delete Course',
        danger: true,
        run: () => {
          deleteCourse(confirm.course.id)
          showToast('success', `${confirm.course.name} deleted`)
        },
      }
    }
    const { provider } = confirm as Extract<Confirm, { provider: ExternalProvider }>
    // A course whose only active provider this is can't be recorded once it's archived.
    const stranded = courses.filter(
      (c) =>
        !c.archived &&
        c.providerIds.includes(provider.id) &&
        !c.providerIds.some((id) => id !== provider.id && providers.find((p) => p.id === id && !p.archived)),
    )
    const strandedLine = stranded.length
      ? ` ${stranded.map((c) => c.name).join(', ')} ${stranded.length === 1 ? 'has' : 'have'} no other provider, so ${stranded.length === 1 ? 'it' : 'they'} can't be recorded until you add one.`
      : ''
    if (confirm.kind === 'archive-provider') {
      const n = providerRecords(provider.id)
      return {
        title: `Archive ${provider.name}?`,
        body: `It won't be offered for new records or uploads. Its ${n} record${n === 1 ? '' : 's'} stay on people's profiles.${strandedLine}`,
        cta: 'Archive Provider',
        danger: false,
        run: () => {
          setProviderArchived(provider.id, true)
          showToast('success', `${provider.name} archived`)
        },
      }
    }
    return {
      title: `Delete ${provider.name}?`,
      body: `It has no records. It's removed from the approved list and can't be recovered.${strandedLine}`,
      cta: 'Delete Provider',
      danger: true,
      run: () => {
        deleteProvider(provider.id)
        showToast('success', `${provider.name} deleted`)
      },
    }
  })()

  return (
    <div className="aet-body">
      <section className="aet-card aet-card--row">
        <div className="aet-head">
          <h3 className="aet-title">Allow one-off trainings</h3>
          <p className="aet-text">
            Admins can record training that isn't on the approved list. Turn this off to only allow approved
            courses.
          </p>
        </div>
        <Toggle
          checked={allowOneOffs}
          onChange={(e) => {
            setAllowOneOffs(e.target.checked)
            showToast('success', e.target.checked ? 'One-off trainings turned on' : 'One-off trainings turned off')
          }}
          aria-label="Allow one-off trainings"
        />
      </section>

      <section className="aet-section" aria-labelledby="aet-courses">
        <SectionHeader
          title="Approved courses"
          description="The external courses your people take, with how often they need retraining."
          divider={false}
          ctas={
            !coursesEmpty && (
              <>
                <Button variant="outlined-2" icon={<DocumentUpload size={20} color="currentColor" variant="Linear" />} onClick={() => setCsvOpen(true)}>
                  Upload CSV
                </Button>
                <Button icon={<Add size={20} color="currentColor" variant="Linear" />} onClick={() => setCourseDrawer({ course: null })}>
                  Add Course
                </Button>
              </>
            )
          }
        />
        {coursesEmpty ? (
          <EmptyState
            illustration={<img src={emptyBox} alt="" width={72} height={72} />}
            title="No approved courses yet"
            description="Add the external courses your people take, with how often they need retraining."
            secondaryAction={{ label: 'Upload CSV', onClick: () => setCsvOpen(true) }}
            primaryAction={{ label: 'Add Course', onClick: () => setCourseDrawer({ course: null }) }}
          />
        ) : (
          <>
            <div className="aet-toolbar">
              <Search value={query} onChange={setQuery} onClear={() => setQuery('')} placeholder="Search courses" ariaLabel="Search courses" />
              <Toggle
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                label="Show archived"
                size="sm"
              />
            </div>
            {visibleCourses.length ? (
              <Table
                columns={courseColumns}
                rows={visibleCourses}
                getRowKey={(c) => c.id}
                getRowState={(c) => (c.archived ? 'disabled' : 'enabled')}
              />
            ) : (
              <EmptyState
                illustration={<img src={noResults} alt="" width={72} height={72} />}
                title="No courses found"
                description="Try a different name, or turn on Show archived."
              />
            )}
          </>
        )}
      </section>

      <section className="aet-section" aria-labelledby="aet-providers">
        <SectionHeader
          title="Approved providers"
          description="The organisations that deliver your approved courses."
          divider={false}
          ctas={
            !providersEmpty && (
              <Button variant="outlined-2" icon={<Add size={20} color="currentColor" variant="Linear" />} onClick={() => setProviderModal({ provider: null })}>
                Add Provider
              </Button>
            )
          }
        />
        {providersEmpty ? (
          <EmptyState
            illustration={<img src={emptyBox} alt="" width={72} height={72} />}
            title="No approved providers yet"
            description="Add the organisations that deliver your external courses."
            secondaryAction={{ label: 'Add Provider', onClick: () => setProviderModal({ provider: null }) }}
          />
        ) : (
          <Table
            columns={providerColumns}
            rows={visibleProviders}
            getRowKey={(p) => p.id}
            getRowState={(p) => (p.archived ? 'disabled' : 'enabled')}
          />
        )}
      </section>

      {courseDrawer && (
        <CourseDrawer
          course={courseDrawer.course}
          onClose={() => setCourseDrawer(null)}
          onSaved={(name, isNew) => {
            setCourseDrawer(null)
            showToast('success', isNew ? `${name} added` : `${name} updated`)
          }}
        />
      )}

      <ProviderModal
        open={!!providerModal}
        provider={providerModal?.provider ?? null}
        onClose={() => setProviderModal(null)}
        onSaved={(p, isNew) => {
          setProviderModal(null)
          showToast('success', isNew ? `${p.name} added` : `${p.name} updated`)
        }}
      />

      <ApprovedListCsvModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onAdded={(n) => {
          setCsvOpen(false)
          showToast('success', `${n} course${n === 1 ? '' : 's'} added`)
        }}
      />

      <ConfirmModal open={!!dialog} onClose={() => setConfirm(null)} ariaLabel={dialog?.title}>
        {dialog && (
          <>
            <div className="confirm-modal-header">
              <h2 className="confirm-modal-title">{dialog.title}</h2>
              <p className="confirm-modal-body">{dialog.body}</p>
            </div>
            <div className="confirm-modal-actions">
              <Button variant="outlined-2" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button
                semantic={dialog.danger ? 'danger' : 'primary'}
                onClick={() => {
                  dialog.run()
                  setConfirm(null)
                }}
              >
                {dialog.cta}
              </Button>
            </div>
          </>
        )}
      </ConfirmModal>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default ExternalTraining
