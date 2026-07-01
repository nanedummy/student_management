import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import useAuth from '../../hooks/useAuth'
import { formatCurrency, statusBadge } from '../../utils/helpers'

export default function ParentDashboard() {
  const { user } = useAuth()
  const studentId = user?.linked_student_id
  
  const [student, setStudent] = useState(null)
  const [attendancePct, setAttendancePct] = useState(0)
  const [marks, setMarks] = useState([])
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) {
      setLoading(false)
      return
    }

    Promise.all([
      api.get(`/students/${studentId}/`),
      api.get('/attendance/sessions/?page_size=1000'),
      api.get(`/attendance/records/?student=${studentId}&page_size=1000`),
      api.get(`/examination/results/?student=${studentId}&page_size=1000`),
      api.get('/fees/')
    ])
    .then(([stuRes, sessRes, attRes, examRes, feesRes]) => {
      setStudent(stuRes.data)
      
      // Calculate attendance
      const sessions = sessRes.data.results ?? sessRes.data
      const records = attRes.data.results ?? attRes.data
      const sessMap = {}
      sessions.forEach(s => sessMap[s.id] = s)
      let totalAttended = 0
      let totalClasses = 0
      records.forEach(r => {
        if (sessMap[r.session]) {
          totalClasses++
          if (['present', 'late', 'excused'].includes(r.status)) totalAttended++
        }
      })
      setAttendancePct(totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0)

      // Calculate recent marks
      const marksData = examRes.data.results ?? examRes.data
      setMarks(marksData.slice(0, 3)) // top 3 recent exams

      // Fees
      const studentFees = (feesRes.data.results ?? feesRes.data).filter(f => String(f.student) === String(studentId))
      setFees(studentFees)
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false))
  }, [studentId])

  if (loading) return <Loader />

  if (!studentId) return (
    <div className="empty-state" style={{ paddingTop: 80 }}>
      <p>No student record is linked to your parent account.</p>
    </div>
  )

  const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'overdue')
  const totalPendingAmount = pendingFees.reduce((sum, f) => sum + Number(f.net_amount || f.amount), 0)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1>Parent Dashboard</h1>
          <p>Welcome back! Here is an overview of your child's progress.</p>
        </div>
      </div>

      {/* Child Profile Hero */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '24px 30px', background: 'linear-gradient(to right, var(--primary), var(--primary-dark))', color: '#fff' }}>
        <img 
          src={student?.photo || `https://ui-avatars.com/api/?name=${student?.first_name}+${student?.last_name}&background=ffffff&color=2563eb`} 
          alt="Student" 
          style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{student?.first_name} {student?.last_name}</div>
          <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>Roll No: {student?.register_number} · Course: {student?.course}</div>
        </div>
        <Link to="/my-profile" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>View Full Profile</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        
        {/* Attendance Widget */}
        <div className="card">
          <div className="card-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <h3>Overall Attendance</h3>
          </div>
          <div className="card-body" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle cx="60" cy="60" r="54" fill="none" stroke={attendancePct >= 75 ? '#22c55e' : attendancePct >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth="10" 
                        strokeDasharray={`${(attendancePct / 100) * 339.292} 339.292`} strokeLinecap="round" transform="rotate(-90 60 60)" />
              </svg>
              <div style={{ position: 'absolute', fontSize: 28, fontWeight: 800 }}>{attendancePct}%</div>
            </div>
            <div style={{ marginTop: 20 }}>
              <Link to="/my-attendance" className="btn btn-outline" style={{ width: '100%' }}>View Detailed Attendance</Link>
            </div>
          </div>
        </div>

        {/* Fees Widget */}
        <div className="card">
          <div className="card-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <h3>Fee Status</h3>
          </div>
          <div className="card-body" style={{ textAlign: 'center', padding: '30px 20px' }}>
             {pendingFees.length > 0 ? (
               <>
                 <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01"/></svg>
                 </div>
                 <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Pending Amount</div>
                 <div style={{ fontSize: 32, fontWeight: 800, color: '#ef4444', margin: '4px 0 20px' }}>{formatCurrency(totalPendingAmount)}</div>
                 <Link to="/fees/pay" className="btn btn-primary" style={{ width: '100%' }}>Pay Now</Link>
               </>
             ) : (
               <>
                 <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                 </div>
                 <div style={{ fontSize: 18, fontWeight: 600, color: '#16a34a' }}>All Fees Paid</div>
                 <div style={{ fontSize: 14, color: 'var(--text-muted)', margin: '4px 0 20px' }}>No pending dues for this academic year.</div>
                 <Link to="/fees/pay" className="btn btn-outline" style={{ width: '100%' }}>View Fee History</Link>
               </>
             )}
          </div>
        </div>
        
        {/* Academics Widget */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Exam Results</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {marks.length > 0 ? (
              <div className="table-wrap">
                <table className="table" style={{ margin: 0 }}>
                  <tbody>
                    {marks.map((m, i) => (
                      <tr key={i} style={{ borderBottom: i === marks.length - 1 ? 'none' : '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600 }}>{m.subject || m.exam_name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Grade: {m.grade || '—'}</div>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: 16, color: m.is_pass ? '#16a34a' : '#ef4444' }}>{Number(m.marks_obtained)} / {m.max_marks}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent exam results found.</div>
            )}
            <div style={{ padding: 20, borderTop: '1px solid var(--border)' }}>
              <Link to="/my-marks" className="btn btn-outline" style={{ width: '100%' }}>View Full Performance</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
