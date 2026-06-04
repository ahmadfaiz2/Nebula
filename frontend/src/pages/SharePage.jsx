import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import api from '../api/axios'

const S = {
  main:   { paddingTop: 'var(--nav-h)', minHeight: '80vh', display: 'flex', alignItems: 'center' },
  wrap:   { maxWidth: 800, margin: '0 auto', padding: '48px 28px' },
  badge:  { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 20 },
  media:  { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 32, boxShadow: '0 8px 40px rgba(0,0,0,0.6)' },
  img:    { width: '100%', height: 'auto', display: 'block' },
  title:  { fontFamily: 'var(--font-orb)', fontWeight: 700, fontSize: '1.9rem', color: '#fff', lineHeight: 1.2, marginBottom: 16 },
  desc:   { fontSize: '1rem', lineHeight: 1.85, color: '#c0c0d0', marginBottom: 32 },
  meta:   { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 },
  chip:   { fontSize: '0.82rem', color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '5px 14px', borderRadius: 999 },
  actions:{ display: 'flex', gap: 12, flexWrap: 'wrap' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 600, color: '#fff', background: 'var(--accent)', border: 'none', borderRadius: 9, padding: '12px 24px', cursor: 'pointer', textDecoration: 'none', boxShadow: '0 4px 16px rgba(108,99,255,0.3)', transition: 'background 160ms ease' },
  btnOutline: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent)', background: 'transparent', border: '1px solid var(--accent)', borderRadius: 9, padding: '12px 24px', cursor: 'pointer', textDecoration: 'none' },
  error:  { textAlign: 'center', padding: '60px 20px' },
  errIcon:{ fontSize: '3rem', marginBottom: 16 },
  errTitle:{ fontFamily: 'var(--font-orb)', fontSize: '1.2rem', color: '#ff6b6b', marginBottom: 10 },
  errMsg: { fontSize: '0.95rem', color: 'var(--muted)', marginBottom: 24 },
}

const TYPE_LABELS = {
  apod: 'Astronomy Picture of the Day',
  epic: 'Earth from Space (EPIC)',
}

function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`
}

function SharePage() {
  const { type, slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchShare = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/v1/share/${type}/${slug}`)
        setData(res.data?.data ?? res.data)
      } catch (e) {
        setError(e.response?.data?.message || 'Konten tidak ditemukan.')
      } finally {
        setLoading(false)
      }
    }
    fetchShare()
  }, [type, slug])

  const pageLink = type === 'apod'
    ? `/apod?date=${slug}`
    : type === 'epic'
    ? `/epic?date=${slug}`
    : '/'

  return (
    <PageShell>
      <main style={S.main}>
        <div style={S.wrap}>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['100%', '60%', '100%', '95%', '80%'].map((w, i) => (
                <div key={i} style={{
                  height: i === 0 ? 320 : 20,
                  width: w,
                  borderRadius: i === 0 ? 16 : 8,
                  background: 'linear-gradient(90deg, #12121a 25%, #1e1e2e 50%, #12121a 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'sh-shimmer 1.6s ease-in-out infinite',
                }} />
              ))}
              <style>{`@keyframes sh-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={S.error}>
              <div style={S.errIcon}>🔭</div>
              <div style={S.errTitle}>Konten Tidak Ditemukan</div>
              <div style={S.errMsg}>{error}</div>
              <Link to="/" style={S.btnPrimary}>Kembali ke Beranda</Link>
            </div>
          )}

          {/* Content */}
          {!loading && data && (
            <>
              <div style={S.badge}>
                NASA · {TYPE_LABELS[type] || type.toUpperCase()}
              </div>

              {data.image_url && (
                <div style={S.media}>
                  <img src={data.image_url} alt={data.title} style={S.img} />
                </div>
              )}

              <h1 style={S.title}>{data.title}</h1>

              <div style={S.meta}>
                {slug && <span style={S.chip}>{formatDate(slug)}</span>}
                {data.copyright && <span style={S.chip}>© {data.copyright}</span>}
                <span style={S.chip}>Sumber: NASA</span>
              </div>

              {data.description && (
                <p style={S.desc}>{data.description}</p>
              )}

              <div style={S.actions}>
                <Link to={pageLink} style={S.btnPrimary}>
                  Buka di Nebula
                </Link>
                <Link to="/" style={S.btnOutline}>
                  Eksplor Lainnya
                </Link>
              </div>
            </>
          )}

        </div>
      </main>
    </PageShell>
  )
}

export default SharePage
