export default function Pagination({ current, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px 0' }}>
      <button 
        className="btn btn-outline btn-sm" 
        onClick={() => onPageChange(current - 1)} 
        disabled={current === 1}
      >
        Previous
      </button>

      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
        Page {current} of {totalPages}
      </span>

      <button 
        className="btn btn-outline btn-sm" 
        onClick={() => onPageChange(current + 1)} 
        disabled={current === totalPages}
      >
        Next
      </button>
    </div>
  );
}
