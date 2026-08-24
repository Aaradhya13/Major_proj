import { ArrowRight, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { recentPredictions } from '../../data/mockData.js'

const stageStyles = {
  Normal: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Very Mild': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Mild: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Moderate: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

function getInitials(patientName) {
  return patientName
    .split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
}

function RecentPredictions() {
  const navigate = useNavigate()

  return (
    <section className="flex min-h-64 flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-md sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-blue-950">
            Recent Predictions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest AI MRI analysis
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

      <div className="mt-6 flex-1">
        {recentPredictions.slice(0, 5).map((prediction, index) => (
          <div
            key={prediction.id}
            className={`flex min-h-20 items-center gap-3 py-4 transition-colors hover:bg-slate-50/80 sm:gap-4 ${
              index === 0 ? '' : 'border-t border-slate-100'
            }`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-900 ring-1 ring-inset ring-blue-100">
                {getInitials(prediction.patientName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 sm:text-[15px]">
                  {prediction.patientName}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {prediction.patientId}
                </p>
              </div>
            </div>

            <div className="w-28 shrink-0 sm:w-36">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${stageStyles[prediction.predictedStage]}`}
              >
                {prediction.predictedStage}
              </span>
              <p className="mt-1.5 text-xs font-medium text-slate-500">
                {prediction.confidence.toFixed(1)}% confidence
              </p>
            </div>

            <div className="hidden w-32 shrink-0 text-sm text-slate-600 md:block">
              {prediction.analysisDate}
            </div>

            <button
              type="button"
              onClick={() => navigate(`/analysis/${prediction.id}`)}
              aria-label={`View ${prediction.patientName} prediction`}
              title={`View ${prediction.patientName} prediction`}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-blue-800 transition-colors hover:bg-blue-50 hover:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
            >
              <Eye size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default RecentPredictions