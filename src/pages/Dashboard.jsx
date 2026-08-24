import { ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import RecentActivity from '../components/dashboard/RecentActivity.jsx'
import RecentPredictions from '../components/dashboard/RecentPredictions.jsx'
import StageDistribution from '../components/dashboard/StageDistribution.jsx'

const statistics = [
  { label: 'Total Patients', value: '248' },
  { label: 'MRI Analyses', value: '1,842' },
  { label: 'High Risk Cases', value: '18' },
  { label: 'AI Model Accuracy', value: '94.7%' },
]

function StatCard({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-blue-950">
        {value}
      </p>
    </article>
  )
}

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-700">Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
            Good morning, Dr. Sarah
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Here&apos;s an overview of your clinical activity today.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/new-analysis')}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        >
          New MRI Analysis
          <ArrowUpRight size={17} strokeWidth={2.25} aria-hidden="true" />
        </button>
      </section>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Clinical activity statistics"
      >
        {statistics.map((statistic) => (
          <StatCard key={statistic.label} {...statistic} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <RecentPredictions />
        <StageDistribution />
        <RecentActivity />
      </section>
    </div>
  )
}

export default Dashboard
