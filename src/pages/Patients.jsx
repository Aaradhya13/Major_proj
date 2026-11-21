import { Eye, Filter, LoaderCircle, Plus, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageBackground from '../components/layout/PageBackground.jsx'
import { authApi } from '../services/api.js'
import { toFrontendPatient } from '../utils/patientAdapter.js'

const stageStyles = {
  Normal: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Very Mild': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Mild: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Moderate: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}
const pageSize = 8

function getInitials(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2)
}

function SummaryCard({ label, value }) {
  return <article className="rounded-lg border border-white/60 bg-white/60 px-4 py-3 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1.5 text-xl font-semibold tracking-tight text-blue-950">{value}</p></article>
}

function Patients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('All Patients')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState({ patient_id: '', name: '', age: '', gender: 'Female' })
  const [formError, setFormError] = useState('')

  function loadPatients() {
    setIsLoading(true)
    authApi.getPatients().then((records) => setPatients(records.map(toFrontendPatient))).catch((requestError) => setError(requestError.message)).finally(() => setIsLoading(false))
  }

  useEffect(() => {
    authApi.getPatients().then((records) => setPatients(records.map(toFrontendPatient))).catch((requestError) => setError(requestError.message)).finally(() => setIsLoading(false))
  }, [])

  const filteredPatients = useMemo(() => patients.filter((patient) => {
    const matchesSearch = `${patient.name} ${patient.patientId}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (stage === 'All Patients' || patient.latestStage === stage)
  }), [patients, search, stage])
  const pageCount = Math.max(1, Math.ceil(filteredPatients.length / pageSize))
  const visiblePatients = filteredPatients.slice((page - 1) * pageSize, page * pageSize)

  async function addPatient(event) {
    event.preventDefault()
    setFormError('')
    try {
      await authApi.createPatient({ ...form, age: Number(form.age) })
      setForm({ patient_id: '', name: '', age: '', gender: 'Female' })
      setIsAddOpen(false)
      loadPatients()
    } catch (requestError) {
      setFormError(requestError.message)
    }
  }

  return (
    <PageBackground>
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">Patients</h1><p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">Manage and review your registered patients and their MRI analysis history.</p></div>
          <button type="button" onClick={() => setIsAddOpen(true)} className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"><Plus size={17} aria-hidden="true" />Add Patient</button>
        </section>
        {isAddOpen && <form onSubmit={addPatient} className="rounded-xl border border-blue-100 bg-white/80 p-5 shadow-sm backdrop-blur-md"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-blue-950">Add Patient</h2><button type="button" onClick={() => setIsAddOpen(false)} aria-label="Close add patient form"><X size={18} /></button></div><div className="mt-4 grid gap-3 sm:grid-cols-4"><input required placeholder="Patient ID" value={form.patient_id} onChange={(event) => setForm({ ...form, patient_id: event.target.value })} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" /><input required placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" /><input required min="0" max="150" type="number" placeholder="Age" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" /><select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>Female</option><option>Male</option><option>Other</option></select></div>{formError && <p className="mt-3 text-sm text-red-700" role="alert">{formError}</p>}<button type="submit" className="mt-4 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white">Save patient</button></form>}
        <section className="grid max-w-3xl gap-3 sm:grid-cols-3"><SummaryCard label="Total Patients" value={patients.length} /><SummaryCard label="Recently Added" value={patients.filter((patient) => patient.analysisCount === 0).length} /><SummaryCard label="Pending Analysis" value={patients.filter((patient) => patient.analysisCount === 0).length} /></section>
        <section className="overflow-hidden rounded-xl border border-white/60 bg-white/60 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><label className="relative block w-full sm:max-w-md"><span className="sr-only">Search patients</span><Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search by patient name or ID..." className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" /></label><div className="flex w-full items-center gap-2 sm:w-auto"><button type="button" aria-label="Filter patients" className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600"><Filter size={17} aria-hidden="true" /><span className="hidden sm:inline">Filter</span></button><select aria-label="Filter by patient stage" value={stage} onChange={(event) => { setStage(event.target.value); setPage(1) }} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 sm:w-44 sm:flex-none"><option>All Patients</option><option>Normal</option><option>Very Mild</option><option>Mild</option><option>Moderate</option></select></div></div>
          {isLoading ? <div className="flex justify-center py-16"><LoaderCircle className="animate-spin text-blue-800" aria-label="Loading patients" /></div> : error ? <div className="px-5 py-12 text-sm text-red-700" role="alert">{error}</div> : visiblePatients.length === 0 ? <div className="px-5 py-12 text-center text-sm text-slate-500">No patients found</div> : <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5 font-semibold">Patient</th><th className="px-4 py-3.5 font-semibold">Patient ID</th><th className="px-4 py-3.5 font-semibold">Age</th><th className="px-4 py-3.5 font-semibold">Gender</th><th className="px-4 py-3.5 font-semibold">Latest Stage</th><th className="px-4 py-3.5 font-semibold">Last Analysis</th><th className="px-5 py-3.5 text-right font-semibold">Action</th></tr></thead><tbody>{visiblePatients.map((patient) => <tr key={patient.id} className="border-t border-slate-100 hover:bg-slate-50/80"><td className="whitespace-nowrap px-5 py-4"><div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-900">{getInitials(patient.name)}</span><span className="font-medium text-slate-800">{patient.name}</span></div></td><td className="whitespace-nowrap px-4 py-4 text-slate-500">{patient.patientId}</td><td className="px-4 py-4 text-slate-600">{patient.age}</td><td className="px-4 py-4 text-slate-600">{patient.gender}</td><td className="whitespace-nowrap px-4 py-4">{patient.latestStage ? <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${stageStyles[patient.latestStage]}`}>{patient.latestStage}</span> : <span className="text-slate-400">No analysis</span>}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{patient.lastAnalysis}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => navigate(`/patients/${patient.id}`)} aria-label={`View ${patient.name}`} title={`View ${patient.name}`} className="inline-flex size-9 items-center justify-center rounded-lg text-blue-800 hover:bg-blue-50"><Eye size={18} aria-hidden="true" /></button></td></tr>)}</tbody></table></div>}
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>Showing {filteredPatients.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredPatients.length)} of {filteredPatients.length} patients</span><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1.5 disabled:text-slate-300">Previous</button><span className="rounded-md bg-blue-50 px-2.5 py-1.5 font-semibold text-blue-900">{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage(page + 1)} className="px-2 py-1.5 disabled:text-slate-300">Next</button></div></div>
        </section>
      </div>
    </PageBackground>
  )
}

export default Patients
