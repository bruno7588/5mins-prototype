import { useMemo, useState } from 'react'
import { Add, Archive, Danger, ArrowRotateLeft, DocumentUpload, Edit2, Trash } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import EmptyState from '@/components/EmptyState/EmptyState'
import RowActionsMenu, { type RowMenuItem } from '@/components/RowActionsMenu/RowActionsMenu'
import Search from '@/components/Search/Search'
import Table, { type Column } from '@/components/Table/Table'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import Toggle from '@/components/Toggle/Toggle'
import Tooltip from '@/components/Tooltip/Tooltip'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import emptyBox from '@/assets/empty-state-illustrations/empty-box.svg'
import noResults from '@/assets/empty-state-illustrations/no-results.svg'
import {
  deleteCourse,
  deleteProvider,
  durationLabel,
  retrainingLabel,
  setCourseArchived,
  setProviderArchived,
  useExternalTraining,
  type ExternalCourse,
  type ExternalProvider,
} from '@/data/externalTraining'
import CourseDrawer from './CourseDrawer'
import ProviderModal from './ProviderModal'
import BulkUploadCoursesDrawer from './BulkUploadCoursesDrawer'
import './ExternalTraining.css'

/* Account & Settings > External Training (DES-336 Phase 1, DEV-4740).
   The tenant's approved list: approved courses and approved providers. Every
   external training record points at one of these courses. Only full admins reach this tab (D21). Prefix: aet- */

type Confirm =
  | { kind: 'archive-course' | 'delete-course'; course: ExternalCourse }
  | { kind: 'archive-provider' | 'delete-provider'; provider: ExternalProvider }

type View = 'courses' | 'providers'

const icon = (I: typeof Edit2) => <I size={20} color="var(--text-primary)" variant="Linear" />

