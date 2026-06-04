import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PageShell } from '../components/PageShell'
import api from '../api/axios'
import '../styles/iss.css'

/* ── Icons ── */
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M1 4v6h6M23 20v-6h-6" />
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" />
  </svg>
)
const TargetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
)
const ResetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const LatIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /></svg>
const LngIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 3c2.5 2.4 2.5 15.6 0 18M12 3c-2.5 2.4-2.5 15.6 0 18" /></svg>
const AltIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
const VelIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
const EyeIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M2 12C4.8 6.6 8.1 4 12 4s7.2 2.6 10 8c-2.8 5.4-6.1 8-10 8S4.8 17.4 2 12z" /></svg>
const ClockIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>

/* ── Format helpers ── */
function fmtLat(v) { return v == null ? '—' : `${Math.abs(v).toFixed(4)}° ${v >= 0 ? 'N' : 'S'}` }
function fmtLng(v) { return v == null ? '—' : `${Math.abs(v).toFixed(4)}° ${v >= 0 ? 'E' : 'W'}` }
function fmtNum(v, d = 2) { return v == null ? '—' : Number(v).toFixed(d) }

/* ── Map controller: follow ISS + detect drag ── */
function MapController({ position, follow, onDragStart }) {
  const map = useMap()
  const init = useRef(false)

  useEffect(() => {
    if (!position) return
    if (!init.current) {
      map.setView(position, 3)
      init.current = true
    } else if (follow) {
      map.panTo(position, { animate: true, duration: 0.9 })
    }
  }, [position, follow, map])

  useEffect(() => {
    map.on('dragstart', onDragStart)
    return () => map.off('dragstart', onDragStart)
  }, [map, onDragStart])

  return null
}

/* ── Captures map ref for external use (Reset Zoom button) ── */
function MapRefCapture({ mapRef }) {
  mapRef.current = useMap()
  return null
}

