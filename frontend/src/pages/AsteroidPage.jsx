import { useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useAuth } from '../context/AuthContext'
import { useInView } from '../hooks/useInView'
import api from '../api/axios'
import '../styles/asteroid.css'

/* ── Icons ── */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
  </svg>
)
const CalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const BmOutline = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
)
const BmSolid = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
)
const SpinSm = () => (
  <svg style={{ animation: 'ast-spin 0.7s linear infinite', display: 'inline-block' }}
    width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2a10 10 0 010 20" />
  </svg>
)

/* ── Formatters ── */
function formatDist(km) {
  if (!km) return '—'
  const n = parseFloat(km)
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)} juta km`
  return `${Math.round(n).toLocaleString('id')} km`
}
function formatVel(kmh) {
  if (!kmh) return '—'
  return `${Math.round(parseFloat(kmh)).toLocaleString('id')} km/jam`
}
function formatDiam(min, max) {
  if (min == null || max == null) return '—'
  if (max < 1) return `${Math.round(min * 1000)}–${Math.round(max * 1000)} m`
  return `${min.toFixed(2)}–${max.toFixed(2)} km`
}
function formatDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  const mo = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  return `${parseInt(day)} ${mo[parseInt(m)-1]} ${y}`
}
function todayStr() { return new Date().toISOString().split('T')[0] }
function addDays(s, n) {
  const d = new Date(s); d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}
function extractAsteroids(raw) {
  return Array.isArray(raw?.asteroids) ? raw.asteroids : []
}
function cleanName(n) { return (n || '').replace(/[()]/g, '').trim() }

const PAGE_SIZE = 10

/* ── Count-up number ── */
function CountUp({ target, run, decimals = 0 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!run || target == null) return
    const dur = 1200, start = performance.now()
    let raf
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1)
      const e = 1 - (1 - p) ** 3
      setVal(+(target * e).toFixed(decimals))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, target, decimals])
  return decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString('id')
}

/* ── Distance Visualization ── */
function DistanceViz({ asteroids }) {
  const top10 = useMemo(() => (
    [...asteroids]
      .sort((a, b) => parseFloat(a.miss_distance_km) - parseFloat(b.miss_distance_km))
      .slice(0, 10)
  ), [asteroids])

  const maxLD = useMemo(() => (
    Math.max(5, ...top10.map(a => parseFloat(a.miss_distance_lunar) || 0)) * 1.1
  ), [top10])

  const moonPos = Math.min((1 / maxLD) * 100, 95)

  const barColor = (ld) => {
    if (ld < 1) return 'red'
    if (ld <= 5) return 'orange'
    return 'blue'
  }

  return (
    <div className="ast-viz">
      <div className="ast-viz__head">
        <div className="ast-viz__title">Visualisasi Jarak ke Bumi</div>
        <div className="ast-viz__sub">1 LD = 384.400 km (jarak Bumi–Bulan)</div>
      </div>
      <div className="ast-viz__legend">
        <div className="ast-viz__leg-item">
          <div className="ast-viz__leg-dot" style={{ background: '#ff4d4d' }} /> &lt;1 LD (Sangat Dekat)
        </div>
        <div className="ast-viz__leg-item">
          <div className="ast-viz__leg-dot" style={{ background: '#ff8c00' }} /> 1–5 LD
        </div>
        <div className="ast-viz__leg-item">
          <div className="ast-viz__leg-dot" style={{ background: '#00d4ff' }} /> &gt;5 LD
        </div>
        <div className="ast-viz__leg-item">
          <div className="ast-viz__leg-dot" style={{ background: '#ffd700', borderRadius: 0, height: 2 }} /> Jarak Bulan (1 LD)
        </div>
      </div>
      <div className="ast-viz__body">
        {top10.map((a, i) => {
          const ld = parseFloat(a.miss_distance_lunar) || 0
          const barW = Math.max(0.5, Math.min(ld / maxLD * 100, 98))
          const color = barColor(ld)
          return (
            <div key={a.id} className="ast-viz__row">
              <div className="ast-viz__name" title={cleanName(a.name)}>{cleanName(a.name)}</div>
              <div className="ast-viz__track">
                <div
                  className={`ast-viz__bar ast-viz__bar--${color}`}
                  style={{ width: `${barW}%`, '--bar-delay': `${i * 60}ms` }}
                />
                {/* Moon reference line */}
                <div className="ast-viz__moon-line" style={{ left: `${moonPos}%` }}>
                  {i === 0 && <div className="ast-viz__moon-label">🌕 1 LD</div>}
                </div>
              </div>
              <div className="ast-viz__ld">{ld.toFixed(2)} LD</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════ */
function AsteroidPage() {
  /* ── Existing logic (unchanged) ── */
  const [searchParams] = useSearchParams()
  const today = todayStr()
  /* Default ke 7 hari terakhir — data past lebih cepat dari NASA API */
  const [startDate, setStartDate] = useState(searchParams.get('start_date') || addDays(today, -6))
  const [endDate,   setEndDate]   = useState(searchParams.get('end_date')   || today)
  const [asteroids, setAsteroids] = useState([])
  const [elementCount, setElementCount] = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [fetched,  setFetched]  = useState(false)
  const [error,    setError]    = useState(null)
  const [filterHazard, setFilterHazard] = useState('all')

  const fetchAsteroids = useCallback(async () => {
    setLoading(true); setError(null); setFetched(false)
    try {
      const res = await api.get(`/v1/asteroids?start_date=${startDate}&end_date=${endDate}`)
      const raw = res.data?.data ?? res.data
      setElementCount(raw?.total_asteroids ?? 0)
      setAsteroids(extractAsteroids(raw))
      setFetched(true)
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal memuat data asteroid.')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  const handleStartChange = (e) => {
    setStartDate(e.target.value)
    const maxEnd = addDays(e.target.value, 7)
    if (endDate > maxEnd) setEndDate(maxEnd)
  }
  const handleEndChange = (e) => {
    const val = e.target.value
    if (val < startDate) return
    if (val > addDays(startDate, 7)) { setEndDate(addDays(startDate, 7)); return }
    setEndDate(val)
  }

  /* ── New state: sort, page, bookmark ── */
  const [sortKey, setSortKey] = useState('distance-asc')
  const [page, setPage] = useState(1)
  const [bmDates, setBmDates] = useState({})
  const [bmLoad,  setBmLoad]  = useState({})
  const { user } = useAuth()

  /* Table header sort (separate from dropdown) */
  const [tblCol, setTblCol] = useState(null)
  const [tblDir, setTblDir] = useState('asc')

  const handleTblSort = (col) => {
    if (tblCol === col) setTblDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setTblCol(col); setTblDir('asc') }
    setPage(1)
  }
  const SortIndicator = ({ col }) => {
    const active = tblCol === col
    return <span className={`ast-sort-icon${active ? ' active' : ''}`}>{active ? (tblDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>
  }

  /* Bookmark fetch */
  const fetchBm = useCallback(async () => {
    if (!user) return
    try {
      const res = await api.get('/v1/bookmarks')
      const list = res.data?.data ?? res.data ?? []
      const map = {}
      list.filter(b => b.type === 'asteroid').forEach(b => { map[b.reference_date] = b.id })
      setBmDates(map)
    } catch (_) {}
  }, [user])
  useEffect(() => { fetchBm() }, [fetchBm])

  const handleBm = async (date) => {
    if (!user) return
    setBmLoad(p => ({ ...p, [date]: true }))
    try {
      if (bmDates[date]) {
        await api.delete(`/v1/bookmarks/${bmDates[date]}`)
        setBmDates(p => { const n = {...p}; delete n[date]; return n })
      } else {
        const res = await api.post('/v1/bookmarks', { type: 'asteroid', reference_date: date })
        setBmDates(p => ({ ...p, [date]: res.data?.data?.id ?? res.data?.id ?? true }))
      }
    } catch (_) {}
    setBmLoad(p => ({ ...p, [date]: false }))
  }

  /* Filter + sort pipeline */
  const filtered = useMemo(() => (
    filterHazard === 'hazardous' ? asteroids.filter(a => a.is_potentially_hazardous)
    : filterHazard === 'safe'    ? asteroids.filter(a => !a.is_potentially_hazardous)
    : asteroids
  ), [asteroids, filterHazard])

  const sortedList = useMemo(() => {
    const activeCol = tblCol || sortKey.split('-')[0]
    const activeDir = tblCol ? tblDir : sortKey.split('-')[1]
    const getVal = (a) => {
      if (activeCol === 'distance' || activeCol === 'distance') return parseFloat(a.miss_distance_km)
      if (activeCol === 'size')  return a.estimated_diameter_km?.max ?? 0
      if (activeCol === 'speed') return parseFloat(a.relative_velocity_kmh)
      if (activeCol === 'date')  return new Date(a.close_approach_date).getTime()
      return 0
    }
    return [...filtered].sort((a, b) => {
      const va = getVal(a), vb = getVal(b)
      return activeDir === 'asc' ? va - vb : vb - va
    })
  }, [filtered, sortKey, tblCol, tblDir])

  const totalPages = Math.ceil(sortedList.length / PAGE_SIZE)
  const paged = sortedList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hazardCount = asteroids.filter(a => a.is_potentially_hazardous).length
  const closestAsteroid = useMemo(() => (
    asteroids.reduce((m, a) => (!m || parseFloat(a.miss_distance_km) < parseFloat(m.miss_distance_km)) ? a : m, null)
  ), [asteroids])

  /* Summary cards count-up */
  const [sumRef, sumInView] = useInView({ threshold: 0.2 })

  /* Reset page when filter/sort changes */
  useEffect(() => { setPage(1) }, [filterHazard, sortKey, tblCol, tblDir])

  /* Dropdown sort handler */
  const handleDropdownSort = (val) => {
    setSortKey(val)
    setTblCol(null) // clear table sort
    setPage(1)
  }

  return (
    <PageShell>
      <style>{`@keyframes ast-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
      <main className="ast-main">
        <div className="ast-wrap">

          {/* ── Page Header ── */}
          <div className="ast-header">
            <div>
              <span className="ast-eyebrow">NASA · NeoWs</span>
              <h1 className="ast-heading">Near Earth Object<br />Tracker</h1>
              <p className="ast-desc">
                Pantau asteroid yang mendekati Bumi berdasarkan data langsung dari NASA NeoWs API.
                Pilih rentang tanggal untuk memulai pencarian.
              </p>
            </div>
            <div className="ast-deco" aria-hidden="true">
              <svg width="140" height="140" viewBox="0 0 200 200" fill="none">
                <ellipse cx="100" cy="100" rx="60" ry="40" stroke="#6c63ff" strokeWidth="1.5" strokeDasharray="6 4" />
                <circle cx="160" cy="100" r="12" fill="#6c63ff" opacity="0.8"/>
                <circle cx="160" cy="100" r="7" fill="#9b8cff"/>
                <circle cx="100" cy="100" r="22" fill="none" stroke="rgba(108,99,255,0.3)" strokeWidth="30"/>
                <circle cx="100" cy="100" r="14" fill="#4aa8ff" opacity="0.5"/>
              </svg>
            </div>
          </div>

          {/* ── Filter Panel ── */}
          <div className="ast-controls">
            <div className="ast-date-group">
              <span className="ast-date-label">Tanggal Mulai</span>
              <div className="ast-date-wrap">
                <CalIcon />
                <input type="date" className="ast-date-input" value={startDate}
                  max={today} onChange={handleStartChange} disabled={loading} />
              </div>
            </div>
            <div className="ast-date-group">
              <span className="ast-date-label">Tanggal Akhir <small style={{ opacity: 0.55 }}>(maks. 7 hari)</small></span>
              <div className="ast-date-wrap">
                <CalIcon />
                <input type="date" className="ast-date-input" value={endDate}
                  min={startDate} max={addDays(startDate, 7)} onChange={handleEndChange} disabled={loading} />
              </div>
            </div>

            <div className="ast-controls-right">
              <div className="ast-filter-group">
                <span className="ast-date-label">Filter</span>
                <div className="ast-filter-pills">
                  {[
                    { key: 'all',       label: 'Semua' },
                    { key: 'hazardous', label: '⚠ Berbahaya', cls: 'ast-pill--danger' },
                    { key: 'safe',      label: '✓ Aman' },
                  ].map(f => (
                    <button
                      key={f.key}
                      className={`ast-pill ${f.cls || ''}${filterHazard === f.key ? ' active' : ''}`}
                      onClick={() => setFilterHazard(f.key)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ast-filter-group">
                <span className="ast-date-label">Urutkan</span>
                <select className="ast-sort-sel" value={sortKey} onChange={e => handleDropdownSort(e.target.value)}>
                  <option value="distance-asc">Jarak Terdekat</option>
                  <option value="size-desc">Ukuran Terbesar</option>
                  <option value="speed-desc">Kecepatan Tertinggi</option>
                  <option value="date-asc">Tanggal Pendekatan</option>
                </select>
              </div>

              <button className="ast-btn-search" onClick={fetchAsteroids} disabled={loading}>
                <SearchIcon />
                {loading ? 'Mencari...' : 'Tampilkan Data'}
              </button>
            </div>
          </div>

          {/* ── Error ── */}
          {error && !loading && (
            <div className="ast-error">
              <div className="ast-error__icon">⚠️</div>
              <div className="ast-error__title">Gagal Memuat Data Asteroid</div>
              <div className="ast-error__msg">{error}</div>
              <button className="ast-btn-retry" onClick={fetchAsteroids}>Coba Lagi</button>
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)',
                borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center',
                gap: 10, fontSize: '0.88rem', color: 'var(--muted)'
              }}>
                <SpinSm />
                <span>Mengambil data dari NASA API — request pertama membutuhkan 5–15 detik. Harap tunggu...</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {[0,1,2].map(i => <div key={i} className="ast-skeleton ast-sk-card" />)}
              </div>
              <div className="ast-skeleton ast-sk-viz" />
              <div className="ast-skeleton ast-sk-table" />
            </div>
          )}

          {/* ── Results ── */}
          {!loading && fetched && !error && (
            <>
              {/* Summary Cards */}
              <div className="ast-sum-grid" ref={sumRef}>
                <div className="ast-sum-card">
                  <div className="ast-sum-card__icon">☄️</div>
                  <div className="ast-sum-card__label">Total Asteroid</div>
                  <div className="ast-sum-card__val">
                    <CountUp target={elementCount} run={sumInView} />
                  </div>
                  <div className="ast-sum-card__sub">dalam rentang tanggal ini</div>
                </div>
                <div className="ast-sum-card ast-sum-card--danger">
                  <div className="ast-sum-card__icon">⚠️</div>
                  <div className="ast-sum-card__label">Berpotensi Berbahaya</div>
                  <div className="ast-sum-card__val">
                    <CountUp target={hazardCount} run={sumInView} />
                  </div>
                  <div className="ast-sum-card__sub">asteroid PHO (Potentially Hazardous)</div>
                </div>
                <div className="ast-sum-card ast-sum-card--blue">
                  <div className="ast-sum-card__icon">🎯</div>
                  <div className="ast-sum-card__label">Jarak Terdekat</div>
                  <div className="ast-sum-card__val">
                    {closestAsteroid ? formatDist(closestAsteroid.miss_distance_km) : '—'}
                  </div>
                  <div className="ast-sum-card__sub">
                    {closestAsteroid ? cleanName(closestAsteroid.name) : '—'}
                  </div>
                </div>
              </div>

              {/* Distance Visualization */}
              {asteroids.length > 0 && <DistanceViz asteroids={asteroids} />}

              {/* Table */}
              {sortedList.length === 0 ? (
                <div className="ast-empty">
                  <div className="ast-empty__icon">🔭</div>
                  <div className="ast-empty__title">Tidak Ada Asteroid</div>
                  <p>Tidak ada asteroid yang cocok dengan filter yang dipilih.</p>
                </div>
              ) : (
                <>
                  <div className="ast-tbl-wrap">
                    <table className="ast-tbl">
                      <thead className="ast-tbl-head">
                        <tr>
                          <th className="ast-th ast-th--num">#</th>
                          <th className="ast-th">Nama</th>
                          <th className="ast-th ast-th--right ast-th-sortable ast-col-diam" onClick={() => handleTblSort('size')}>
                            Diameter <SortIndicator col="size" />
                          </th>
                          <th className="ast-th ast-th--right ast-th-sortable" onClick={() => handleTblSort('speed')}>
                            Kecepatan <SortIndicator col="speed" />
                          </th>
                          <th className="ast-th ast-th--right ast-th-sortable" onClick={() => handleTblSort('distance')}>
                            Jarak Bumi <SortIndicator col="distance" />
                          </th>
                          <th className="ast-th ast-th--right ast-col-lunar">Jarak (LD)</th>
                          <th className="ast-th ast-th--center ast-th-sortable ast-col-date" onClick={() => handleTblSort('date')}>
                            Tanggal <SortIndicator col="date" />
                          </th>
                          <th className="ast-th ast-th--center">Status</th>
                          <th className="ast-th ast-th--center">Simpan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paged.map((a, i) => (
                          <tr key={a.id} className={`ast-tr${a.is_potentially_hazardous ? ' ast-tr--danger' : ''}`}>
                            <td className="ast-td ast-td--num">{(page - 1) * PAGE_SIZE + i + 1}</td>
                            <td className="ast-td ast-td--name" title={cleanName(a.name)}>
                              {cleanName(a.name)}
                            </td>
                            <td className="ast-td ast-td--right ast-col-diam">
                              {formatDiam(a.estimated_diameter_km?.min, a.estimated_diameter_km?.max)}
                            </td>
                            <td className="ast-td ast-td--right">{formatVel(a.relative_velocity_kmh)}</td>
                            <td className="ast-td ast-td--right">{formatDist(a.miss_distance_km)}</td>
                            <td className="ast-td ast-td--right ast-col-lunar">
                              {parseFloat(a.miss_distance_lunar).toFixed(2)} LD
                            </td>
                            <td className="ast-td ast-td--center ast-col-date">{formatDate(a.close_approach_date)}</td>
                            <td className="ast-td ast-td--center">
                              {a.is_potentially_hazardous
                                ? <span className="ast-badge-danger">⚠ Berbahaya</span>
                                : <span className="ast-badge-safe">✓ Aman</span>
                              }
                            </td>
                            <td className="ast-td ast-td--center">
                              {user ? (
                                <button
                                  className={`ast-bm-btn${bmDates[a.close_approach_date] ? ' active' : ''}`}
                                  onClick={() => handleBm(a.close_approach_date)}
                                  disabled={!!bmLoad[a.close_approach_date]}
                                  title={bmDates[a.close_approach_date] ? 'Hapus bookmark' : 'Simpan'}
                                >
                                  {bmLoad[a.close_approach_date] ? <SpinSm /> : bmDates[a.close_approach_date] ? <BmSolid /> : <BmOutline />}
                                </button>
                              ) : (
                                <button className="ast-bm-btn" disabled title="Login untuk menyimpan">
                                  <BmOutline />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="ast-pagination">
                      <button className="ast-pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                      {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                        let pg = i + 1
                        if (totalPages > 7) {
                          if (page <= 4) pg = i + 1
                          else if (page >= totalPages - 3) pg = totalPages - 6 + i
                          else pg = page - 3 + i
                        }
                        return (
                          <button
                            key={pg}
                            className={`ast-pg-btn${page === pg ? ' active' : ''}`}
                            onClick={() => setPage(pg)}
                          >
                            {pg}
                          </button>
                        )
                      })}
                      <button className="ast-pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                      <span className="ast-pg-info">Halaman {page} dari {totalPages}</span>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Empty prompt (initial) ── */}
          {!loading && !fetched && !error && (
            <div className="ast-empty" style={{ paddingTop: 72 }}>
              <div className="ast-empty__icon">☄️</div>
              <div className="ast-empty__title">Mulai Pencarian</div>
              <p>Pilih rentang tanggal dan klik "Tampilkan Data" untuk melihat Near Earth Objects dari NASA.</p>
            </div>
          )}

        </div>
      </main>
    </PageShell>
  )
}

export default AsteroidPage
