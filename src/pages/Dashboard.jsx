import {
  ArrowUpRight,
  BrainCircuit,
  ClipboardList,
  Gauge,
  Hospital,
  ScanLine,
  ShieldAlert,
  UsersRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import hospitalNeuralBg from '../assets/hospital-neural-bg.png'
import RecentActivity from '../components/dashboard/RecentActivity.jsx'
import RecentPredictions from '../components/dashboard/RecentPredictions.jsx'
import StageDistribution from '../components/dashboard/StageDistribution.jsx'
import { useAuth } from '../context/useAuth.js'
import { authApi } from '../services/api.js'
import { toFrontendAnalysis } from '../utils/analysisAdapter.js'

const statToneClasses = {
  blue: 'bg-slate-100/90 text-slate-700 ring-slate-200/80',
  teal: 'bg-slate-100/90 text-slate-700 ring-slate-200/80',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
}

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
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState([])
  const [dashboardStats, setDashboardStats] = useState(null)
  const [dashboardError, setDashboardError] = useState('')

  useEffect(() => {
    authApi.getDashboardStats().then((stats) => {
      setDashboardStats(stats)
      setAnalyses(stats.recent_predictions.map(toFrontendAnalysis))
    }).catch((requestError) => setDashboardError(requestError.message))
  }, [])

  const highRiskCount = dashboardStats?.high_risk_cases ?? 0
  const patientCount = dashboardStats?.total_patients ?? 0
  const todayCount = dashboardStats?.analyses_today ?? 0
  const totalAnalyses = dashboardStats?.total_analyses ?? 0
  const statistics = [
    { label: 'Total Patients', value: patientCount, trend: 'Registered in PostgreSQL', tone: 'blue', icon: UsersRound },
    { label: 'MRI Analyses', value: totalAnalyses, trend: `${todayCount} completed today`, tone: 'teal', icon: ScanLine },
    { label: 'High-Risk Cases', value: highRiskCount, trend: 'Saved Demented screening results', tone: 'rose', icon: ShieldAlert },
    { label: 'Analyses Today', value: todayCount, trend: 'Saved today in PostgreSQL', tone: 'emerald', icon: Gauge },
  ]
  const workflowMetrics = [
    {
      label: 'Total Analyses',
      value: totalAnalyses,
      detail: 'Saved MRI analysis records',
      icon: ScanLine,
      surface: 'bg-sky-50 text-sky-700 ring-sky-100',
    },
    {
      label: 'Analyses Today',
      value: todayCount,
      detail: 'Records created today',
      icon: BrainCircuit,
      surface: 'bg-teal-50 text-teal-700 ring-teal-100',
    },
    {
      label: 'High-Risk Cases',
      value: highRiskCount,
      detail: 'Demented stage 1 results',
      icon: ShieldAlert,
      surface: 'bg-rose-50 text-rose-700 ring-rose-100',
    },
    {
      label: 'Total Patients',
      value: patientCount,
      detail: 'Registered patient records',
      icon: UsersRound,
      surface: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    },
  ]

  return (
    <div
      className="relative isolate -m-4 min-h-[calc(100vh-5rem)] bg-cover bg-center bg-fixed bg-no-repeat p-4 sm:-mx-6 sm:-my-6 sm:p-6 lg:-mx-8 lg:-mb-10 lg:-mt-7 lg:p-8"
      style={{ backgroundImage: `url(${hospitalNeuralBg})`, backgroundAttachment: 'fixed' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/75" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-5 lg:p-6">
        {dashboardError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{dashboardError}</div>}
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
                Good morning, {user?.name ?? 'Doctor'}
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
                  {todayCount} analyses
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
              {workflowMetrics.slice(0, 3).map((item) => {
                const Icon = item.icon
                return (
                <div key={item.label} className="rounded-lg border border-white/60 bg-white/60 p-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] backdrop-blur-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${item.surface}`}>
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700">{item.label}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{item.detail}</p>
                      </div>
                    </div>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${item.surface}`}>
                      {item.value}
                    </span>
                  </div>
                </div>
                )
              })}
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
          <RecentPredictions analyses={analyses} />
          <StageDistribution analyses={analyses} stageDistribution={dashboardStats?.stage_distribution} totalAnalyses={totalAnalyses} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <article className="dashboard-card-rise rounded-2xl border border-white/60 bg-white/60 p-5 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-blue-950">
                Analysis Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Database-backed MRI workflow totals
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              <BrainCircuit size={14} aria-hidden="true" />
              Live stats
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {workflowMetrics.map((item) => {
              const Icon = item.icon
              return (
            <div key={item.label} className="rounded-lg border border-white/60 bg-white/60 px-4 py-3 shadow-[0_3px_12px_rgba(15,23,42,0.04)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900">
                  <Icon size={17} className="shrink-0 text-blue-800" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${item.surface}`}>
                  {item.value}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
            </div>
              )
            })}
          </div>
          </article>

          <RecentActivity analyses={analyses} />
        </section>
      </div>
    </div>
  )
}

export default Dashboard
