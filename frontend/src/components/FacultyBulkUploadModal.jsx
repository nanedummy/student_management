import { useState } from 'react'
import api from '../api/axios'

export default function FacultyBulkUploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return setError('Please select an Excel file')
    
    setError('')
    setLoading(true)
    setResult(null)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const { data } = await api.post('/faculty/bulk-upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(data)
      if (data.created_count > 0) {
        onSuccess()
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process file')
    } finally {
      setLoading(false)
    }
  }

  const sampleUrl = `${api.defaults.baseURL.replace(/\/api\/?$/, '')}/api/faculty/bulk-upload/sample/`

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="card-header">
          <h3>Bulk Upload Faculty</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
        </div>
        <div className="card-body">
          {!result ? (
            <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Upload an Excel (.xlsx) file to add multiple faculty members at once. 
              The first two rows (headings and example) will be ignored.
            </p>
            <a href={sampleUrl} download="faculty_sample.xlsx" className="btn btn-outline btn-sm" style={{ marginBottom: 12 }}>
              📥 Download Sample Format
            </a>
          </div>
          
          <div className="form-group">
            <label className="form-label">Excel File</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1.5px dashed var(--border)', borderRadius: 8, background: 'var(--bg)' }}>
              <input 
                type="file" 
                accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={e => setFile(e.target.files[0])}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <span className="btn btn-outline btn-sm" style={{ pointerEvents: 'none', background: 'var(--bg-card)' }}>
                {file ? 'Pick another' : 'Choose File'}
              </span>
              <span style={{ fontSize: 13, color: file ? 'var(--text)' : 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file ? file.name : 'No file selected...'}
              </span>
            </div>
          </div>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !file}>
              {loading ? 'Processing...' : 'Upload & Process'}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className={`alert ${result.created_count > 0 ? 'alert-success' : 'alert-warning'}`}>
            <strong>Upload Complete!</strong>
            <p>Successfully created {result.created_count} faculty members.</p>
          </div>
          
          {result.errors && result.errors.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 14, color: 'var(--danger)', marginBottom: 8 }}>Skipped Rows ({result.errors.length}):</h4>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: 12, maxHeight: 200, overflowY: 'auto' }}>
                <ul style={{ margin: 0, paddingLeft: 20, color: '#b91c1c', fontSize: 13 }}>
                  {result.errors.map((err, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}
