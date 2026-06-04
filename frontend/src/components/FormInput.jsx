function FormInput({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        {...props}
        className="bg-white/[0.04] text-white placeholder-slate-600 px-4 py-3 rounded-lg
                   border border-white/10 outline-none transition-all duration-200
                   focus:border-cyan-500/60 focus:bg-white/[0.06]"
      />
    </div>
  )
}

export default FormInput
