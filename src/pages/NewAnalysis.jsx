import {
  CheckCircle2,
  CloudUpload,
  FileImage,
  FileText,
  LoaderCircle,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createMockAnalysis,
  patients,
  updateMockAnalysisPreview,
} from '../data/mockData.js'

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const previewableImageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']

function isPreviewableImage(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  return (
    file.type?.startsWith('image/') ||
    previewableImageExtensions.includes(extension)
  )
}

function readImageDataUrl(file) {
  if (!isPreviewableImage(file)) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

function NewAnalysis() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [selectedPatientName, setSelectedPatientName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [notes, setNotes] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisId, setAnalysisId] = useState(null)

  const selectedPatient = patients.find(
    (patient) => patient.name === selectedPatientName,
  )
  const canAnalyze = Boolean(selectedPatient && selectedFile) && !isAnalyzing

  useEffect(() => {
    if (!isAnalyzing || !analysisId) {
      return undefined
    }

    const timer = setTimeout(() => {
      navigate(`/analysis/${analysisId}`)
    }, 1400)

    return () => clearTimeout(timer)
  }, [analysisId, isAnalyzing, navigate])

  function handleFileChange(event) {
    const [file] = event.target.files ?? []
    if (file) {
      setSelectedFile(file)
    }
  }

  function removeFile() {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (canAnalyze) {
      setIsAnalyzing(true)
      const objectUrl = isPreviewableImage(selectedFile)
        ? URL.createObjectURL(selectedFile)
        : null
      const analysis = createMockAnalysis({
        patient: selectedPatient,
        file: selectedFile,
        notes,
        previewUrl: objectUrl,
      })
      setAnalysisId(analysis.id)
      readImageDataUrl(selectedFile).then((dataUrl) => {
        updateMockAnalysisPreview(analysis.id, dataUrl)
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-7xl space-y-7"
      aria-busy={isAnalyzing}
    >
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
          New MRI Analysis
        </h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Upload an MRI scan and run an AI-powered Alzheimer&apos;s assessment.
        </p>
      </section>

      <fieldset disabled={isAnalyzing} className="space-y-7 border-0 p-0">
        <section className="grid gap-5 xl:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-md sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight text-blue-950">
              Patient Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select the patient associated with this scan.
            </p>

            <label className="mt-6 block text-sm font-medium text-slate-700">
              Select Patient
              <input
                type="text"
                list="patient-options"
                value={selectedPatientName}
                onChange={(event) => setSelectedPatientName(event.target.value)}
                placeholder="Search patients by name..."
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <datalist id="patient-options">
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.name}>
                    {patient.patientId}
                  </option>
                ))}
              </datalist>
            </label>
            {selectedPatient && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-blue-50/60 px-3 py-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-900">
                  {selectedPatient.name
                    .split(' ')
                    .map((namePart) => namePart[0])
                    .join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-950">
                    {selectedPatient.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {selectedPatient.patientId}
                  </p>
                </div>
              </div>
            )}
            <button
              type="button"
              className="mt-5 text-sm font-semibold text-blue-800 transition-colors hover:text-blue-950"
            >
              + Add New Patient
            </button>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-md sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight text-blue-950">
              MRI Scan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add the scan to begin the assessment.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".dcm,.nii,.nii.gz,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="sr-only"
            />
            {selectedFile ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <FileImage size={20} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {selectedFile.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <CheckCircle2
                  size={20}
                  className="shrink-0 text-emerald-600"
                  aria-label="File uploaded"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  aria-label="Remove selected MRI scan"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-slate-800"
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 flex min-h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-5 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-800">
                  <CloudUpload size={24} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="mt-3 text-sm font-semibold text-slate-700">
                  Drag and drop MRI scan here
                </span>
                <span className="mt-1 text-sm text-blue-700">
                  or click to browse files
                </span>
                <span className="mt-3 text-xs text-slate-400">
                  Supported formats: DICOM, NIfTI, PNG, JPG
                </span>
              </button>
            )}
          </article>
        </section>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-md sm:p-6">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-800" aria-hidden="true" />
            <h2 className="text-lg font-semibold tracking-tight text-blue-950">
              Clinical Notes
            </h2>
          </div>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add any relevant symptoms, observations, or clinical notes..."
            rows={4}
            className="mt-5 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-2 text-xs text-slate-400">Notes are optional.</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-md sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-blue-950">
            Analysis Settings
          </h2>
          <div className="mt-4 flex flex-col gap-1 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="text-sm font-semibold text-blue-950">Analysis Type</p>
              <p className="mt-1 text-sm text-slate-600">
                Alzheimer&apos;s Stage Classification
              </p>
            </div>
            <p className="max-w-xl text-xs leading-5 text-slate-500">
              The AI model will analyze the MRI scan and classify the predicted
              stage.
            </p>
          </div>
        </article>
      </fieldset>

      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          disabled={isAnalyzing}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canAnalyze}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isAnalyzing && (
            <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
          )}
          {isAnalyzing ? 'Analyzing MRI scan...' : 'Run AI Analysis'}
        </button>
      </div>
    </form>
  )
}

export default NewAnalysis
