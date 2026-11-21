import { Eye, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageBackground from '../components/layout/PageBackground.jsx'
import { authApi } from '../services/api.js'
import { toFrontendAnalysis } from '../utils/analysisAdapter.js'

const stageStyles = { Normal: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', 'Very Mild': 'bg-sky-50 text-sky-700 ring-sky-600/20', Mild: 'bg-amber-50 text-amber-700 ring-amber-600/20', Moderate: 'bg-rose-50 text-rose-700 ring-rose-600/20' }

function History() {
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    authApi.getAnalyses().then((records) => setAnalyses(records.map(toFrontendAnalysis))).catch((requestError) => setError(requestError.message)).finally(() => setIsLoading(false))
  }, [])
  return <PageBackground><div className="mx-auto max-w-7xl space-y-7"><section><h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">Prediction History</h1><p className="mt-2 text-sm text-slate-500 sm:text-base">Review completed MRI analyses across your clinical workspace.</p></section>{isLoading ? <div className="flex justify-center rounded-xl border border-white/60 bg-white/60 py-16"><LoaderCircle className="animate-spin text-blue-800" aria-label="Loading analyses" /></div> : error ? <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">{error}</div> : analyses.length === 0 ? <div className="rounded-xl border border-white/60 bg-white/60 px-6 py-16 text-center text-sm text-slate-500">No analyses yet.</div> : <section className="overflow-hidden rounded-xl border border-white/60 bg-white/60 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5 font-semibold">Patient</th><th className="px-4 py-3.5 font-semibold">Analysis ID</th><th className="px-4 py-3.5 font-semibold">Predicted Stage</th><th className="px-4 py-3.5 font-semibold">Decision Score</th><th className="px-4 py-3.5 font-semibold">Date</th><th className="px-4 py-3.5 font-semibold">Status</th><th className="px-5 py-3.5 text-right font-semibold">Action</th></tr></thead><tbody>{analyses.map((analysis) => <tr key={analysis.id} className="border-t border-slate-100 hover:bg-slate-50/80"><td className="px-5 py-4 font-medium text-slate-800">{analysis.patientDetails.name}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{analysis.id}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${stageStyles[analysis.predictedStage]}`}>{analysis.predictedStage}</span></td><td className="px-4 py-4 font-medium text-slate-700">{analysis.stage1DecisionScore.toFixed(4)}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{analysis.date}</td><td className="px-4 py-4 text-slate-600">{analysis.status}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => navigate(`/analysis/${analysis.id}`)} aria-label={`View ${analysis.patientDetails.name} prediction`} className="inline-flex size-9 items-center justify-center rounded-lg text-blue-800 hover:bg-blue-50 hover:text-blue-950"><Eye size={18} aria-hidden="true" /></button></td></tr>)}</tbody></table></div></section>}</div></PageBackground>
}

export default History
