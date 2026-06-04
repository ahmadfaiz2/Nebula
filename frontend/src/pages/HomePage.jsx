import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useScrolled } from '../hooks/useScrolled'
import { useInView } from '../hooks/useInView'
import Starfield from '../components/Starfield'
import api from '../api/axios'
import '../styles/homepage.css'

/* ── Icons ── */
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 6.3L21 9.3l-5 4.3L17.6 21 12 17.3 6.4 21 8 13.6l-5-4.3 6.6-1z" />
  </svg>
)
const TelescopeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.2 13.3l11.8-6.8 2 3.5-11.8 6.8z" /><path d="M14.6 6.6l3.4-2 2 3.5-3.4 2" />
    <path d="M11 14.5L13 21" /><path d="M9 21h6" /><circle cx="6" cy="14.5" r="2.1" />
  </svg>
)
const SatelliteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8l3-3 3 3-3 3z" /><path d="M13 16l3-3 3 3-3 3z" /><path d="M8 11l5 5" />
    <path d="M16 4l1.5-1.5a2.1 2.1 0 013 3L19 9" /><path d="M5 13a4 4 0 01-3 3" /><path d="M8 17a4 4 0 01-3 3" />
  </svg>
)
const CometIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="8" r="4" /><path d="M13 11L3 21" /><path d="M9 12l-3 1.5" /><path d="M12 15l-1.5 3" />
  </svg>
)
const EarthIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.4 2.5 15.6 0 18M12 3c-2.5 2.4-2.5 15.6 0 18" />
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
const ArrowDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M6 13l6 6 6-6" />
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
const RocketIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c3 1.5 5 5 5 9l-3 3h-4l-3-3c0-4 2-7.5 5-9z" /><circle cx="12" cy="9" r="1.6" />
    <path d="M9 17l-2 4M15 17l2 4M12 17v4" />
  </svg>
)

/* ── Navbar ── */
const NAV_ITEMS = [
  { label: 'APOD',     to: '/apod' },
  { label: 'ISS',      to: '/iss' },
  { label: 'Asteroid', to: '/asteroids' },
  { label: 'EPIC',     to: '/epic' },
]

