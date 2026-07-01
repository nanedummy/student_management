import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const { user } = useAuth()

  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkStatus, setLinkStatus] = useState('')

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSidebarOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const requiresLink = user?.role === 'parent' && !user.linked_student_id

  useEffect(() => {
    if (requiresLink) {
      api.get('/students/?page_size=1000').then(r => setStudents(r.data.results ?? r.data)).catch(() => {})
      // Silent attempt to check if pending
      api.post('/accounts/submit_link_request/', { student_id: 0 }).catch(err => {
         // This will 404, but if we had a dedicated check we'd do it here. 
      })
    }
  }, [requiresLink])

  const handleLinkSubmit = async () => {
    if (!selectedStudent) return
    setLinking(true)
    try {
      await api.post('/accounts/submit_link_request/', { student_id: selectedStudent })
      setLinkStatus('pending')
    } catch (err) {
      if (err.response?.data?.error === 'Request already pending') {
        setLinkStatus('pending')
      } else {
        setLinkStatus('error')
      }
    } finally {
      setLinking(false)
    }
  }

  return (
    <div className="layout">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content" style={requiresLink ? { filter: 'grayscale(100%) blur(4px)', pointerEvents: 'none' } : {}}>
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="page fade-in">
          <Outlet />
        </main>
        <Footer />
      </div>

      {requiresLink && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ width: 400, maxWidth: '90%' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Link Your Child</h3>
            </div>
            <div className="card-body">
              {linkStatus === 'pending' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#b45309',
                    padding: '16px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>Request Pending</strong>
                    <span style={{ fontSize: '14px', lineHeight: '1.5', display: 'block' }}>
                      Your request to link your account to the selected student has been submitted and is pending admin approval. Please check back later.
                    </span>
                  </div>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { user?.logout?.() || localStorage.clear(); window.location.href='/login' }}>
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ marginBottom: 16 }}>
                    To access the parent portal, you must select your child's student record. This request will be reviewed by an administrator.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Select Student</label>
                    <select className="form-control" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                      <option value="">-- Choose Student --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.roll_number})</option>
                      ))}
                    </select>
                  </div>
                  {linkStatus === 'error' && <p style={{color: 'red', fontSize: 12}}>An error occurred. Please try again.</p>}
                  
                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => { user?.logout?.() || localStorage.clear(); window.location.href='/login' }}
                    >
                      Logout
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 2, justifyContent: 'center' }}
                      onClick={handleLinkSubmit}
                      disabled={!selectedStudent || linking}
                    >
                      {linking ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
