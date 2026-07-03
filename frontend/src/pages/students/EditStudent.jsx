import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getStudent, updateStudent } from '../../services/studentService'
import { COURSES, COURSE_DEPARTMENTS } from '../../utils/constants'
import Loader from '../../components/Loader'
import DatePicker from '../../components/DatePicker'

export default function EditStudent() {
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getStudent(id).then(r => {
      const d = r.data
      setForm({
        ...d,
        date_of_birth: d.date_of_birth || '',
        cgpa: d.cgpa ?? '',
        attendance_percentage: d.attendance_percentage ?? '',
        community: d.community || '', blood_group: d.blood_group || '', religion: d.religion || '', aadhar_id: d.aadhar_id || '', caste: d.caste || '', board_curriculum: d.board_curriculum || '', nationality: d.nationality || '', mother_tongue: d.mother_tongue || '', identification_mark: d.identification_mark || '',
        bank_account_holder_name: d.bank_account_holder_name || '', bank_account_number: d.bank_account_number || '', bank_name: d.bank_name || '', bank_branch_name: d.bank_branch_name || '', bank_ifsc_code: d.bank_ifsc_code || '', bank_account_type: d.bank_account_type || '',
        father_name: d.father_name || '', father_occupation: d.father_occupation || '', father_annual_income: d.father_annual_income || '',
        mother_name: d.mother_name || '', mother_occupation: d.mother_occupation || '', mother_annual_income: d.mother_annual_income || '',
        has_guardian: d.has_guardian || false, guardian_name: d.guardian_name || '', guardian_number: d.guardian_number || '', guardian_relationship: d.guardian_relationship || '', guardian_occupation: d.guardian_occupation || '', guardian_annual_income: d.guardian_annual_income || ''
      })
      if (d.photo) setPhotoPreview(d.photo)
    })
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      set('photo', file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleFileChange = (field, e) => {
    const file = e.target.files[0]
    if (file) set(field, file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      Object.keys(form).forEach(key => {
        if ((key === 'photo' || key === 'marksheet_10th' || key === 'marksheet_12th') && typeof form[key] === 'string') return
        if (form[key] !== null && form[key] !== undefined && form[key] !== '') formData.append(key, form[key])
      })
      formData.append('roll_number', form.register_number)
      await updateStudent(id, formData)
      navigate('/students')
    } catch (err) {
      const d = err.response?.data
      setError(d ? Object.values(d).flat().join(' ') : 'Failed to update student')
    } finally {
      setLoading(false)
    }
  }

  if (!form) return <Loader />

  return (
    <div>
      <div className="page-header">
        <div><h1>Edit Student</h1><p>Update student information</p></div>
        <Link to="/students" className="btn btn-outline">← Back</Link>
      </div>

      <div className="card">
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            {/* --- Personal & Academic --- */}
            <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Personal & Academic Info</h3>
            
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Photo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {photoPreview && <img src={photoPreview} alt="Preview" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--border)' }} />}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1.5px dashed var(--border)', borderRadius: 8, background: 'var(--bg)', flex: 1, maxWidth: 350 }}>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                  <span className="btn btn-outline btn-sm" style={{ pointerEvents: 'none', background: 'var(--bg-card)' }}>
                    {form?.photo && typeof form.photo !== 'string' ? 'Pick another' : 'Choose File'}
                  </span>
                  <span style={{ fontSize: 13, color: form?.photo && typeof form.photo !== 'string' ? 'var(--text)' : 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {form?.photo && typeof form.photo !== 'string' ? form.photo.name : 'No image selected...'}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" value={form.first_name} onChange={e => set('first_name', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Last Name *</label><input className="form-control" value={form.last_name} onChange={e => set('last_name', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Email *</label><input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Register Number *</label><input className="form-control" value={form.register_number} onChange={e => set('register_number', e.target.value)} required /></div>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Residence Type *</label>
                <select className="form-control" value={form.residence_type || 'day_scholar'} onChange={e => set('residence_type', e.target.value)}>
                  <option value="day_scholar">Day Scholar</option><option value="hosteler">Hosteler</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Date of Birth</label><DatePicker className="form-control" name="date_of_birth" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Nationality</label><input className="form-control" value={form.nationality} onChange={e => set('nationality', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Religion</label><input className="form-control" value={form.religion} onChange={e => set('religion', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Community</label><input className="form-control" value={form.community} onChange={e => set('community', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Caste</label><input className="form-control" value={form.caste} onChange={e => set('caste', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Mother Tongue</label><input className="form-control" value={form.mother_tongue} onChange={e => set('mother_tongue', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Blood Group</label><input className="form-control" value={form.blood_group} onChange={e => set('blood_group', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Aadhar ID</label><input className="form-control" value={form.aadhar_id} onChange={e => set('aadhar_id', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Identification Mark</label><input className="form-control" value={form.identification_mark} onChange={e => set('identification_mark', e.target.value)} /></div>
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
              <div className="form-group"><label className="form-label">Board Curriculum</label><input className="form-control" value={form.board_curriculum} onChange={e => set('board_curriculum', e.target.value)} /></div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">CGPA</label><input className="form-control" type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={e => set('cgpa', e.target.value)} placeholder="0.00 - 10.00" /></div>
              <div className="form-group"><label className="form-label">Attendance %</label><input className="form-control" type="number" step="0.01" min="0" max="100" value={form.attendance_percentage} onChange={e => set('attendance_percentage', e.target.value)} placeholder="0.00 - 100.00" /></div>
            </div>
            
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={3} value={form.address} onChange={e => set('address', e.target.value)} />
            </div>

            <h3 style={{ marginTop: 32, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Bank Details</h3>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Account Holder Name</label><input className="form-control" value={form.bank_account_holder_name} onChange={e => set('bank_account_holder_name', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Account Number</label><input className="form-control" value={form.bank_account_number} onChange={e => set('bank_account_number', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Bank Name</label><input className="form-control" value={form.bank_name} onChange={e => set('bank_name', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Branch Name</label><input className="form-control" value={form.bank_branch_name} onChange={e => set('bank_branch_name', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">IFSC Code</label><input className="form-control" value={form.bank_ifsc_code} onChange={e => set('bank_ifsc_code', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Account Type</label><input className="form-control" value={form.bank_account_type} onChange={e => set('bank_account_type', e.target.value)} /></div>
            </div>

            <div className="form-grid" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">10th Marksheet</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="file" className="form-control" onChange={e => handleFileChange('marksheet_10th', e)} />
                  {typeof form.marksheet_10th === 'string' && <a href={form.marksheet_10th} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">View</a>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">12th Marksheet</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="file" className="form-control" onChange={e => handleFileChange('marksheet_12th', e)} />
                  {typeof form.marksheet_12th === 'string' && <a href={form.marksheet_12th} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">View</a>}
                </div>
              </div>
            </div>

            {/* --- Parents Details --- */}
            <h3 style={{ marginTop: 32, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Parents Details</h3>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Father's Name</label><input className="form-control" value={form.father_name} onChange={e => set('father_name', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Father's Occupation</label><input className="form-control" value={form.father_occupation} onChange={e => set('father_occupation', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Father's Annual Income (₹)</label><input className="form-control" type="number" value={form.father_annual_income} onChange={e => set('father_annual_income', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Mother's Name</label><input className="form-control" value={form.mother_name} onChange={e => set('mother_name', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Mother's Occupation</label><input className="form-control" value={form.mother_occupation} onChange={e => set('mother_occupation', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Mother's Annual Income (₹)</label><input className="form-control" type="number" value={form.mother_annual_income} onChange={e => set('mother_annual_income', e.target.value)} /></div>
            </div>

            {/* --- Guardian Details --- */}
            <div style={{ marginTop: 32, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Guardian Details</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.has_guardian} onChange={e => set('has_guardian', e.target.checked)} />
                <span style={{ fontWeight: 600 }}>Enable Guardian</span>
              </label>
            </div>
            
            {form.has_guardian && (
              <div className="form-grid" style={{ animation: 'fadeIn 0.3s' }}>
                <div className="form-group"><label className="form-label">Guardian's Name</label><input className="form-control" value={form.guardian_name} onChange={e => set('guardian_name', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Guardian's Number</label><input className="form-control" value={form.guardian_number} onChange={e => set('guardian_number', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Relationship</label><input className="form-control" value={form.guardian_relationship} onChange={e => set('guardian_relationship', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Guardian's Occupation</label><input className="form-control" value={form.guardian_occupation} onChange={e => set('guardian_occupation', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Guardian's Annual Income (₹)</label><input className="form-control" type="number" value={form.guardian_annual_income} onChange={e => set('guardian_annual_income', e.target.value)} /></div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 32 }}>
              <Link to="/students" className="btn btn-outline">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Update Student'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
