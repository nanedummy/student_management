import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getStudents, deleteStudent } from '../../services/studentService'
import { getFaculty } from '../../services/facultyService'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import Pagination from '../../components/Pagination'
import useAuth from '../../hooks/useAuth'
import { formatDate, statusBadge, initials } from '../../utils/helpers'
import BulkUploadModal from '../../components/BulkUploadModal'
import { COURSES, DEPARTMENTS, COURSE_DEPARTMENTS } from '../../utils/constants'


function ActionMenu({ studentId, name, canEdit, canDelete, onDelete, navigate }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-block' }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)} className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: 18, lineHeight: 1 }}>⋮</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 130, overflow: 'hidden' }}>
            {canEdit && <button onClick={() => { setOpen(false); navigate(`/students/${studentId}/edit`) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>Edit</button>}
            {canDelete && <button onClick={() => { setOpen(false); onDelete() }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--danger)' }}>Delete</button>}
          </div>
        </>
      )}
    </div>
  )
}

export default function StudentList() {
  const { user } = useAuth()
  const role = user?.role
  const navigate = useNavigate()

  // Students → own profile
  useEffect(() => {
    if (role === 'student') { navigate('/my-profile', { replace: true }); return }
  }, [role, navigate])

  const canAdd = role === 'admin' || role === 'faculty'
  const canDelete = role === 'admin' || role === 'faculty' || role === 'super_admin'
  const canEdit = role === 'admin' || role === 'super_admin'

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState({ search: '', course: '', department: '', year: '', status: '', page: 1 })
  const [totalPages, setTotalPages] = useState(1)
  const [showBulkModal, setShowBulkModal] = useState(false)

  const load = async (p = params) => {
    setLoading(true)
    try {
      const res = await getStudents(p)
      setStudents(res.data.results || res.data)
      setTotalPages(res.data.total_pages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (student, e) => {
    e.stopPropagation()
    if (!canEdit) return
    const newStatus = student.status === 'active' ? 'inactive' : 'active'
    try {
      await api.patch(`/students/${student.id}/`, { status: newStatus })
      setStudents(sts => sts.map(s => s.id === student.id ? { ...s, status: newStatus } : s))
    } catch (err) {
      alert('Failed to update status')
    }
  }

  useEffect(() => { load({ ...params, page: 1 }) }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      load({ ...params, page: 1 })
    }, 400)
    return () => clearTimeout(t)
  }, [params.search])

  const set = e => setParams(p => ({ ...p, [e.target.name]: e.target.value, page: 1 }))

  const handlePageChange = (newPage) => {
    setParams(p => ({ ...p, page: newPage }))
    load({ ...params, page: newPage })
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return
    await deleteStudent(id)
    load(params)
  }

  if (role === 'student') return null

  return (
    <div>
      <div className="page-header">
        <div><h1>Students</h1><p>{students.length} total students</p></div>
        {canAdd && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline" onClick={() => setShowBulkModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Bulk Upload
            </button>
            <Link to="/students/add" className="btn btn-primary">+ Add Student</Link>
          </div>
        )}
      </div>

      {showBulkModal && (
        <BulkUploadModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => { load({ ...params, page: 1 }) }}
        />
      )}

      <div className="card">
        <div className="toolbar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <div className="search-bar" style={{ flex: 2, minWidth: 200, margin: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input placeholder="Search students..." name="search" value={params.search} onChange={set} />
          </div>
          <select className="form-control" style={{ flex: 1, minWidth: 140 }} name="course" value={params.course} onChange={e => { const c = e.target.value; setParams(p => ({ ...p, course: c, department: '', page: 1 })); load({ ...params, course: c, department: '', page: 1 }) }}>
            <option value="">All Courses</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-control" style={{ flex: 1, minWidth: 140 }} name="department" value={params.department} onChange={e => { const d = e.target.value; setParams(p => ({ ...p, department: d, page: 1 })); load({ ...params, department: d, page: 1 }) }} disabled={!params.course}>
            <option value="">{params.course ? 'All Departments' : 'Select Course first'}</option>
            {(COURSE_DEPARTMENTS[params.course] || []).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="form-control" style={{ width: 120 }} name="year" value={params.year} onChange={e => { set(e); load({ ...params, year: e.target.value, page: 1 }) }}>
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
          <select className="form-control" style={{ width: 120 }} name="status" value={params.status} onChange={e => { set(e); load({ ...params, status: e.target.value, page: 1 }) }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? <Loader /> : students.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            <p>No students found</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th><th>Reg No</th><th>Residence</th><th>Course</th><th>Year</th><th>CGPA</th><th>Attendance</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} onClick={() => navigate(`/students/${s.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</div>
                      </div>
                    </td>
                    <td>{s.register_number}</td>
                    <td>{s.residence_type === 'hosteler' ? 'Hosteler' : 'Day Scholar'}</td>
                    <td>{s.course}</td>
                    <td>Year {s.year}</td>
                    <td>{s.cgpa != null ? Number(s.cgpa).toFixed(2) : '—'}</td>
                    <td style={{ color: s.attendance_percentage >= 75 ? 'var(--success)' : s.attendance_percentage != null ? 'var(--danger)' : 'inherit' }}>
                      {s.attendance_percentage != null ? `${Number(s.attendance_percentage).toFixed(1)}%` : '—'}
                    </td>
                    <td>
                      <span 
                        className={`badge ${statusBadge(s.status)}`}
                        onClick={(e) => handleToggleStatus(s, e)}
                        style={{ cursor: canEdit ? 'pointer' : 'default' }}
                        title={canEdit ? 'Click to toggle status' : ''}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <ActionMenu
                        studentId={s.id}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onDelete={() => handleDelete(s.id, `${s.first_name} ${s.last_name}`)}
                        navigate={navigate}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination current={params.page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  )
}
