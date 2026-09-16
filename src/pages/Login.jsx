import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import hospitalNeuralBg from '../assets/hospital-neural-bg.png'
import { useAuth } from '../context/useAuth.js'

function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('sarah.mitchell@neurovision.ai')
  const [password, setPassword] = useState('NeuroVision123!')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) return <Navigate to={location.state?.from ?? '/dashboard'} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login({ email, password })
      navigate(location.state?.from ?? '/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-6"
      style={{ backgroundImage: `url(${hospitalNeuralBg})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(239,248,250,0.94)_0%,rgba(239,248,250,0.78)_42%,rgba(15,54,79,0.58)_100%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(125,211,252,0.22),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.16),rgba(226,242,246,0.34))]" aria-hidden="true" />

      <section className="relative z-10 w-full max-w-[27rem] overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_24px_70px_rgba(15,54,79,0.24)] backdrop-blur-md">
        <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-700 to-blue-950" aria-hidden="true" />
        <div className="p-6 sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-950 text-sm font-bold text-white shadow-sm ring-4 ring-blue-100">
              NV
            </div>
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-blue-700">NeuroVision AI</p>
              <p className="mt-1 text-xs text-slate-500">Clinical Decision Support</p>
            </div>
          </div>

          <h1 className="text-[1.8rem] font-semibold tracking-tight text-slate-950">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to access your clinical workspace.</p>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Password
              <input
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
            <button
              className="h-12 w-full rounded-xl bg-blue-950 px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(23,37,84,0.18)] transition-colors hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default Login