import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const ICONS = {
  crown:        'M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14a1 1 0 001-1v-1H4v1a1 1 0 001 1z',
  shield:       'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  auth:         'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  dashboard:    'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  students:     'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  faculty:      'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z',
  users:        'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  hr:           'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  attendance:   'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  academics:    'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  timetable:    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  examination:  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4',
  fees:         'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  library:      'M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',
  hostel:       'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  transport:    'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2 M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  placement:    'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  alumni:       'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  notifications:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  reports:      'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  settings:     'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
}

const Icon = ({ name, size = 24, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d={ICONS[name] || ICONS.dashboard} />
  </svg>
)

const MODULE_TREE = [
  { label: 'Authentication Module',      path: null,           icon: 'auth', desc: 'Login, JWT, role-based access' },
  { label: 'Dashboard Module',           path: '/dashboard',   icon: 'dashboard', desc: 'Overview, charts, quick stats' },
  { label: 'Student Management',         path: '/students',    icon: 'students', desc: 'Enroll, profiles, records' },
  { label: 'Faculty Management',         path: '/faculty',     icon: 'faculty', desc: 'Faculty profiles, assignments' },
  { label: 'System Users & Approvals',   path: '/users',       icon: 'users', desc: 'Manage system access & approvals' },
  { label: 'HR & Payroll Module',        path: '/hr/employees',icon: 'hr', desc: 'Employees, payroll, leaves' },
  { label: 'Attendance Module',          path: '/attendance',  icon: 'attendance', desc: 'Student attendance tracking' },
  { label: 'Academic Module',            path: '/academics',   icon: 'academics', desc: 'Subjects, curriculum, calendar' },
  { label: 'Timetable Module',           path: '/timetable',   icon: 'timetable', desc: 'Class schedules, periods' },
  { label: 'Examination Module',         path: '/examination', icon: 'examination', desc: 'Exams, results, grades' },
  { label: 'Fee Management Module',      path: '/fees',        icon: 'fees', desc: 'Fee collection, structures' },
  { label: 'Library Management',         path: '/library',     icon: 'library', desc: 'Books, issues, returns' },
  { label: 'Hostel Management',          path: '/hostel',      icon: 'hostel', desc: 'Rooms, allotments, complaints' },
  { label: 'Transport Management',       path: '/transport',   icon: 'transport', desc: 'Routes, vehicles, allotments' },
  { label: 'Placement Management',       path: '/placement',   icon: 'placement', desc: 'Companies, drives, applications' },
  { label: 'Alumni Management',          path: '/alumni',      icon: 'alumni', desc: 'Alumni profiles, events' },
  { label: 'Notification Module',        path: '/notifications',icon: 'notifications', desc: 'Announcements, broadcasts' },
  { label: 'Reports & Analytics',        path: '/reports',     icon: 'reports', desc: 'Institution-wide analytics' },
  { label: 'Settings & Access Control',  path: '/settings',    icon: 'settings', desc: 'Users, roles, system config' },
]

export default function AdminPanel() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {user?.role === 'super_admin' ? 'Super Admin Panel' : 'Admin Panel'}
          </h1>
          <p className="page-subtitle">College ERP System — Full Module Overview</p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          <div style={{ fontWeight: 600, color: 'var(--text)' }}>Logged in as</div>
          <div>{user?.username} · <span style={{ textTransform: 'capitalize', color: 'var(--primary)' }}>{user?.role?.replace('_', ' ')}</span></div>
        </div>
      </div>

      {/* Module Cards Grid */}
      <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Quick Access</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {MODULE_TREE.filter(m => m.path).map(m => (
          <div key={m.label} className="card" style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onClick={() => navigate(m.path)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                <Icon name={m.icon} size={32} />
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{m.label.replace(' Module', '').replace(' Management', '')}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
