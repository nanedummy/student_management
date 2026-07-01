import React, { useState, useEffect } from 'react'

export default function TransportForm({ activeTab, onSave, editData, onCancelEdit }) {
  // Shared localized dynamic forms state management
  const [formData, setFormData] = useState({})

  // Reset forms conditionally when tabs or edit modes alternate
  useEffect(() => {
    if (editData) {
      setFormData(editData)
    } else {
      if (activeTab === 'vehicles') setFormData({ busNo: '', model: '', capacity: '', route: '' })
      if (activeTab === 'drivers') setFormData({ name: '', license: '', phone: '', status: 'Active' })
      if (activeTab === 'allotments') setFormData({ studentName: '', rollNo: '', busNo: '', pickupPoint: '' })
    }
  }, [activeTab, editData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="card">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>
            {editData ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Edit Profile Entry
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add New {activeTab.slice(0, -1)}
              </>
            )}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeTab === 'vehicles' && (
              <>
                <input type="text" placeholder="Bus Number (e.g., TN-45-A-1234)" value={formData.busNo || ''} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, busNo: e.target.value})} />
                <input type="text" placeholder="Vehicle Model" value={formData.model || ''} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, model: e.target.value})} />
                <input type="number" placeholder="Max Seating Capacity" value={formData.capacity || ''} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                <input type="text" placeholder="Assigned Route Track" value={formData.route || ''} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, route: e.target.value})} />
              </>
            )}

            {activeTab === 'drivers' && (
              <>
                <input type="text" placeholder="Driver Full Name" value={formData.name || ''} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="text" placeholder="Commercial License Key" value={formData.license || ''} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, license: e.target.value})} />
                <input type="text" placeholder="Contact Mobile Phone" value={formData.phone || ''} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <select value={formData.status || 'Active'} style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </>
            )}

            {activeTab === 'allotments' && (
              <>
                <input type="text" placeholder="Student Name" value={formData.studentName || ''} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, studentName: e.target.value})} />
                <input type="text" placeholder="Roll Registration Number" value={formData.rollNo || ''} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, rollNo: e.target.value})} />
                <input type="text" placeholder="Assign Vehicle No." value={formData.busNo || ''} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, busNo: e.target.value})} />
                <input type="text" placeholder="Pickup Station Location" value={formData.pickupPoint || ''} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, pickupPoint: e.target.value})} />
              </>
            )}

            <button type="submit" className="btn" style={{ background: 'var(--primary)', color: 'white', marginTop: '0.5rem' }}>
              {editData ? 'Update Record' : 'Save Record'}
            </button>
            
            {editData && (
              <button type="button" className="btn btn-outline" onClick={onCancelEdit}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}