import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">

      {/* Panel Kiri — Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1600&auto=format&fit=crop')",
          }}
        />
        {/* Overlay tipis supaya teks terbaca */}
        <div className="absolute inset-0 bg-[#0a0a0f]/50" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-lg text-cyan-400">✦</span>
            <span className="text-xl font-semibold tracking-wide">Nebula</span>
          </Link>

          <div>
            <h2 className="text-4xl font-bold leading-snug mb-3">
              Jelajahi alam semesta<br />dari layar kamu.
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              Foto astronomi harian, pelacak ISS real-time, asteroid dekat Bumi,
              dan citra Bumi dari luar angkasa.
            </p>
          </div>
        </div>
      </div>

      {/* Garis pemisah */}
      <div className="hidden lg:block w-px bg-white/[0.06]" />

      {/* Panel Kanan — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Logo mobile */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-10 text-white">
            <span className="text-cyan-400">✦</span>
            <span className="text-xl font-semibold">Nebula</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white mb-1.5">{title}</h1>
            <p className="text-slate-500 text-sm">{subtitle}</p>
          </div>

          {children}

          <p className="text-slate-600 mt-7 text-center text-sm">{footer}</p>
        </motion.div>
      </div>

    </div>
  )
}

export default AuthLayout
