import { useState, useEffect } from 'react'
import api from '../../api/axios'
import TimetableBulkUploadModal from '../../components/TimetableBulkUploadModal'
import { COURSES, COURSE_DEPARTMENTS } from '../../utils/constants'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday']
const DAY_SHORT = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat' }

export default function TimetableModule() {
  const [entries, setEntries]         = useState([])
  const [courses, setCourses]         = useState([])
  const [filterCourse, setFilterCourse] = useState('')
  const [filterDept, setFilterDept]     = useState('')
  const [filterSem, setFilterSem]       = useState('')
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm]               = useState({ course: '', department: '', semester: 1, day: 'monday', period: 1, start_time: '', end_time: '', subject: '', subject_code: '', faculty_name: '', room: '', academic_year: '2024-25' })
  const [faculties, setFaculties]     = useState([])
  const [subjects, setSubjects]       = useState([])
  const [error, setError]             = useState(null)
  const [showBulkModal, setShowBulkModal] = useState(false)



  const loadCourses = async () => {
    try {
      const res = await api.get('/timetable/?page_size=1000')
      const list = res.data.results ?? res.data
      setCourses([...new Set(list.map(e => e.course))].filter(Boolean))
    } catch (e) {}
  }

  const load = async () => {
    const params = { page_size: 1000 }
    if (filterCourse) params.course = filterCourse
    if (filterDept)   params.department = filterDept
    if (filterSem)    params.semester = filterSem
    const res = await api.get('/timetable/', { params })
    const list = res.data.results ?? res.data
    setEntries(list)

    api.get('/faculty/?page_size=1000').then(r => setFaculties(r.data.results ?? r.data)).catch(() => {})
    api.get('/academics/subjects/?page_size=1000').then(r => setSubjects(r.data.results ?? r.data)).catch(() => {})
  }

  useEffect(() => { 
    loadCourses()
  }, [])

  useEffect(() => { load() }, [filterCourse, filterDept, filterSem])

  const set = e => {
    const { name, value } = e.target
    if (name === 'subject') {
      const selectedSubject = subjects.find(s => s.name === value)
      setForm(f => ({ ...f, subject: value, subject_code: selectedSubject ? selectedSubject.code : '' }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.start_time && form.end_time) {
      const startObj = new Date(`1970-01-01T${form.start_time}:00`);
      const endObj = new Date(`1970-01-01T${form.end_time}:00`);
      const diffMins = (endObj - startObj) / 60000;

      if (diffMins <= 0) {
        return setError('End time must be strictly after start time.');
      }
      if (diffMins > 240) {
        return setError('A single class period cannot exceed 4 hours in duration.');
      }
    }

    try {
      await api.post('/timetable/', form)
      setShowForm(false)
      setForm({ course: '', department: '', semester: 1, day: 'monday', period: 1, start_time: '', end_time: '', subject: '', subject_code: '', faculty_name: '', room: '', academic_year: '2024-25' })
      load()
    } catch (err) {
      if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0])
      } else if (err.response?.data) {
        setError(Object.values(err.response.data).flat().join(' '))
      } else {
        setError('An error occurred while saving.')
      }
    }
  }

  const del = async (id) => {
    if (!confirm('Delete entry?')) return
    await api.delete(`/timetable/${id}/`)
    load()
  }

  const byDay = {}
  DAYS.forEach(d => { byDay[d] = entries.filter(e => e.day === d).sort((a, b) => a.period - b.period) })

  return (
    <div>
      {showBulkModal && (
        <TimetableBulkUploadModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            setShowBulkModal(false)
            load()
          }}
        />
      )}

      <div className="page-header">
        <div><h1>Timetable</h1><p>Manage class schedules</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" onClick={() => setShowBulkModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: 'middle' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Bulk Upload
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Add Entry</button>
        </div>
      </div>

      {showForm && (
        <div className="form-panel">
          <div className="form-panel-title">Add Timetable Entry</div>
          <form onSubmit={save}>
            {error && <div className="alert alert-error" style={{ marginBottom: 15 }}>{error}</div>}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Course</label>
                <select name="course" value={form.course} onChange={e => { set(e); setForm(f => ({ ...f, department: '' })) }} required>
                  <option value="">-- Select Course --</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select name="department" value={form.department} onChange={set}>
                  <option value="">-- Select Department --</option>
                  {(COURSE_DEPARTMENTS[form.course] || []).map(d => <option key={d} value={d}>{d}</option>)}
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
                <label className="form-label">Subject</label>
                <select name="subject" value={form.subject} onChange={set} required>
                  <option value="">-- Select Subject --</option>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Subject Code</label><input name="subject_code" value={form.subject_code || ''} onChange={set} readOnly style={{ background: 'var(--bg)' }} /></div>
              <div className="form-group">
                <label className="form-label">Faculty</label>
                <select name="faculty_name" value={form.faculty_name} onChange={set}>
                  <option value="">-- Select Faculty --</option>
                  {faculties.map(f => <option key={f.id} value={`${f.first_name} ${f.last_name}`}>{f.first_name} {f.last_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Day</label>
                <select name="day" value={form.day} onChange={set}>
                  {DAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Period</label>
                <select name="period" value={form.period} onChange={set}>
                  {[1,2,3,4,5,6,7,8].map(p => <option key={p} value={p}>Period {p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Semester</label>
                <select name="semester" value={form.semester} onChange={set}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Start Time</label><input type="time" name="start_time" value={form.start_time} onChange={set} required /></div>
              <div className="form-group"><label className="form-label">End Time</label><input type="time" name="end_time" value={form.end_time} onChange={set} required /></div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Save Entry</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Weekly Schedule</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setFilterDept('') }} style={{ width: 160 }}>
              <option value="">All Courses</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: 180 }} disabled={!filterCourse}>
              <option value="">{filterCourse ? 'All Departments' : 'Select Course first'}</option>
              {(COURSE_DEPARTMENTS[filterCourse] || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterSem} onChange={e => setFilterSem(e.target.value)} style={{ width: 120 }}>
              <option value="">All Sems</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {!filterCourse || !filterDept || !filterSem ? (
            <div className="empty-state">
              <p>Please select a Course, Department, and Semester</p>
              <span>Timetable grids are specific to a single class section.</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="empty-state"><p>No timetable entries yet</p><span>Add entries using the button above</span></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px 14px', background: 'var(--bg)', fontWeight: 700, textAlign: 'left', borderBottom: '2px solid var(--border)', width: 80 }}>Day</th>
                      {[1,2,3,4,5,6,7,8].map(p => (
                        <th key={p} style={{ padding: '10px 8px', background: 'var(--bg)', fontWeight: 600, textAlign: 'center', borderBottom: '2px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>P{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => (
                      <tr key={day} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 14px', fontWeight: 700, background: 'var(--bg)', fontSize: 13, color: 'var(--text-muted)' }}>{DAY_SHORT[day]}</td>
                        {[1,2,3,4,5,6,7,8].map(p => {
                          const entry = byDay[day]?.find(e => Number(e.period) === p)
                          return (
                            <td key={p} style={{ padding: 4, verticalAlign: 'top', minWidth: 90 }}>
                              {entry ? (
                                <div className="tt-cell">
                                  <button className="tt-del" onClick={() => del(entry.id)}>✕</button>
                                  <div className="tt-cell-subject">{entry.subject}</div>
                                  <div className="tt-cell-meta">{entry.faculty_name}</div>
                                  <div className="tt-cell-meta">{entry.start_time?.slice(0,5)}–{entry.end_time?.slice(0,5)}</div>
                                  {entry.room && <div className="tt-cell-meta">🚪 {entry.room}</div>}
                                </div>
                              ) : (
                                <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--border)', fontSize: 18 }}>·</div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
