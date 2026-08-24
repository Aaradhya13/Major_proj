import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Download,
  ScanLine,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  analysisHistory,
  patients,
  recentPredictions,
} from '../data/mockData.js'
import {
  downloadAnalysisReport,
  toDisplayAnalysisId,
} from '../utils/reportGenerator.js'

const stageStyles = {
  Normal: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Very Mild': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Mild: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Moderate: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const probabilityStyles = {
  Normal: 'bg-emerald-400',
  'Very Mild': 'bg-blue-800',
  Mild: 'bg-amber-400',
  Moderate: 'bg-rose-400',
}

const requestedProbabilities = [
  { stage: 'Normal', probability: 4.2 },
  { stage: 'Very Mild', probability: 91.8 },
  { stage: 'Mild', probability: 3.1 },
  { stage: 'Moderate', probability: 0.9 },
]

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isPreviewableImage(file) {
  if (!file) {
    return false
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  return (
    file.type?.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)
  )
}

function PredictionResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isScanOpen, setIsScanOpen] = useState(false)
  const analysis = analysisHistory.find((item) => item.id === id)
  const recentPrediction = recentPredictions.find((item) => item.id === id)
  const patientId = analysis?.patientId ?? recentPrediction?.patientId
  const patient = patients.find((item) => item.id === patientId)
  const stage = analysis?.predictedStage ?? recentPrediction?.predictedStage ?? 'Very Mild'
  const confidence = analysis?.confidence ?? recentPrediction?.confidence ?? 91.8
  const analysisDate = analysis?.date ?? recentPrediction?.analysisDate ?? 'Aug 24, 2026'
  const status = analysis?.status ?? recentPrediction?.status ?? 'Reviewed'

  if (!patient) {
    return (
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 transition-colors hover:text-blue-950"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to Dashboard
        </button>
        <h1 className="mt-8 text-2xl font-semibold text-blue-950">
          Prediction result not found
        </h1>
      </div>
    )
  }

  const probabilities = analysis?.probabilities ?? (patient.id === 'patient-0184'
    ? requestedProbabilities
    : requestedProbabilities.map((item) => ({
        ...item,
        probability: item.stage === stage ? confidence : item.stage === 'Normal' ? 2.5 : 1.2,
      })))

  function downloadReport() {
    const displayAnalysisId = toDisplayAnalysisId(id)
    downloadAnalysisReport({
      analysis,
      patient,
      analysisId: displayAnalysisId,
      stage,
      confidence,
      analysisDate,
      probabilities,
    })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <button
        type="button"
        onClick={() => navigate(`/patients/${patient.id}`)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 transition-colors hover:text-blue-950"
      >
        <ArrowLeft size={17} strokeWidth={2} aria-hidden="true" />
        Back to Patient Details
      </button>

      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
          MRI Prediction Result
        </h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          AI-assisted analysis of {patient.name}&apos;s MRI scan
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-md sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Predicted Alzheimer&apos;s Stage
              </p>
              <span
                className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${stageStyles[stage]}`}
              >
                {stage}
              </span>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
              <Brain size={21} aria-hidden="true" />
            </div>
          </div>
          <div className="mt-7">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">Confidence</span>
              <span className="text-xl font-semibold text-blue-950">
                {confidence.toFixed(1)}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-700"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
          <dl className="mt-7 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-slate-500">Analysis ID</dt>
              <dd className="mt-1.5 text-sm font-semibold text-slate-700">
                {toDisplayAnalysisId(id)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Analysis Date</dt>
              <dd className="mt-1.5 text-sm font-semibold text-slate-700">
                {analysisDate}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Status</dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <CheckCircle2 size={15} className="text-emerald-600" aria-hidden="true" />
                {status}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-md sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-blue-950">
                MRI Scan
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Source scan used for this prediction
              </p>
            </div>
            <ScanLine size={20} className="text-blue-800" aria-hidden="true" />
          </div>
          <div className="mt-6 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-blue-100 text-blue-800">
              <Brain size={28} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-700">
              MRI scan visualization
            </p>
            {analysis?.file && (
              <p className="mt-1 text-xs text-slate-400">
                {analysis.file.name} · {formatFileSize(analysis.file.size)}
              </p>
            )}
            <button
              type="button"
              onClick={() => setIsScanOpen(true)}
              className="mt-4 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-blue-800 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
            >
              View Full Scan
            </button>
          </div>
        </article>
      </section>

      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-md sm:p-7">
        <h2 className="text-lg font-semibold tracking-tight text-blue-950">
          AI Assessment
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
          The AI analysis detected patterns consistent with a {stage} stage.
          The result suggests early structural changes and should be considered
          alongside clinical evaluation and patient history.
        </p>
        {analysis?.notes && (
          <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            <span className="font-semibold text-slate-700">Clinical notes:</span>{' '}
            {analysis.notes}
          </p>
        )}
        <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">
          AI-generated assessment. This result is intended to support, not
          replace, clinical judgment.
        </p>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-md sm:p-7">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-blue-950">
            Stage Probability Breakdown
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Model confidence across Alzheimer&apos;s disease stages
          </p>
        </div>
        <div className="mt-6 space-y-6">
          {probabilities.map((item) => (
            <div key={item.stage}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`font-medium ${item.stage === stage ? 'text-blue-950' : 'text-slate-600'}`}
                  >
                    {item.stage}
                  </span>
                  {item.stage === stage && (
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
                      Highest probability
                    </span>
                  )}
                </div>
                <span className="shrink-0 font-semibold text-slate-700">
                  {item.probability.toFixed(1)}%
                </span>
              </div>
              <div
                className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label={`${item.stage} probability`}
                aria-valuenow={item.probability}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  className={`h-full rounded-full ${probabilityStyles[item.stage]}`}
                  style={{ width: `${item.probability}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={downloadReport}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        >
          <Download size={17} aria-hidden="true" />
          Download Report
        </button>
        <button
          type="button"
          onClick={() => navigate('/analysis/new')}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        >
          Start New Analysis
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>

      {isScanOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 sm:p-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsScanOpen(false)
            }
          }}
        >
          <div
            className="relative max-h-full w-full max-w-4xl overflow-auto rounded-xl bg-white p-5 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scan-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 id="scan-modal-title" className="text-lg font-semibold text-blue-950">
                  MRI Scan
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {analysis?.file?.name ?? 'Uploaded scan'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsScanOpen(false)}
                aria-label="Close MRI scan"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5 flex min-h-72 items-center justify-center rounded-lg bg-slate-50 p-4 sm:min-h-[28rem]">
              {analysis?.previewUrl && isPreviewableImage(analysis.file) ? (
                <img
                  src={analysis.previewUrl}
                  alt={`MRI scan for ${patient.name}`}
                  className="max-h-[min(70vh,36rem)] max-w-full rounded-lg object-contain"
                />
              ) : (
                <div className="max-w-md text-center">
                  <Brain size={42} className="mx-auto text-slate-300" aria-hidden="true" />
                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    This scan cannot be previewed directly.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {analysis?.file?.name
                      ? `${analysis.file.name} is available, but this file format does not support an in-browser image preview.`
                      : 'No preview image is available for this mock analysis.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PredictionResult
