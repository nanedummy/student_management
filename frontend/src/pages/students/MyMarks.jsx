import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import useAuth from '../../hooks/useAuth'

export default function MyMarks() {
  const { user } = useAuth()
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const studentId = user.linked_student_id
    if (!studentId) { setLoading(false); return }

    api.get(`/examination/results/?student=${studentId}&page_size=1000`)
      .then(examRes => {
        const marksData = examRes.data.results ?? examRes.data
        const mappedMarks = marksData.map(m => ({
           subject: m.subject || m.exam_name,
           exam_name: m.exam_name,
           total: m.marks_obtained,
           max: m.max_marks || 100,
           is_pass: m.is_pass,
           grade: m.grade
        }))
        setMarks(mappedMarks)
      })
      .catch(err => console.error(err))
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
        <div><h1>{user?.role === 'parent' ? "Child's Marks" : 'My Marks'}</h1><p>Live data showing {user?.role === 'parent' ? 'your child\'s' : 'your'} performance in exams</p></div>
      </div>

      <div className="card">
        <div className="card-body">
            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--radius)', display: 'flex', gap: 24 }}>
              <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Marks</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>
                  {marks.reduce((s, m) => s + Number(m.total), 0)} / {marks.reduce((s, m) => s + Number(m.max), 0)}
                </div>
              </div>
              <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Percentage</span>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {marks.length ? Math.round(marks.reduce((s, m) => s + Number(m.total), 0) / Math.max(1, marks.reduce((s, m) => s + Number(m.max), 0)) * 100) : 0}%
                </div>
              </div>
            </div>
            {marks.length === 0 ? <div className="alert">No exam results found.</div> : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Exam / Subject</th>
                    <th>Marks Obtained</th>
                    <th>Max Marks</th>
                    <th>Grade</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((m, i) => {
                    return (
                      <tr key={i}>
                        <td><strong>{m.subject}</strong><br/><span style={{fontSize: 12, color: 'var(--text-muted)', fontWeight: 'normal'}}>{m.exam_name}</span></td>
                        <td><strong>{Number(m.total)}</strong></td>
                        <td style={{ color: 'var(--text-muted)' }}>{m.max}</td>
                        <td><strong>{m.grade || '—'}</strong></td>
                        <td><span className={`badge ${m.is_pass ? 'badge-success' : 'badge-danger'}`}>{m.is_pass ? 'PASS' : 'FAIL'}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            )}
        </div>
      </div>
    </div>
  )
}
