import {
  ArrowRight,
  CheckCircle2,
  Eye,
  LoaderCircle,
  MessageSquareCheck,
  Percent,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageBackground from '../components/layout/PageBackground.jsx'
import { authApi } from '../services/api.js'
import { toDisplayAnalysisId } from '../utils/reportGenerator.js'

const stageStyles = {
  Normal: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Very Mild': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Mild: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Moderate: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

function formatReviewDate(timestamp) {
  if (!timestamp) return 'Unavailable'
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(timestamp))
  } catch {
    return 'Unavailable'
  }
}

function StatCard({ label, value, detail, tone = 'blue', icon: Icon }) {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-800 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  }

  return (
    <article className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.78rem] font-medium tracking-[0.02em] text-slate-600">{label}</p>
          <p className="mt-2.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
        </div>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${toneClasses[tone]}`}>
          <Icon size={19} strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-[0.75rem] font-medium text-slate-500">{detail}</p>
    </article>
  )
}

function ClinicalFeedback() {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'correct' | 'incorrect'

  async function refreshReviews() {
    setIsLoading(true)
    setError('')
    try {
      const data = await authApi.getAnalysisReviews()
      setReviews(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load clinical feedback.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    authApi.getAnalysisReviews()
      .then((data) => {
        if (active) setReviews(Array.isArray(data) ? data : [])
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load clinical feedback.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [])

  // Calculate real database-backed summary statistics
  const totalReviews = reviews.length
  const correctCount = reviews.filter((item) => item.is_correct === true).length
  const incorrectCount = reviews.filter((item) => item.is_correct === false).length
  const agreementRate = totalReviews > 0 ? ((correctCount / totalReviews) * 100).toFixed(1) + '%' : '0%'

  // Filtered reviews based on search query and status filter
  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      // Status filter
      if (filterStatus === 'correct' && item.is_correct !== true) return false
      if (filterStatus === 'incorrect' && item.is_correct !== false) return false

      // Search query (patient name, analysis id, patient id, doctor name, remarks)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = item.patient_name?.toLowerCase().includes(query)
        const matchesAnalysis = item.analysis_id?.toLowerCase().includes(query)
        const matchesPatientId = item.patient_id?.toLowerCase().includes(query)
        const matchesRemarks = item.remarks?.toLowerCase().includes(query)
        const matchesDoctor = item.doctor_name?.toLowerCase().includes(query)
        return (
          matchesName ||
          matchesAnalysis ||
          matchesPatientId ||
          matchesRemarks ||
          matchesDoctor
        )
      }
      return true
    })
  }, [reviews, filterStatus, searchQuery])

  return (
    <PageBackground>
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
              Clinical Feedback
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Review and track clinical assessments of AI predictions.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button
              type="button"
              onClick={refreshReviews}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
              Refresh
            </button>
            <span className="text-slate-400">·</span>
            <div className="flex items-center gap-1.5">
              <MessageSquareCheck size={16} className="text-blue-800" aria-hidden="true" />
              <span>{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
            </div>
          </div>
        </section>

        {/* Summary Statistics Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Review statistics">
          <StatCard
            label="Total Reviews"
            value={totalReviews}
            detail="Stored in PostgreSQL"
            tone="blue"
            icon={MessageSquareCheck}
          />
          <StatCard
            label="AI Confirmed"
            value={correctCount}
            detail="Marked correct by doctor"
            tone="emerald"
            icon={CheckCircle2}
          />
          <StatCard
            label="AI Disputed"
            value={incorrectCount}
            detail="Marked incorrect by doctor"
            tone="rose"
            icon={XCircle}
          />
          <StatCard
            label="Agreement Rate"
            value={agreementRate}
            detail="Clinical concordance"
            tone="indigo"
            icon={Percent}
          />
        </section>

        {/* Search and Filters */}
        <section className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name or analysis ID..."
              className="w-full rounded-xl border border-slate-200 bg-white/90 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === 'all'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Reviews ({totalReviews})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('correct')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === 'correct'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              ✓ Correct ({correctCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('incorrect')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === 'incorrect'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-800'
              }`}
            >
              ✕ Incorrect ({incorrectCount})
            </button>
          </div>
        </section>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/60 py-20 backdrop-blur-md">
            <LoaderCircle className="size-8 animate-spin text-blue-800" aria-label="Loading clinical feedback" />
            <p className="mt-3 text-sm font-medium text-slate-500">Loading clinical feedback...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 p-8 text-center backdrop-blur-md" role="alert">
            <XCircle size={36} className="mx-auto text-rose-500" aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-rose-950">Unable to load clinical feedback</h2>
            <p className="mt-1 text-sm text-rose-700">{error}</p>
            <button
              type="button"
              onClick={refreshReviews}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <section className="rounded-2xl border border-white/60 bg-white/60 px-6 py-20 text-center shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-800 ring-1 ring-blue-100">
              <MessageSquareCheck size={28} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-blue-950">No clinical feedback yet</h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
              Doctor reviews submitted after AI analyses will appear here.
            </p>
            <button
              type="button"
              onClick={() => navigate('/analysis/new')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              Start New Analysis
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </section>
        ) : filteredReviews.length === 0 ? (
          <section className="rounded-2xl border border-white/60 bg-white/60 px-6 py-16 text-center shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md">
            <p className="text-base font-semibold text-slate-700">No matching reviews found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search query or switching filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setFilterStatus('all')
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50"
            >
              Reset Filters
            </button>
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-slate-50/90 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Patient</th>
                    <th className="px-4 py-3.5 font-semibold">AI Prediction</th>
                    <th className="px-4 py-3.5 font-semibold">Doctor Review</th>
                    <th className="px-4 py-3.5 font-semibold">Doctor&apos;s Remarks</th>
                    <th className="px-4 py-3.5 font-semibold">Reviewed By</th>
                    <th className="px-4 py-3.5 font-semibold">Reviewed On</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((item) => {
                    const stage = item.predicted_stage || item.stage || 'Normal'
                    const stageBadge = stageStyles[stage] || stageStyles.Normal

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100/90 transition-colors hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">{item.patient_name}</div>
                          <div className="text-xs text-slate-500">
                            {item.patient_id} · {toDisplayAnalysisId(item.analysis_id)}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-slate-800">{item.final_prediction}</span>
                            <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${stageBadge}`}>
                              {stage}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                              item.is_correct
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                            }`}
                          >
                            {item.is_correct ? (
                              <CheckCircle2 size={13} className="shrink-0" aria-hidden="true" />
                            ) : (
                              <XCircle size={13} className="shrink-0" aria-hidden="true" />
                            )}
                            {item.is_correct ? 'Correct' : 'Incorrect'}
                          </span>
                        </td>

                        <td className="max-w-[18rem] px-4 py-4">
                          {item.remarks ? (
                            <p className="truncate text-xs leading-5 text-slate-700" title={item.remarks}>
                              &ldquo;{item.remarks}&rdquo;
                            </p>
                          ) : (
                            <span className="text-xs italic text-slate-400">No remarks</span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs font-medium text-slate-700">
                          {item.doctor_name || 'Dr. Sarah Mitchell'}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                          {formatReviewDate(item.updated_at || item.created_at)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/analysis/${item.analysis_id}`)}
                            title={`View review for ${item.patient_name}`}
                            aria-label={`View review for ${item.patient_name}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
                          >
                            <Eye size={14} aria-hidden="true" />
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500">
              Showing {filteredReviews.length} of {totalReviews} clinical assessments recorded in PostgreSQL
            </div>
          </section>
        )}
      </div>
    </PageBackground>
  )
}

export default ClinicalFeedback
