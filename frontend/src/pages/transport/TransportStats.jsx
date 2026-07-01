import React from 'react'

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

export default function TransportStats({ vehiclesCount, driversCount, allotmentsCount }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
      <StatCard label="Registered Buses" value={vehiclesCount} color="var(--primary)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="13" rx="2" ry="2" /><path d="M17 21v-2M7 21v-2M2 11h20M2 15h20" /></svg>} />
      <StatCard label="Active Drivers" value={driversCount} color="var(--success)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" /></svg>} />
      <StatCard label="Total Allocated Students" value={allotmentsCount} icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>} />
    </div>
  )
}