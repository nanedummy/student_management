import { useState, useEffect } from 'react'
import api from '../../api/axios'

const TYPE_COLOR = { info: '#2563eb', warning: '#f59e0b', success: '#22c55e', alert: '#ef4444' }
const TYPE_ICON  = {
  info: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
  warning: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  success: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  alert: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
}
const DEFAULT_ICON = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>

export default function NotificationsModule() {
  const [notifications, setNotifications] = useState([])
  const [showForm, setShowForm]           = useState(false)
  const [form, setForm]                   = useState({ title: '', message: '', notif_type: 'info', target: 'all', expires_at: '' })
  const [loading, setLoading]             = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await api.get('/notifications/')
    setNotifications(res.data.results ?? res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    await api.post('/notifications/', form)
    setShowForm(false)
    setForm({ title: '', message: '', notif_type: 'info', target: 'all', expires_at: '' })
    load()
  }

  const toggle = async (id, current) => {
    await api.patch(`/notifications/${id}/`, { is_active: !current })
    load()
  }

  const del = async (id) => {
    if (!confirm('Delete notification?')) return
    await api.delete(`/notifications/${id}/`)
    load()
  }

  const deleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL notifications? This cannot be undone.')) return
    await api.delete('/notifications/delete_all/')
    load()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div><h1>Notifications</h1><p>Broadcast announcements to users</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          {notifications.length > 0 && (
            <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '0 12px' }} onClick={deleteAll} title="Delete All Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>+ New Notification</button>
        </div>
      </div>

      {showForm && (
        <div className="form-panel">
          <div className="form-panel-title">Create Notification</div>
          <form onSubmit={save}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Title</label><input name="title" value={form.title} onChange={set} required /></div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select name="notif_type" value={form.notif_type} onChange={set}>
                  <option value="info">Info</option><option value="warning">Warning</option>
                  <option value="success">Success</option><option value="alert">Alert</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select name="target" value={form.target} onChange={set}>
                  <option value="all">All</option><option value="students">Students</option>
                  <option value="faculty">Faculty</option><option value="staff">Staff</option><option value="parents">Parents</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Expires At (optional)</label><input type="datetime-local" name="expires_at" value={form.expires_at} onChange={set} /></div>
            </div>
            <div className="form-group"><label className="form-label">Message</label><textarea name="message" value={form.message} onChange={set} rows={3} required /></div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Send Notification</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading
        ? <div className="loader-wrap"><div className="spinner" /></div>
        : notifications.length === 0
          ? <div className="card"><div className="empty-state"><p>No notifications yet</p><span>Create one using the button above</span></div></div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifications.map(n => {
                const color = TYPE_COLOR[n.notif_type] || '#666'
                const isApproval = n.title.includes('Registration') || n.title.includes('Link');
                return (
                  <div key={n.id} className="notif-card" 
                    style={{ 
                      borderLeft: `3px solid ${color}`, opacity: n.is_active ? 1 : 0.55,
                      cursor: isApproval ? 'pointer' : 'default',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => { if (isApproval) e.currentTarget.style.backgroundColor = 'var(--bg-light)' }}
                    onMouseLeave={(e) => { if (isApproval) e.currentTarget.style.backgroundColor = '' }}
                    onClick={() => {
                      if (isApproval) window.location.href = '/users?tab=approvals';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{TYPE_ICON[n.notif_type] || DEFAULT_ICON}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</span>
                        <span style={{ padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: color + '18', color }}>{n.notif_type}</span>
                        <span className="badge badge-gray">→ {n.target}</span>
                        {!n.is_active && <span className="badge badge-danger">Inactive</span>}
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.message}</p>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 5 }}>
                        By {n.created_by || 'Admin'} · {new Date(n.created_at).toLocaleString('en-IN')}
                        {n.expires_at && ` · Expires: ${new Date(n.expires_at).toLocaleDateString('en-IN')}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button className="btn btn-sm btn-outline" onClick={() => toggle(n.id, n.is_active)}>{n.is_active ? 'Deactivate' : 'Activate'}</button>
                      <button className="btn btn-sm btn-danger" onClick={() => del(n.id)}>Delete</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
    </div>
  )
}
