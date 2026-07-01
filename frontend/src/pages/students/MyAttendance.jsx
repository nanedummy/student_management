import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import useAuth from '../../hooks/useAuth'

const AttendanceBar = ({ attended, total }) => {
  const pct = Math.round((attended / total) * 100)
  const color = pct >= 75 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 99 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 36 }}>{pct}%</span>
    </div>
  )
}

export default function MyAttendance() {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const studentId = user.linked_student_id
    if (!studentId) { setLoading(false); return }

    Promise.all([
      api.get('/attendance/sessions/?page_size=1000'),
      api.get(`/attendance/records/?student=${studentId}&page_size=1000`)
    ]).then(([sessRes, attRes]) => {
        const sessions = sessRes.data.results ?? sessRes.data
        const records = attRes.data.results ?? attRes.data
        
        const sessMap = {}
        sessions.forEach(s => sessMap[s.id] = s)
        const subjMap = {}
        records.forEach(r => {
           const s = sessMap[r.session]
           if (s) {
             const subj = s.subject || s.course || 'General'
             if (!subjMap[subj]) subjMap[subj] = { subject: subj, total: 0, attended: 0 }
             subjMap[subj].total += 1
             if (['present', 'late', 'excused'].includes(r.status)) subjMap[subj].attended += 1
           }
        })
        setAttendance(Object.values(subjMap))
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <Loader />

  if (!user?.linked_student_id) return (
    <div className="empty-state" style={{ paddingTop: 80 }}>
      <p style={{ fontSize: 15 }}>No student record linked to your account.</p>
    </div>
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>{user?.role === 'parent' ? "Child's Attendance" : 'My Attendance'}</h1><p>Live data tracking {user?.role === 'parent' ? 'your child\'s' : 'your'} daily attendance across subjects</p></div>
      </div>

      <div className="card">
        <div className="card-body">
            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--radius)', display: 'flex', gap: 24 }}>
              <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Overall Attendance</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>
                  {attendance.length ? Math.round(attendance.reduce((s, a) => s + a.attended, 0) / Math.max(1, attendance.reduce((s, a) => s + a.total, 0)) * 100) : 0}%
                </div>
              </div>
              <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Classes Attended</span>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {attendance.reduce((s, a) => s + a.attended, 0)} / {attendance.reduce((s, a) => s + a.total, 0)}
                </div>
              </div>
            </div>
            {attendance.length === 0 ? <div className="alert">No attendance records found.</div> : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Attended</th>
                    <th>Total</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map(a => (
                    <tr key={a.subject}>
                      <td><strong>{a.subject}</strong></td>
                      <td>{a.attended}</td>
                      <td>{a.total}</td>
                      <td style={{ minWidth: 180 }}><AttendanceBar attended={a.attended} total={a.total} /></td>
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
