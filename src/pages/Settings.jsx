import PageBackground from '../components/layout/PageBackground.jsx'
import { useEffect, useState } from 'react'
import { authApi } from '../services/api.js'
import { useAuth } from '../context/useAuth.js'

function Settings() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '' })
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    authApi.profile().then((currentUser) => setProfile({ name: currentUser.name, email: currentUser.email })).catch((requestError) => setError(requestError.message))
  }, [])

  async function saveProfile(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const updatedUser = await authApi.updateProfile(profile)
      updateUser(updatedUser)
      setMessage('Profile saved.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function savePassword(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      await authApi.changePassword(passwords)
      setPasswords({ current_password: '', new_password: '' })
      setMessage('Password changed.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <PageBackground>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold text-slate-950">Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your NeuroVision account.</p>
        {message && <p className="mt-4 text-sm text-emerald-700" role="status">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
        <form className="mt-6 rounded-2xl border border-white/70 bg-white/90 p-6 shadow-lg" onSubmit={saveProfile}>
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">Name<input className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /></label>
            <label className="text-sm font-medium text-slate-700">Email<input className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required /></label>
          </div>
          <button className="mt-5 rounded-lg bg-blue-950 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800" type="submit">Save profile</button>
        </form>
        <form className="mt-5 rounded-2xl border border-white/70 bg-white/90 p-6 shadow-lg" onSubmit={savePassword}>
          <h2 className="text-lg font-semibold text-slate-900">Password</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">Current password<input className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3" type="password" value={passwords.current_password} onChange={(event) => setPasswords({ ...passwords, current_password: event.target.value })} required /></label>
            <label className="text-sm font-medium text-slate-700">New password<input className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3" type="password" minLength="8" value={passwords.new_password} onChange={(event) => setPasswords({ ...passwords, new_password: event.target.value })} required /></label>
          </div>
          <button className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50" type="submit">Change password</button>
        </form>
      </div>
    </PageBackground>
  )
}

export default Settings
