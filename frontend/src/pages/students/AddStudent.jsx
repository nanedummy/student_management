import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createStudent } from '../../services/studentService'
import { COURSES, COURSE_DEPARTMENTS } from '../../utils/constants'
import DatePicker from '../../components/DatePicker'

const init = { first_name: '', last_name: '', email: '', phone: '', gender: 'male', residence_type: 'day_scholar', date_of_birth: '', address: '', course: '', department: '', year: 1, register_number: '', status: 'active', cgpa: '', attendance_percentage: '', photo: null }

export default function AddStudent() {
  const [form, setForm] = useState(init)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const email = params.get('email')
    const username = params.get('username')
    const firstName = params.get('first_name')
    const lastName = params.get('last_name')
    const phone = params.get('phone')
    
    setForm(f => {
      let updates = { ...f }
      if (email) updates.email = email
      if (phone) updates.phone = phone
      
      if (firstName || lastName) {
        if (firstName) updates.first_name = firstName
        if (lastName) updates.last_name = lastName
      } else if (username) {
        const parts = username.split('.')
        if (parts.length > 1) {
          updates.first_name = parts[0]
          updates.last_name = parts.slice(1).join(' ')
        } else {
          updates.first_name = username
        }
      }
      return updates
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      set('photo', file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== '') formData.append(key, form[key])
      })
      formData.append('roll_number', form.register_number)
      await createStudent(formData)
      navigate('/students')
    } catch (err) {
      const d = err.response?.data
      setError(d ? Object.values(d).flat().join(' ') : 'Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Add Student</h1><p>Register a new student</p></div>
        <Link to="/students" className="btn btn-outline">← Back</Link>
      </div>

      <div className="card">
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Photo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {photoPreview && <img src={photoPreview} alt="Preview" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--border)' }} />}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1.5px dashed var(--border)', borderRadius: 8, background: 'var(--bg)', flex: 1, maxWidth: 350 }}>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                  <span className="btn btn-outline btn-sm" style={{ pointerEvents: 'none', background: 'var(--bg-card)' }}>
                    {form?.photo ? 'Pick another' : 'Choose File'}
                  </span>
                  <span style={{ fontSize: 13, color: form?.photo ? 'var(--text)' : 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {form?.photo ? form.photo.name : 'No image selected...'}
                  </span>
                </div>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-control" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-control" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Register Number *</label>
                <input className="form-control" value={form.register_number} onChange={e => set('register_number', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Residence Type *</label>
                <select className="form-control" value={form.residence_type || 'day_scholar'} onChange={e => set('residence_type', e.target.value)}>
                  <option value="day_scholar">Day Scholar</option>
                  <option value="hosteler">Hosteler</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <DatePicker className="form-control" name="date_of_birth" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Course *</label>
                <select className="form-control" value={form.course} onChange={e => { set('course', e.target.value); set('department', '') }} required>
                  <option value="">Select Course</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select className="form-control" value={form.department} onChange={e => set('department', e.target.value)} required disabled={!form.course}>
                  <option value="">{form.course ? 'Select Department' : 'Select Course first'}</option>
                  {(COURSE_DEPARTMENTS[form.course] || []).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year *</label>
                <select className="form-control" value={form.year} onChange={e => set('year', Number(e.target.value))}>
                  {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">CGPA</label>
                <input className="form-control" type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={e => set('cgpa', e.target.value)} placeholder="0.00 - 10.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Attendance %</label>
                <input className="form-control" type="number" step="0.01" min="0" max="100" value={form.attendance_percentage} onChange={e => set('attendance_percentage', e.target.value)} placeholder="0.00 - 100.00" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={3} value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Link to="/students" className="btn btn-outline">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Add Student'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