/* ── Orbit facts ── */
const ORBIT_FACTS = [
  { num: '~90', unit: 'menit', title: 'Waktu Orbit', desc: 'ISS mengelilingi Bumi satu kali setiap 90 menit' },
  { num: '408',  unit: 'km',    title: 'Ketinggian Rata-rata', desc: 'ISS mengorbit pada ketinggian rata-rata 408 kilometer' },
  { num: '16',   unit: 'kali/hari', title: 'Matahari Terbit', desc: 'Astronot di ISS melihat matahari terbit 16 kali sehari' },
]

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
function IssPage() {

  /* ── Existing logic (unchanged) ── */
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState(5)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchIss = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/v1/iss/position')
      setData(res.data?.data ?? res.data)
      setLastUpdate(new Date())
      setCountdown(5)
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal mengambil posisi ISS.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchIss() }, [fetchIss])

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { fetchIss(); return 5 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [fetchIss])

  /* ── Map state ── */
  const [trail,  setTrail]  = useState([])
  const [follow, setFollow] = useState(true)
  const [flash,  setFlash]  = useState(false)
  const mapRef = useRef(null)

  /* Update trail & flash when data changes */
  useEffect(() => {
    if (data?.latitude == null) return
    setTrail(prev => [...prev, [data.latitude, data.longitude]].slice(-20))
    setFlash(true)
    const t = setTimeout(() => setFlash(false), 450)
    return () => clearTimeout(t)
  }, [data])

  const handleMapDrag = useCallback(() => setFollow(false), [])

  const handleReset = useCallback(() => {
    setFollow(false)
    mapRef.current?.setView([20, 0], 2, { animate: true })
  }, [])

  /* ISS icon (created once) */
  const issIcon = useMemo(() => L.divIcon({
    html: `<div class="is-iss-dot"><div class="is-iss-dot__ring"></div><div class="is-iss-dot__core"></div><span class="is-iss-dot__label">ISS</span></div>`,
    className: '',
    iconSize: [48, 56],
    iconAnchor: [24, 24],
  }), [])

  const position = data ? [data.latitude, data.longitude] : null

  /* 6 stat cards */
  const stats = [
    { cls: '',         icon: <LatIcon  />, label: 'Latitude',   val: fmtLat(data?.latitude)  },
    { cls: '',         icon: <LngIcon  />, label: 'Longitude',  val: fmtLng(data?.longitude) },
    { cls: 'is-stat-blue',   icon: <AltIcon  />, label: 'Ketinggian', val: fmtNum(data?.altitude_km), unit: 'km' },
    { cls: 'is-stat-purple', icon: <VelIcon  />, label: 'Kecepatan',  val: data?.velocity_kmh ? Math.round(data.velocity_kmh).toLocaleString('id') : '—', unit: 'km/jam' },
    { cls: data?.visibility === 'daylight' ? 'is-stat-yellow' : 'is-stat-muted', icon: <EyeIcon />, label: 'Visibilitas', val: data?.visibility === 'daylight' ? '☀ Daylight' : data?.visibility === 'eclipsed' ? '🌑 Eclipse' : (data?.visibility ?? '—') },
    { cls: 'is-stat-muted',  icon: <ClockIcon/>, label: 'Diperbarui', val: lastUpdate ? lastUpdate.toLocaleTimeString('id-ID') : '—', unit: lastUpdate ? lastUpdate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '' },
  ]

  return (
    <PageShell>
      <main className="is-main">
        <div className="is-wrap">

          {/* ── Page Header ── */}
          <div className="is-header">
            <div className="is-header__top">
              <div>
                <span className="is-eyebrow">Real-Time Tracking</span>
                <h1 className="is-heading">ISS Tracker</h1>
                <div className="is-refresh-row">
                  <span className="is-countdown">
                    {loading ? 'Memperbarui...' : `Update dalam ${countdown}s`}
                  </span>
                  <button className="is-btn-refresh" onClick={fetchIss} disabled={loading}>
                    <RefreshIcon />
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>
              <div className="is-live-badge">
                <div className="is-live-indicator">
                  <span className="is-live-dot" />
                  <span className="is-live-text">LIVE</span>
                </div>
                <span className="is-live-sub">Diperbarui tiap 5 detik</span>
              </div>
            </div>
          </div>

          {/* ── Error Banner ── */}
          {error && !loading && (
            <div className="is-error-banner">
              ⚠️ {error} — Mencoba kembali secara otomatis.
            </div>
          )}

          {/* ── Map ── */}
          <div className="is-map-section">
            {loading && !data ? (
              <div className="is-skeleton is-map-skeleton" />
            ) : (
              <div className="is-map-container">
                <MapContainer
                  center={[20, 0]}
                  zoom={2}
                  scrollWheelZoom
                  zoomControl={false}
                  style={{ width: '100%', height: '100%' }}
                  attributionControl
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={18}
                  />
                  {position && (
                    <>
                      <Marker position={position} icon={issIcon}>
                        <Tooltip direction="top" offset={[0, -30]}>
                          ISS &nbsp;·&nbsp; {data.latitude.toFixed(2)}°, {data.longitude.toFixed(2)}°
                        </Tooltip>
                      </Marker>
                      {trail.length > 1 && (
                        <Polyline
                          positions={trail}
                          color="#00d4ff"
                          opacity={0.55}
                          weight={2}
                          dashArray="6 4"
                        />
                      )}
                    </>
                  )}
                  <MapController position={position} follow={follow} onDragStart={handleMapDrag} />
                  <MapRefCapture mapRef={mapRef} />
                </MapContainer>

                {/* Buttons over the map */}
                <div className="is-map-btns">
                  <button
                    className={`is-map-btn${follow ? ' active' : ''}`}
                    onClick={() => setFollow(v => !v)}
                    title="Ikuti ISS"
                  >
                    <TargetIcon />
                    <span>Ikuti ISS</span>
                  </button>
                  <button className="is-map-btn" onClick={handleReset} title="Reset Zoom">
                    <ResetIcon />
                    <span>Reset Zoom</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Stats Grid (6 cards) ── */}
          <div className="is-stats">
            {loading && !data
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="is-skeleton is-stat-skeleton" />
                ))
              : stats.map(s => (
                  <div key={s.label} className={`is-stat-card ${s.cls || ''}${flash ? ' flash' : ''}`}>
                    <div className="is-stat-card__icon">{s.icon}</div>
                    <div className="is-stat-card__label">{s.label}</div>
                    <div className="is-stat-card__val">{s.val}</div>
                    {s.unit && <div className="is-stat-card__unit">{s.unit}</div>}
                  </div>
                ))
            }
          </div>

        </div>{/* /is-wrap */}

        {/* ── Orbit Info ── */}
        <div className="is-orbit-section">
          <div className="is-wrap">
            <div className="is-orbit-heading">Fakta ISS</div>
            <div className="is-orbit-grid">
              {ORBIT_FACTS.map(f => (
                <div key={f.title} className="is-orbit-fact">
                  <div className="is-orbit-fact__num">{f.num}</div>
                  <div className="is-orbit-fact__unit">{f.unit}</div>
                  <div className="is-orbit-fact__title">{f.title}</div>
                  <div className="is-orbit-fact__desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </PageShell>
  )
}

export default IssPage
