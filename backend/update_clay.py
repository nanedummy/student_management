with open('../frontend/src/index.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_css = """/* ── Custom Modern Datepicker ────────────────────────────────────── */
.clay-datepicker-container {
  position: relative;
  width: 100%;
}
.clay-datepicker-input {
  background: var(--bg-card) !important;
  border-radius: var(--radius-sm) !important;
  border: 1.5px solid var(--border) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02) !important;
  padding: 10px 16px 10px 42px !important;
  outline: none !important;
  cursor: pointer;
  color: var(--text) !important;
  width: 100%;
  transition: all 0.2s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 14px center;
  background-size: 18px;
}
.clay-datepicker-input:hover {
  border-color: var(--primary) !important;
  background-color: var(--primary-light) !important;
}
.clay-datepicker-input:focus {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.16), 0 1px 2px rgba(0, 0, 0, 0.02) !important;
}
.clay-datepicker-popup {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 999;
  width: 280px;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  animation: fadeIn 0.15s ease-out;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.clay-datepicker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 14px;
}
.clay-datepicker-header button {
  background: transparent;
  border: 1px solid var(--border);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-muted);
}
.clay-datepicker-header button:hover {
  background: var(--bg-light);
  color: var(--text);
  border-color: #d1d5db;
}
.clay-datepicker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  text-align: center;
}
.clay-datepicker-dayname {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.clay-datepicker-day {
  background: transparent;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--text);
  margin: 0 auto;
}
.clay-datepicker-day:hover {
  background: var(--bg-light);
}
.clay-datepicker-day.selected {
  background: var(--primary);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(37,99,235,0.25);
}

@media (prefers-color-scheme: dark) {
  .clay-datepicker-input {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2360a5fa' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'/%3E%3C/svg%3E");
  }
  .clay-datepicker-input:hover {
    background-color: rgba(59, 130, 246, 0.08) !important;
  }
  .clay-datepicker-header button:hover {
    border-color: #4b5563;
  }
}
"""

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "/* ── Custom Claymorphism Datepicker" in line:
        start_idx = i
    if start_idx != -1 and line.startswith(".form-label {"):
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    with open('../frontend/src/index.css', 'w', encoding='utf-8') as f:
        f.writelines(lines[:start_idx])
        f.write(new_css)
        f.writelines(lines[end_idx:])
    print("Replaced CSS successfully")
else:
    print("Failed to find boundaries", start_idx, end_idx)
