import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getStudent, deleteStudent } from '../../services/studentService'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import { formatDate, statusBadge, initials } from '../../utils/helpers'
import useAuth from '../../hooks/useAuth'

export default function StudentProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = ['super_admin', 'admin'].includes(user?.role)
  const canEdit = isAdmin || ['hr'].includes(user?.role) || user?.permissions?.includes('manage_students')
  const canDelete = isAdmin || ['hr', 'faculty'].includes(user?.role) || user?.permissions?.includes('manage_students')
  const [student, setStudent] = useState(null)
  const [password, setPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [showPwForm, setShowPwForm] = useState(false)

  useEffect(() => {
    getStudent(id).then(r => setStudent(r.data)).catch(() => setStudent({}))
  }, [id])

  const handleSetPassword = async (e) => {
    e.preventDefault()
    setPwLoading(true)
    setPwMsg('')
    try {
      const res = await api.post('/accounts/create-student-account/', { student_id: id, password })
      setPwMsg({ type: 'success', text: res.data.message })
      setPassword('')
      setShowPwForm(false)
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.error || 'Failed to set password' })
    } finally {
      setPwLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}? This cannot be undone.`)) return
    try {
      await deleteStudent(id)
      navigate('/students')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete student')
    }
  }

  const handleToggleStatus = async () => {
    try {
      const newStatus = student.status === 'active' ? 'inactive' : 'active'
      await api.patch(`/students/${id}/`, { status: newStatus })
      setStudent(s => ({ ...s, status: newStatus }))
    } catch (err) {
      alert('Failed to update status')
    }
  }

  if (!student) return <Loader />
  if (!student.id) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--danger)' }}>Profile not found or access denied.</div>

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline" 
            style={{ 
              width: 36, 
              height: 36, 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: 16
            }}
            title="Go Back"
          >
            ←
          </button>
          <div>
            <h1>Student Profile</h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canEdit && (
            <button onClick={handleToggleStatus} className="btn btn-outline">
              {student.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {canEdit && <button onClick={() => navigate(`/students/${id}/edit`)} className="btn btn-primary">Edit</button>}
          {canDelete && <button onClick={handleDelete} className="btn btn-danger">Delete</button>}
        </div>
      </div>

      {/* Profile Header */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="profile-header">
          <div className="profile-avatar">
            {student.photo
              ? <img src={student.photo} alt={student.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : initials(student.first_name, student.last_name)
            }
          </div>
          <div className="profile-info">
            <h2>{student.first_name} {student.last_name}</h2>
            <p>{student.email}</p>
            <p style={{ marginTop: 6 }}>
              <span className={`badge ${statusBadge(student.status)}`}>{student.status}</span>
              <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: 13 }}>{student.course} · Year {student.year}</span>
            </p>
          </div>
        </div>

        {/* Academic Stats */}
        <div style={{ display: 'flex', gap: 16, padding: '12px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', margin: '16px 0' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>
              {student.cgpa != null ? Number(student.cgpa).toFixed(2) : '—'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>CGPA</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: student.attendance_percentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
              {student.attendance_percentage != null ? `${Number(student.attendance_percentage).toFixed(1)}%` : '—'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Attendance</div>
          </div>
        </div>

        <div className="profile-grid">
          {[
            ['Register Number', student.register_number],
            ['Gender', student.gender],
            ['Residence Type', student.residence_type === 'hosteler' ? 'Hosteler' : 'Day Scholar'],
            ['Phone', student.phone || '—'],
            ['Date of Birth', formatDate(student.date_of_birth)],
            ['Course', student.course],
            ['Year', `Year ${student.year}`],
            ['Joined', formatDate(student.created_at)],
            ['Address', student.address || '—'],
            ['Nationality', student.nationality || '—'],
            ['Religion', student.religion || '—'],
            ['Community', student.community || '—'],
            ['Caste', student.caste || '—'],
            ['Mother Tongue', student.mother_tongue || '—'],
            ['Blood Group', student.blood_group || '—'],
            ['Aadhar ID', student.aadhar_id || '—'],
            ['Identification Mark', student.identification_mark || '—'],
            ['Board Curriculum', student.board_curriculum || '—'],
          ].map(([label, value]) => (
            <div key={label} className="profile-item">
              <div className="profile-item-label">{label}</div>
              <div className="profile-item-value">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Details */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <h3 style={{ marginBottom: 12 }}>Bank Details</h3>
          <div className="profile-grid">
            {[
              ['Account Holder Name', student.bank_account_holder_name || '—'],
              ['Account Number', student.bank_account_number || '—'],
              ['Bank Name', student.bank_name || '—'],
              ['Branch Name', student.bank_branch_name || '—'],
              ['IFSC Code', student.bank_ifsc_code || '—'],
              ['Account Type', student.bank_account_type || '—'],
            ].map(([label, value]) => (
              <div key={label} className="profile-item">
                <div className="profile-item-label">{label}</div>
                <div className="profile-item-value">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documents */}
      {(student.marksheet_10th || student.marksheet_12th) && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <h3 style={{ marginBottom: 12 }}>Documents</h3>
            <div style={{ display: 'flex', gap: 16 }}>
              {student.marksheet_10th && <a href={student.marksheet_10th} target="_blank" rel="noreferrer" className="btn btn-outline">10th Marksheet</a>}
              {student.marksheet_12th && <a href={student.marksheet_12th} target="_blank" rel="noreferrer" className="btn btn-outline">12th Marksheet</a>}
            </div>
          </div>
        </div>
      )}

      {/* Parents Details */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <h3 style={{ marginBottom: 12 }}>Parents Details</h3>
          <div className="profile-grid">
            {[
              ["Father's Name", student.father_name || '—'],
              ["Father's Occupation", student.father_occupation || '—'],
              ["Father's Annual Income (₹)", student.father_annual_income || '—'],
              ["Mother's Name", student.mother_name || '—'],
              ["Mother's Occupation", student.mother_occupation || '—'],
              ["Mother's Annual Income (₹)", student.mother_annual_income || '—'],
            ].map(([label, value]) => (
              <div key={label} className="profile-item">
                <div className="profile-item-label">{label}</div>
                <div className="profile-item-value">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guardian Details */}
      {student.has_guardian && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <h3 style={{ marginBottom: 12 }}>Guardian Details</h3>
            <div className="profile-grid">
              {[
                ["Guardian's Name", student.guardian_name || '—'],
                ["Guardian's Number", student.guardian_number || '—'],
                ["Relationship", student.guardian_relationship || '—'],
                ["Guardian's Occupation", student.guardian_occupation || '—'],
                ["Guardian's Annual Income (₹)", student.guardian_annual_income || '—'],
              ].map(([label, value]) => (
                <div key={label} className="profile-item">
                  <div className="profile-item-label">{label}</div>
                  <div className="profile-item-value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Set Password — admin only */}
      {isAdmin && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Login Account</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Username: <strong>{student.register_number}</strong></div>
            </div>
            <button onClick={() => { setShowPwForm(p => !p); setPwMsg('') }} className="btn btn-outline">
              {showPwForm ? 'Cancel' : 'Set Password'}
            </button>
          </div>
          {showPwForm && (
            <form onSubmit={handleSetPassword} style={{ padding: '0 20px 16px', display: 'flex', gap: 8 }}>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                {pwLoading ? 'Saving...' : 'Save'}
              </button>
            </form>
          )}
          {pwMsg && (
            <div style={{ padding: '0 20px 16px' }}>
              <div className={`alert alert-${pwMsg.type === 'success' ? 'success' : 'error'}`}>{pwMsg.text}</div>
            </div>
          )}
        </div>
      )}

      {/* Fees redirect — both admin and student */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <div>
          <div style={{ fontWeight: 600 }}>Fee Records</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <span>{student.register_number}</span>
            <span style={{ margin: '0 8px' }}>·</span>
            <span>{student.course}</span>
          </div>
        </div>
        <Link to={isAdmin ? `/fees?student=${id}` : '/fees'} className="btn btn-primary">View Fees →</Link>
      </div>
    </div>
  )
}
