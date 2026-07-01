import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getFacultyById } from '../../services/facultyService'
import { getStudents } from '../../services/studentService'
import Loader from '../../components/Loader'
import useAuth from '../../hooks/useAuth'
import { formatDate, initials, statusBadge } from '../../utils/helpers'

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{value || '—'}</span>
  </div>
)

const StatBox = ({ label, value, color }) => (
  <div style={{ flex: 1, padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', textAlign: 'center' }}>
    <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
  </div>
)

export default function FacultyProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [faculty, setFaculty] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('profile')

  useEffect(() => {
    Promise.all([getFacultyById(id), getStudents({ page_size: 1000 })])
      .then(([fRes, sRes]) => {
        setFaculty(fRes.data)
        setStudents(sRes.data.results ? sRes.data.results : sRes.data)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loader />
  if (!faculty) return <div style={{ padding: 32 }}>Faculty not found.</div>

  // Students in same department & course as this faculty
  const deptStudents = students.filter(s =>
    s.department === faculty.department ||
    (faculty.course && s.course === faculty.course)
  )

  const activeCount = deptStudents.filter(s => s.status === 'active').length
  const inactiveCount = deptStudents.filter(s => s.status === 'inactive').length
  const avgCgpa = deptStudents.length > 0
    ? (deptStudents.reduce((sum, s) => sum + (parseFloat(s.cgpa) || 0), 0) / deptStudents.length).toFixed(2)
    : '—'
  const avgAttendance = deptStudents.length > 0
    ? (deptStudents.reduce((sum, s) => sum + (parseFloat(s.attendance_percentage) || 0), 0) / deptStudents.length).toFixed(1)
    : '—'

  const tabStyle = (t) => ({
    padding: '10px 20px',
    border: 'none',
    borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
    background: 'transparent',
    color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
    fontWeight: tab === t ? 600 : 400,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.2s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div className="page-header">
        <div><h1>User Profile</h1><p>Staff details and class information</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          {user?.role === 'admin' && (
            <Link to={`/faculty/${id}/edit`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Edit
            </Link>
          )}
          <button onClick={() => navigate(-1)} className="btn btn-outline">← Back</button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 26, flexShrink: 0 }}>
              {initials(faculty.first_name, faculty.last_name)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>{faculty.first_name} {faculty.last_name}</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>{faculty.designation} · {faculty.department}</div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span className={`badge ${statusBadge(faculty.status)}`}>{faculty.status}</span>
                {faculty.course && <span className="badge badge-gray">{faculty.course}</span>}
                {faculty.assigned_role_label && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#ede9fe', color: '#7c3aed', border: '1px solid #c4b5fd' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    {faculty.assigned_role_label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
            <button style={tabStyle('profile')} onClick={() => setTab('profile')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile
            </button>
            <button style={tabStyle('students')} onClick={() => setTab('students')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
              </svg>
              Students ({deptStudents.length})
            </button>
            <button style={tabStyle('stats')} onClick={() => setTab('stats')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }}>
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Stats
            </button>
          </div>

          {/* Profile Tab */}
          {tab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <InfoRow label="First Name" value={faculty.first_name} />
              <InfoRow label="Last Name" value={faculty.last_name} />
              <InfoRow label="Email" value={faculty.email} />
              <InfoRow label="Phone" value={faculty.phone} />
              <InfoRow label="Department" value={faculty.department} />
              <InfoRow label="Course" value={faculty.course} />
              <InfoRow label="Designation" value={faculty.designation} />
              <InfoRow label="Qualification" value={faculty.qualification} />
              <InfoRow label="Experience" value={faculty.experience ? `${faculty.experience} years` : null} />
              <InfoRow label="Status" value={faculty.status?.charAt(0).toUpperCase() + faculty.status?.slice(1)} />
              <InfoRow label="Joined" value={formatDate(faculty.created_at)} />
              <InfoRow label="System Role" value={faculty.assigned_role_label || 'Not assigned'} />
            </div>
          )}

          {/* Students Tab */}
          {tab === 'students' && (
            <div>
              {deptStudents.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <p>No students found in <strong>{faculty.department}</strong> / <strong>{faculty.course}</strong></p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Register No.</th>
                        <th>Course</th>
                        <th>Year</th>
                        <th>CGPA</th>
                        <th>Attendance</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptStudents.map(s => (
                        <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/students/${s.id}`)}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 11, flexShrink: 0 }}>
                                {initials(s.first_name, s.last_name)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 500, fontSize: 13 }}>{s.first_name} {s.last_name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: 13 }}>{s.register_number}</td>
                          <td style={{ fontSize: 13 }}>{s.course}</td>
                          <td style={{ fontSize: 13 }}>Year {s.year}</td>
                          <td style={{ fontSize: 13 }}>{s.cgpa ?? '—'}</td>
                          <td style={{ fontSize: 13 }}>{s.attendance_percentage != null ? `${s.attendance_percentage}%` : '—'}</td>
                          <td><span className={`badge ${statusBadge(s.status)}`}>{s.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {tab === 'stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <StatBox label="Total Students" value={deptStudents.length} color="#2563eb" />
                <StatBox label="Active" value={activeCount} color="#16a34a" />
                <StatBox label="Inactive" value={inactiveCount} color="#dc2626" />
                <StatBox label="Avg CGPA" value={avgCgpa} color="#7c3aed" />
                <StatBox label="Avg Attendance" value={avgAttendance !== '—' ? `${avgAttendance}%` : '—'} color="#0891b2" />
              </div>

              {/* Year-wise breakdown */}
              {deptStudents.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Year-wise Breakdown</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map(y => {
                      const count = deptStudents.filter(s => s.year === y).length
                      if (count === 0) return null
                      return (
                        <div key={y} style={{ padding: '10px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', textAlign: 'center', minWidth: 80 }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb' }}>{count}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Year {y}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Gender breakdown */}
              {deptStudents.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Gender Breakdown</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {['male', 'female', 'other'].map(g => {
                      const count = deptStudents.filter(s => s.gender === g).length
                      if (count === 0) return null
                      const colors = { male: '#2563eb', female: '#db2777', other: '#7c3aed' }
                      return (
                        <div key={g} style={{ padding: '10px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', textAlign: 'center', minWidth: 80 }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: colors[g] }}>{count}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{g}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
