import { Download, Eye, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { analysisHistory, patients } from '../data/mockData.js'
import {
  downloadAnalysisReport,
  toDisplayAnalysisId,
} from '../utils/reportGenerator.js'
import PageBackground from '../components/layout/PageBackground.jsx'

const stageStyles = {
  Normal: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Very Mild': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Mild: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Moderate: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const fallbackProbabilities = [
  { stage: 'Normal', probability: 4.2 },
  { stage: 'Very Mild', probability: 91.8 },
  { stage: 'Mild', probability: 3.1 },
  { stage: 'Moderate', probability: 0.9 },
]

function getPatient(analysis) {
  return patients.find((patient) => patient.id === analysis.patientId) ?? {
    ...analysis.patientDetails,
    name: analysis.patientDetails?.name ?? 'Unknown patient',
    patientId: analysis.patientDetails?.patientId ?? 'Unavailable',
  }
}

function Reports() {
  const navigate = useNavigate()

  function handleDownload(analysis, patient) {
    downloadAnalysisReport({
      analysis,
      patient,
      analysisId: toDisplayAnalysisId(analysis.id),
      stage: analysis.predictedStage,
      confidence: analysis.confidence,
      analysisDate: analysis.date,
      probabilities: analysis.probabilities ?? fallbackProbabilities,
    })
  }

  return (
    <PageBackground>
      <div className="mx-auto max-w-7xl space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
            Reports
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            View and download completed clinical AI analysis reports.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FileText size={17} className="text-blue-800" aria-hidden="true" />
          {analysisHistory.length} reports
        </div>
      </section>

      {analysisHistory.length === 0 ? (
        <section className="rounded-xl border border-white/60 bg-white/60 px-6 py-16 text-center shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md">
          <FileText size={36} className="mx-auto text-slate-300" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-blue-950">
            No reports yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Completed MRI analyses will appear here.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-white/60 bg-white/60 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-semibold tracking-tight text-blue-950">
              Analysis Reports
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Completed and reviewed MRI prediction results
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Patient</th>
                  <th className="px-4 py-3.5 font-semibold">Patient ID</th>
                  <th className="px-4 py-3.5 font-semibold">Analysis ID</th>
                  <th className="px-4 py-3.5 font-semibold">Predicted Stage</th>
                  <th className="px-4 py-3.5 font-semibold">Confidence</th>
                  <th className="px-4 py-3.5 font-semibold">Analysis Date</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {analysisHistory.map((analysis) => {
                  const patient = getPatient(analysis)
                  return (
                    <tr
                      key={analysis.id}
                      className="border-t border-slate-100 transition-colors hover:bg-slate-50/80"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                        {patient.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                        {patient.patientId}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-600">
                        {toDisplayAnalysisId(analysis.id)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${stageStyles[analysis.predictedStage]}`}
                        >
                          {analysis.predictedStage}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                        {analysis.confidence.toFixed(1)}%
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {analysis.date}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {analysis.status ?? 'Completed'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/analysis/${analysis.id}`)}
                            aria-label={`View results for ${patient.name}`}
                            title="View results"
                            className="inline-flex size-9 items-center justify-center rounded-lg text-blue-800 transition-colors hover:bg-blue-50 hover:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
                          >
                            <Eye size={18} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(analysis, patient)}
                            aria-label={`Download report for ${patient.name}`}
                            title="Download report"
                            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
                          >
                            <Download size={18} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
      </div>
    </PageBackground>
  )
}

export default Reports
