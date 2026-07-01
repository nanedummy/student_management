import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import useAuth from '../../hooks/useAuth'
import { formatDate, statusBadge, initials } from '../../utils/helpers'

export default function MyProfile() {
  const { user } = useAuth()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attendance, setAttendance] = useState([])
  const [marks, setMarks] = useState([])

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ phone: '', address: '' })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchProfile = () => {
    if (!user) return
    const studentId = user.linked_student_id
    if (!studentId) { setLoading(false); setError(true); return }

    Promise.all([
      api.get(`/students/${studentId}/`),
      api.get(`/attendance/records/?student=${studentId}`),
      api.get(`/examination/results/?student=${studentId}`)
    ]).then(([rStudent, rAtt, rMarks]) => {
        const s = rStudent.data
        setStudent(s)
        setForm({ phone: s.phone || '', address: s.address || '' })
        setAttendance(rAtt.data.results || rAtt.data)
        setMarks(rMarks.data.results || rMarks.data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProfile() }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('phone', form.phone)
      formData.append('address', form.address)
      if (photo) formData.append('photo', photo)
      
      await api.patch(`/students/${student.id}/`, formData)
      setIsEditing(false)
      fetchProfile()
    } catch (err) {
      alert('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  if (error || !student) return (
    <div className="empty-state" style={{ paddingTop: 80 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.4 }}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      </svg>
      <p style={{ fontSize: 15 }}>No student record linked to your account.</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Please contact your administrator to link your account.</p>
    </div>
  )

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{user?.role === 'parent' ? "Child's Profile" : 'My Profile'}</h1>
          <p>{user?.role === 'parent' ? 'Detailed information about your child' : 'Manage your personal and academic details'}</p>
        </div>
        <button onClick={() => setIsEditing(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
          Update Profile
        </button>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} onClick={() => setIsEditing(false)} />
          <div className="modal card fade-in" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 999, width: '100%', maxWidth: 450 }}>
            <div className="card-header"><h3>Update Profile Info</h3></div>
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" rows="3" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Profile Photo</label>
                  <input type="file" className="form-control" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Profile header card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="profile-header">
          <div className="profile-avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
            {student.photo
              ? <img src={student.photo} alt={student.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : initials(student.first_name, student.last_name)
            }
          </div>
          <div className="profile-info">
            <h2>{student.first_name} {student.last_name}</h2>
            <p>{student.email}</p>
            <p style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`badge ${statusBadge(student.status)}`}>{student.status}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{student.course} · Year {student.year}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Roll: {student.register_number}</span>
            </p>
          </div>
        </div>

        <div className="profile-grid">
          {[
            ['Roll Number', student.register_number],
            ['Gender', student.gender],
            ['Phone', student.phone || '—'],
            ['Date of Birth', formatDate(student.date_of_birth)],
            ['Course', student.course],
            ['Year', `Year ${student.year}`],
            ['Joined', formatDate(student.created_at)],
            ['Address', student.address || '—'],
          ].map(([label, value]) => (
            <div key={label} className="profile-item">
              <div className="profile-item-label">{label}</div>
              <div className="profile-item-value">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ '--kpi-color': '#2563eb' }}>
          <div className="kpi-value">{student.attendance_percentage || 0}%</div>
          <div className="kpi-label">Overall Attendance</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': '#059669' }}>
          <div className="kpi-value">{student.cgpa || 'N/A'}</div>
          <div className="kpi-label">Current CGPA</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div className="card">
          <div className="card-header"><h3>Attendance Records</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {attendance.length === 0 ? <div style={{ padding: 20, color: 'var(--text-muted)' }}>No records found</div> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
                  <tbody>
                    {attendance.map(a => (
                      <tr key={a.id}>
                        <td>{formatDate(a.session_date)}</td>
                        <td>{a.subject || '—'}</td>
                        <td>
                          <span className={`badge ${a.status === 'present' ? 'badge-success' : a.status === 'absent' ? 'badge-danger' : 'badge-warning'}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Examination Marks</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {marks.length === 0 ? <div style={{ padding: 20, color: 'var(--text-muted)' }}>No marks found</div> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Exam / Subject</th><th>Score</th><th>Grade</th></tr></thead>
                  <tbody>
                    {marks.map(m => (
                      <tr key={m.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{m.subject || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.exam_name}</div>
                        </td>
                        <td>{m.marks_obtained} / {m.max_marks}</td>
                        <td><span className={`badge ${m.is_pass ? 'badge-success' : 'badge-danger'}`}>{m.grade || (m.is_pass ? 'Pass' : 'Fail')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
