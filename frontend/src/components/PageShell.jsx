import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useScrolled } from '../hooks/useScrolled'
import api from '../api/axios'

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 6.3L21 9.3l-5 4.3L17.6 21 12 17.3 6.4 21 8 13.6l-5-4.3 6.6-1z" />
  </svg>
)
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

const NAV_ITEMS = [
  { label: 'APOD',     to: '/apod' },
  { label: 'ISS',      to: '/iss' },
  { label: 'Asteroid', to: '/asteroids' },
  { label: 'EPIC',     to: '/epic' },
]

function SharedNavbar() {
  const scrolled = useScrolled(40)
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try { await api.post('/v1/auth/logout') } catch (_) {}
    logout()
    setOpen(false)
  }

  return (
    <>
      <nav className={`hp-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="hp-nav__inner">
          <Link to="/" className="hp-logo"><StarIcon /> NEBULA</Link>
          <ul className="hp-nav__menu">
            {NAV_ITEMS.map(n => (
              <li key={n.label}>
                <Link to={n.to} className={`hp-nav__link${location.pathname === n.to ? ' active' : ''}`}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="hp-nav__actions">
            {user ? (
              <div className="hp-user-chip">
                <span className="hp-avatar">{user.name[0].toUpperCase()}</span>
                <span className="hp-user-name">{user.name}</span>
                <button className="hp-btn hp-btn--sm hp-btn--ghost" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <>
                <button className="hp-btn hp-btn--sm hp-btn--ghost" onClick={() => navigate('/login')}>Masuk</button>
                <button className="hp-btn hp-btn--sm hp-btn--primary" onClick={() => navigate('/register')}>Daftar</button>
              </>
            )}
            <button className="hp-hamburger" onClick={() => setOpen(v => !v)} aria-label="Menu">
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`hp-mobile-menu${open ? ' open' : ''}`}>
        {NAV_ITEMS.map(n => (
          <Link key={n.label} to={n.to} onClick={() => setOpen(false)}>{n.label}</Link>
        ))}
        <div className="hp-mm-actions">
          {user ? (
            <button className="hp-btn hp-btn--sm hp-btn--ghost" onClick={handleLogout}>
              Logout ({user.name})
            </button>
          ) : (
            <>
              <button className="hp-btn hp-btn--sm hp-btn--ghost" onClick={() => { navigate('/login'); setOpen(false) }}>Masuk</button>
              <button className="hp-btn hp-btn--sm hp-btn--primary" onClick={() => { navigate('/register'); setOpen(false) }}>Daftar</button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function SharedFooter() {
  return (
    <footer className="hp-footer">
      <div className="hp-wrap">
        <div className="hp-footer__top">
          <div>
            <Link to="/" className="hp-logo" style={{ marginBottom: 14, display: 'inline-flex' }}>
              <StarIcon /> NEBULA
            </Link>
            <p className="hp-footer__tag">Explore the Universe, One Click at a Time.</p>
          </div>
          <div>
            <div className="hp-footer__nav-title">Navigasi</div>
            <div className="hp-footer__links">
              <Link to="/">Home</Link>
              <Link to="/apod">APOD</Link>
              <Link to="/iss">ISS</Link>
              <Link to="/asteroids">Asteroid</Link>
              <Link to="/epic">EPIC</Link>
              <Link to="/bookmark">Bookmark</Link>
            </div>
          </div>
          <div className="hp-footer__credit">
            <div className="hp-footer__credit-title">Sumber Data</div>
            <p>Data provided by NASA Open APIs</p>
            <a href="https://api.nasa.gov" target="_blank" rel="noopener noreferrer">api.nasa.gov</a>
          </div>
        </div>
      </div>
      <div className="hp-footer__bottom">
        © 2026 Nebula. Dibuat untuk penjelajah alam semesta.
      </div>
    </footer>
  )
}

export function PageShell({ children }) {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: '"DM Sans", sans-serif' }}>
      <SharedNavbar />
      {children}
      <SharedFooter />
    </div>
  )
}
