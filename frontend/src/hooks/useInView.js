import { useState, useEffect, useRef } from 'react'

export function useInView(options = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold: 0.2, ...options })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}
