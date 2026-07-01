import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { ENDPOINTS } from '../../api/endpoints'
import DatePicker from '../../components/DatePicker'

const STATUS_BADGE = { employed: 'badge-success', self_employed: 'badge-success', higher_studies: 'badge-warning', unemployed: 'badge-danger' }
const EVENT_BADGE  = { upcoming: 'badge-warning', ongoing: 'badge-info', completed: 'badge-success' }

export default function AlumniModule() {
  const [tab, setTab]           = useState('dashboard')
  const [alumni, setAlumni]     = useState([])
  const [events, setEvents]     = useState([])
  const [stats, setStats]       = useState(null)
  const [search, setSearch]     = useState('')
  const [showForm, setShowForm] = useState(null)
  const [form, setForm]         = useState({})

  const load = async () => {
    const [al, ev, st] = await Promise.all([
      api.get(ENDPOINTS.ALUMNI_PROFILES, { params: search ? { search } : {} }),
      api.get(ENDPOINTS.ALUMNI_EVENTS),
      api.get(`${ENDPOINTS.ALUMNI_PROFILES}stats/`),
    ])
    setAlumni(al.data.results ?? al.data)
    setEvents(ev.data.results ?? ev.data)
    setStats(st.data)
  }

  useEffect(() => { load() }, [])

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const save = async (endpoint, e) => {
    e.preventDefault()
    await api.post(endpoint, form)
    setShowForm(null); setForm({}); load()
  }

  const toggleVerify = async (id, current) => {
    await api.patch(`${ENDPOINTS.ALUMNI_PROFILES}${id}/`, { is_verified: !current })
    load()
  }

  const KPI_DATA = stats ? [
    { label: 'Total Alumni',    value: stats.total_alumni,    color: '#2563eb', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z M6 12.5V17c0 3 12 3 12 0v-4.5"/></svg> },
    { label: 'Verified',        value: stats.verified,        color: '#22c55e', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> },
    { label: 'Employed',        value: stats.employed,        color: '#059669', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
    { label: 'Higher Studies',  value: stats.higher_studies,  color: '#f59e0b', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
    { label: 'Total Events',    value: stats.total_events,    color: '#7c3aed', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
    { label: 'Upcoming Events', value: stats.upcoming_events, color: '#0891b2', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div><h1>Alumni Management</h1><p>Profiles, events &amp; engagement</p></div>
      </div>

      <div className="mod-tabs">
        {[
          ['dashboard', 'Dashboard', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M18 20V10M12 20V4M6 20v-6"/></svg>],
          ['alumni', 'Alumni', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M22 10v6M2 10l10-5 10 5-10 5z M6 12.5V17c0 3 12 3 12 0v-4.5"/></svg>],
          ['events', 'Events', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>]
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

      {tab === 'alumni' && (
        <div className="card">
          <div className="card-header">
            <h3>Alumni Directory</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowForm('alumni'); setForm({ first_name: '', last_name: '', email: '', phone: '', batch_year: '', course: '', department: '', current_company: '', designation: '', location: '', employment_status: 'employed' }) }}>+ Add Alumni</button>
          </div>
          <div className="card-body">
            <div className="toolbar" style={{ padding: 0, marginBottom: 16, border: 'none', background: 'none' }}>
              <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                <div className="search-bar" style={{ flex: 1 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input placeholder="Search name, email, company, course…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} style={{ width: '100%' }} />
                </div>
                <button className="btn btn-outline" onClick={load}>Search</button>
              </div>
            </div>

            {showForm === 'alumni' && (
              <div className="form-panel">
                <div className="form-panel-title">Add Alumni Profile</div>
                <form onSubmit={e => save(ENDPOINTS.ALUMNI_PROFILES, e)}>
                  <div className="form-grid">
                    {[['First Name','first_name'],['Last Name','last_name'],['Email','email'],['Phone','phone'],['Batch Year','batch_year'],['Course','course'],['Department','department'],['Company','current_company'],['Designation','designation'],['Location','location'],['LinkedIn','linkedin']].map(([l, n]) => (
                      <div key={n} className="form-group"><label className="form-label">{l}</label><input name={n} value={form[n] || ''} onChange={set} /></div>
                    ))}
                    <div className="form-group">
                      <label className="form-label">Employment Status</label>
                      <select name="employment_status" value={form.employment_status || 'employed'} onChange={set}>
                        <option value="employed">Employed</option><option value="self_employed">Self Employed</option>
                        <option value="higher_studies">Higher Studies</option><option value="unemployed">Unemployed</option>
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
                <thead><tr><th>Name</th><th>Batch</th><th>Course</th><th>Company</th><th>Status</th><th>Verified</th><th></th></tr></thead>
                <tbody>
                  {alumni.length === 0
                    ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No alumni found</td></tr>
                    : alumni.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>{a.first_name} {a.last_name}</td>
                        <td>{a.batch_year}</td>
                        <td>{a.course}</td>
                        <td>{a.current_company || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td><span className={`badge ${STATUS_BADGE[a.employment_status] || 'badge-gray'}`}>{a.employment_status?.replace('_', ' ')}</span></td>
                        <td>{a.is_verified ? <span className="badge badge-success">Verified</span> : <span className="badge badge-gray">Unverified</span>}</td>
                        <td><button className="btn btn-sm btn-outline" onClick={() => toggleVerify(a.id, a.is_verified)}>{a.is_verified ? 'Unverify' : 'Verify'}</button></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'events' && (
        <div className="card">
          <div className="card-header">
            <h3>Alumni Events</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowForm('event'); setForm({ title: '', description: '', event_date: '', venue: '', status: 'upcoming' }) }}>+ Add Event</button>
          </div>
          <div className="card-body">
            {showForm === 'event' && (
              <div className="form-panel">
                <div className="form-panel-title">New Event</div>
                <form onSubmit={e => save(ENDPOINTS.ALUMNI_EVENTS, e)}>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Title</label><input name="title" value={form.title || ''} onChange={set} required /></div>
                    <div className="form-group"><label className="form-label">Event Date</label><DatePicker name="event_date" value={form.event_date || ''} onChange={set} required /></div>
                    <div className="form-group"><label className="form-label">Venue</label><input name="venue" value={form.venue || ''} onChange={set} /></div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select name="status" value={form.status || 'upcoming'} onChange={set}>
                        <option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label className="form-label">Description</label><textarea name="description" value={form.description || ''} onChange={set} rows={2} /></div>
                  <div className="form-actions">
                    <button className="btn btn-primary" type="submit">Save</button>
                    <button className="btn btn-outline" type="button" onClick={() => setShowForm(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Date</th><th>Venue</th><th>Registrations</th><th>Status</th></tr></thead>
                <tbody>
                  {events.length === 0
                    ? <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No events yet</td></tr>
                    : events.map(e => (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 600 }}>{e.title}</td>
                        <td>{e.event_date}</td>
                        <td>{e.venue || '—'}</td>
                        <td>{e.registrations_count}</td>
                        <td><span className={`badge ${EVENT_BADGE[e.status] || 'badge-gray'}`}>{e.status}</span></td>
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
