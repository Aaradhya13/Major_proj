import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Download,
  LoaderCircle,
  Pencil,
  ScanLine,
  X,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  downloadAnalysisReport,
  toDisplayAnalysisId,
} from '../utils/reportGenerator.js'
import { toFrontendAnalysis } from '../utils/analysisAdapter.js'
import { authApi } from '../services/api.js'

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

  const name = typeof file === 'string' ? file : file.name || ''
  const extension = name.split('.').pop()?.toLowerCase()
  const mimeType = typeof file === 'object' ? file.type : ''
  return (
    mimeType?.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp'].includes(extension)
  )
}

function formatReviewDate(timestamp) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp))
}

function PredictionResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isScanOpen, setIsScanOpen] = useState(false)
  const [scanBlobUrl, setScanBlobUrl] = useState(null)
  const [scanImageError, setScanImageError] = useState('')
  const [scanRetryKey, setScanRetryKey] = useState(0)
  const [savedAnalysis, setSavedAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [review, setReview] = useState(null)
  const [isReviewLoading, setIsReviewLoading] = useState(true)
  const [isEditingReview, setIsEditingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ isCorrect: null, remarks: '' })
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [isSavingReview, setIsSavingReview] = useState(false)

  const scanImageUrl = savedAnalysis?.previewUrl || scanBlobUrl
  const isScanPreviewable = isPreviewableImage(savedAnalysis?.file?.name)
  const isScanImageLoading = isScanPreviewable && !scanImageUrl && !scanImageError

  useEffect(() => {
    let active = true
    authApi.getAnalysis(id).then((record) => {
      if (active) setSavedAnalysis(toFrontendAnalysis(record))
    }).catch(() => {}).finally(() => {
      if (active) setIsLoading(false)
    })
    return () => { active = false }
  }, [id])

  useEffect(() => {
    const fileName = savedAnalysis?.file?.name || ''
    if (!id || savedAnalysis?.previewUrl || !isPreviewableImage(fileName)) {
      return
    }

    let active = true
    let objectUrl = null

    authApi
      .getAnalysisImageBlob(id)
      .then((blob) => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setScanBlobUrl(objectUrl)
        setScanImageError('')
      })
      .catch((err) => {
        if (!active) return
        setScanImageError(err?.message || 'Unable to load MRI scan.')
      })

    return () => {
      active = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [id, savedAnalysis?.previewUrl, savedAnalysis?.file?.name, scanRetryKey])

  useEffect(() => {
    let active = true

    authApi.getAnalysisReview(id).then((savedReview) => {
      if (!active) return
      if (savedReview) {
        setReview(savedReview)
        setReviewForm({
          isCorrect: savedReview.is_correct,
          remarks: savedReview.remarks ?? '',
        })
      } else {
        setReview(null)
        setReviewForm({ isCorrect: null, remarks: '' })
      }
    }).catch((requestError) => {
      if (!active) return
      if (requestError.status === 404) {
        setReview(null)
        setReviewForm({ isCorrect: null, remarks: '' })
        return
      }
      setReviewError(requestError.message)
    }).finally(() => {
      if (active) setIsReviewLoading(false)
    })

    return () => { active = false }
  }, [id])

  const analysis = savedAnalysis
  const patient = analysis?.patientDetails
  const stage = analysis?.predictedStage ?? 'Very Mild'
  const isModelPrediction = analysis?.modelPrediction === true
  const confidence = isModelPrediction ? null : analysis?.confidence ?? null
  const finalPrediction = analysis?.finalPrediction ?? stage
  const analysisDate = analysis?.date ?? 'Unavailable'
  const status = analysis?.status ?? 'Completed'

  if (isLoading) {
    return <div className="mx-auto max-w-7xl py-16 text-center text-sm text-slate-500">Loading analysis...</div>
  }

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

  function beginReviewEdit() {
    setReviewForm({
      isCorrect: review.is_correct,
      remarks: review.remarks ?? '',
    })
    setReviewError('')
    setReviewSuccess('')
    setIsEditingReview(true)
  }

  async function submitReview(event) {
    event.preventDefault()
    if (reviewForm.isCorrect === null) {
      setReviewError('Select whether the AI prediction was correct or incorrect.')
      return
    }

    setIsSavingReview(true)
    setReviewError('')
    setReviewSuccess('')
    const payload = {
      is_correct: reviewForm.isCorrect,
      remarks: reviewForm.remarks,
    }

    try {
      if (review) {
        await authApi.updateAnalysisReview(id, payload)
      } else {
        await authApi.createAnalysisReview(id, payload)
      }
      const savedReview = await authApi.getAnalysisReview(id)
      setReview(savedReview)
      setReviewForm({
        isCorrect: savedReview.is_correct,
        remarks: savedReview.remarks ?? '',
      })
      setIsEditingReview(false)
      setReviewSuccess('Doctor review saved successfully.')
    } catch (requestError) {
      setReviewError(requestError.message)
    } finally {
      setIsSavingReview(false)
    }
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
        <article className="rounded-xl border border-white/60 bg-white/60 p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md sm:p-7">
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
            {isModelPrediction ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500">Stage 1 decision score</dt>
                  <dd className="mt-1 text-xl font-semibold text-blue-950">
                    {analysis.stage1DecisionScore.toFixed(4)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Final prediction</dt>
                  <dd className="mt-1 text-xl font-semibold text-blue-950">
                    {finalPrediction}
                  </dd>
                </div>
              </dl>
            ) : (
              <>
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
              </>
            )}
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

        <article className="rounded-xl border border-white/60 bg-white/60 p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md sm:p-7">
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
                {analysis.file.name}
                {analysis.file.size > 0 ? ` · ${formatFileSize(analysis.file.size)}` : ''}
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

      <article className="rounded-xl border border-white/60 bg-white/60 p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md sm:p-7">
        <h2 className="text-lg font-semibold tracking-tight text-blue-950">
          AI Assessment
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
          {isModelPrediction
            ? `The model returned ${finalPrediction}. This output is a decision-support result and should be considered alongside clinical evaluation and patient history.`
            : `The AI analysis detected patterns consistent with a ${stage} stage. The result suggests early structural changes and should be considered alongside clinical evaluation and patient history.`}
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

      {isModelPrediction ? (
        <article className="rounded-xl border border-white/60 bg-white/60 p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md sm:p-7">
          <h2 className="text-lg font-semibold tracking-tight text-blue-950">
            Model Output
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            These are raw SVM decision scores, not calibrated probabilities or confidence percentages.
          </p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium text-slate-500">Stage 1 screening</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{analysis.stage1Prediction}</dd>
              <dd className="mt-1 text-xs text-slate-500">Decision score: {analysis.stage1DecisionScore.toFixed(4)}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium text-slate-500">Stage 2 severity</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{analysis.stage2Prediction ?? 'Not run'}</dd>
              <dd className="mt-1 text-xs text-slate-500">
                {analysis.stage2DecisionScore === null
                  ? 'Skipped for non-demented screening result'
                  : `Decision score: ${analysis.stage2DecisionScore.toFixed(4)}`}
              </dd>
            </div>
          </dl>
          {analysis.gradcam && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-800">Grad-CAM explanation</h3>
              <img
                src={analysis.gradcam}
                alt="Grad-CAM visualization of model attention"
                className="mt-3 w-full rounded-lg border border-slate-200"
              />
            </div>
          )}
        </article>
      ) : (
      <article className="rounded-xl border border-white/60 bg-white/60 p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md sm:p-7">
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
      )}

      <article className="rounded-xl border border-white/60 bg-white/60 p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-blue-950">
              Doctor Review
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Clinical feedback on this AI assessment.
            </p>
          </div>
          {review && !isEditingReview && (
            <button
              type="button"
              onClick={beginReviewEdit}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-blue-800 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
            >
              <Pencil size={16} aria-hidden="true" />
              Edit Review
            </button>
          )}
        </div>

        {isReviewLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
            Loading doctor review...
          </div>
        ) : (
          <>
            {reviewSuccess && (
              <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700" role="status">
                {reviewSuccess}
              </p>
            )}
            {reviewError && (
              <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                {reviewError}
              </p>
            )}

            {review && !isEditingReview ? (
              <dl className="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Prediction assessment</dt>
                  <dd className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold ${review.is_correct ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {review.is_correct ? <CheckCircle2 size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}
                    {review.is_correct ? 'Correct' : 'Incorrect'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Reviewed by</dt>
                  <dd className="mt-2 text-sm font-semibold text-slate-700">{review.doctor_name}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-slate-500">Doctor&apos;s Remarks</dt>
                  <dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.remarks || 'No remarks added.'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Reviewed on</dt>
                  <dd className="mt-2 text-sm font-semibold text-slate-700">{formatReviewDate(review.updated_at)}</dd>
                </div>
              </dl>
            ) : (
              <form className="mt-6 border-t border-slate-100 pt-5" onSubmit={submitReview}>
                <fieldset>
                  <legend className="text-sm font-semibold text-slate-700">
                    Was the AI prediction correct?
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setReviewForm((current) => ({ ...current, isCorrect: true }))}
                      aria-pressed={reviewForm.isCorrect === true}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1 ${reviewForm.isCorrect === true ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50'}`}
                    >
                      <CheckCircle2 size={19} aria-hidden="true" />
                      Prediction is Correct
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewForm((current) => ({ ...current, isCorrect: false }))}
                      aria-pressed={reviewForm.isCorrect === false}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1 ${reviewForm.isCorrect === false ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50/50'}`}
                    >
                      <XCircle size={19} aria-hidden="true" />
                      Prediction is Incorrect
                    </button>
                  </div>
                </fieldset>
                <div className="mt-5">
                  <label htmlFor="doctor-review-remarks" className="text-sm font-semibold text-slate-700">
                    Doctor&apos;s Remarks
                  </label>
                  <textarea
                    id="doctor-review-remarks"
                    value={reviewForm.remarks}
                    onChange={(event) => setReviewForm((current) => ({ ...current, remarks: event.target.value }))}
                    maxLength={2000}
                    rows={4}
                    placeholder="Add optional clinical remarks"
                    className="mt-2 block w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  {isEditingReview && (
                    <button
                      type="button"
                      onClick={() => setIsEditingReview(false)}
                      disabled={isSavingReview}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSavingReview}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-700"
                  >
                    {isSavingReview && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
                    {isSavingReview ? 'Saving Review...' : review ? 'Save Changes' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
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
              {isScanImageLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <LoaderCircle size={36} className="animate-spin text-blue-800" aria-hidden="true" />
                  <p className="mt-4 text-sm font-medium text-slate-600">Loading MRI scan...</p>
                </div>
              ) : scanImageError ? (
                <div className="max-w-md text-center">
                  <Brain size={42} className="mx-auto text-rose-300" aria-hidden="true" />
                  <p className="mt-4 text-sm font-semibold text-rose-800">
                    Unable to load MRI scan.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {scanImageError}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setScanImageError('')
                      setScanRetryKey((prev) => prev + 1)
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
                  >
                    Retry
                  </button>
                </div>
              ) : scanImageUrl ? (
                <img
                  src={scanImageUrl}
                  alt={`MRI scan for ${patient.name}`}
                  className="max-h-[min(70vh,36rem)] max-w-full rounded-lg object-contain shadow-sm"
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
                      : 'No preview image is available for this analysis.'}
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
