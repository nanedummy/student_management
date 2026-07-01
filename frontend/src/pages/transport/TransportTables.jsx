import React, { useState } from 'react'

export default function TransportTable({ activeTab, data, onEdit, onDelete }) {
  const [searchQuery, setSearchQuery] = useState('')

  // Universal structural search selector logic
  const filteredData = data.filter((item) => {
    const stringifiedValues = Object.values(item).join(' ').toLowerCase()
    return stringifiedValues.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="card">
      {/* Inline Search Bar Element */}
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
                <th style={{ padding: '0.75rem 1rem', textTransform: 'none' }}>Actions</th>
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
                <th style={{ padding: '0.75rem 1rem', textTransform: 'none' }}>Actions</th>
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
                <th style={{ padding: '0.75rem 1rem', textTransform: 'none' }}>Actions</th>
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
            No records matched your selection parameters.
          </div>
        )}
      </div>
    </div>
  )
}