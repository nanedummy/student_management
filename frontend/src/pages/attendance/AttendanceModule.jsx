import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Pagination from '../../components/Pagination'
import ClayDatePicker from '../../components/ClayDatePicker'

const STATUS_BADGE = { present: 'badge-success', absent: 'badge-danger', late: 'badge-warning', excused: 'badge-gray' }

export default function AttendanceModule() {
  const [tab, setTab]           = useState('mark')
  const [sessions, setSessions] = useState([])
  const [sessionPage, setSessionPage] = useState(1)
  const [sessionTotalPages, setSessionTotalPages] = useState(1)
  const [studentSearch, setStudentSearch] = useState('')
  const [students, setStudents] = useState([])
  const [records, setRecords]   = useState({})
  const [form, setForm]         = useState({ date: new Date().toISOString().split('T')[0], course: '', subject: '', faculty_name: '', period: 1 })
  const [saving, setSaving]     = useState(false)
  const [summary, setSummary]   = useState(null)
  const [summaryId, setSummaryId] = useState('')
  const [courses, setCourses]   = useState([])
  const [subjects, setSubjects] = useState([])
  const [faculties, setFaculties] = useState([])

  const loadSessions = (p = 1) => {
    api.get(`/attendance/sessions/?page=${p}`).then(r => {
      if (r.data.results) {
        setSessions(r.data.results)
        setSessionTotalPages(r.data.total_pages)
      } else {
        setSessions(r.data)
        setSessionTotalPages(1)
      }
    })
  }

  useEffect(() => {
    loadSessions(1)
    api.get('/students/?page_size=1000').then(r => {
      const list = r.data.results ?? r.data
      setStudents(list)
      const init = {}
      list.forEach(s => { init[s.id] = 'present' })
      setRecords(init)
      
      const uniqueCourses = [...new Set(list.map(s => s.course))].filter(Boolean)
      setCourses(uniqueCourses)
      if (uniqueCourses.length > 0) {
        setForm(f => ({ ...f, course: uniqueCourses[0] }))
      }
    })
    
    api.get('/academics/subjects/?page_size=1000').then(r => setSubjects(r.data.results ?? r.data)).catch(() => {})
    api.get('/faculty/?page_size=1000').then(r => setFaculties(r.data.results ?? r.data)).catch(() => {})
  }, [])

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleMark = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const sessionRes = await api.post('/attendance/sessions/', form)
      const sessionId = sessionRes.data.id
      await api.post(`/attendance/sessions/${sessionId}/bulk_mark/`, { records: students.map(s => ({ student: s.id, status: records[s.id] || 'present' })) })
      loadSessions(sessionPage)
      alert('Attendance saved!')
    } finally { setSaving(false) }
  }

  const loadSummary = async () => {
    if (!summaryId) return
    const res = await api.get(`/attendance/sessions/student_summary/?student=${summaryId}`)
    setSummary(res.data)
  }

  const setAll = (status) => {
    const updated = {}
    students.forEach(s => { updated[s.id] = status })
    setRecords(updated)
  }

  const presentCount = Object.values(records).filter(v => v === 'present').length
  const absentCount  = Object.values(records).filter(v => v === 'absent').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div><h1>Attendance Module</h1><p>Mark and track student attendance</p></div>
      </div>

      <div className="mod-tabs">
        {[
          ['mark', 'Mark Attendance', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>],
          ['sessions', 'Sessions', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18"/></svg>],
          ['summary', 'Student Summary', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M18 20V10M12 20V4M6 20v-6"/></svg>]
        ].map(([t, label, icon]) => (
          <button key={t} className={`mod-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)} style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            {label}
          </button>
        ))}
      </div>

      {tab === 'mark' && (
        <form onSubmit={handleMark} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header"><h3>Session Details</h3></div>
            <div className="card-body">
              <div className="form-grid">
                {[['Date', 'date', 'date'], ['Course', 'course', 'text'], ['Subject', 'subject', 'text'], ['Faculty', 'faculty_name', 'text'], ['Period', 'period', 'number']].map(([l, n, t]) => (
                  <div key={n} className="form-group">
                    <label className="form-label">{l}</label>
                    {n === 'course' ? (
                      <select name={n} value={form[n]} onChange={set} required className="form-control">
                        <option value="">-- Select Course --</option>
                        {courses.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : n === 'subject' ? (
                      <select name={n} value={form[n]} onChange={set} required className="form-control">
                        <option value="">-- Select Subject --</option>
                        {subjects.map(s => <option key={s.id} value={s.name}>{s.name} ({s.code})</option>)}
                      </select>
                    ) : n === 'faculty_name' ? (
                      <select name={n} value={form[n]} onChange={set} required className="form-control">
                        <option value="">-- Select Faculty --</option>
                        {faculties.map(f => <option key={f.id} value={`${f.first_name} ${f.last_name}`}>{f.first_name} {f.last_name}</option>)}
                      </select>
                    ) : n === 'period' ? (
                      <select name={n} value={form[n]} onChange={set} required className="form-control">
                        <option value="">-- Select Period --</option>
                        {[1,2,3,4,5,6,7,8].map(p => <option key={p} value={p}>Period {p}</option>)}
                      </select>
                    ) : n === 'date' ? (
                      <ClayDatePicker name={n} value={form[n]} onChange={set} required={true} />
                    ) : (
                      <input type={t} name={n} value={form[n]} onChange={set} required={['date'].includes(n)} className="form-control" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Mark Students</h3>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mark all:</span>
                {['present', 'absent', 'late', 'excused'].map(s => (
                  <button key={s} type="button" className="btn btn-sm btn-outline" onClick={() => setAll(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '10px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 20, fontSize: 13 }}>
              <span>Total: <strong>{students.length}</strong></span>
              <span style={{ color: '#22c55e' }}>Present: <strong>{presentCount}</strong></span>
              <span style={{ color: '#ef4444' }}>Absent: <strong>{absentCount}</strong></span>
            </div>
            <div style={{ padding: '10px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search students by name or reg no..." 
                value={studentSearch} 
                onChange={(e) => setStudentSearch(e.target.value)} 
              />
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Student</th><th>Register No.</th><th>Status</th></tr></thead>
                <tbody>
                  {students.filter(s => {
                    const q = studentSearch.toLowerCase()
                    return (s.first_name + ' ' + s.last_name).toLowerCase().includes(q) || (s.register_number && s.register_number.toLowerCase().includes(q))
                  }).map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--text-muted)', width: 40 }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</td>
                      <td>{s.register_number}</td>
                      <td>
                        <select style={{ width: 130, padding: '5px 10px' }} value={records[s.id] || 'present'} onChange={e => setRecords(r => ({ ...r, [s.id]: e.target.value }))}>
                          <option value="present">Present</option><option value="absent">Absent</option>
                          <option value="late">Late</option><option value="excused">Excused</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer">
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Attendance'}</button>
            </div>
          </div>
        </form>
      )}

      {tab === 'sessions' && (
        <div className="card">
          <div className="card-header"><h3>Attendance Sessions</h3><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sessions.length} sessions</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Course</th><th>Subject</th><th>Period</th><th>Faculty</th><th>Marked</th><th>Present</th></tr></thead>
              <tbody>
                {sessions.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No sessions yet</td></tr>
                  : sessions.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.date}</td>
                      <td>{s.course}</td>
                      <td>{s.subject || '—'}</td>
                      <td>P{s.period}</td>
                      <td>{s.faculty_name || '—'}</td>
                      <td>{s.records_count}</td>
                      <td><span className="badge badge-success">{s.present_count}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <Pagination current={sessionPage} totalPages={sessionTotalPages} onPageChange={(p) => { setSessionPage(p); loadSessions(p); }} />
          </div>
        </div>
      )}

      {tab === 'summary' && (
        <div className="card">
          <div className="card-header"><h3>Student Attendance Summary</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label className="form-label">Select Student</label>
                <select value={summaryId} onChange={e => setSummaryId(e.target.value)}>
                  <option value="">— Select student —</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.register_number})</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={loadSummary}>Load Summary</button>
            </div>

            {summary && (
              <div className="kpi-grid">
                {[
                  { label: 'Total Classes', value: summary.total,      color: '#2563eb', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18"/></svg> },
                  { label: 'Present',       value: summary.present,    color: '#22c55e', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> },
                  { label: 'Absent',        value: summary.absent,     color: '#ef4444', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg> },
                  { label: 'Late',          value: summary.late,       color: '#f59e0b', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/></svg> },
                  { label: 'Attendance %',  value: summary.percentage + '%', color: summary.percentage >= 75 ? '#22c55e' : '#ef4444', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
                ].map(k => (
                  <div key={k.label} className="kpi-card" style={{ '--kpi-color': k.color }}>
                    <div className="kpi-icon" style={{ opacity: 0.8 }}>{k.icon}</div>
                    <div className="kpi-value">{k.value}</div>
                    <div className="kpi-label">{k.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
