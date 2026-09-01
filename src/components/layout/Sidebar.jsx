import {
  Activity,
  Bell,
  FileBarChart,
  History,
  LayoutDashboard,
  LogOut,
  ScanLine,
  Search,
  Settings,
  UsersRound,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Patients', path: '/patients', icon: UsersRound },
  { label: 'New Analysis', path: '/analysis/new', icon: ScanLine },
  { label: 'Prediction History', path: '/history', icon: History },
  { label: 'Reports', path: '/reports', icon: FileBarChart },
  { label: 'Settings', path: '/settings', icon: Settings },
]

function Sidebar({
  doctorName = 'Dr. Sarah Mitchell',
  doctorRole = 'Neurology Department',
  onLogout,
}) {
  const initials = doctorName
    .split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)

  return (
    <aside className="border-b border-white/70 bg-white/82 px-3 py-2.5 shadow-[0_14px_45px_rgba(14,116,144,0.08)] backdrop-blur-2xl sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-[13rem] shrink-0 items-center gap-2.5 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-950 to-slate-900 px-2.5 py-2 text-white shadow-sm">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/15">
              <Activity size={18} strokeWidth={2.25} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="whitespace-nowrap text-[0.98rem] font-semibold tracking-tight">
                NeuroVision AI
              </p>
              <p className="mt-0.5 whitespace-nowrap text-[10px] text-blue-100/80">
                Clinical Decision Support
              </p>
            </div>
          </div>

          <nav
            className="flex min-w-0 flex-1 items-center justify-center gap-1.5"
            aria-label="Primary navigation"
          >
            {navigationItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/dashboard'}
                className={({ isActive }) =>
                  `group inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[0.77rem] font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50/95 text-blue-950 shadow-sm ring-1 ring-inset ring-blue-100'
                      : 'text-slate-600 hover:bg-white/85 hover:text-blue-900 hover:ring-1 hover:ring-inset hover:ring-blue-100'
                  }`
                }
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white/75 text-current ring-1 ring-inset ring-slate-100 transition-transform group-hover:scale-105">
                  <Icon size={14} strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="whitespace-nowrap">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Search"
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
            >
              <Search size={16} strokeWidth={2} aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
            >
              <Bell size={16} strokeWidth={2} aria-hidden="true" />
              <span className="absolute right-2 top-2 block size-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2.5 rounded-xl bg-white/76 px-2.5 py-1.5 shadow-sm ring-1 ring-slate-200 backdrop-blur-xl">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-950 ring-2 ring-white">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="whitespace-nowrap text-[0.75rem] font-semibold text-slate-900">
                  {doctorName}
                </p>
                <p className="whitespace-nowrap text-[10px] text-slate-500">
                  {doctorRole}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Logout"
              title="Logout"
              className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white/76 text-slate-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              <LogOut size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
