import {
  Activity,
  FileBarChart,
  History,
  LayoutDashboard,
  LogOut,
  ScanLine,
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
]

function Sidebar({
  doctorName = 'Dr. Sarah Mitchell',
  doctorRole = 'Neurologist',
  onLogout,
}) {
  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-slate-200 bg-white px-4 py-6 text-slate-700">
      <div className="flex items-center gap-3 px-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-900 text-white">
          <Activity size={24} strokeWidth={2.25} aria-hidden="true" />
        </div>
        <div>
          <p className="text-base font-semibold tracking-tight text-blue-950">
            NeuroVision AI
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Clinical Decision Support
          </p>
        </div>
      </div>

      <nav className="mt-10 flex-1" aria-label="Primary navigation">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>
        <div className="mt-3 space-y-1">
          {navigationItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
                }`
              }
            >
              <Icon size={19} strokeWidth={2} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="my-6 border-t border-slate-100" />
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`
          }
        >
          <Settings size={19} strokeWidth={2} aria-hidden="true" />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-900">
            {doctorName
              .split(' ')
              .map((namePart) => namePart[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {doctorName}
            </p>
            <p className="truncate text-xs text-slate-500">{doctorRole}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={19} strokeWidth={2} aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