function ExternalTraining() {
  const { courses, providers, records } = useExternalTraining()
  const { toasts, show: showToast } = useToast()
  const [view, setView] = useState<View>('courses')
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  /* Stays set while the drawer plays its exit; key remounts it fresh on each open. */
  const [courseDrawer, setCourseDrawer] = useState<{ course: ExternalCourse | null; open: boolean; key: number } | null>(null)
  const openCourseDrawer = (course: ExternalCourse | null) => setCourseDrawer({ course, open: true, key: Date.now() })
  const closeCourseDrawer = () => setCourseDrawer((d) => d && { ...d, open: false })
  const [providerModal, setProviderModal] = useState<{ provider: ExternalProvider | null } | null>(null)
  const [csvOpen, setCsvOpen] = useState(false)
  const [csvKey, setCsvKey] = useState(0)
  const openCsv = () => {
    setCsvKey((k) => k + 1)
    setCsvOpen(true)
  }
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
        .filter((p) => !query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase()))
        .sort((a, b) => Number(a.archived) - Number(b.archived) || a.name.localeCompare(b.name)),
    [providers, showArchived, query],
  )

  /* Edit, Archive and Delete as separate actions, each with a line saying what it does
     (management review 2026-11-12: archive was hidden inside the delete flow). Delete is
     last; with training records it stays greyed and its line says to archive instead. */
  const recordCount = (n: number) => `${n} training record${n === 1 ? '' : 's'}`
  const menuFor = (thing: 'course' | 'provider', archived: boolean, records: number): RowMenuItem[] => {
    const why = `This ${thing} has ${recordCount(records)}, so it can't be deleted. Archive it instead.`
    return [
      {
        key: 'edit',
        label: 'Edit',
        description: thing === 'course' ? 'Update the name, providers, duration or expiry' : 'Update the provider name',
        icon: icon(Edit2),
      },
      archived
        ? { key: 'unarchive', label: 'Unarchive', description: 'Make it available for new training again', icon: icon(ArrowRotateLeft) }
        : { key: 'archive', label: 'Archive', description: 'Hide it from new records. Current records stay.', icon: icon(Archive) },
      {
        key: 'delete',
        label: 'Delete',
        description: 'Permanently remove it from the approved list',
        icon: <Trash size={20} color="currentColor" variant="Linear" />,
        danger: true,
        disabled: records > 0,
        title: records ? why : undefined,
      },
    ]
  }

  /* "Training records" names what is counted (research 2026-11-09: name the thing, explain
     the nuance at the header); the tooltip says renewals and Not passed count too. */
  const recordsHeader = (thing: 'course' | 'provider') => (
    <span className="aet-th">
      Training records
      <Tooltip
        position="Top"
        alignment="End"
        text={
          thing === 'course'
            ? 'Each time this course was logged for a learner, including renewals and Not passed results.'
            : 'Each time a course from this provider was logged for a learner, including renewals and Not passed results.'
        }
      />
    </span>
  )

  const onCourseAction = (key: string, course: ExternalCourse) => {
    if (key === 'edit') openCourseDrawer(course)
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
    { key: 'retraining', header: 'Expiry', width: '0 0 200px', render: (c) => retrainingLabel(c.retrainingMonths) },
    { key: 'records', header: recordsHeader('course'), width: '0 0 184px', align: 'center', render: (c) => courseRecords(c.id) },
    {
      key: 'actions',
      header: '',
      width: '0 0 56px',
      align: 'center',
      cellClassName: 'is-overflow',
      render: (c) => (
        <RowActionsMenu
          ariaLabel={`Actions for ${c.name}`}
          items={menuFor('course', c.archived, courseRecords(c.id))}
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
    { key: 'courses', header: 'Courses', width: '0 0 112px', align: 'center', render: (p) => providerCourses(p.id) },
    { key: 'records', header: recordsHeader('provider'), width: '0 0 184px', align: 'center', render: (p) => providerRecords(p.id) },
    {
      key: 'actions',
      header: '',
      width: '0 0 56px',
      align: 'center',
      cellClassName: 'is-overflow',
      render: (p) => (
        <RowActionsMenu
          ariaLabel={`Actions for ${p.name}`}
          items={menuFor('provider', p.archived, providerRecords(p.id))}
          onSelect={(key) => onProviderAction(key, p)}
        />
      ),
    },
  ]

  const coursesEmpty = courses.length === 0
  const providersEmpty = providers.length === 0

  /* ── Confirm dialog copy ── */
  /* Copy from the Figma dialogs (Approved List, Archive and Delete flows). */
  const archiveBody = (thing: 'courses' | 'providers', n: number, expiry: boolean) =>
    `Archived ${thing} can't be picked for new training records.` +
    (n ? ` Its ${recordCount(n)} ${n === 1 ? 'stays' : 'stay'} on learner profiles${expiry ? ' and still count towards expiry' : ''}.` : '')
  const deleteBody = "It will be removed from the approved list and can't be recovered."
  const dialog = (() => {
    if (!confirm) return null
    if (confirm.kind === 'archive-course') {
      return {
        title: `Archive ${confirm.course.name}?`,
        body: archiveBody('courses', courseRecords(confirm.course.id), true),
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
        body: deleteBody,
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
      return {
        title: `Archive ${provider.name}?`,
        body: `${archiveBody('providers', providerRecords(provider.id), false)}${strandedLine}`,
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
      body: `${deleteBody}${strandedLine}`,
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
      <section className="aet-section" aria-label="Approved list">
        <div className="aet-toolbar aet-toolbar--top">
          <ContentSwitcher
            ariaLabel="Approved list"
            items={[
              { key: 'courses', label: 'Approved Courses' },
              { key: 'providers', label: 'Approved Providers' },
            ]}
            activeKey={view}
            onChange={(key) => {
              setView(key as View)
              setQuery('')
            }}
          />
        </div>

        {/* No swap animation between the two views (Bruno, 2026-11-05). */}
        <div className="aet-view" role="tabpanel">
            {view === 'courses' ? (
              coursesEmpty ? (
                <EmptyState
                  illustration={<img src={emptyBox} alt="" width={72} height={72} />}
                  title="No approved courses yet"
                  description="Add the external courses your people take, with how long each one stays valid."
                  secondaryAction={{ label: 'Bulk Upload Courses', onClick: openCsv }}
                  primaryAction={{ label: 'Add Course', onClick: () => openCourseDrawer(null) }}
                />
              ) : (
                <>
                  <div className="aet-toolbar">
                    <Search value={query} onChange={setQuery} onClear={() => setQuery('')} placeholder="Search courses" ariaLabel="Search courses" />
                    <Toggle checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} label="Show archived" size="sm" />
                    <div className="aet-toolbar__ctas">
                      <Button variant="outlined" icon={<DocumentUpload size={20} color="currentColor" variant="Linear" />} onClick={openCsv}>
                        Bulk Upload Courses
                      </Button>
                      <Button icon={<Add size={20} color="currentColor" variant="Linear" />} onClick={() => openCourseDrawer(null)}>
                        Add Course
                      </Button>
                    </div>
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
              )
            ) : providersEmpty ? (
              <EmptyState
                illustration={<img src={emptyBox} alt="" width={72} height={72} />}
                title="No approved providers yet"
                description="Add the organisations that deliver your external courses."
                secondaryAction={{ label: 'Add Provider', onClick: () => setProviderModal({ provider: null }) }}
              />
            ) : (
              <>
                <div className="aet-toolbar">
                  <Search value={query} onChange={setQuery} onClear={() => setQuery('')} placeholder="Search providers" ariaLabel="Search providers" />
                  <Toggle checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} label="Show archived" size="sm" />
                  <div className="aet-toolbar__ctas">
                    <Button icon={<Add size={20} color="currentColor" variant="Linear" />} onClick={() => setProviderModal({ provider: null })}>
                      Add Provider
                    </Button>
                  </div>
                </div>
                {visibleProviders.length ? (
                  <Table
                    columns={providerColumns}
                    rows={visibleProviders}
                    getRowKey={(p) => p.id}
                    getRowState={(p) => (p.archived ? 'disabled' : 'enabled')}
                  />
                ) : (
                  <EmptyState
                    illustration={<img src={noResults} alt="" width={72} height={72} />}
                    title="No providers found"
                    description="Try a different name, or turn on Show archived."
                  />
                )}
              </>
            )}
        </div>
      </section>

      {courseDrawer && (
        <CourseDrawer
          key={courseDrawer.key}
          open={courseDrawer.open}
          course={courseDrawer.course}
          onClose={closeCourseDrawer}
          onSaved={(name, isNew) => {
            closeCourseDrawer()
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

      {csvKey > 0 && (
        <BulkUploadCoursesDrawer
          key={csvKey}
          open={csvOpen}
          onClose={() => setCsvOpen(false)}
          onAdded={(n) => {
            setCsvOpen(false)
            showToast('success', `${n} course${n === 1 ? '' : 's'} added`)
          }}
        />
      )}

      <ConfirmModal open={!!dialog} onClose={() => setConfirm(null)} ariaLabel={dialog?.title} className={dialog?.danger ? 'aet-delete-dialog' : undefined}>
        {dialog && (
          <>
            <div className="confirm-modal-header confirm-modal-header--center">
              {/* DS dialogs (overlays.md): delete is Error; archive is Warning, since it can be restored. */}
              <div className="confirm-modal-icon">
                <Danger size={56} color={dialog.danger ? 'var(--danger-500)' : 'var(--warning-500)'} variant="Linear" />
              </div>
              <h2 className="confirm-modal-title">{dialog.title}</h2>
              <p className="confirm-modal-body">{dialog.body}</p>
            </div>
            <div className="confirm-modal-actions">
              <Button variant="outlined-2" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button
                semantic={dialog.danger ? 'danger' : 'warning'}
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
