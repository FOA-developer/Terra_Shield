import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [coldStart, setColdStart] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)
    try {
      await login(username, password, { onSlow: setColdStart })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Sign in failed. Check your credentials and try again.')
    } finally {
      setLoading(false)
      setColdStart(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Desktop hero panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-forest-900 p-11 lg:flex">
        <div
          className="absolute inset-0 opacity-75"
          style={{ background: 'repeating-linear-gradient(100deg,#12382a 0 30px,#0b1f17 30px 60px)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg,rgba(15,45,33,0.55),rgba(7,35,26,0.95))' }}
        />
        <div className="relative">
          <Logo variant="light" />
        </div>
        <div className="relative max-w-md">
          <div className="text-[40px] font-bold leading-tight tracking-tight text-white">
            Risk visibility across every kilometre you are responsible for.
          </div>
          <div className="mt-4.5 text-base leading-relaxed text-forest-100">
            128 monitored segments across 5 pipelines in the Niger Delta, scored and ranked every night.
          </div>
        </div>
        <div className="relative font-mono text-[11px] tracking-wide text-forest-200">
          [ MOODY PIPELINE INFRASTRUCTURE PHOTO — DROP IMAGE HERE ]
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-white px-5.5 py-9 lg:p-12">
        <div className="w-full max-w-[396px]">
          <div className="mb-8.5 flex items-center gap-2.5 lg:hidden">
            <Logo />
          </div>

          <div className="text-[27px] font-bold tracking-tight text-forest-800">Sign in</div>
          <div className="mt-2 text-[15px] text-gray-500">Secure access to your pipeline risk intelligence.</div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-6.5 flex h-13 w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-gray-900"
          >
            <span className="inline-block h-4.5 w-4.5 rounded-full border-[3px] border-forest-600" />
            Sign in with Google
          </button>

          <div className="my-5.5 flex items-center gap-3 font-mono text-xs text-gray-400">
            <div className="h-px flex-1 bg-gray-200" />OR<div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="grid gap-3.5">
            <div>
              <div className="mb-1.5 text-[13px] font-semibold text-gray-700">Username</div>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-username"
                className="h-13 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-[15px] text-gray-900 outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <div className="text-[13px] font-semibold text-gray-700">Password</div>
                <a href="#forgot" className="text-[13px]">Forgot password?</a>
              </div>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="h-13 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-[15px] text-gray-900 outline-none focus:border-forest-600"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
                {error}
              </div>
            )}
            {loading && coldStart && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-[13px] text-forest-700">
                Waking up the server, this can take up to a minute…
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1.5 h-[54px] w-full rounded-xl border border-forest-600 bg-forest-600 text-base font-bold text-white disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5.5 text-center text-[13px] text-gray-500">
            Not registered? <a href="#request">Request access</a> · <Link to="/">Back to site</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
