import { useState, useEffect, useRef } from 'react'

export default function DatePicker({ value = '', onChange, name = '', placeholder = 'Select Date', required = false, className = '', style = {} }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  
  // View states for the calendar sheet
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  
  const containerRef = useRef(null)

  // Parse YYYY-MM-DD value
  useEffect(() => {
    if (value) {
      const parts = value.split('-')
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
        if (!isNaN(d.getTime())) {
          setSelectedDate(d)
          setViewMonth(d.getMonth())
          setViewYear(d.getFullYear())
          return
        }
      }
    }
    setSelectedDate(null)
  }, [value])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Month names helper
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Weekday names
  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  // Handle month/year change
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const handleDateSelect = (day, isCurrentMonth, relativeMonthOffset = 0) => {
    let targetMonth = viewMonth + relativeMonthOffset
    let targetYear = viewYear
    
    if (targetMonth < 0) {
      targetMonth = 11
      targetYear -= 1
    } else if (targetMonth > 11) {
      targetMonth = 0
      targetYear += 1
    }

    const d = new Date(targetYear, targetMonth, day)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const formatted = `${yyyy}-${mm}-${dd}`
    
    if (onChange) {
      onChange({ target: { name, value: formatted } })
    }
    setIsOpen(false)
  }

  const handleClear = () => {
    if (onChange) {
      onChange({ target: { name, value: '' } })
    }
    setIsOpen(false)
  }

  const handleToday = () => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const formatted = `${yyyy}-${mm}-${dd}`
    if (onChange) {
      onChange({ target: { name, value: formatted } })
    }
    setIsOpen(false)
  }

  // Generate calendar grid array
  const generateGrid = () => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay()
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate()
    const prevTotalDays = new Date(viewYear, viewMonth, 0).getDate()
    
    const cells = []
    
    // Add prev month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        day: prevTotalDays - i,
        isCurrentMonth: false,
        offset: -1
      })
    }
    
    // Add current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        day: i,
        isCurrentMonth: true,
        offset: 0
      })
    }
    
    // Add next month leading days to complete grid rows
    const totalCells = cells.length
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
    const targetCellCount = totalCells + remaining <= 35 && totalCells + remaining > 0 ? 35 : 42;
    const padCount = targetCellCount - totalCells;

    for (let i = 1; i <= padCount; i++) {
      cells.push({
        day: i,
        isCurrentMonth: false,
        offset: 1
      })
    }
    
    return cells
  }

  const gridCells = generateGrid()
  const currentYear = new Date().getFullYear()
  
  // Year range: currentYear - 80 to currentYear + 10
  const YEARS = []
  for (let y = currentYear + 10; y >= currentYear - 80; y--) {
    YEARS.push(y)
  }

  // Check if date is selected date
  const isSelected = (day, offset) => {
    if (!selectedDate) return false
    const cellDate = new Date(viewYear, viewMonth + offset, day)
    return selectedDate.getDate() === cellDate.getDate() &&
           selectedDate.getMonth() === cellDate.getMonth() &&
           selectedDate.getFullYear() === cellDate.getFullYear()
  }

  // Check if date is today
  const isToday = (day, offset) => {
    const today = new Date()
    const cellDate = new Date(viewYear, viewMonth + offset, day)
    return today.getDate() === cellDate.getDate() &&
           today.getMonth() === cellDate.getMonth() &&
           today.getFullYear() === cellDate.getFullYear()
  }

  // Format value for visible display
  const getVisibleValue = () => {
    if (!selectedDate) return ''
    const yyyy = selectedDate.getFullYear()
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const dd = String(selectedDate.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  return (
    <div ref={containerRef} className="clay-datepicker-container" style={{ position: 'relative', width: '100%', ...style }}>
      {/* Visible Input Trigger */}
      <div 
        onClick={() => setIsOpen(open => !open)}
        className={`clay-datepicker-input ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '9px 12px 9px 40px',
          minHeight: '40px',
          borderRadius: 'var(--radius-sm)',
          border: '1.5px solid var(--border)',
          background: 'var(--bg-card)',
          color: selectedDate ? 'var(--text)' : 'var(--text-light)',
          fontWeight: 500,
          position: 'relative',
          transition: 'var(--transition)'
        }}
      >
        {/* Cute Calendar Icon inside input */}
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <span>{getVisibleValue() || placeholder}</span>
        
        {/* Dropdown Chevron */}
        <svg 
          width="14" 
          height="14" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth="2.5"
          style={{ 
            opacity: 0.5, 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.2s' 
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Popover Calendar (Claymorphic / Glassmorphic Hybrid) */}
      {isOpen && (
        <div 
          className="clay-datepicker-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 9999,
            width: '300px',
            padding: '16px',
            backgroundColor: 'var(--white)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '16px',
            boxShadow: 'inset 3px 3px 6px rgba(255, 255, 255, 0.7), inset -3px -3px 6px rgba(0, 0, 0, 0.08), 0 12px 28px rgba(0, 0, 0, 0.12)',
            animation: 'clayDatePickerSlideIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Custom Styles Inject for Animation & Hover */}
          <style>{`
            @keyframes clayDatePickerSlideIn {
              from { opacity: 0; transform: translateY(8px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .clay-dp-day:hover {
              background: var(--primary-light) !important;
              color: var(--primary) !important;
              transform: translateY(-2px) scale(1.08) !important;
              box-shadow: inset 2px 2px 4px rgba(255,255,255,0.9), inset -1px -1px 3px rgba(0,0,0,0.06), 0 4px 8px rgba(37,99,235,0.15) !important;
            }
            .clay-dp-nav-btn:hover {
              background: var(--border-light) !important;
              transform: scale(1.1) !important;
            }
            .clay-dp-select {
              border: none !important;
              background: transparent !important;
              font-weight: 700 !important;
              color: var(--text) !important;
              cursor: pointer !important;
              font-size: 14px !important;
              padding: 4px 8px !important;
              border-radius: 8px !important;
              width: auto !important;
              transition: var(--transition) !important;
            }
            .clay-dp-select:hover {
              background: rgba(0,0,0,0.04) !important;
            }
            @media (prefers-color-scheme: dark) {
              .clay-datepicker-dropdown {
                border: 2px solid rgba(255, 255, 255, 0.08) !important;
                box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.05), inset -2px -2px 4px rgba(0, 0, 0, 0.35), 0 12px 28px rgba(0, 0, 0, 0.3) !important;
              }
              .clay-dp-select:hover {
                background: rgba(255,255,255,0.08) !important;
              }
              .clay-dp-day:hover {
                background: rgba(59, 130, 246, 0.15) !important;
                box-shadow: inset 1px 1px 2px rgba(255,255,255,0.1), inset -1px -1px 2px rgba(0,0,0,0.35), 0 4px 8px rgba(0,0,0,0.2) !important;
              }
            }
          `}</style>

          {/* Header Month/Year Nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {/* Month Dropdown */}
              <select 
                className="clay-dp-select" 
                value={viewMonth} 
                onChange={e => setViewMonth(parseInt(e.target.value))}
              >
                {MONTHS.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
              </select>

              {/* Year Dropdown */}
              <select 
                className="clay-dp-select" 
                value={viewYear} 
                onChange={e => setViewYear(parseInt(e.target.value))}
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Left/Right Arrows */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                type="button"
                onClick={handlePrevMonth}
                className="clay-dp-nav-btn"
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: 'none', background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'var(--transition)'
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                type="button"
                onClick={handleNextMonth}
                className="clay-dp-nav-btn"
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: 'none', background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'var(--transition)'
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          {/* Weekdays Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {WEEKDAYS.map(w => (
              <div key={w} style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase' }}>
                {w}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {gridCells.map((cell, idx) => {
              const selected = isSelected(cell.day, cell.offset)
              const today = isToday(cell.day, cell.offset)
              
              return (
                <button
                  key={`${cell.day}-${cell.offset}-${idx}`}
                  type="button"
                  onClick={() => handleDateSelect(cell.day, cell.isCurrentMonth, cell.offset)}
                  className="clay-dp-day"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: today ? '2px solid var(--primary)' : 'none',
                    fontSize: '13px',
                    fontWeight: selected ? '800' : '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    position: 'relative',
                    
                    // Selected clay button style
                    background: selected 
                      ? 'linear-gradient(135deg, var(--primary), #7c3aed)' 
                      : 'transparent',
                    color: selected 
                      ? '#ffffff' 
                      : cell.isCurrentMonth 
                        ? 'var(--text)' 
                        : 'var(--text-light)',
                    opacity: cell.isCurrentMonth ? 1 : 0.45,
                    boxShadow: selected
                      ? 'inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(37, 99, 235, 0.3)'
                      : 'none',
                  }}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>

          {/* Footer Quick Controls */}
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
            <button 
              type="button"
              onClick={handleClear}
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--danger)', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer', padding: '4px 8px', borderRadius: '6px',
                transition: 'var(--transition)'
              }}
            >
              Clear
            </button>
            <button 
              type="button"
              onClick={handleToday}
              style={{
                background: 'var(--primary-light)', border: 'none',
                color: 'var(--primary)', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer', padding: '4px 10px', borderRadius: '6px',
                transition: 'var(--transition)'
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
