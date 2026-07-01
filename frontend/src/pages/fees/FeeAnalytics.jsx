import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import { formatCurrency, formatDate } from '../../utils/helpers'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const KPI = ({ label, value, sub, color, icon }) => (
  <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div className="stat-value" style={{ color, fontSize: 22 }}>{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
      <div style={{ color, opacity: 0.8, display: 'flex', alignItems: 'center' }}>{icon}</div>
    </div>
  </div>
)

export default function FeeAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/fees/analytics/').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (!data) return <div className="empty-state"><p>Failed to load analytics.</p></div>

  const { summary, monthly_collection, fee_type_breakdown, status_breakdown, department_wise, upcoming_dues } = data

  const feeTypeColors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#16a34a', '#6b7280']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div><h1>Fee Analytics</h1><p>Department-wise collection insights & KPIs</p></div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Academic Year: <strong>2024-25</strong>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <KPI label="Total Fees Billed" value={formatCurrency(summary.total_fees)} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} color="#2563eb" sub="All records" />
        <KPI label="Total Collected" value={formatCurrency(summary.total_paid)} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>} color="#22c55e" sub={`${summary.paid_count} paid`} />
        <KPI label="Pending Amount" value={formatCurrency(summary.total_pending)} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/></svg>} color="#f59e0b" sub={`${summary.pending_count} records`} />
        <KPI label="Overdue Amount" value={formatCurrency(summary.total_overdue)} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} color="#ef4444" sub={`${summary.overdue_count} records`} />
        <KPI label="Collection Rate" value={`${summary.collection_rate}%`} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/></svg>} color="#7c3aed" sub="Paid vs total" />
        <KPI label="Total Discounts" value={formatCurrency(summary.total_discount)} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z M6 12.5V17c0 3 12 3 12 0v-4.5"/></svg>} color="#059669" sub="Scholarships applied" />
        <KPI label="Total Fines" value={formatCurrency(summary.total_fine)} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01"/></svg>} color="#dc2626" sub="Penalties collected" />
      </div>

      {/* Collection Rate Bar */}
      <div className="card">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Overall Collection Rate</span>
            <span style={{ fontWeight: 700, color: '#22c55e' }}>{summary.collection_rate}%</span>
          </div>
          <div style={{ background: '#f3f4f6', borderRadius: 999, height: 12, overflow: 'hidden' }}>
            <div style={{
              width: `${summary.collection_rate}%`, height: '100%', borderRadius: 999,
              background: 'linear-gradient(90deg, #22c55e, #16a34a)', transition: 'width 0.6s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>₹0</span><span>{formatCurrency(summary.total_fees)}</span>
          </div>
        </div>
      </div>

      {/* Monthly Collection Chart */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Monthly Collection — {new Date().getFullYear()}
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Paid fees by month</span>
        </div>
        <div className="card-body">
          {monthly_collection.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}><p>No payment data for this year yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthly_collection} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="collGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                <Area type="monotone" dataKey="collected" stroke="#2563eb" strokeWidth={2} fill="url(#collGrad)" name="Collected" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Fee Type Breakdown + Status Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Fee Type Bar */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              Fee Type Breakdown
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Amount by category</span>
          </div>
          <div className="card-body">
            {fee_type_breakdown.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}><p>No data yet.</p></div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={fee_type_breakdown} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="fee_type" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                  <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]}>
                    {fee_type_breakdown.map((_, i) => (
                      <Cell key={i} fill={feeTypeColors[i % feeTypeColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Pie */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
              Payment Status
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Distribution by status</span>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie data={status_breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" paddingAngle={3}>
                  {status_breakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={v => `${v} records`} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {status_breakdown.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.value} records</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Department-wise Collection */}
      {department_wise.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v18 M9 22V9M15 22V9"/></svg>
              Department / Course-wise Collection
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Paid vs Pending per course</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={department_wise} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                <Legend />
                <Bar dataKey="paid" name="Paid" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Upcoming Dues */}
      {upcoming_dues.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/></svg>
              Upcoming Dues — Next 7 Days
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{upcoming_dues.length} records</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Fee Type</th><th>Amount</th><th>Due Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {upcoming_dues.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 500 }}>{f.student}</td>
                    <td>{f.fee_type}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(f.amount)}</td>
                    <td>{formatDate(f.due_date)}</td>
                    <td>
                      <span className={`badge ${f.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
