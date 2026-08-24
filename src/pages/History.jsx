import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { analysisHistory, patients } from '../data/mockData.js'

const stageStyles = {
  Normal: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Very Mild': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Mild: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Moderate: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

function History() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
          Prediction History
        </h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Review completed MRI analyses across your clinical workspace.
        </p>
      </section>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Patient</th>
                <th className="px-4 py-3.5 font-semibold">Analysis Date</th>
                <th className="px-4 py-3.5 font-semibold">Predicted Stage</th>
                <th className="px-4 py-3.5 font-semibold">Confidence</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {analysisHistory.map((analysis) => {
                const patient = patients.find((item) => item.id === analysis.patientId)
                return (
                  <tr key={analysis.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {patient?.name ?? analysis.patientDetails?.name ?? 'Unknown patient'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">{analysis.date}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${stageStyles[analysis.predictedStage]}`}>
                        {analysis.predictedStage}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">{analysis.confidence.toFixed(1)}%</td>
                    <td className="px-4 py-4 text-slate-600">{analysis.status}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/analysis/${analysis.id}`)}
                        aria-label={`View ${analysis.id}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg text-blue-800 hover:bg-blue-50 hover:text-blue-950"
                      >
                        <Eye size={18} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default History
