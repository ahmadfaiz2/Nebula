import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import AuthLayout from '../components/AuthLayout'
import FormInput from '../components/FormInput'
import Button from '../components/Button'

function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
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
      const res = await api.post('/v1/auth/register', form)
      login(res.data.data.user, res.data.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Buat akun baru"
      subtitle="Mulai perjalananmu menjelajahi luar angkasa."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
            Login di sini
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
          label="Nama"
          name="name"
          type="text"
          placeholder="Nama lengkap"
          value={form.name}
          onChange={handleChange}
          required
        />
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
          placeholder="Minimal 8 karakter"
          value={form.password}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Konfirmasi Password"
          name="password_confirmation"
          type="password"
          placeholder="Ulangi password"
          value={form.password_confirmation}
          onChange={handleChange}
          required
        />
        <Button type="submit" loading={loading}>
          Register
        </Button>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
