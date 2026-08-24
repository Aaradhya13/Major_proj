import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

function getPageDetails(pathname) {
  if (pathname === '/' || pathname === '/dashboard') {
    return {
      title: 'Dashboard',
      subtitle: 'Overview of your clinical AI insights and patient activity.',
    }
  }

  if (pathname === '/patients') {
    return { title: 'Patients' }
  }

  if (pathname.startsWith('/patients/')) {
    return { title: 'Patient Details' }
  }

  if (pathname === '/new-analysis' || pathname === '/analysis/new') {
    return { title: 'New Analysis' }
  }

  if (pathname.startsWith('/analysis/')) {
    return { title: 'Prediction Results' }
  }

  if (pathname === '/history') {
    return { title: 'Prediction History' }
  }

  if (pathname === '/reports') {
    return { title: 'Reports' }
  }

  if (pathname === '/settings') {
    return { title: 'Settings' }
  }

  return { title: 'NeuroVision AI' }
}

function Header() {
  const { pathname } = useLocation()
  const { title, subtitle } = getPageDetails(pathname)

  return (
    <header className="flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight text-blue-950 sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 hidden truncate text-sm text-slate-500 sm:block">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Search"
          className="flex size-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-blue-900"
        >
          <Search size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-blue-900"
        >
          <Bell size={20} strokeWidth={2} aria-hidden="true" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-blue-700" />
        </button>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-900">
            DS
          </div>
          <span className="hidden text-sm font-medium text-slate-700 md:block">
            Dr. Sarah
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header
