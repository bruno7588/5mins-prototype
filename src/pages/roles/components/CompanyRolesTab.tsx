import { SearchNormal1, Edit2, Copy, ArrowLeft2, ArrowRight2, Add, Trash } from 'iconsax-react'
import { useState } from 'react'
import type { CompanyRole } from '../data/mockRoles'

interface Props {
  roles: CompanyRole[]
  onCreateRole: () => void
  onEditRole: (role: CompanyRole) => void
  onDuplicateRole: (role: CompanyRole) => void
  onDeleteRole: (role: CompanyRole) => void
  onBrowseLibrary: () => void
}

function CompanyRolesTab({ roles, onCreateRole, onEditRole, onDuplicateRole, onDeleteRole, onBrowseLibrary }: Props) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = roles.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const pageStart = (page - 1) * perPage + 1
  const pageEnd = Math.min(page * perPage, filtered.length)


  const handleSearch = (val: string) => { setSearch(val); setPage(1) }

  if (roles.length === 0) {
    return (
      <div className="roles-empty-state">
        <div className="roles-empty-state__illustration">
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Lines on top */}
            <line x1="38" y1="8" x2="38" y2="20" stroke="var(--neutral-400, #9EA4B3)" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="30" y1="12" x2="25" y2="6" stroke="var(--neutral-400, #9EA4B3)" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="56" y1="12" x2="61" y2="6" stroke="var(--neutral-400, #9EA4B3)" strokeWidth="2.5" strokeLinecap="round"/>
            {/* Tray body */}
            <rect x="18" y="36" width="50" height="36" rx="4" fill="var(--neutral-200, #BFC2CC)" stroke="var(--neutral-400, #9EA4B3)" strokeWidth="2"/>
            {/* Tray opening */}
            <path d="M18 52H32C32 56.418 35.582 60 40 60H46C50.418 60 54 56.418 54 52H68" stroke="var(--neutral-400, #9EA4B3)" strokeWidth="2" fill="var(--neutral-100, #E8E9ED)"/>
            {/* Tray rim */}
            <rect x="14" y="48" width="58" height="8" rx="2" fill="var(--neutral-300, #BFC2CC)" stroke="var(--neutral-400, #9EA4B3)" strokeWidth="2"/>
          </svg>
        </div>
        <div className="roles-empty-state__info">
          <h3 className="roles-empty-state__title">No roles yet!</h3>
          <p className="roles-empty-state__description">Create your first role or copy one from the 5Mins library.</p>
        </div>
        <div className="roles-empty-state__cta">
          <button className="roles-btn-outlined-primary" onClick={onBrowseLibrary}>
            Browse 5Mins Roles
          </button>
          <button className="roles-btn-primary-with-icon" onClick={onCreateRole}>
            Create New Role
            <Add size={20} color="var(--neutral-25)" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Toolbar */}
      <div className="roles-filter-bar">
        <div className="roles-search" style={{ width: 320 }}>
          <SearchNormal1 size={18} variant="Outline" color="var(--text-tertiary)" />
          <input
            className="roles-search-input"
            placeholder="Search roles…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          {search && (
            <button className="roles-search__clear" onClick={() => handleSearch('')} aria-label="Clear search">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>

        <div className="roles-filter-right">
          <button className="roles-btn-text">
            Export Roles
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_export_co)">
                <path fillRule="evenodd" clipRule="evenodd" d="M17.5 5.625V17.5C17.5 18.163 17.2366 18.7989 16.7678 19.2678C16.2989 19.7366 15.663 20 15 20H13.75V18.75H15C15.3315 18.75 15.6495 18.6183 15.8839 18.3839C16.1183 18.1495 16.25 17.8315 16.25 17.5V5.625H13.75C13.2527 5.625 12.7758 5.42746 12.4242 5.07583C12.0725 4.72419 11.875 4.24728 11.875 3.75V1.25H5C4.66848 1.25 4.35054 1.3817 4.11612 1.61612C3.8817 1.85054 3.75 2.16848 3.75 2.5V13.75H2.5V2.5C2.5 1.83696 2.76339 1.20107 3.23223 0.732233C3.70107 0.263392 4.33696 0 5 0L11.875 0L17.5 5.625ZM4.39625 18.5513C4.40341 18.7482 4.4517 18.9415 4.53803 19.1187C4.62435 19.2958 4.7468 19.453 4.8975 19.58C5.06 19.715 5.25917 19.82 5.495 19.895C5.73167 19.9708 6.00875 20.0088 6.32625 20.0088C6.74875 20.0088 7.10667 19.9429 7.4 19.8113C7.695 19.6796 7.91958 19.4963 8.07375 19.2612C8.22958 19.0246 8.3075 18.7513 8.3075 18.4412C8.3075 18.1613 8.25167 17.9279 8.14 17.7412C8.02564 17.5539 7.86397 17.4 7.67125 17.295C7.45006 17.1722 7.21151 17.0837 6.96375 17.0325L6.1875 16.8525C6.0049 16.8176 5.83238 16.7425 5.6825 16.6325C5.62547 16.5885 5.5795 16.5318 5.54825 16.4669C5.517 16.4021 5.50133 16.3308 5.5025 16.2588C5.5025 16.0637 5.57958 15.9038 5.73375 15.7788C5.89042 15.6521 6.10375 15.5887 6.37375 15.5887C6.55208 15.5887 6.70625 15.6171 6.83625 15.6737C6.95655 15.7214 7.06248 15.7993 7.14375 15.9C7.22068 15.9928 7.27235 16.1039 7.29375 16.2225H8.23125C8.21512 15.968 8.12857 15.7231 7.98125 15.515C7.82373 15.2902 7.60755 15.1129 7.35625 15.0025C7.04946 14.8673 6.71635 14.8024 6.38125 14.8125C6.01542 14.8125 5.69208 14.875 5.41125 15C5.13042 15.1242 4.91083 15.2996 4.7525 15.5262C4.59417 15.7537 4.515 16.02 4.515 16.325C4.515 16.5767 4.56583 16.795 4.6675 16.98C4.77083 17.1658 4.9175 17.3188 5.1075 17.4388C5.2975 17.5579 5.52208 17.6467 5.78125 17.705L6.55375 17.885C6.81208 17.9458 7.005 18.0263 7.1325 18.1263C7.19455 18.1739 7.24421 18.2359 7.27728 18.3068C7.31036 18.3777 7.32586 18.4556 7.3225 18.5337C7.32532 18.6626 7.28821 18.7893 7.21625 18.8962C7.13571 19.0059 7.02494 19.0898 6.8975 19.1375C6.75833 19.1958 6.58625 19.225 6.38125 19.225C6.23542 19.225 6.10208 19.2083 5.98125 19.175C5.87043 19.1452 5.76557 19.0966 5.67125 19.0312C5.58813 18.9773 5.51697 18.9068 5.46214 18.8243C5.40732 18.7417 5.37 18.6488 5.3525 18.5513H4.39625ZM1.0075 17.1162C1.0075 16.8054 1.05 16.5417 1.135 16.325C1.20927 16.1254 1.34054 15.9519 1.5125 15.8263C1.68737 15.7079 1.89522 15.648 2.10625 15.655C2.29375 15.655 2.45958 15.6954 2.60375 15.7763C2.74462 15.8515 2.8622 15.9639 2.94375 16.1012C3.03087 16.2458 3.08229 16.4091 3.09375 16.5775H4.05V16.4875C4.04171 16.2572 3.98564 16.0312 3.88537 15.8238C3.78509 15.6164 3.64279 15.432 3.4675 15.2825C3.28871 15.1292 3.0808 15.0135 2.85625 14.9425C2.61255 14.859 2.35633 14.818 2.09875 14.8213C1.65375 14.8212 1.27417 14.9142 0.96 15.1C0.6475 15.285 0.409167 15.5483 0.245 15.89C0.0825 16.2317 0.000833333 16.6396 0 17.1138V17.7362C0 18.2096 0.0804167 18.6162 0.24125 18.9562C0.405417 19.2954 0.64375 19.5562 0.95625 19.7388C1.26875 19.9196 1.64958 20.01 2.09875 20.01C2.46458 20.01 2.79167 19.9417 3.08 19.805C3.36833 19.6683 3.5975 19.4792 3.7675 19.2375C3.93995 18.9893 4.03795 18.697 4.05 18.395V18.3H3.095C3.08316 18.4609 3.03256 18.6166 2.9475 18.7537C2.8642 18.8865 2.74677 18.9944 2.6075 19.0662C2.45102 19.1406 2.27948 19.1778 2.10625 19.175C1.89511 19.1806 1.68709 19.1232 1.50875 19.01C1.33741 18.8883 1.20708 18.7174 1.135 18.52C1.04363 18.2691 1.00038 18.0032 1.0075 17.7362V17.1162ZM11.3062 19.9137H10.115L8.4425 14.915H9.58875L10.7088 18.8375H10.7562L11.8663 14.915H12.965L11.3062 19.9137Z" fill="currentColor"/>
              </g>
              <defs>
                <clipPath id="clip0_export_co">
                  <rect width="20" height="20" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </button>
          <button className="roles-btn-primary-with-icon" onClick={onCreateRole}>
            Create New Role
            <Add size={20} color="var(--neutral-25)" />
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="roles-empty">
          <div className="roles-empty__illustration">
            <span className="roles-empty__zero">0</span>
            <svg className="roles-empty__accents" width="61" height="50" viewBox="0 0 61 50" fill="none">
              <path d="M5.5 30C3.5 32 1.5 35.5 1 38" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round"/>
              <path d="M10 37C8.5 38.5 7 41 6.5 43" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round"/>
              <path d="M51 8C53 5.5 55.5 2.5 56 1" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round"/>
              <path d="M55.5 15C57 13 59 10.5 59.5 9" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="roles-empty__text">No results found!</p>
          <p className="roles-empty__subtext">Try a different search, or create a custom role</p>
          <button className="roles-btn-primary" onClick={onCreateRole}>
            Create New Role
          </button>
        </div>
      ) : (
        <div className="people-table">
          {/* Header */}
          <div className="people-table-header">
            <div className="people-table-cell roles-col--name-co">Role Name</div>
            <div className="people-table-cell roles-col--skills">Skills</div>
            <div className="people-table-cell roles-col--employees">Learners</div>
            <div className="people-table-cell roles-col--actions"></div>
          </div>

          {/* Rows */}
          {paginated.map(role => (
            <div key={role.id} className="people-table-row">
              <div className="people-table-cell roles-col--name-co">
                <button
                  className="roles-role-link"
                  onClick={() => onEditRole(role)}
                >
                  {role.name}
                </button>
                {role.leadership && <span className="roles-leader-badge">Leadership</span>}
              </div>
              <div className="people-table-cell roles-col--skills">
                {role.skills.length}
              </div>
              <div className="people-table-cell roles-col--employees">
                {role.employeeCount}
              </div>
              <div className="people-table-cell roles-col--actions">
                <span className="roles-icon-btn-wrapper">
                  <button
                    className="roles-icon-btn"
                    onClick={() => onDuplicateRole(role)}
                  >
                    <Copy size={18} color="var(--text-tertiary)" />
                  </button>
                  <span className="roles-icon-tooltip">Duplicate</span>
                </span>
                <span className="roles-icon-btn-wrapper">
                  <button
                    className="roles-icon-btn"
                    onClick={() => onEditRole(role)}
                  >
                    <Edit2 size={18} color="var(--text-tertiary)" />
                  </button>
                  <span className="roles-icon-tooltip">Edit</span>
                </span>
                <span className="roles-icon-btn-wrapper">
                  <button
                    className="roles-icon-btn roles-icon-btn--danger"
                    onClick={() => onDeleteRole(role)}
                  >
                    <Trash size={18} color="currentColor" />
                  </button>
                  <span className="roles-icon-tooltip">Delete</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > perPage && (
        <div className="roles-pagination">
          <span className="roles-pagination-text">
            {pageStart}–{pageEnd} of {filtered.length}
          </span>
          <button
            className="roles-pagination-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ArrowLeft2 size={16} color="currentColor" />
          </button>
          <button
            className="roles-pagination-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ArrowRight2 size={16} color="currentColor" />
          </button>
        </div>
      )}

    </>
  )
}

export default CompanyRolesTab