function HPNavbar() {
  const scrolled = useScrolled(40)
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
                <Link to={n.to} className="hp-nav__link">{n.label}</Link>
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
            <button className="hp-btn hp-btn--sm hp-btn--ghost" onClick={handleLogout}>Logout ({user.name})</button>
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

/* ── Hero ── */
function Hero() {
  const [hideInd, setHideInd] = useState(false)
  useEffect(() => {
    const onScroll = () => setHideInd(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="hp-hero">
      <div className="hp-hero__bg"><Starfield density={1.15} shooting={true} /></div>
      <div className="hp-hero__overlay" />
      <div className="hp-hero__content">
        <div className="hp-badge hp-reveal" style={{ animationDelay: '0.2s' }}>
          <RocketIcon /> Data Langsung dari NASA
        </div>
        <h1 className="hp-reveal" style={{ animationDelay: '0.4s' }}>
          Jelajahi<br />Alam Semesta
        </h1>
        <p className="hp-hero__sub hp-reveal" style={{ animationDelay: '0.6s' }}>
          Foto astronomi harian, posisi ISS real-time, tracker asteroid, dan foto
          Bumi dari luar angkasa — semua dalam satu platform.
        </p>
        <div className="hp-hero__cta hp-reveal" style={{ animationDelay: '0.8s' }}>
          <Link to="/apod" className="hp-btn hp-btn--lg hp-btn--primary"><TelescopeIcon /> Lihat APOD Hari Ini</Link>
          <Link to="/iss"  className="hp-btn hp-btn--lg hp-btn--outline"><SatelliteIcon /> Lacak ISS Sekarang</Link>
        </div>
      </div>
      <a href="#fitur" className="hp-scroll-ind hp-reveal"
        style={{ animationDelay: '1.2s', opacity: hideInd ? 0 : undefined, pointerEvents: hideInd ? 'none' : 'auto' }}>
        <span>SCROLL UNTUK EKSPLORASI</span>
        <span className="hp-scroll-ind__arrow"><ArrowDownIcon /></span>
      </a>
    </header>
  )
}

/* ── Features ── */
const FEATURES = [
  { icon: <TelescopeIcon />, cls: 'hp-ic-purple', to: '/apod',      title: 'Astronomy Picture of the Day',  desc: 'Foto atau video astronomi pilihan NASA setiap harinya, lengkap dengan penjelasan ilmiah.', link: 'Lihat Hari Ini' },
  { icon: <SatelliteIcon />, cls: 'hp-ic-blue',   to: '/iss',       title: 'ISS Real-Time Tracker',         desc: 'Lacak posisi Stasiun Luar Angkasa Internasional secara real-time di peta dunia interaktif.', link: 'Lacak Sekarang' },
  { icon: <CometIcon />,     cls: 'hp-ic-red',    to: '/asteroids', title: 'Near Earth Object Tracker',     desc: 'Pantau daftar asteroid yang mendekati Bumi lengkap dengan data ukuran, jarak, dan status bahaya.', link: 'Lihat Asteroid' },
  { icon: <EarthIcon />,     cls: 'hp-ic-green',  to: '/epic',      title: 'Earth from Space (EPIC)',       desc: 'Lihat foto Bumi dari luar angkasa yang diambil oleh kamera EPIC milik NASA setiap harinya.', link: 'Lihat Galeri' },
]

function FeatureCard({ f, index }) {
  const [ref, inView] = useInView()
  return (
    <Link to={f.to} ref={ref} className={`hp-card${inView ? ' in' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}>
      <div className={`hp-card__icon ${f.cls}`}>{f.icon}</div>
      <h3>{f.title}</h3>
      <p>{f.desc}</p>
      <span className="hp-card__link">{f.link} <ArrowRightIcon /></span>
    </Link>
  )
}

function Features() {
  return (
    <section className="hp-section" id="fitur" style={{ background: 'var(--bg)' }}>
      <div className="hp-wrap">
        <div className="hp-section__head">
          <div className="hp-eyebrow">Apa yang Bisa Kamu Eksplorasi</div>
          <h2 className="hp-section__title">Semua Data Luar Angkasa<br />dalam Satu Tempat</h2>
          <p className="hp-section__desc">Nebula mengonsumsi langsung dari NASA Open API untuk memberikan data paling akurat dan terkini.</p>
        </div>
        <div className="hp-feature-grid">
          {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} index={i} />)}
        </div>
      </div>
    </section>
  )
}

/* ── Stats ── */
const STATS = [
  { target: 1995,  sep: false, label: 'Tahun APOD Pertama Kali Diterbitkan', sub: 'Arsip tersedia sejak 16 Juni 1995' },
  { target: 27600, sep: true,  label: 'Km/jam Kecepatan ISS',               sub: 'Mengorbit Bumi setiap 90 menit' },
  { target: 2000,  sep: true,  suffix: '+', label: 'Asteroid Terlacak Per Minggu', sub: 'Data langsung dari NASA NeoWs' },
]

function StatItem({ s, run }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!run) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setVal(s.target); return }
    const dur = 1500, start = performance.now()
    let raf
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(s.target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, s.target])

  const formatted = s.sep ? val.toLocaleString('de-DE') : String(val)
  return (
    <div className="hp-stat">
      <div className="hp-stat__num">{formatted}{s.suffix || ''}</div>
      <div className="hp-stat__label">{s.label}</div>
      <div className="hp-stat__sub">{s.sub}</div>
    </div>
  )
}

function Stats() {
  const [ref, inView] = useInView({ threshold: 0.4 })
  return (
    <section className="hp-stats" ref={ref}>
      <div className="hp-wrap">
        <div className="hp-stats-grid">
          <StatItem s={STATS[0]} run={inView} />
          <div className="hp-stat-divider" />
          <StatItem s={STATS[1]} run={inView} />
          <div className="hp-stat-divider" />
          <StatItem s={STATS[2]} run={inView} />
        </div>
      </div>
    </section>
  )
}

/* ── CTA ── */
function CTA() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ref, inView] = useInView({ threshold: 0.3 })

  if (user) {
    return (
      <section className="hp-cta">
        <Starfield density={0.5} />
        <div ref={ref} className={`hp-cta__content hp-fade${inView ? ' in' : ''}`}>
          <h2>Selamat Datang Kembali, {user.name}!</h2>
          <p>Lanjutkan eksplorasimu — buka konten luar angkasa favorit yang sudah kamu simpan.</p>
          <Link to="/bookmark" className="hp-btn hp-btn--glow"><RocketIcon /> Buka Bookmark Saya</Link>
        </div>
      </section>
    )
  }
  return (
    <section className="hp-cta">
      <Starfield density={0.5} />
      <div ref={ref} className={`hp-cta__content hp-fade${inView ? ' in' : ''}`}>
        <h2>Siap Menjelajahi Alam Semesta?</h2>
        <p>Buat akun gratis dan mulai simpan konten luar angkasa favoritmu.</p>
        <button className="hp-btn hp-btn--glow" onClick={() => navigate('/register')}><RocketIcon /> Buat Akun Gratis</button>
        <p className="hp-cta__note">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </section>
  )
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="hp-footer">
      <div className="hp-wrap">
        <div className="hp-footer__top">
          <div>
            <Link to="/" className="hp-logo" style={{ marginBottom: 14, display: 'inline-flex' }}><StarIcon /> NEBULA</Link>
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

/* ── HomePage ── */
function HomePage() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <HPNavbar />
      <main>
        <Hero />
        <Features />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage
