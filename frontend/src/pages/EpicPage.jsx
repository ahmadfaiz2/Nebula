import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import '../styles/epic.css'

/* ── Icons ── */
const CalIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
const ZoomIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4M11 8v6M8 11h6" />
  </svg>
)
const BookmarkOutline = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
)
const BookmarkSolid = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
)
const SpinIcon = () => (
  <svg className="ep-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 2a10 10 0 010 20" />
  </svg>
)

/* Backend sudah menyediakan image_url — epicImgUrl tidak diperlukan */

function dateOnly(dateString) {
  return dateString ? dateString.split(' ')[0] : ''
}

function formatDateTime(dateString) {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' UTC'
}

const today = new Date().toISOString().split('T')[0]

function EpicPage() {
  const [searchParams] = useSearchParams()
  const [date, setDate] = useState(searchParams.get('date') || '')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [lbLoaded, setLbLoaded] = useState(false)
  const [bookmarkIds, setBookmarkIds] = useState({})
  const [bmLoading, setBmLoading] = useState({})
  const { user } = useAuth()

  const fetchEpic = useCallback(async (d) => {
    setLoading(true)
    setError(null)
    setImages([])
    try {
      const url = d ? `/v1/epic?date=${d}` : '/v1/epic'
      const res = await api.get(url)
      const list = res.data?.data ?? res.data ?? []
      setImages(Array.isArray(list) ? list : [])
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal memuat gambar EPIC.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBookmarks = useCallback(async () => {
    if (!user) return
    try {
      const res = await api.get('/v1/bookmarks')
      const list = res.data?.data ?? res.data ?? []
      const map = {}
      for (const b of list) {
        if (b.type === 'epic') map[b.reference_date] = b.id
      }
      setBookmarkIds(map)
    } catch (_) {}
  }, [user])

  useEffect(() => { fetchEpic(date) }, [date, fetchEpic])
  useEffect(() => { fetchBookmarks() }, [fetchBookmarks])
  useEffect(() => { if (lightbox) setLbLoaded(false) }, [lightbox])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const handleBookmark = async (imgDate) => {
    if (!user) return
    setBmLoading(p => ({ ...p, [imgDate]: true }))
    try {
      if (bookmarkIds[imgDate]) {
        await api.delete(`/v1/bookmarks/${bookmarkIds[imgDate]}`)
        setBookmarkIds(p => { const n = { ...p }; delete n[imgDate]; return n })
      } else {
        const res = await api.post('/v1/bookmarks', { type: 'epic', reference_date: imgDate })
        const newId = res.data?.data?.id ?? res.data?.id ?? true
        setBookmarkIds(p => ({ ...p, [imgDate]: newId }))
      }
    } catch (_) {}
    setBmLoading(p => ({ ...p, [imgDate]: false }))
  }

  const displayDate = images[0] ? dateOnly(images[0].date) : null

  return (
    <PageShell>
      <main className="ep-main">
        <div className="ep-wrap">

          {/* Header */}
          <div className="ep-header">
            <div className="ep-header__inner">
              <div>
                <span className="ep-eyebrow">NASA · DSCOVR · EPIC Camera</span>
                <h1 className="ep-heading">Earth from Space</h1>
                <p className="ep-sub">
                  {displayDate
                    ? `Menampilkan foto Bumi tanggal ${displayDate}`
                    : 'Foto terbaru Bumi dari kamera EPIC NASA'}
                </p>
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 8, fontWeight: 500 }}>Pilih Tanggal</div>
                <div className="ep-date-wrap">
                  <CalIcon />
                  <input
                    type="date"
                    className="ep-date-input"
                    value={date}
                    max={today}
                    onChange={e => setDate(e.target.value)}
                    disabled={loading}
                    placeholder="Terbaru"
                  />
                </div>
                {date && (
                  <button
                    onClick={() => setDate('')}
                    style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--accent-2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                  >
                    ← Kembali ke terbaru
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && !loading && (
            <div className="ep-empty">
              <div className="ep-empty__icon">⚠️</div>
              <div className="ep-empty__title">Gagal Memuat Gambar</div>
              <p>{error}</p>
            </div>
          )}

          {/* Info bar */}
          {!loading && !error && images.length > 0 && (
            <div className="ep-info-bar">
              <div className="ep-count">
                Menampilkan <strong>{images.length}</strong> foto Bumi
              </div>
              {images[0]?.dscovr_distance_km && (
                <div className="ep-distance">
                  Jarak DSCOVR dari Bumi: {Math.round(images[0].dscovr_distance_km).toLocaleString('id')} km
                </div>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="ep-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="ep-skeleton ep-card-skeleton" />
              ))}
            </div>
          ) : !error && images.length > 0 ? (
            <div className="ep-grid">
              {images.map(img => {
                const imgDate = dateOnly(img.date)
                const isBookmarked = !!bookmarkIds[imgDate]
                const isBmLoading = !!bmLoading[imgDate]
                const src = img.image_url
                return (
                  <div key={img.identifier} className="ep-card">
                    <div className="ep-card__img-wrap" onClick={() => setLightbox(img)}>
                      <img src={src} alt={img.caption} className="ep-card__img" loading="lazy" />
                      <div className="ep-card__overlay" />
                      <div className="ep-card__zoom"><ZoomIcon /></div>
                    </div>
                    <div className="ep-card__body">
                      <div className="ep-card__time">{formatDateTime(img.date)}</div>
                      <div className="ep-card__caption">{img.caption}</div>
                      {img.centroid_coordinates && (
                        <div className="ep-card__coords">
                          {img.centroid_coordinates.lat?.toFixed(2)}° lat, {img.centroid_coordinates.lon?.toFixed(2)}° lon
                        </div>
                      )}
                      <div className="ep-card__actions">
                        {user ? (
                          <button
                            className={`ep-bm-btn${isBookmarked ? ' active' : ''}`}
                            onClick={() => handleBookmark(imgDate)}
                            disabled={isBmLoading}
                          >
                            {isBmLoading ? <SpinIcon /> : isBookmarked ? <BookmarkSolid /> : <BookmarkOutline />}
                            {isBookmarked ? 'Tersimpan' : 'Simpan'}
                          </button>
                        ) : (
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                            Login untuk menyimpan
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : !error ? (
            <div className="ep-empty">
              <div className="ep-empty__icon">🌍</div>
              <div className="ep-empty__title">Tidak Ada Gambar</div>
              <p>Tidak ada gambar EPIC tersedia untuk tanggal ini. Coba pilih tanggal lain.</p>
            </div>
          ) : null}

        </div>
      </main>

      {/* Lightbox */}
      {lightbox && (
        <div className="ep-lightbox" onClick={() => setLightbox(null)}>
          <button className="ep-lightbox__close" onClick={() => setLightbox(null)}><CloseIcon /></button>
          <div className="ep-lightbox__inner" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.image_url}
              alt={lightbox.caption}
              className="ep-lightbox__img"
              style={{ opacity: lbLoaded ? 1 : 0 }}
              onLoad={() => setLbLoaded(true)}
            />
          </div>
          <div className="ep-lightbox__info">
            <p>{lightbox.caption}</p>
          </div>
        </div>
      )}
    </PageShell>
  )
}

export default EpicPage
