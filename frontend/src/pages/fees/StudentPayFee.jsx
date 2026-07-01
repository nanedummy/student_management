import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import useAuth from '../../hooks/useAuth'
import { formatCurrency, formatDate } from '../../utils/helpers'

export default function StudentPayFee() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  
  const [fees, setFees] = useState([])
  const [selected, setSelected] = useState(null)
  const [paymentMode, setPaymentMode] = useState('Online')
  const [txnId, setTxnId] = useState('')
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.linked_student_id) { setLoading(false); return }
    api.get(`/students/${user.linked_student_id}/`)
      .then(r => {
        setStudent(r.data)
        fetchFees()
      })
      .catch(() => setLoading(false))
  }, [user])

  const fetchFees = () => {
    api.get('/fees/')
      .then(fr => {
        const studentFees = (fr.data.results ?? fr.data).filter(f => String(f.student) === String(user.linked_student_id))
        setFees(studentFees)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handlePay = async () => {
    if (!selected) return
    if (!txnId.trim()) { setError('Please enter a Transaction ID (e.g. your UPI Reference or Bank Ref No)'); return }
    setPaying(true)
    setError('')
    try {
      const res = await api.post('/fees/process-payment/', {
        fee_id: selected.id,
        payment_mode: paymentMode,
        transaction_id: txnId
      })
      setSuccess({ feeType: selected.fee_type, amount: selected.net_amount || selected.amount, receipt: res.data.receipt_number || txnId })
      setSelected(null)
      setTxnId('')
      fetchFees() // Refresh fees to show as paid
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Payment failed. Try again.')
    } finally {
      setPaying(false)
    }
  }

  const downloadReceipt = () => {
    alert(`Receipt downloaded for ${success.feeType}!`)
  }

  if (loading) return <Loader />
  if (!student) return (
    <div className="empty-state" style={{ paddingTop: 80 }}>
      <p>No student record linked to your account.</p>
    </div>
  )

  const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'overdue')
  const paidFees = fees.filter(f => f.status === 'paid')

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Fee Details & Payment</h1>
          <p>{student.course} · {student.register_number}</p>
        </div>
        <button onClick={() => navigate(-1)} className="btn btn-outline">← Back</button>
      </div>

      {success && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#15803d' }}>Payment Successful!</div>
            <div style={{ fontSize: 13, color: '#166534', marginTop: 2 }}>{success.feeType} — {formatCurrency(success.amount)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={downloadReceipt} className="btn btn-primary">Download Receipt</button>
            <button onClick={() => setSuccess(null)} className="btn btn-outline">Dismiss</button>
          </div>
        </div>
      )}

      {/* Pending Fees Section */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>Pending Dues</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Select a fee to make a payment</span>
        </div>
        <div className="card-body">
          {pendingFees.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginBottom: 12 }}><polyline points="20 6 9 17 4 12"/></svg>
              <p style={{ fontWeight: 500, color: '#15803d' }}>Hooray! No pending fees.</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>All your dues are cleared for now.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {pendingFees.map(f => {
                const amount = Number(f.net_amount || f.amount)
                const isSelected = selected?.id === f.id
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelected(isSelected ? null : f)}
                    style={{
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg)',
                      borderRadius: 12, padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: isSelected ? `0 0 0 3px rgba(37,99,235,0.15)` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.fee_type}</div>
                      {f.status === 'overdue' && <span className="badge badge-danger">Overdue</span>}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{formatCurrency(amount)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Due: <strong style={{ color: f.status === 'overdue' ? '#ef4444' : 'inherit' }}>{formatDate(f.due_date)}</strong></div>
                    
                    <div style={{
                      marginTop: 16, padding: '8px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, borderRadius: 6,
                      background: isSelected ? 'var(--primary)' : '#e5e7eb',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                    }}>
                      {isSelected ? 'Selected' : 'Select to Pay'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Section */}
      {selected && (
        <div className="card fade-in" style={{ marginBottom: 20 }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3>Confirm Payment</h3>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.fee_type} — {formatCurrency(selected.net_amount || selected.amount)}</span>
          </div>
          
          {error && <div className="alert alert-error" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none' }}>{error}</div>}
          
          <div className="card-body">
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed #cbd5e1' }}>
                <span style={{ color: 'var(--text-muted)' }}>Student</span>
                <span style={{ fontWeight: 600 }}>{student.first_name} {student.last_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed #cbd5e1' }}>
                <span style={{ color: 'var(--text-muted)' }}>Roll No</span>
                <span style={{ fontWeight: 600 }}>{student.register_number}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed #cbd5e1' }}>
                <span style={{ color: 'var(--text-muted)' }}>Course</span>
                <span style={{ fontWeight: 600 }}>{student.course}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #cbd5e1' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fee Type</span>
                <span style={{ fontWeight: 600 }}>{selected.fee_type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text)', fontWeight: 700 }}>Total Amount</span>
                <span style={{ fontWeight: 800, fontSize: 24, color: 'var(--primary)' }}>{formatCurrency(selected.net_amount || selected.amount)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Payment Mode</label>
                <select className="form-control" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                  <option value="Online">Credit/Debit/UPI (Online)</option>
                  <option value="NetBanking">Net Banking</option>
                  <option value="Cash">Cash (Manual Submission)</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Transaction ID *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Bank / UPI Ref No"
                  value={txnId}
                  onChange={e => setTxnId(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
              <button onClick={() => setSelected(null)} className="btn btn-outline" disabled={paying}>Cancel</button>
              <button onClick={handlePay} className="btn btn-primary" disabled={paying} style={{ padding: '0 24px' }}>
                {paying ? 'Processing...' : `Pay ${formatCurrency(selected.net_amount || selected.amount)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paid Fees History */}
      {paidFees.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Payment History</h3>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Fee Type</th>
                  <th>Amount</th>
                  <th>Paid Date</th>
                  <th>Txn ID / Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paidFees.map(f => (
                  <tr key={f.id}>
                    <td><strong>{f.fee_type}</strong><br/><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.academic_year || ''}</span></td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(f.net_amount || f.amount)}</td>
                    <td>{formatDate(f.paid_date)}</td>
                    <td>
                      <div style={{ fontSize: 13, fontFamily: 'monospace' }}>{f.transaction_id || f.receipt_number || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.payment_mode}</div>
                    </td>
                    <td><span className="badge badge-success">Paid</span></td>
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
