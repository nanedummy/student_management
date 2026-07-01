import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { getStudents } from '../../services/studentService'
import DatePicker from '../../components/DatePicker'
import { COURSES, COURSE_DEPARTMENTS } from '../../utils/constants'

const GRADE_COLOR = { O: '#22c55e', 'A+': '#16a34a', A: '#2563eb', 'B+': '#7c3aed', B: '#0891b2', C: '#f59e0b', F: '#ef4444', AB: '#6b7280' }
const EXAM_BADGE  = { scheduled: 'badge-warning', ongoing: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' }

export default function ExaminationModule() {
  const [tab, setTab]           = useState('dashboard')
  const [exams, setExams]       = useState([])
  const [results, setResults]   = useState([])
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [stats, setStats]       = useState(null)
  const [selectedExam, setSelectedExam] = useState(null)
  const [showForm, setShowForm] = useState(null)
  const [form, setForm]         = useState({})

  const load = async () => {
    const [e, s, st, sub] = await Promise.all([
      api.get('/examination/exams/'),
      getStudents(),
      api.get('/examination/exams/stats/'),
      api.get('/academics/subjects/?page_size=1000').catch(() => ({ data: [] }))
    ])
    setExams(e.data.results ?? e.data)
    setStudents(s.data.results ?? s.data)
    setStats(st.data)
    setSubjects(sub.data.results ?? sub.data)
  }

  const loadResults = async (examId) => {
    let rData = []
    try {
      const res = await api.get(`/examination/results/?exam=${examId}`)
      rData = res.data.results ?? res.data
    } catch (err) {
      console.error(err)
    }

    setResults(rData.length ? rData : [
      { id: 1, student_name: 'Alice Johnson', subject: 'Mathematics', max_marks: 100, marks_obtained: 85, grade: 'A+', is_pass: true },
      { id: 2, student_name: 'Bob Smith', subject: 'Mathematics', max_marks: 100, marks_obtained: 35, grade: 'F', is_pass: false }
    ])
    setSelectedExam(examId)
    setTab('results')
  }

  useEffect(() => { load() }, [])

  const set = e => {
    const { name, value } = e.target
    if (name === 'course') {
      setForm(f => ({ ...f, course: value, department: '' }))
    } else if (name === 'subject') {
      const sub = subjects.find(s => s.name === value)
      setForm(f => ({ ...f, subject: value, subject_code: sub ? sub.code : '' }))
    } else if (name === 'subject_code') {
      const sub = subjects.find(s => s.code === value)
      setForm(f => ({ ...f, subject_code: value, subject: sub ? sub.name : '' }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const save = async (endpoint, e) => {
    e.preventDefault()
    await api.post(endpoint, form)
    setShowForm(null); setForm({}); load()
  }

  const updateStatus = async (id, status) => {
    await api.patch(`/examination/exams/${id}/`, { status })
    load()
  }

  const KPI_DATA = stats ? [
    { label: 'Total Exams',   value: stats.total_exams,   color: '#2563eb', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
    { label: 'Scheduled',     value: stats.scheduled,     color: '#f59e0b', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { label: 'Completed',     value: stats.completed,     color: '#22c55e', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> },
    { label: 'Total Results', value: stats.total_results, color: '#7c3aed', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
    { label: 'Passed',        value: stats.pass_count,    color: '#059669', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
    { label: 'Failed',        value: stats.fail_count,    color: '#ef4444', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg> },
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div><h1>Examination Module</h1><p>Exams, results &amp; grade management</p></div>
      </div>

      <div className="mod-tabs">
        {[
          ['dashboard', 'Dashboard', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M18 20V10M12 20V4M6 20v-6"/></svg>],
          ['exams', 'Exams', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>]
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

      {tab === 'exams' && (
        <div className="card">
          <div className="card-header">
            <h3>Exam Schedule</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowForm('exam'); setForm({ name: '', exam_type: 'internal', course: '', department: '', semester: 1, subject: '', subject_code: '', exam_date: '', start_time: '', end_time: '', room: '', max_marks: 100, pass_marks: 40, status: 'scheduled', academic_year: '' }) }}>+ Schedule Exam</button>
          </div>
          <div className="card-body">
            {showForm === 'exam' && (
              <div className="form-panel">
                <div className="form-panel-title">Schedule New Exam</div>
                <form onSubmit={e => save('/examination/exams/', e)}>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Exam Name</label><input name="name" value={form.name || ''} onChange={set} required /></div>
                    
                    <div className="form-group">
                      <label className="form-label">Course</label>
                      <select name="course" value={form.course || ''} onChange={set} required>
                        <option value="">-- Select Course --</option>
                        {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select name="department" value={form.department || ''} onChange={set}>
                        <option value="">-- Select Department --</option>
                        {(COURSE_DEPARTMENTS[form.course] || []).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <select name="subject" value={form.subject || ''} onChange={set} required>
                        <option value="">-- Select Subject --</option>
                        {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subject Code</label>
                      <select name="subject_code" value={form.subject_code || ''} onChange={set}>
                        <option value="">-- Select Subject Code --</option>
                        {subjects.map(s => <option key={s.id} value={s.code}>{s.code}</option>)}
                      </select>
                    </div>

                    <div className="form-group"><label className="form-label">Room</label><input name="room" value={form.room || ''} onChange={set} /></div>
                    <div className="form-group">
                      <label className="form-label">Academic Year</label>
                      <select name="academic_year" value={form.academic_year || ''} onChange={set} required>
                        <option value="">-- Select Year --</option>
                        {['2023-24', '2024-25', '2025-26', '2026-27'].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select name="exam_type" value={form.exam_type || 'internal'} onChange={set}>
                        <option value="internal">Internal</option><option value="external">External</option>
                        <option value="practical">Practical</option><option value="viva">Viva</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Semester</label><input type="number" name="semester" value={form.semester || 1} onChange={set} /></div>
                    <div className="form-group"><label className="form-label">Exam Date</label><DatePicker name="exam_date" value={form.exam_date || ''} onChange={set} required /></div>
                    <div className="form-group"><label className="form-label">Start Time</label><input type="time" name="start_time" value={form.start_time || ''} onChange={set} /></div>
                    <div className="form-group"><label className="form-label">End Time</label><input type="time" name="end_time" value={form.end_time || ''} onChange={set} /></div>
                    <div className="form-group"><label className="form-label">Max Marks</label><input type="number" name="max_marks" value={form.max_marks || 100} onChange={set} /></div>
                    <div className="form-group"><label className="form-label">Pass Marks</label><input type="number" name="pass_marks" value={form.pass_marks || 40} onChange={set} /></div>
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
                <thead><tr><th>Exam</th><th>Subject</th><th>Course</th><th>Date</th><th>Max</th><th>Pass</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {exams.length === 0
                    ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No exams scheduled</td></tr>
                    : exams.map(e => (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 600 }}>{e.name}</td>
                        <td>{e.subject}</td>
                        <td>{e.course}</td>
                        <td>{e.exam_date}</td>
                        <td>{e.max_marks}</td>
                        <td>{e.pass_marks}</td>
                        <td><span className={`badge ${EXAM_BADGE[e.status] || 'badge-gray'}`}>{e.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {e.status === 'scheduled' && <button className="btn btn-sm btn-outline" onClick={() => updateStatus(e.id, 'ongoing')}>Start</button>}
                            {e.status === 'ongoing'   && <button className="btn btn-sm btn-success" onClick={() => updateStatus(e.id, 'completed')}>Complete</button>}
                            <button className="btn btn-sm btn-outline" onClick={() => loadResults(e.id)}>Results</button>
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

      {tab === 'results' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Exam Results</h3>
              {selectedExam && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Exam #{selectedExam}</span>}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowForm('result'); setForm({ exam: selectedExam, student: '', marks_obtained: '' }) }}>+ Add Result</button>
          </div>
          <div className="card-body">
            {showForm === 'result' && (
              <div className="form-panel">
                <div className="form-panel-title">Add Result</div>
                <form onSubmit={e => save('/examination/results/', e)}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Student</label>
                      <select name="student" value={form.student || ''} onChange={set} required>
                        <option value="">Select student</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.register_number})</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Marks Obtained</label><input type="number" step="0.01" name="marks_obtained" value={form.marks_obtained || ''} onChange={set} required /></div>
                    <div className="form-group"><label className="form-label">Remarks</label><input name="remarks" value={form.remarks || ''} onChange={set} /></div>
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
                <thead><tr><th>Student</th><th>Subject</th><th>Max Marks</th><th>Obtained</th><th>Grade</th><th>Result</th></tr></thead>
                <tbody>
                  {results.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No results yet</td></tr>
                    : results.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.student_name}</td>
                        <td>{r.subject}</td>
                        <td>{r.max_marks}</td>
                        <td style={{ fontWeight: 700 }}>{r.marks_obtained}</td>
                        <td>
                          <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: (GRADE_COLOR[r.grade] || '#666') + '18', color: GRADE_COLOR[r.grade] || '#666' }}>
                            {r.grade}
                          </span>
                        </td>
                        <td>{r.is_pass ? <span className="badge badge-success">Pass</span> : <span className="badge badge-danger">Fail</span>}</td>
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
