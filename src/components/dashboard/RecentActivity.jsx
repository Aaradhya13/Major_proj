import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle,
  FileText,
  UserPlus,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { recentActivities } from '../../data/mockData.js'

const activityIcons = {
  'analysis-completed': Brain,
  'high-risk-detected': AlertTriangle,
  'patient-added': UserPlus,
  'prediction-reviewed': CheckCircle,
  'report-generated': FileText,
}

const activityIconStyles = {
  'analysis-completed': 'bg-blue-50 text-blue-700',
  'high-risk-detected': 'bg-rose-50 text-rose-700',
  'patient-added': 'bg-emerald-50 text-emerald-700',
  'prediction-reviewed': 'bg-teal-50 text-teal-700',
  'report-generated': 'bg-amber-50 text-amber-700',
}

function RecentActivity() {
  const navigate = useNavigate()

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-md sm:p-7 xl:col-span-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-blue-950">
            Recent Activity
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest updates from your clinical workspace
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-50 hover:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
        >
          <span className="hidden sm:inline">View All</span>
          <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      <ul className="mt-6">
        {recentActivities.map((activity, index) => {
          const Icon = activityIcons[activity.type]

          return (
            <li
              key={activity.id}
              className={`${index === 0 ? '' : 'border-t border-slate-100'} transition-colors hover:bg-slate-50/80`}
            >
              <div className="flex min-h-20 items-start gap-3 py-4 sm:gap-4">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${activityIconStyles[activity.type]}`}
                >
                  <Icon size={19} strokeWidth={2} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 sm:text-[15px]">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {activity.description}
                  </p>
                </div>
                <time className="shrink-0 pt-0.5 text-xs font-medium text-slate-400 sm:text-sm">
                  {activity.timestamp}
                </time>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default RecentActivity