import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import '../styles/apod.css'

/* ── Icons ── */
const CalendarIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const BookmarkOutline = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
)
const BookmarkSolid = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
)
const ShareIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
  </svg>
)
const SpinIcon = () => (
  <svg className="ap-spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 2a10 10 0 010 20" />
  </svg>
)
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
const WAIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1s-1.2-.4-2.3-1.4c-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.4.1-.1.2-.3.3-.4.1-.1.1-.3 0-.4-.1-.1-.7-1.6-.9-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4C7 8.5 6.3 9.3 6.3 10.8s1.1 3 1.2 3.2c.1.2 2 3.2 4.9 4.4.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.1-1.3z"/><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16z"/>
  </svg>
)
const TWIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const TGIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.7 8c-.12.56-.44.7-.9.44l-2.49-1.83-1.2 1.15c-.13.13-.24.24-.5.24l.18-2.52 4.6-4.16c.2-.18-.04-.28-.31-.1L7.83 14.5l-2.44-.76c-.53-.17-.54-.53.11-.78l9.54-3.68c.44-.16.82.11.6.52z"/>
  </svg>
)

/* ── Helpers ── */
function getYoutubeId(url) {
  if (!url) return null
  const m = url.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}
function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`
}

const today = new Date().toISOString().split('T')[0]
const TRUNCATE_LEN = 400

/* ── Main Component ── */
function ApodPage() {
  const [searchParams] = useSearchParams()
  const [date, setDate] = useState(searchParams.get('date') || today)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visible, setVisible] = useState(false)
  const [bookmarkId, setBookmarkId] = useState(null)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [bmMsg, setBmMsg] = useState('')
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxLoaded, setLightboxLoaded] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [translatedText, setTranslatedText] = useState(null)
  const [showTranslated, setShowTranslated] = useState(false)
  const [translating, setTranslating] = useState(false)
  const { user } = useAuth()

  /* Fetch APOD */
  const fetchApod = useCallback(async (d) => {
    setLoading(true)
    setError(null)
    setData(null)
    setVisible(false)
    setExpanded(false)
    setBookmarkId(null)
    setTranslatedText(null)
    setShowTranslated(false)
    try {
      const res = await api.get(`/v1/apod?date=${d}`)
      setData(res.data?.data ?? res.data)
      setTimeout(() => setVisible(true), 50)
    } catch (e) {
      setError(e.response?.data?.message || 'Terjadi kesalahan saat memuat data.')
    } finally {
      setLoading(false)
    }
  }, [])

  /* Check existing bookmark */
  const checkBookmark = useCallback(async (d) => {
    if (!user) return
    try {
      const res = await api.get('/v1/bookmarks')
      const list = res.data?.data ?? res.data ?? []
      const found = list.find(b => b.type === 'apod' && b.reference_date === d)
      setBookmarkId(found ? found.id : null)
    } catch (_) {}
  }, [user])

  useEffect(() => { fetchApod(date) }, [date, fetchApod])
  useEffect(() => { checkBookmark(date) }, [date, checkBookmark])

  /* Lightbox ESC */
  useEffect(() => {
    if (!showLightbox) return
    const onKey = (e) => { if (e.key === 'Escape') setShowLightbox(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showLightbox])

  useEffect(() => { if (showLightbox) setLightboxLoaded(false) }, [showLightbox])

  const handleBookmark = async () => {
    if (!user) return
    setBookmarkLoading(true)
    setBmMsg('')
    try {
      if (bookmarkId) {
        await api.delete(`/v1/bookmarks/${bookmarkId}`)
        setBookmarkId(null)
        setBmMsg('Bookmark dihapus.')
      } else {
        await api.post('/v1/bookmarks', { type: 'apod', reference_date: date })
        await checkBookmark(date)
        setBmMsg('Berhasil disimpan! ✓')
      }
    } catch (e) {
      const msg = e.response?.data?.message || ''
      setBmMsg(msg.includes('already') || e.response?.status === 409 ? 'Sudah tersimpan sebelumnya.' : 'Gagal menyimpan bookmark.')
    }
    setBookmarkLoading(false)
    setTimeout(() => setBmMsg(''), 3000)
  }

  const handleTranslate = async () => {
    if (translatedText) { setShowTranslated(v => !v); return }
    setTranslating(true)
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(explanation)}`
      )
      const json = await res.json()
      const result = json[0].map(s => s?.[0] ?? '').join('')
      setTranslatedText(result)
      setShowTranslated(true)
    } catch {
      setBmMsg('Terjemahan gagal. Coba lagi beberapa saat.')
      setTimeout(() => setBmMsg(''), 3000)
    } finally {
      setTranslating(false)
    }
  }

  const shareUrl = `${window.location.origin}/share/apod/${date}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const handleEmbedCopy = () => {
    navigator.clipboard.writeText(`<iframe src="${shareUrl}" width="600" height="400" frameborder="0" title="${data?.title || 'NASA APOD'}"></iframe>`)
    setEmbedCopied(true)
    setTimeout(() => setEmbedCopied(false), 2000)
  }

  const explanation = data?.explanation || ''
  const shouldTruncate = explanation.length > TRUNCATE_LEN
  const displayText = shouldTruncate && !expanded
    ? explanation.slice(0, TRUNCATE_LEN) + '…'
    : explanation

  return (
    <PageShell>
      <main className="ap-main">
        {/* Page Header */}
        <div className="ap-header">
          <div className="ap-wrap">
            <div className="ap-header__inner">
              <div className="ap-header__left">
                <div className="ap-eyebrow">NASA · APOD</div>
                <h1 className="ap-heading">Astronomy Picture<br />of the Day</h1>
              </div>
              <div className="ap-header__right">
                <span className="ap-date-label">Pilih Tanggal</span>
                <div className="ap-date-wrap">
                  <CalendarIcon />
                  <input
                    type="date" className="ap-date-input"
                    value={date} min="1995-06-16" max={today}
                    onChange={e => setDate(e.target.value)} disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="ap-wrap">
            <div className="ap-error">
              <div className="ap-error__icon">🔭</div>
              <div className="ap-error__title">Tidak Ada APOD untuk Tanggal Ini</div>
              <div className="ap-error__msg">
                {error}<br />
                <small style={{ opacity: 0.7 }}>
                  Beberapa tanggal tidak memiliki APOD di arsip NASA. Coba tanggal lain.
                </small>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="ap-btn--primary" onClick={() => fetchApod(date)}>Coba Lagi</button>
                <button
                  className="ap-btn--primary"
                  style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                  onClick={() => setDate(today)}
                >
                  Kembali ke Hari Ini
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!error && (
          <div className={`ap-content${visible ? ' visible' : ''}`}>

            {/* Media */}
            <div className="ap-wrap ap-media-wrap">
              {loading ? (
                <div className="ap-skeleton ap-media-skeleton" />
              ) : data?.media_type === 'video' ? (
                <div className="ap-video-wrap">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(data.url)}`}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title={data.title}
                  />
                </div>
              ) : (
                <div className="ap-img-wrap" onClick={() => setShowLightbox(true)} title="Klik untuk perbesar">
                  <img src={data?.url} alt={data?.title} className="ap-img" />
                  {data?.copyright && (
                    <div className="ap-img-copyright">© {data.copyright.replace(/\n/g, ' ')}</div>
                  )}
                  <div className="ap-img-hint">🔍 Klik untuk perbesar</div>
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div className="ap-wrap ap-info-wrap">
              {loading ? (
                <div className="ap-info-skeleton">
                  <div className="ap-skeleton-row">
                    <div className="ap-skeleton ap-skeleton--pill" />
                    <div className="ap-skeleton ap-skeleton--pill" style={{ width: 140 }} />
                  </div>
                  <div className="ap-skeleton ap-skeleton--title" />
                </div>
              ) : (
                <div className="ap-info">
                  <div className="ap-info__badges">
                    <span className="ap-badge">{formatDate(data?.date)}</span>
                    {data?.copyright && <span className="ap-badge">© {data.copyright.replace(/\n/g, ' ')}</span>}
                  </div>
                  <h2 className="ap-title">{data?.title}</h2>
                </div>
              )}
            </div>

            {/* Explanation */}
            <div className="ap-wrap ap-explanation-wrap">
              {loading ? (
                <div className="ap-exp-skeleton">
                  {['100%','95%','100%','60%'].map((w, i) => (
                    <div key={i} className="ap-skeleton ap-skeleton--text" style={{ width: w }} />
                  ))}
                </div>
              ) : (
                <div className="ap-explanation">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <div className="ap-eyebrow" style={{ margin: 0 }}>
                      Penjelasan Ilmiah
                      {showTranslated && <span style={{ marginLeft: 8, color: 'var(--green)', fontSize: '0.7rem', fontWeight: 600 }}>· Bahasa Indonesia</span>}
                    </div>
                    <button
                      className="ap-readmore"
                      onClick={handleTranslate}
                      disabled={translating}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      {translating
                        ? <><SpinIcon /> Menerjemahkan...</>
                        : showTranslated
                        ? '🔤 Lihat Asli (English)'
                        : '🌐 Terjemahkan ke Indonesia'
                      }
                    </button>
                  </div>
                  <p className="ap-explanation__text">
                    {showTranslated ? translatedText : displayText}
                  </p>
                  {!showTranslated && shouldTruncate && (
                    <button className="ap-readmore" onClick={() => setExpanded(v => !v)}>
                      {expanded ? 'Lebih sedikit ↑' : 'Baca selengkapnya ↓'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar */}
            {!loading && data && (
              <div className="ap-wrap ap-actions-wrap">
                <div className="ap-actions">
                  <div>
                    {user ? (
                      <button
                        className={`ap-btn-action${bookmarkId ? ' active' : ''}`}
                        onClick={handleBookmark} disabled={bookmarkLoading}
                      >
                        {bookmarkLoading ? <SpinIcon /> : bookmarkId ? <BookmarkSolid /> : <BookmarkOutline />}
                        {bookmarkId ? 'Tersimpan' : 'Simpan'}
                      </button>
                    ) : (
                      <div className="ap-bookmark-locked">
                        <BookmarkOutline /><span>Simpan</span>
                        <span className="ap-lock-tip">Login untuk menyimpan</span>
                      </div>
                    )}
                  </div>
                  <button className="ap-btn-share" onClick={() => setShowShare(true)}>
                    <ShareIcon /> Bagikan
                  </button>
                </div>
                {bmMsg && (
                  <p style={{
                    marginTop: 10, fontSize: '0.85rem',
                    color: bmMsg.includes('Gagal') ? '#ff6b6b' : '#4ade80',
                    animation: 'ap-fadeIn 200ms ease'
                  }}>
                    {bmMsg}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {showLightbox && (
        <div className="ap-lightbox" onClick={() => setShowLightbox(false)}>
          <button className="ap-lightbox__close" onClick={() => setShowLightbox(false)}><CloseIcon /></button>
          <div className="ap-lightbox__inner" onClick={e => e.stopPropagation()}>
            {!lightboxLoaded && <div className="ap-lightbox__spinner"><SpinIcon /></div>}
            <img
              src={data?.hdurl || data?.url} alt={data?.title}
              className="ap-lightbox__img"
              style={{ opacity: lightboxLoaded ? 1 : 0 }}
              onLoad={() => setLightboxLoaded(true)}
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="ap-modal-overlay" onClick={() => setShowShare(false)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <button className="ap-modal__close" onClick={() => setShowShare(false)}><CloseIcon /></button>
            <h3 className="ap-modal__title">Bagikan APOD</h3>
            <p className="ap-modal__sub">{data?.title}</p>

            <div className="ap-modal__section">
              <div className="ap-modal__label">Salin Link</div>
              <div className="ap-copy-row">
                <input readOnly className="ap-copy-input" value={shareUrl} />
                <button className="ap-copy-btn" onClick={handleCopy}>{copied ? '✓ Tersalin' : 'Salin'}</button>
              </div>
            </div>

            <div className="ap-modal__section">
              <div className="ap-modal__label">Bagikan ke</div>
              <div className="ap-social-row">
                <a href={`https://wa.me/?text=${encodeURIComponent((data?.title||'APOD')+' '+shareUrl)}`} target="_blank" rel="noopener noreferrer" className="ap-social ap-social--wa"><WAIcon /> WhatsApp</a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(data?.title||'NASA APOD')}`} target="_blank" rel="noopener noreferrer" className="ap-social ap-social--tw"><TWIcon /> Twitter/X</a>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(data?.title||'NASA APOD')}`} target="_blank" rel="noopener noreferrer" className="ap-social ap-social--tg"><TGIcon /> Telegram</a>
              </div>
            </div>

            <div className="ap-modal__section" style={{ marginBottom: 0 }}>
              <div className="ap-modal__label">Embed di Website</div>
              <div className="ap-embed-row">
                <textarea readOnly className="ap-embed-input" value={`<iframe src="${shareUrl}" width="600" height="400" frameborder="0" title="${data?.title||'NASA APOD'}"></iframe>`} />
                <button className="ap-copy-btn" onClick={handleEmbedCopy}>{embedCopied ? '✓ Tersalin' : 'Salin Kode'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}

export default ApodPage
