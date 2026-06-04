import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import api from '../api/axios'

/* ── Inline styles (no extra CSS file needed) ── */
const S = {
  main:  { paddingTop: 'var(--nav-h)', paddingBottom: 64 },
  wrap:  { maxWidth: 900, margin: '0 auto', padding: '0 28px' },
  header:{ padding: '48px 0 36px' },
  eyebrow:{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: 10 },
  heading:{ fontFamily: 'var(--font-orb)', fontWeight: 700, fontSize: '2.4rem', color: '#fff', margin: 0 },
  groupTitle:{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16, marginTop: 32 },
  card:  { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 12, transition: 'border-color 180ms ease' },
  cardLeft:{ display: 'flex', alignItems: 'center', gap: 16 },
  typeIcon:{ width: 46, height: 46, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0 },
  cardInfo:{ display: 'flex', flexDirection: 'column', gap: 4 },
  cardType:{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' },
  cardDate:{ fontSize: '1rem', fontWeight: 700, color: '#fff' },
  cardSub: { fontSize: '0.82rem', color: 'var(--muted)' },
  cardActions:{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 },
  linkBtn:{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-2)', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 8, padding: '8px 14px', textDecoration: 'none', transition: 'background 160ms ease' },
  delBtn:{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', transition: 'all 160ms ease' },
  empty: { textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' },
  emptyIcon:{ fontSize: '3.5rem', marginBottom: 18 },
  emptyTitle:{ fontFamily: 'var(--font-orb)', fontSize: '1.2rem', color: '#fff', marginBottom: 10 },
  emptyText:{ fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 28 },
}

const TYPE_META = {
  apod: {
    label: 'APOD',
    color: 'rgba(108,99,255,0.15)',
    iconColor: 'var(--accent-2)',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3.2 13.3l11.8-6.8 2 3.5-11.8 6.8z"/><path d="M14.6 6.6l3.4-2 2 3.5-3.4 2"/><path d="M11 14.5L13 21"/><path d="M9 21h6"/><circle cx="6" cy="14.5" r="2.1"/></svg>,
    linkPrefix: '/apod',
    linkParam: (b) => `?date=${b.reference_date}`,
    linkLabel: 'Lihat APOD',
  },
  epic: {
    label: 'EPIC',
    color: 'rgba(74,222,128,0.12)',
    iconColor: 'var(--green)',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.4 2.5 15.6 0 18M12 3c-2.5 2.4-2.5 15.6 0 18"/></svg>,
    linkPrefix: '/epic',
    linkParam: (b) => `?date=${b.reference_date}`,
    linkLabel: 'Lihat EPIC',
  },
  asteroid: {
    label: 'Asteroid',
    color: 'rgba(255,140,0,0.12)',
    iconColor: '#ff8c00',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="16" cy="8" r="4"/><path d="M13 11L3 21M9 12l-3 1.5M12 15l-1.5 3"/></svg>,
    linkPrefix: '/asteroids',
    linkParam: (b) => `?start_date=${b.reference_date}&end_date=${b.reference_date}`,
    linkLabel: 'Lihat Asteroid',
  },
}

function formatDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`
}

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
)

const skeletonStyle = {
  background: 'linear-gradient(90deg, var(--surface) 25%, #1e1e2e 50%, var(--surface) 75%)',
  backgroundSize: '200% 100%',
  animation: 'bm-shimmer 1.6s ease-in-out infinite',
  borderRadius: 14,
  height: 76,
  marginBottom: 12,
}

function BookmarkPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState({})

  const fetchBookmarks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/v1/bookmarks')
      setBookmarks(res.data?.data ?? res.data ?? [])
    } catch (_) {
      setBookmarks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBookmarks() }, [fetchBookmarks])

  const handleDelete = async (id) => {
    setDeleting(p => ({ ...p, [id]: true }))
    try {
      await api.delete(`/v1/bookmarks/${id}`)
      setBookmarks(prev => prev.filter(b => b.id !== id))
    } catch (_) {}
    setDeleting(p => ({ ...p, [id]: false }))
  }

  const grouped = {}
  for (const b of bookmarks) {
    if (!grouped[b.type]) grouped[b.type] = []
    grouped[b.type].push(b)
  }

  return (
    <PageShell>
      <style>{`@keyframes bm-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <main style={S.main}>
        <div style={S.wrap}>

          {/* Header */}
          <div style={S.header}>
            <span style={S.eyebrow}>Koleksi Saya</span>
            <h1 style={S.heading}>Bookmark Saya</h1>
          </div>

          {/* Loading */}
          {loading && (
            <div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={skeletonStyle} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && bookmarks.length === 0 && (
            <div style={S.empty}>
              <div style={S.emptyIcon}>🔖</div>
              <div style={S.emptyTitle}>Belum Ada Bookmark</div>
              <p style={S.emptyText}>
                Kamu belum menyimpan konten apapun. Jelajahi halaman APOD atau EPIC dan klik tombol
                "Simpan" untuk menyimpan konten favoritmu di sini.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/apod" style={{ ...S.linkBtn, background: 'var(--accent)', color: '#fff', border: 'none' }}>
                  Jelajahi APOD
                </Link>
                <Link to="/epic" style={{ ...S.linkBtn, background: 'rgba(74,222,128,0.15)', color: 'var(--green)', borderColor: 'rgba(74,222,128,0.3)' }}>
                  Jelajahi EPIC
                </Link>
              </div>
            </div>
          )}

          {/* Grouped bookmarks */}
          {!loading && Object.keys(grouped).sort().map(type => {
            const meta = TYPE_META[type] || { label: type.toUpperCase(), color: 'rgba(255,255,255,0.05)', iconColor: 'var(--muted)', icon: '📌', linkPrefix: '/', linkParam: () => '', linkLabel: 'Lihat' }
            return (
              <div key={type}>
                <div style={S.groupTitle}>{meta.label} — {grouped[type].length} item</div>
                {grouped[type].map(b => (
                  <div
                    key={b.id}
                    style={S.card}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={S.cardLeft}>
                      <div style={{ ...S.typeIcon, background: meta.color, color: meta.iconColor }}>
                        {meta.icon}
                      </div>
                      <div style={S.cardInfo}>
                        <span style={S.cardType}>{meta.label}</span>
                        <span style={S.cardDate}>{formatDate(b.reference_date)}</span>
                        <span style={S.cardSub}>{b.reference_date}</span>
                      </div>
                    </div>
                    <div style={S.cardActions}>
                      <Link
                        to={`${meta.linkPrefix}${meta.linkParam(b)}`}
                        style={S.linkBtn}
                      >
                        {meta.linkLabel}
                      </Link>
                      <button
                        style={{
                          ...S.delBtn,
                          ...(deleting[b.id] ? { opacity: 0.4 } : {}),
                        }}
                        onClick={() => handleDelete(b.id)}
                        disabled={deleting[b.id]}
                        title="Hapus bookmark"
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,107,107,0.5)'; e.currentTarget.style.color = '#ff6b6b' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

        </div>
      </main>
    </PageShell>
  )
}

export default BookmarkPage
