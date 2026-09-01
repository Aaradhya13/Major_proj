import { Bell, Search } from 'lucide-react'

function Header() {
  return (
    <header className="border-b border-slate-200/80 bg-white/75 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-3">
        <label className="relative block w-full max-w-4xl">
          <span className="sr-only">Search workspace</span>
          <Search
            size={18}
            strokeWidth={2}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Search patients, reports, analysis IDs..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
          >
            <Bell size={20} strokeWidth={2} aria-hidden="true" />
            <span className="absolute right-3 top-3 block size-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
