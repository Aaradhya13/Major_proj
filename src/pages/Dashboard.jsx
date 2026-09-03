import {
  ArrowUpRight,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileClock,
  Gauge,
  Hospital,
  ScanLine,
  ShieldAlert,
  UsersRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import hospitalNeuralBg from '../assets/hospital-neural-bg.png'
import RecentActivity from '../components/dashboard/RecentActivity.jsx'
import RecentPredictions from '../components/dashboard/RecentPredictions.jsx'
import StageDistribution from '../components/dashboard/StageDistribution.jsx'

const statistics = [
  {
    label: 'Total Patients',
    value: '248',
    trend: '+12 this month',
    tone: 'blue',
    icon: UsersRound,
  },
  {
    label: 'MRI Analyses',
    value: '1,842',
    trend: '36 completed today',
    tone: 'teal',
    icon: ScanLine,
  },
  {
    label: 'High Risk Cases',
    value: '18',
    trend: '4 awaiting review',
    tone: 'rose',
    icon: ShieldAlert,
  },
  {
    label: 'AI Model Accuracy',
    value: '94.7%',
    trend: 'Validated cohort',
    tone: 'emerald',
    icon: Gauge,
  },
]

const statToneClasses = {
  blue: 'bg-slate-100/90 text-slate-700 ring-slate-200/80',
  teal: 'bg-slate-100/90 text-slate-700 ring-slate-200/80',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
}

const careQueue = [
  {
    label: 'Critical review',
    value: '4',
    color: 'bg-rose-400',
    width: '72%',
    surface: 'bg-rose-50 text-rose-700 ring-rose-100',
  },
  {
    label: 'Pending upload QC',
    value: '7',
    color: 'bg-amber-400',
    width: '64%',
    surface: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  {
    label: 'Reports to sign',
    value: '11',
    color: 'bg-sky-500',
    width: '58%',
    surface: 'bg-sky-50 text-sky-700 ring-sky-100',
  },
]

const teamLoad = [
  { name: 'Neurology', value: 82 },
  { name: 'Radiology', value: 68 },
  { name: 'Memory Clinic', value: 54 },
]

function StatCard({ label, value, trend, tone, icon: Icon, index }) {
  return (
    <article
      className="dashboard-card-rise group rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/65 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.78rem] font-medium tracking-[0.02em] text-slate-600">{label}</p>
          <p className="mt-3 text-[2.15rem] font-semibold tracking-[-0.06em] text-slate-800 leading-none">
            {value}
          </p>
        </div>
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-300 group-hover:scale-105 ${statToneClasses[tone]}`}
        >
          <Icon size={20} strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-[0.72rem] font-medium text-slate-500">{trend}</p>
    </article>
  )
}

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div
      className="relative isolate -m-4 min-h-[calc(100vh-5rem)] bg-cover bg-center bg-fixed bg-no-repeat p-4 sm:-mx-6 sm:-my-6 sm:p-6 lg:-mx-8 lg:-mb-10 lg:-mt-7 lg:p-8"
      style={{ backgroundImage: `url(${hospitalNeuralBg})`, backgroundAttachment: 'fixed' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/75" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-5 lg:p-6">
        <section className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="relative overflow-hidden p-6 sm:p-8 lg:min-h-[25rem]">
            <div className="dashboard-soft-pulse absolute right-10 top-8 hidden h-28 w-28 rounded-full border border-blue-100 bg-blue-50/45 lg:block" />
            <div className="absolute right-20 top-20 hidden h-12 w-12 rounded-full border border-teal-100 bg-teal-50/60 lg:block" />
            <div className="absolute bottom-8 right-12 hidden grid-cols-3 gap-2 opacity-50 lg:grid">
              {Array.from({ length: 9 }).map((_, index) => (
                <span key={index} className="size-1.5 rounded-full bg-teal-300" />
              ))}
            </div>
            <div className="dashboard-card-rise relative max-w-3xl p-5 sm:p-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50/90 px-3 py-1 text-xs font-semibold text-teal-800">
                <Hospital size={14} aria-hidden="true" />
                Neuro care command center
              </span>
              <h2 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-blue-950 sm:text-5xl">
                Good morning, Dr. Sarah
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Monitor Alzheimer&apos;s MRI assessments, prioritize flagged
                cases, and keep clinical reporting moving from one workspace.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate('/analysis/new')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                >
                  New MRI Analysis
                  <ArrowUpRight size={17} strokeWidth={2.25} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/patients')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                >
                  <ClipboardList size={17} aria-hidden="true" />
                  Review Patient Queue
                </button>
              </div>
            </div>
          </div>

          <aside className="dashboard-card-rise relative m-5 overflow-hidden rounded-2xl border border-white/60 bg-white/60 p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md lg:m-6">
            <div className="absolute -right-10 -top-10 size-40 rounded-full bg-sky-100/60" />
            <div className="absolute -bottom-12 right-14 size-28 rounded-full bg-teal-100/60" />
            <div className="absolute left-6 top-24 h-24 w-24 rounded-full border border-blue-100/70" />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-700">Today</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-blue-950">
                  36 analyses
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Imaging workflow summary
                </p>
              </div>
              <div className="relative flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-900 ring-1 ring-blue-100">
                <BrainCircuit size={24} aria-hidden="true" />
              </div>
            </div>
            <div className="relative mt-6 space-y-3">
              {careQueue.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/60 bg-white/60 p-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] backdrop-blur-md">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${item.surface}`}>
                      {item.value}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200/50">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </aside>
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Clinical activity statistics">
          {statistics.map((statistic, index) => (
            <StatCard key={statistic.label} {...statistic} index={index} />
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
          <RecentPredictions />
          <StageDistribution />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <article className="dashboard-card-rise rounded-2xl border border-white/60 bg-white/60 p-5 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-blue-950">
                Care Team Load
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Active workload by service line
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle2 size={14} aria-hidden="true" />
              Stable
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {teamLoad.map((team) => (
              <div key={team.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{team.name}</span>
                  <span className="font-semibold text-slate-900">{team.value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-800 to-teal-500"
                    style={{ width: `${team.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/60 bg-white/60 px-4 py-3 shadow-[0_3px_12px_rgba(15,23,42,0.04)] backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CalendarClock size={17} className="text-blue-800" aria-hidden="true" />
                Next board review
              </div>
              <p className="mt-1 text-sm text-slate-500">Today, 14:30</p>
            </div>
            <div className="rounded-lg border border-white/60 bg-white/60 px-4 py-3 shadow-[0_3px_12px_rgba(15,23,42,0.04)] backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FileClock size={17} className="text-blue-800" aria-hidden="true" />
                Median report time
              </div>
              <p className="mt-1 text-sm text-slate-500">18 min after scan</p>
            </div>
          </div>
          </article>

          <RecentActivity />
        </section>
      </div>
    </div>
  )
}

export default Dashboard
