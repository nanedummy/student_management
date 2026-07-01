import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getFacultyById, updateFaculty } from '../../services/facultyService'
import { DEPARTMENTS, DESIGNATIONS, DEPARTMENT_COURSES } from '../../utils/constants'
import Loader from '../../components/Loader'
import api from '../../api/axios'
import { PREDEFINED_ROLES, PermissionGrid } from './FacultyList'

export default function EditFaculty() {
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // User access settings states
  const [hasUser, setHasUser] = useState(false)
  const [userAccount, setUserAccount] = useState(null)
  const [createUser, setCreateUser] = useState(false)
  const [customRoles, setCustomRoles] = useState([])

  // Account creation/edit fields
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [roleType, setRoleType] = useState('predefined') // 'predefined' | 'custom'
  const [selectedRole, setSelectedRole] = useState('faculty')
  const [customRoleName, setCustomRoleName] = useState('')
  const [selectedCustomRoleId, setSelectedCustomRoleId] = useState('')
  const [permissions, setPermissions] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facRes = await getFacultyById(id)
        setForm(facRes.data)
        const email = facRes.data.email

        // Load all system users to check if this email already exists
        const userRes = await api.get('/accounts/users/')
        const foundUser = userRes.data.find(u => u.email === email)
        if (foundUser) {
          setHasUser(true)
          setUserAccount(foundUser)
          setUsername(foundUser.username)
          setPermissions(foundUser.custom_permissions || [])
          if (foundUser.custom_role_id) {
            setRoleType('custom')
            setSelectedCustomRoleId(foundUser.custom_role_id)
          } else {
            setRoleType('predefined')
            setSelectedRole(foundUser.role || 'faculty')
          }
        } else {
          setHasUser(false)
          setUsername(email ? email.split('@')[0] : '')
        }

        // Load custom roles
        const rolesRes = await api.get('/accounts/custom-roles/')
        setCustomRoles(rolesRes.data)
      } catch (err) {
        console.error("Error loading access settings data", err)
      }
    }
    fetchData()
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // 1. Save Faculty Details
      await updateFaculty(id, form)

      // 2. User Account Handling
      if (hasUser && userAccount) {
        // Update existing user account
        let uRole = roleType === 'custom' ? 'custom' : selectedRole
        let uCustomRoleId = roleType === 'custom' ? Number(selectedCustomRoleId) : null

        // Handle custom role creation/update
        if (roleType === 'custom') {
          if (!uCustomRoleId && customRoleName.trim()) {
            // Create a new custom role first
            const crRes = await api.post('/accounts/custom-roles/create/', {
              name: customRoleName.trim(),
              permissions
            })
            uCustomRoleId = crRes.data.id
          } else if (uCustomRoleId) {
            // Update permissions for the selected custom role
            await api.patch(`/accounts/custom-roles/${uCustomRoleId}/`, {
              permissions
            })
          }
        }

        // Update the user details
        await api.patch(`/accounts/users/${userAccount.id}/`, {
          email: form.email,
          role: uRole,
          custom_role_id: uCustomRoleId,
          custom_permissions: permissions
        })

        // Change password if provided
        if (newPassword) {
          await api.post(`/accounts/users/${userAccount.id}/set-password/`, {
            password: newPassword
          })
        }
      } else if (!hasUser && createUser) {
        if (!password) {
          throw new Error('Password is required to create a system user account.')
        }
        // Create new user account
        let uRole = roleType === 'custom' ? 'custom' : selectedRole
        let uCustomRoleId = roleType === 'custom' ? Number(selectedCustomRoleId) : null

        // Handle custom role creation
        if (roleType === 'custom') {
          if (!uCustomRoleId && customRoleName.trim()) {
            const crRes = await api.post('/accounts/custom-roles/create/', {
              name: customRoleName.trim(),
              permissions
            })
            uCustomRoleId = crRes.data.id
          }
        }

        // Convert/create system user
        await api.post('/accounts/convert-faculty/', {
          faculty_id: id,
          username,
          password,
          role: uRole,
          custom_role_id: uCustomRoleId,
          custom_permissions: permissions
        })
      }

      navigate('/faculty')
    } catch (err) {
      const d = err.response?.data
      setError(d ? (d.error || Object.values(d).flat().join(' ')) : (err.message || 'Failed to update faculty and user settings'))
    } finally {
      setLoading(false)
    }
  }

  const renderRoleSelector = () => {
    return (
      <div style={{ marginTop: 15 }}>
        <div className="form-label" style={{ marginBottom: 10 }}>Role Assignment Type</div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13.5, fontWeight: 500 }}>
            <input type="radio" name="roleType" checked={roleType === 'predefined'} onChange={() => {
              setRoleType('predefined')
              setCustomRoleName('')
              setSelectedCustomRoleId('')
            }} style={{ width: 14, height: 14, accentColor: 'var(--primary)' }} />
            Predefined System Role
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13.5, fontWeight: 500 }}>
            <input type="radio" name="roleType" checked={roleType === 'custom'} onChange={() => setRoleType('custom')} style={{ width: 14, height: 14, accentColor: 'var(--primary)' }} />
            Custom Role (Fine-grained Permissions)
          </label>
        </div>

        {roleType === 'predefined' ? (
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Select Role *</label>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={{ maxWidth: 400 }}>
              {PREDEFINED_ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="form-grid" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Select Existing Custom Role</label>
              <select value={selectedCustomRoleId} onChange={e => {
                const val = e.target.value
                setSelectedCustomRoleId(val)
                if (val) {
                  const cr = customRoles.find(r => r.id === Number(val))
                  if (cr) {
                    setPermissions(cr.permissions || [])
                    setCustomRoleName('')
                  }
                }
              }}>
                <option value="">-- Create New / Type custom --</option>
                {customRoles.map(cr => (
                  <option key={cr.id} value={cr.id}>{cr.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Or Create New Custom Role (Type Name)</label>
              <input value={customRoleName} onChange={e => {
                setCustomRoleName(e.target.value)
                setSelectedCustomRoleId('')
              }} placeholder="e.g. Assistant Warden" disabled={!!selectedCustomRoleId} />
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <label className="form-label" style={{ marginBottom: 12 }}>System Permissions Grid</label>
          <PermissionGrid selected={permissions} onChange={setPermissions} />
        </div>
      </div>
    )
  }

  if (!form) return <Loader />

  return (
    <div>
      <div className="page-header">
        <div><h1>Edit User</h1><p>Update user information</p></div>
        <Link to="/faculty" className="btn btn-outline">← Back</Link>
      </div>

      <div className="card">
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select value={form.department} onChange={e => { set('department', e.target.value); set('course', '') }} required>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Course</label>
                <select value={form.course || ''} onChange={e => set('course', e.target.value)} disabled={!form.department}>
                  <option value="">{form.department ? 'Select Course' : 'Select Department first'}</option>
                  {(DEPARTMENT_COURSES[form.department] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Designation *</label>
                <select value={form.designation} onChange={e => set('designation', e.target.value)} required>
                  <option value="">Select Designation</option>
                  {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Qualification</label>
                <input value={form.qualification} onChange={e => set('qualification', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Experience (years)</label>
                <input type="number" min="0" value={form.experience} onChange={e => set('experience', Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 30, borderTop: '1px solid var(--border)', paddingTop: 24, marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
                <svg style={{ width: 18, height: 18, color: 'var(--primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Access & Role Settings
              </h3>

              {!hasUser ? (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>
                    <input type="checkbox" checked={createUser} onChange={e => setCreateUser(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                    Create System User Account for this staff member
                  </label>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginLeft: 24, marginTop: 4 }}>
                    Enabling this will generate a login credential and system role for the faculty member using their email address.
                  </p>

                  {createUser && (
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1.5px dashed var(--border)' }}>
                      <div className="form-grid" style={{ marginBottom: 18 }}>
                        <div className="form-group">
                          <label className="form-label">Username *</label>
                          <input value={username} onChange={e => setUsername(e.target.value)} required placeholder="Enter username" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Password *</label>
                          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter temporary password" />
                        </div>
                      </div>

                      {renderRoleSelector()}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="form-grid" style={{ marginBottom: 18 }}>
                    <div className="form-group">
                      <label className="form-label">Username (Linked System Account)</label>
                      <input value={username} disabled style={{ background: 'var(--bg)', cursor: 'not-allowed', opacity: 0.8 }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Change Password (Leave blank to keep current)</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
                    </div>
                  </div>

                  {renderRoleSelector()}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <Link to="/faculty" className="btn btn-outline">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

