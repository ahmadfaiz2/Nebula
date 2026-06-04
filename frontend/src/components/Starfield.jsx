import { useEffect, useRef } from 'react'

function Starfield({ density = 1, shooting = false }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf, w, h, stars = [], shoot = null, nextShoot = 0
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round((w * h) / 7000 * density)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * 0.02 + 0.004,
        tp: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        hue: Math.random() > 0.82 ? 'rgba(155,140,255,' : 'rgba(255,255,255,',
      }))
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        s.tp += s.tw
        const alpha = s.a + Math.sin(s.tp) * 0.25
        if (!reduce) { s.x += s.vx; s.y += s.vy }
        if (s.x < 0) s.x = w; if (s.x > w) s.x = 0
        if (s.y < 0) s.y = h; if (s.y > h) s.y = 0
        ctx.beginPath()
        ctx.fillStyle = s.hue + Math.max(0, alpha).toFixed(2) + ')'
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      if (shooting && !reduce) {
        if (!shoot && t > nextShoot) {
          shoot = { x: Math.random() * w * 0.6, y: Math.random() * h * 0.4, len: 0, life: 0 }
        }
        if (shoot) {
          shoot.life += 1
          shoot.len = Math.min(shoot.len + 14, 180)
          const ex = shoot.x + shoot.len, ey = shoot.y + shoot.len * 0.5
          const grad = ctx.createLinearGradient(shoot.x, shoot.y, ex, ey)
          grad.addColorStop(0, 'rgba(255,255,255,0)')
          grad.addColorStop(1, 'rgba(180,170,255,0.9)')
          ctx.strokeStyle = grad; ctx.lineWidth = 2
          ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(ex, ey); ctx.stroke()
          shoot.x += 9; shoot.y += 4.5
          if (shoot.life > 34 || shoot.x > w) { shoot = null; nextShoot = t + 3500 + Math.random() * 4000 }
        }
      }
      raf = requestAnimationFrame(frame)
    }

    resize()
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [density, shooting])

  return <canvas ref={ref} className="hp-starfield" aria-hidden="true" />
}

export default Starfield
