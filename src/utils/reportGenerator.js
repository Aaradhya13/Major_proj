function escapePdfText(value) {
  return String(value ?? 'Unavailable')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '')
}

function wrapReportText(value, maxLength = 88) {
  const lines = []
  let currentLine = ''

  String(value ?? 'Unavailable')
    .split(/\s+/)
    .forEach((word) => {
      const nextLine = currentLine ? `${currentLine} ${word}` : word
      if (nextLine.length > maxLength && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = nextLine
      }
    })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

export function toDisplayAnalysisId(id) {
  if (id === 'analysis-0184-03') {
    return 'AN-2026-0184-03'
  }

  return id.replace('analysis-', 'AN-')
}

export function createPdfReport({
  analysis,
  patient,
  analysisId,
  stage,
  confidence,
  analysisDate,
  probabilities,
}) {
  const patientName =
    patient?.name ?? analysis?.patientDetails?.name ?? 'Unavailable'
  const patientId =
    patient?.patientId ?? analysis?.patientDetails?.patientId ?? 'Unavailable'
  const reportLines = [
    'NeuroVision AI',
    'Clinical AI Prediction Report',
    '',
    `Patient: ${patientName}`,
    `Patient ID: ${patientId}`,
    `Analysis ID: ${analysisId}`,
    `Analysis Date: ${analysisDate}`,
    `Status: ${analysis?.status ?? 'Reviewed'}`,
    `MRI Scan: ${analysis?.file?.name ?? 'Unavailable'}`,
  ]

  if (analysis?.modelPrediction) {
    reportLines.push(
      '',
      `Final prediction: ${analysis.finalPrediction ?? stage}`,
      `Stage 1 screening: ${analysis.stage1Prediction ?? 'Unavailable'}`,
      `Stage 1 decision score: ${analysis.stage1DecisionScore ?? 'Unavailable'}`,
      `Stage 2 severity: ${analysis.stage2Prediction ?? 'Not run'}`,
      `Stage 2 decision score: ${analysis.stage2DecisionScore ?? 'Not run'}`,
      '',
      'Model score note',
      'Decision scores are raw SVM decision scores. They are not calibrated probabilities or confidence percentages.',
      '',
      'Clinical notes',
      ...wrapReportText(analysis.notes ?? 'No clinical notes provided.'),
      '',
      'AI Assessment',
      ...wrapReportText(
        `The model returned ${analysis.finalPrediction ?? stage}. This is an AI-based decision-support result and should be considered alongside clinical evaluation and patient history.`,
      ),
    )
  } else {
    reportLines.push(
      `Predicted Alzheimer's Stage: ${stage}`,
      `Confidence: ${confidence.toFixed(1)}%`,
      '',
      'Stage Probability Breakdown',
      ...probabilities.map(
        (item) => `${item.stage}: ${item.probability.toFixed(1)}%`,
      ),
      '',
      'AI Assessment',
      ...wrapReportText(
        `The AI analysis detected patterns consistent with a ${stage} stage. The result suggests early structural changes and should be considered alongside clinical evaluation and patient history.`,
      ),
      '',
      'Clinical notes',
      ...wrapReportText(analysis?.notes ?? 'No clinical notes provided.'),
    )
  }

  reportLines.push(
    '',
    'Disclaimer: This is an AI-assisted decision-support result intended to support, not replace, clinical judgment. It is not a medical diagnosis.',
  )
  const contentLines = ['BT', '/F1 18 Tf', '50 750 Td']

  reportLines.forEach((line, index) => {
    if (index === 2 || index === 11 || index === 15) {
      contentLines.push('/F1 13 Tf')
    }
    contentLines.push(`(${escapePdfText(line)}) Tj`, '0 -22 Td')
  })
  contentLines.push('ET')

  const content = contentLines.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}

export function downloadAnalysisReport({
  analysis,
  patient,
  analysisId,
  stage,
  confidence,
  analysisDate,
  probabilities,
}) {
  const reportBlob = createPdfReport({
    analysis,
    patient,
    analysisId,
    stage,
    confidence,
    analysisDate,
    probabilities,
  })
  const downloadUrl = URL.createObjectURL(reportBlob)
  const link = document.createElement('a')
  const safePatientName = (patient?.name ?? 'Patient').replace(
    /[^a-z0-9]+/gi,
    '_',
  )
  link.href = downloadUrl
  link.download = `NeuroVision_Report_${safePatientName}_${analysisId}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
}
