function Button({ children, loading, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium
                 py-3 rounded-lg transition-colors duration-200
                 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? 'Memproses...' : children}
    </button>
  )
}

export default Button
