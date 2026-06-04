import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import AuthLayout from '../components/AuthLayout'
import FormInput from '../components/FormInput'
import Button from '../components/Button'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/v1/auth/login', form)
      login(res.data.data.user, res.data.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Selamat datang kembali"
      subtitle="Masuk untuk melanjutkan eksplorasi."
      footer={
        <>
          Belum punya akun?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
            Daftar di sini
          </Link>
        </>
      }
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormInput
          label="Email"
          name="email"
          type="email"
          placeholder="kamu@email.com"
          value={form.email}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Button type="submit" loading={loading}>
          Login
        </Button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
