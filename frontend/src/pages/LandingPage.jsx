import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const features = [
  { icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75', title: 'Student Management', desc: 'Complete student lifecycle — admissions, profiles, attendance, and academic records in one place.', color: '#2563eb' },
  { icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z', title: 'Faculty & HR', desc: 'Manage faculty profiles, payroll, leave requests, and HR operations seamlessly.', color: '#7c3aed' },
  { icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6', title: 'Fee Management', desc: 'Automated fee collection, payment tracking, scholarships, and financial analytics.', color: '#059669' },
  { icon: 'M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z', title: 'Library System', desc: 'Digital catalog, book issue/return tracking, and fine management for your library.', color: '#d97706' },
  { icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', title: 'Hostel Management', desc: 'Room allotments, attendance, visitor logs, complaints, and hostel fee management.', color: '#dc2626' },
  { icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'Placement & Alumni', desc: 'Track placements, manage job drives, and stay connected with your alumni network.', color: '#0891b2' },
]

const stats = [
  { value: '10K+', label: 'Students Managed' },
  { value: '500+', label: 'Faculty Members' },
  { value: '15+', label: 'Modules' },
  { value: '99.9%', label: 'Uptime' },
]

const roles = [
  { role: 'Admin', desc: 'Full control over all modules', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
  { role: 'Faculty', desc: 'Academics, attendance & grades', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h20v14H2z" /><path d="M8 21h8" /><path d="M12 17v4" /></svg> },
  { role: 'Student', desc: 'Profile, fees & results', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg> },
  { role: 'HR', desc: 'Employees, payroll & leaves', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { role: 'Accountant', desc: 'Fees, payments & reports', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
  { role: 'Librarian', desc: 'Books, issues & returns', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg> },
]

function Icon({ d, size = 22, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <header className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="landing-brand-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
              </svg>
            </div>
            <span>CollegeMS</span>
          </div>
          <nav className="landing-links">
            <a href="#features">Features</a>
            <a href="#stats">Stats</a>
            <a href="#roles">Roles</a>
          </nav>
          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-bg-orb orb1" />
        <div className="hero-bg-orb orb2" />
        <div className="hero-bg-orb orb3" />
        <div className="landing-container">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            All-in-one College ERP Platform
          </div>
          <h1 className="hero-title">
            Manage Your College<br />
            <span className="hero-gradient">Smarter & Faster</span>
          </h1>
          <p className="hero-subtitle">
            A comprehensive college management system covering students, faculty, fees, hostel, library, HR, and more — all in one powerful platform.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-lg hero-cta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
              Sign In to Dashboard
            </Link>
            <a href="#features" className="btn btn-outline btn-lg">
              Explore Features
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
            </a>
          </div>
          <div className="hero-stats">
            {stats.map(s => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-section" id="features">
        <div className="landing-container">
          <div className="section-header">
            <div className="section-tag">Features</div>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-sub">15+ integrated modules to run your institution efficiently</p>
          </div>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{ background: f.color + '18', color: f.color }}>
                  <Icon d={f.icon} size={22} color={f.color} />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="landing-stats-banner" id="stats">
        <div className="landing-container">
          <div className="stats-banner-grid">
            {stats.map(s => (
              <div key={s.label} className="stats-banner-item">
                <div className="stats-banner-value">{s.value}</div>
                <div className="stats-banner-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="landing-section" id="roles">
        <div className="landing-container">
          <div className="section-header">
            <div className="section-tag">Access Control</div>
            <h2 className="section-title">Role-Based Access</h2>
            <p className="section-sub">Each user sees only what they need — secure and focused</p>
          </div>
          <div className="roles-grid">
            {roles.map(r => (
              <div key={r.role} className="role-card">
                <div className="role-icon">{r.icon}</div>
                <div className="role-name">{r.role}</div>
                <div className="role-desc">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta">
        <div className="landing-container">
          <div className="cta-card">
            <div className="hero-bg-orb cta-orb1" />
            <div className="hero-bg-orb cta-orb2" />
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-sub">Sign in to your CollegeMS dashboard and manage your institution with ease.</p>
            <Link to="/login" className="btn btn-primary btn-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-inner">
            <div className="landing-brand">
              <div className="landing-brand-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                </svg>
              </div>
              <span>CollegeMS</span>
            </div>
            <span className="landing-footer-copy">© {new Date().getFullYear()} CollegeMS — Built with React + Django</span>
            <div className="landing-footer-links">
              <Link to="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
