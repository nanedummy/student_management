import React from 'react'

export default function TransportTabs({ activeTab, setActiveTab }) {
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