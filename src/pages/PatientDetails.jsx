import { ArrowLeft, Eye, Plus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { analysisHistory, patients } from '../data/mockData.js'

const stageStyles = {
  Normal: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Very Mild': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Mild: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Moderate: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const riskLevels = {
  Normal: 'Low Risk',
  'Very Mild': 'Low Risk',
  Mild: 'Moderate Risk',
  Moderate: 'High Risk',
}

function getInitials(name) {
  return name
    .split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
}

function InfoCard({ label, value, stage }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {stage ? (
        <span
          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${stageStyles[value]}`}
        >
          {value}
        </span>
      ) : (
        <p className="mt-2 truncate text-base font-semibold text-blue-950">
          {value}
        </p>
      )}
    </article>
  )
}

function PatientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const patient = patients.find((item) => item.id === id)
  const patientAnalyses = analysisHistory.filter(
    (analysis) => analysis.patientId === id,
  )

  if (!patient) {
    return (
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate('/patients')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:text-blue-950"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to Patients
        </button>
        <h1 className="mt-8 text-2xl font-semibold text-blue-950">
          Patient not found
        </h1>
      </div>
    )
  }

  const latestAnalysis = patientAnalyses[0]
  const firstAnalysis = patientAnalyses[patientAnalyses.length - 1]

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <button
        type="button"
        onClick={() => navigate('/patients')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 transition-colors hover:text-blue-950"
      >
        <ArrowLeft size={17} strokeWidth={2} aria-hidden="true" />
        Back to Patients
      </button>

      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-900 ring-4 ring-blue-50">
            {getInitials(patient.name)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
              {patient.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{patient.patientId}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/new-analysis')}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        >
          <Plus size={17} strokeWidth={2.25} aria-hidden="true" />
          New MRI Analysis
        </button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Age" value={patient.age} />
        <InfoCard label="Gender" value={patient.gender} />
        <InfoCard label="Patient ID" value={patient.patientId} />
        <InfoCard label="Latest Alzheimer&apos;s Stage" value={patient.latestStage} stage />
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[1.35fr_1fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-md sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-blue-950">
                MRI Analysis History
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Previous clinical AI assessments
              </p>
            </div>
            <span className="text-sm font-medium text-slate-400">
              {patientAnalyses.length} analyses
            </span>
          </div>

          <div className="mt-5">
            {patientAnalyses.map((analysis, index) => (
              <div
                key={analysis.id}
                className={`flex items-center gap-3 py-4 transition-colors hover:bg-slate-50/80 sm:gap-4 ${index === 0 ? '' : 'border-t border-slate-100'}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {analysis.date}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${stageStyles[analysis.predictedStage]}`}
                    >
                      {analysis.predictedStage}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {analysis.confidence.toFixed(1)}% Confidence
                    </span>
                  </div>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs font-medium text-slate-400">Status</p>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {analysis.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/analysis/${analysis.id}`)}
                  aria-label={`View result from ${analysis.date}`}
                  title={`View result from ${analysis.date}`}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-blue-800 transition-colors hover:bg-blue-50 hover:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
                >
                  <Eye size={18} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-md sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-blue-950">
            Clinical Summary
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Analyses</p>
              <p className="mt-1.5 text-lg font-semibold text-blue-950">
                {patientAnalyses.length}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">First Analysis</p>
              <p className="mt-1.5 text-sm font-semibold text-slate-700">
                {firstAnalysis?.date ?? 'No data'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Latest Analysis</p>
              <p className="mt-1.5 text-sm font-semibold text-slate-700">
                {latestAnalysis?.date ?? 'No data'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Current Risk Level</p>
              <p className="mt-1.5 text-sm font-semibold text-slate-700">
                {riskLevels[patient.latestStage]}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="text-sm font-semibold text-blue-950">AI Assessment</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The latest MRI analysis indicates features consistent with a{' '}
              {patient.latestStage} stage. Continued monitoring and follow-up
              evaluation are recommended.
            </p>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              AI-generated assessment. This result should support, not replace,
              clinical judgment.
            </p>
          </div>
        </article>
      </section>
    </div>
  )
}

export default PatientDetails
