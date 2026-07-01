import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { ENDPOINTS } from '../../api/endpoints'

const StatCard = ({ label, value, color, icon }) => (
  <div className="card">
    <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{label}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: color || 'inherit' }}>{value ?? '—'}</div>
        </div>
        {icon && <div style={{ color: color && color !== 'inherit' ? color : 'var(--text-muted)', opacity: 0.7, display: 'flex', alignItems: 'center' }}>{icon}</div>}
      </div>
    </div>
  </div>
)

export default function HostelDashboard() {
  const [stats, setStats] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`${ENDPOINTS.HOSTEL_BLOCKS}stats/`).then(r => setStats(r.data)).catch(() => {
      setStats({
        total_blocks: 4, total_rooms: 120, available_rooms: 15, occupied_rooms: 105,
        total_allotments: 200, pending_applications: 8, pending_leaves: 3,
        open_complaints: 5, pending_fees: 12, overdue_fees: 4
      })
    })
  }, [])

  const cards = stats ? [
    ['Total Blocks',          stats.total_blocks,          'inherit',          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 7v1a3 3 0 003 3h12a3 3 0 003-3V7M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>],
    ['Total Rooms',           stats.total_rooms,           'inherit',          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>],
    ['Available Rooms',       stats.available_rooms,       'var(--success)',    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>],
    ['Occupied Rooms',        stats.occupied_rooms,        '#f59e0b',          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22V14a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M2 18h20"/></svg>],
    ['Active Allotments',     stats.total_allotments,      'var(--primary)',    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>],
    ['Pending Applications',  stats.pending_applications,  '#f59e0b',          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6M9 12h6M9 16h6"/></svg>],
    ['Pending Leaves',        stats.pending_leaves,        '#f59e0b',          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>],
    ['Open Complaints',       stats.open_complaints,       'var(--danger)',     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01"/></svg>],
    ['Pending Fees',          stats.pending_fees,          '#f59e0b',          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>],
    ['Overdue Fees',          stats.overdue_fees,          'var(--danger)',     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>],
  ] : []

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hostel Management</h1>
          <p className="page-subtitle">Overview of hostel operations</p>
        </div>
      </div>

      {!stats ? <div className="loader" /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {cards.map(([label, value, color, icon]) => (
              <StatCard key={label} label={label} value={value} color={color} icon={icon} />
            ))}
          </div>

          <div className="card">
            <div className="card-body">
              <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Quick Actions</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  ['Applications',  '/hostel/applications'],
                  ['Rooms',         '/hostel/rooms'],
                  ['Allotments',    '/hostel/allotments'],
                  ['Attendance',    '/hostel/attendance'],
                  ['Fees',          '/hostel/fees'],
                  ['Leave Requests','/hostel/leaves'],
                  ['Visitors',      '/hostel/visitors'],
                  ['Complaints',    '/hostel/complaints'],
                  ['Reports',       '/hostel/reports'],
                ].map(([label, path]) => (
                  <button key={path} className="btn btn-outline" onClick={() => navigate(path)}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
