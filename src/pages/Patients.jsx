import { Eye, Filter, Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { patients } from '../data/mockData.js'
import PageBackground from '../components/layout/PageBackground.jsx'

const stageStyles = {
  Normal: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Very Mild': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Mild: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Moderate: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const summaryItems = [
  { label: 'Total Patients', value: '248' },
  { label: 'Recently Added', value: '12' },
  { label: 'Pending Analysis', value: '7' },
]

function getInitials(name) {
  return name
    .split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
}

function SummaryCard({ label, value }) {
  return (
    <article className="rounded-lg border border-white/60 bg-white/60 px-4 py-3 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1.5 text-xl font-semibold tracking-tight text-blue-950">
        {value}
      </p>
    </article>
  )
}

function Patients() {
  const navigate = useNavigate()

  return (
    <PageBackground>
      <div className="mx-auto max-w-7xl space-y-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
            Patients
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
            Manage and review your registered patients and their MRI analysis
            history.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        >
          <Plus size={17} strokeWidth={2.25} aria-hidden="true" />
          Add Patient
        </button>
      </section>

      <section className="grid max-w-3xl gap-3 sm:grid-cols-3">
        {summaryItems.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-white/60 bg-white/60 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <label className="relative block w-full sm:max-w-md">
            <span className="sr-only">Search patients</span>
            <Search
              size={18}
              strokeWidth={2}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="Search by patient name or ID..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              type="button"
              aria-label="Filter patients"
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
            >
              <Filter size={17} strokeWidth={2} aria-hidden="true" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <select
              aria-label="Filter by patient stage"
              defaultValue="All Patients"
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-44 sm:flex-none"
            >
              <option>All Patients</option>
              <option>Normal</option>
              <option>Very Mild</option>
              <option>Mild</option>
              <option>Moderate</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Patient</th>
                <th className="px-4 py-3.5 font-semibold">Patient ID</th>
                <th className="px-4 py-3.5 font-semibold">Age</th>
                <th className="px-4 py-3.5 font-semibold">Gender</th>
                <th className="px-4 py-3.5 font-semibold">Latest Stage</th>
                <th className="px-4 py-3.5 font-semibold">Last Analysis</th>
                <th className="px-5 py-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50/80"
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-900 ring-1 ring-inset ring-blue-100">
                        {getInitials(patient.name)}
                      </span>
                      <span className="font-medium text-slate-800">
                        {patient.name}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                    {patient.patientId}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{patient.age}</td>
                  <td className="px-4 py-4 text-slate-600">{patient.gender}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${stageStyles[patient.latestStage]}`}
                    >
                      {patient.latestStage}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {patient.lastAnalysis}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      aria-label={`View ${patient.name}`}
                      title={`View ${patient.name}`}
                      className="inline-flex size-9 items-center justify-center rounded-lg text-blue-800 transition-colors hover:bg-blue-50 hover:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
                    >
                      <Eye size={18} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Showing 1–8 of 248 patients</span>
          <div className="flex items-center gap-1">
            <button type="button" className="px-2 py-1.5 text-slate-400">
              Previous
            </button>
            <button type="button" className="rounded-md bg-blue-50 px-2.5 py-1.5 font-semibold text-blue-900">
              1
            </button>
            <button type="button" className="px-2.5 py-1.5 hover:text-blue-900">
              2
            </button>
            <button type="button" className="px-2.5 py-1.5 hover:text-blue-900">
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button type="button" className="px-2 py-1.5 font-medium hover:text-blue-900">
              Next
            </button>
          </div>
        </div>
      </section>
      </div>
    </PageBackground>
  )
}

export default Patients
