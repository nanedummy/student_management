import { useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth'
import api from '../api/axios'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/my-profile': 'My Profile',
  '/my-fees': 'My Fees',
  '/admin-panel': 'Admin Panel',
  '/students': 'Students',
  '/students/add': 'Add Student',
  '/faculty': 'Faculty',
  '/faculty/add': 'Add Faculty',
  '/fees': 'Fees',
  '/fees/add': 'Add Fee',
  '/fees/structure': 'Fee Structure',
  '/fees/history': 'Payment History',
  '/hr/employees': 'Employees',
  '/hr/attendance': 'HR Attendance',
  '/hr/leaves': 'Leave Requests',
  '/hr/payroll': 'Payroll',
  '/hr/reports': 'HR Reports',
  '/attendance': 'Student Attendance',
  '/academics': 'Academics',
  '/timetable': 'Timetable',
  '/examination': 'Examination',
  '/library': 'Library',
  '/hostel': 'Hostel',
  '/transport': 'Transport',
  '/placement': 'Placement',
  '/alumni': 'Alumni',
  '/users': 'Users & Roles',
  '/notifications': 'Notifications',
  '/reports': 'Reports & Analytics',
  '/settings': 'Settings',
}

function getTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname]
  if (pathname.includes('/edit')) return 'Edit'
  if (pathname.includes('/students/')) return 'Student Profile'
  if (pathname.includes('/faculty/')) return 'Faculty Profile'
  if (pathname.includes('/hr/employees/')) return 'Employee Profile'
  if (pathname.includes('/hr/payslip/')) return 'Payslip'
  if (pathname.includes('/hostel/')) return 'Hostel'
  return 'CollegeMS'
}

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (user) {
      api.get('/notifications/').then(r => {
        setUnread(r.data.filter(n => !n.is_read).length)
      }).catch(() => {})
    }
  }, [pathname, user])

  const title = getTitle(pathname)

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={onMenuClick} aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <div className="navbar-title-wrap">
          <div className="navbar-title">{title}</div>
          <div className="navbar-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Notifications */}
        {user && (
          <Link to="/notifications">
            <button className="navbar-icon-btn" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
            </button>
          </Link>
        )}

        {/* User chip */}
        <div className="navbar-user-chip">
          <div className="navbar-user-avatar">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="navbar-user-info">
            <div className="navbar-user-name">{user?.username}</div>
            <div className="navbar-user-role">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
