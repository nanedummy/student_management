import { useState, useRef, useEffect } from 'react';

export default function ClayDatePicker({ name, value, onChange, required }) {
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    // handle YYYY-MM-DD
    if (value) {
      const [y, m, d] = value.split('-');
      return new Date(y, m - 1, d);
    }
    return new Date();
  });
  
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const y = newDate.getFullYear();
    const m = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(newDate.getDate()).padStart(2, '0');
    const dateString = `${y}-${m}-${d}`;
    onChange({ target: { name, value: dateString } });
    setOpen(false);
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Selected date parsed
  let selectedDate = null;
  if (value) {
    const [y, m, d] = value.split('-');
    selectedDate = new Date(y, m - 1, d);
  }

  // format value for display
  let displayValue = '';
  if (value && selectedDate) {
    displayValue = `${selectedDate.getDate()} - ${monthNames[selectedDate.getMonth()].slice(0, 3)} - ${selectedDate.getFullYear()}`;
  }

  return (
    <div className="clay-datepicker-container" ref={containerRef}>
      <input
        type="text"
        readOnly
        className="form-control clay-datepicker-input"
        value={displayValue}
        onClick={() => setOpen(!open)}
        placeholder="Select Date"
        required={required}
      />
      {open && (
        <div className="clay-datepicker-popup">
          <div className="clay-datepicker-header">
            <button type="button" onClick={() => changeMonth(-1)}>&lt;</button>
            <strong>{monthNames[month]} {year}</strong>
            <button type="button" onClick={() => changeMonth(1)}>&gt;</button>
          </div>
          <div className="clay-datepicker-grid">
            {dayNames.map(d => <div key={d} className="clay-datepicker-dayname">{d}</div>)}
            {blanks.map(b => <div key={`blank-${b}`} />)}
            {days.map(d => {
              const isSelected = selectedDate && selectedDate.getDate() === d && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
              return (
                <button
                  key={d}
                  type="button"
                  className={`clay-datepicker-day ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleDateClick(d)}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
