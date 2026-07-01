import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { ENDPOINTS } from '../../api/endpoints'

// ==========================================
// 1. STATS COMPONENT
// ==========================================
const StatCard = ({ label, value, color, icon }) => (
  <div className="card">
    <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{label}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: color || 'inherit' }}>{value ?? '0'}</div>
        </div>
        {icon && <div style={{ display: 'flex', alignItems: 'center', opacity: 0.8, color: color || 'var(--text-muted)' }}>{icon}</div>}
      </div>
    </div>
  </div>
)

function TransportStats({ vehiclesCount, driversCount, allotmentsCount }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
      <StatCard label="Registered Buses" value={vehiclesCount} color="var(--primary)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="13" rx="2" ry="2" /><path d="M17 21v-2M7 21v-2M2 11h20M2 15h20" /></svg>} />
      <StatCard label="Active Drivers" value={driversCount} color="var(--success)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" /></svg>} />
      <StatCard label="Total Allocated Students" value={allotmentsCount} icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>} />
    </div>
  )
}

// ==========================================
// 2. TABS COMPONENT
// ==========================================
function TransportTabs({ activeTab, setActiveTab }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', paddingBottom: '0.25rem' }}>
      {['vehicles', 'drivers', 'allotments'].map((tab) => (
        <button
          key={tab}
          className={`btn ${activeTab === tab ? '' : 'btn-outline'}`}
          style={{ 
            textTransform: 'uppercase', 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            letterSpacing: '0.05em',
            borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none'
          }}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ==========================================
// 3. FORM COMPONENT
// ==========================================
function TransportForm({ activeTab, onSave, editData, onCancelEdit }) {
  const [formData, setFormData] = useState({})

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
                <input type="text" placeholder="Bus Number" value={formData.busNo || ''} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid var(--border)' }} onChange={e => setFormData({...formData, busNo: e.target.value})} />
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
              <button type="button" className="btn btn-outline" onClick={onCancelEdit}>Cancel</button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// ==========================================
// 4. TABLE COMPONENT
// ==========================================
function TransportTable({ activeTab, data, onEdit, onDelete }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredData = data.filter((item) => {
    const stringifiedValues = Object.values(item).join(' ').toLowerCase()
    return stringifiedValues.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="card">
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
        <input 
          type="text" 
          placeholder={`🔍 Search across ${activeTab}...`} 
          value={searchQuery}
          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 4, border: '1px solid var(--border)', fontSize: '0.85rem' }}
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </div>

      <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
        {activeTab === 'vehicles' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Bus Number</th>
                <th style={{ padding: '0.75rem 1rem' }}>Model Profile</th>
                <th style={{ padding: '0.75rem 1rem' }}>Seating Limit</th>
                <th style={{ padding: '0.75rem 1rem' }}>Active Track Line</th>
                <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((v, index) => (
                <tr key={v.id || v._id || index} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{v.busNo}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{v.model}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{v.capacity} Seats</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 500 }}>{v.route}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span onClick={() => onEdit(v)} style={{ color: 'var(--primary)', cursor: 'pointer', marginRight: '0.75rem', fontWeight: 600 }}>Edit</span>
                    <span onClick={() => onDelete(v.id || v._id || index)} style={{ color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}>Delete</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'drivers' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Operator Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>License Key ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Phone Line</th>
                <th style={{ padding: '0.75rem 1rem' }}>Duty Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((d, index) => (
                <tr key={d.id || d._id || index} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{d.name}</td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>{d.license}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{d.phone}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ color: d.status === 'Active' ? 'var(--success)' : '#f59e0b', fontWeight: 600, fontSize: '0.8rem' }}>● {d.status}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span onClick={() => onEdit(d)} style={{ color: 'var(--primary)', cursor: 'pointer', marginRight: '0.75rem', fontWeight: 600 }}>Edit</span>
                    <span onClick={() => onDelete(d.id || d._id || index)} style={{ color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}>Delete</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'allotments' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Student Details</th>
                <th style={{ padding: '0.75rem 1rem' }}>Roll No</th>
                <th style={{ padding: '0.75rem 1rem' }}>Bus Allotted</th>
                <th style={{ padding: '0.75rem 1rem' }}>Station Destination</th>
                <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((a, index) => (
                <tr key={a.id || a._id || index} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{a.studentName}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{a.rollNo}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{a.busNo}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {a.pickupPoint}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span onClick={() => onEdit(a)} style={{ color: 'var(--primary)', cursor: 'pointer', marginRight: '0.75rem', fontWeight: 600 }}>Edit</span>
                    <span onClick={() => onDelete(a.id || a._id || index)} style={{ color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}>Delete</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filteredData.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No records matched your search.
          </div>
        )}
      </div>
    </div>
  )
}

// ==========================================
// 5. MAIN PARENT ROUTER (EXPORT DEFAULT)
// ==========================================
export default function TransportModule() {
  const [activeTab, setActiveTab] = useState('vehicles')
  const [loading, setLoading] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [allotments, setAllotments] = useState([])

  const loadData = async () => {
    setLoading(true)
    try {
      const baseEndpoint = ENDPOINTS.TRANSPORT || '/api/transport/'
      const [vRes, dRes, aRes] = await Promise.all([
        api.get(`${baseEndpoint}vehicles/`).catch(() => ({ data: [] })),
        api.get(`${baseEndpoint}drivers/`).catch(() => ({ data: [] })),
        api.get(`${baseEndpoint}allotments/`).catch(() => ({ data: [] }))
      ])
      
      const vData = vRes.data?.results || vRes.data || []
      const dData = dRes.data?.results || dRes.data || []
      const aData = aRes.data?.results || aRes.data || []

      setVehicles(vData.length ? vData : [
        { id: 1, busNo: 'BUS-101', model: 'Tata Marcopolo', capacity: 40, route: 'Route A - City Center' },
        { id: 2, busNo: 'BUS-102', model: 'Ashok Leyland', capacity: 35, route: 'Route B - North Square' }
      ])
      
      setDrivers(dData.length ? dData : [
        { id: 1, name: 'Ramesh Kumar', license: 'DL-1234567', phone: '+1234567890', status: 'Active' },
        { id: 2, name: 'Suresh Singh', license: 'DL-9876543', phone: '+0987654321', status: 'On Leave' }
      ])
      
      setAllotments(aData.length ? aData : [
        { id: 1, studentName: 'Alice Johnson', rollNo: 'S001', busNo: 'BUS-101', pickupPoint: 'City Center Bus Stop' },
        { id: 2, studentName: 'Bob Smith', rollNo: 'S002', busNo: 'BUS-102', pickupPoint: 'North Square Metro' }
      ])

    } catch (err) {
      console.error("API Error connecting to database:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSaveRecord = async (submittedData) => {
    const baseEndpoint = ENDPOINTS.TRANSPORT || '/api/transport/'
    const targetSetter = activeTab === 'vehicles' ? setVehicles : activeTab === 'drivers' ? setDrivers : setAllotments
    const currentList = activeTab === 'vehicles' ? vehicles : activeTab === 'drivers' ? drivers : allotments

    if (editingRecord) {
      try {
        const id = editingRecord.id || editingRecord._id
        const res = await api.put(`${baseEndpoint}${activeTab}/${id}/`, submittedData)
        targetSetter(currentList.map(item => (item.id === id || item._id === id) ? res.data : item))
      } catch {
        targetSetter(currentList.map(item => (item.id === editingRecord.id || item._id === editingRecord._id) ? submittedData : item))
      }
      setEditingRecord(null)
    } else {
      try {
        const res = await api.post(`${baseEndpoint}${activeTab}/`, submittedData)
        targetSetter([...currentList, res.data])
      } catch {
        targetSetter([...currentList, { id: Date.now(), ...submittedData }])
      }
    }
  }

  const handleDeleteRecord = async (idValue) => {
    const baseEndpoint = ENDPOINTS.TRANSPORT || '/api/transport/'
    const targetSetter = activeTab === 'vehicles' ? setVehicles : activeTab === 'drivers' ? setDrivers : setAllotments
    const currentList = activeTab === 'vehicles' ? vehicles : activeTab === 'drivers' ? drivers : allotments

    try {
      await api.delete(`${baseEndpoint}${activeTab}/${idValue}/`)
      targetSetter(currentList.filter(item => item.id !== idValue && item._id !== idValue))
    } catch {
      targetSetter(currentList.filter((item, index) => item.id !== idValue && item._id !== idValue && index !== idValue))
    }
  }

  const getActiveTabDataset = () => {
    if (activeTab === 'vehicles') return vehicles
    if (activeTab === 'drivers') return drivers
    return allotments
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transport Fleet Management</h1>
          <p className="page-subtitle">Configure fleet vehicles, staff listings, and student assignments</p>
        </div>
        <button className="btn btn-outline" onClick={loadData} disabled={loading}>
          {loading ? 'Updating…' : 'Refresh Data'}
        </button>
      </div>

      {loading && <div className="loader" />}

      <TransportStats 
        vehiclesCount={vehicles.length} 
        driversCount={drivers.length} 
        allotmentsCount={allotments.length} 
      />

      <TransportTabs activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setEditingRecord(null); }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <TransportForm 
          activeTab={activeTab} 
          onSave={handleSaveRecord} 
          editData={editingRecord}
          onCancelEdit={() => setEditingRecord(null)}
        />
        <TransportTable 
          activeTab={activeTab} 
          data={getActiveTabDataset()} 
          onEdit={(record) => setEditingRecord(record)}
          onDelete={handleDeleteRecord}
        />
      </div>
    </div>
  )
}