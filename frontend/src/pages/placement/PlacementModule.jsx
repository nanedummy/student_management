import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { ENDPOINTS } from '../../api/endpoints'

const APP_BADGE  = { applied: 'badge-gray', shortlisted: 'badge-warning', selected: 'badge-success', rejected: 'badge-danger' }
const DRV_BADGE  = { upcoming: 'badge-warning', ongoing: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' }

export default function PlacementModule() {
  const [tab, setTab]                   = useState('dashboard')
  const [companies, setCompanies]       = useState([])
  const [drives, setDrives]             = useState([])
  const [applications, setApplications] = useState([])
  const [stats, setStats]               = useState(null)
  const [showForm, setShowForm]         = useState(null)
  const [form, setForm]                 = useState({})
  const [selectedDrive, setSelectedDrive] = useState(null)

  const load = async () => {
    const [co, dr, st] = await Promise.all([
      api.get(ENDPOINTS.PLACEMENT_COMPANIES),
      api.get(ENDPOINTS.PLACEMENT_DRIVES),
      api.get(`${ENDPOINTS.PLACEMENT_DRIVES}stats/`),
    ])
    setCompanies(co.data.results ?? co.data)
    setDrives(dr.data.results ?? dr.data)
    setStats(st.data)
  }

  const loadApplications = async (driveId) => {
    const res = await api.get(ENDPOINTS.PLACEMENT_APPLICATIONS, { params: { drive: driveId } })
    setApplications(res.data.results ?? res.data)
    setSelectedDrive(driveId)
    setTab('applications')
  }

  useEffect(() => { load() }, [])

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const save = async (endpoint, e) => {
    e.preventDefault()
    await api.post(endpoint, form)
    setShowForm(null); setForm({}); load()
  }

  const updateApp = async (id, status) => {
    await api.patch(`${ENDPOINTS.PLACEMENT_APPLICATIONS}${id}/`, { status })
    loadApplications(selectedDrive)
  }

  const KPI_DATA = stats ? [
    { label: 'Companies',     value: stats.total_companies,   color: '#2563eb', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 7v1a3 3 0 003 3h12a3 3 0 003-3V7M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg> },
    { label: 'Total Drives',  value: stats.total_drives,      color: '#7c3aed', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6M9 12h6M9 16h6"/></svg> },
    { label: 'Upcoming',      value: stats.upcoming_drives,   color: '#f59e0b', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { label: 'Completed',     value: stats.completed_drives,  color: '#22c55e', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> },
    { label: 'Applications',  value: stats.total_applications,color: '#0891b2', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
    { label: 'Selected',      value: stats.total_selected,    color: '#059669', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div><h1>Placement Management</h1><p>Companies, drives &amp; applications</p></div>
      </div>

      <div className="mod-tabs">
        {[
          ['dashboard', 'Dashboard', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M18 20V10M12 20V4M6 20v-6"/></svg>],
          ['companies', 'Companies', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M3 21h18M3 7v1a3 3 0 003 3h12a3 3 0 003-3V7M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>],
          ['drives', 'Drives', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6M9 12h6M9 16h6"/></svg>],
          ['applications', 'Applications', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>]
        ].map(([t, label, icon]) => (
          <button key={t} className={`mod-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)} style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            {label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && stats && (
        <div className="kpi-grid">
          {KPI_DATA.map(k => (
            <div key={k.label} className="kpi-card" style={{ '--kpi-color': k.color }}>
              <div className="kpi-icon" style={{ opacity: 0.8 }}>{k.icon}</div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'companies' && (
        <div className="card">
          <div className="card-header">
            <h3>Companies</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowForm('company'); setForm({ name: '', industry: '', website: '', contact_person: '', contact_email: '', contact_phone: '' }) }}>+ Add Company</button>
          </div>
          <div className="card-body">
            {showForm === 'company' && (
              <div className="form-panel">
                <div className="form-panel-title">Add Company</div>
                <form onSubmit={e => save(ENDPOINTS.PLACEMENT_COMPANIES, e)}>
                  <div className="form-grid">
                    {[['Company Name','name'],['Industry','industry'],['Website','website'],['Contact Person','contact_person'],['Contact Email','contact_email'],['Contact Phone','contact_phone']].map(([l, n]) => (
                      <div key={n} className="form-group"><label className="form-label">{l}</label><input name={n} value={form[n] || ''} onChange={set} /></div>
                    ))}
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-primary" type="submit">Save</button>
                    <button className="btn btn-outline" type="button" onClick={() => setShowForm(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
            <div className="table-wrap">
              <table>
                <thead><tr><th>Company</th><th>Industry</th><th>Contact Person</th><th>Email</th><th>Phone</th></tr></thead>
                <tbody>
                  {companies.length === 0
                    ? <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No companies added</td></tr>
                    : companies.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>{c.industry || '—'}</td>
                        <td>{c.contact_person || '—'}</td>
                        <td>{c.contact_email || '—'}</td>
                        <td>{c.contact_phone || '—'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'drives' && (
        <div className="card">
          <div className="card-header">
            <h3>Placement Drives</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowForm('drive'); setForm({ company: '', title: '', drive_date: '', venue: '', package_lpa: '', eligible_courses: '', min_cgpa: '', status: 'upcoming' }) }}>+ Add Drive</button>
          </div>
          <div className="card-body">
            {showForm === 'drive' && (
              <div className="form-panel">
                <div className="form-panel-title">Schedule Drive</div>
                <form onSubmit={e => save(ENDPOINTS.PLACEMENT_DRIVES, e)}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <select name="company" value={form.company || ''} onChange={set} required>
                        <option value="">Select company</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    {[['Drive Title','title'],['Drive Date','drive_date','date'],['Venue','venue'],['Package (LPA)','package_lpa','number'],['Eligible Courses','eligible_courses'],['Min CGPA','min_cgpa','number']].map(([l, n, t='text']) => (
                      <div key={n} className="form-group"><label className="form-label">{l}</label><input type={t} name={n} value={form[n] || ''} onChange={set} /></div>
                    ))}
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select name="status" value={form.status || 'upcoming'} onChange={set}>
                        <option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-primary" type="submit">Save</button>
                    <button className="btn btn-outline" type="button" onClick={() => setShowForm(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
            <div className="table-wrap">
              <table>
                <thead><tr><th>Company</th><th>Title</th><th>Date</th><th>Package</th><th>Applied</th><th>Selected</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {drives.length === 0
                    ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No drives scheduled</td></tr>
                    : drives.map(d => (
                      <tr key={d.id}>
                        <td>{d.company_name}</td>
                        <td style={{ fontWeight: 600 }}>{d.title}</td>
                        <td>{d.drive_date}</td>
                        <td><strong>{d.package_lpa} LPA</strong></td>
                        <td>{d.applications_count}</td>
                        <td><strong style={{ color: '#22c55e' }}>{d.selected_count}</strong></td>
                        <td><span className={`badge ${DRV_BADGE[d.status] || 'badge-gray'}`}>{d.status}</span></td>
                        <td><button className="btn btn-sm btn-outline" onClick={() => loadApplications(d.id)}>Applications</button></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'applications' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Applications</h3>
              {selectedDrive && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Drive #{selectedDrive}</span>}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowForm('application'); setForm({ drive: selectedDrive, student_name: '', student_id: '', course: '', cgpa: '' }) }}>+ Add Application</button>
          </div>
          <div className="card-body">
            {showForm === 'application' && (
              <div className="form-panel">
                <div className="form-panel-title">Add Application</div>
                <form onSubmit={e => save(ENDPOINTS.PLACEMENT_APPLICATIONS, e)}>
                  <div className="form-grid">
                    {[['Student Name','student_name'],['Student ID','student_id'],['Course','course'],['CGPA','cgpa','number']].map(([l, n, t='text']) => (
                      <div key={n} className="form-group"><label className="form-label">{l}</label><input type={t} name={n} value={form[n] || ''} onChange={set} /></div>
                    ))}
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-primary" type="submit">Save</button>
                    <button className="btn btn-outline" type="button" onClick={() => setShowForm(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Course</th><th>CGPA</th><th>Status</th><th>Offer Letter</th><th></th></tr></thead>
                <tbody>
                  {applications.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No applications</td></tr>
                    : applications.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>{a.student_name}</td>
                        <td>{a.course}</td>
                        <td>{a.cgpa}</td>
                        <td><span className={`badge ${APP_BADGE[a.status] || 'badge-gray'}`}>{a.status}</span></td>
                        <td>{a.offer_letter ? <span className="badge badge-success">Yes</span> : '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {a.status === 'applied'      && <button className="btn btn-sm btn-outline" onClick={() => updateApp(a.id, 'shortlisted')}>Shortlist</button>}
                            {a.status === 'shortlisted'  && <button className="btn btn-sm btn-success" onClick={() => updateApp(a.id, 'selected')}>Select</button>}
                            {!['rejected','selected'].includes(a.status) && <button className="btn btn-sm btn-danger" onClick={() => updateApp(a.id, 'rejected')}>Reject</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
