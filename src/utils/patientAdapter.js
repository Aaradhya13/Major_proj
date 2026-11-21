function stageFromPrediction(prediction) {
  if (!prediction) return null
  if (prediction === 'Non-Demented') return 'Normal'
  if (prediction.includes('Moderate')) return 'Moderate'
  if (prediction.includes('Mild') && !prediction.includes('Very')) return 'Mild'
  if (prediction.includes('Very Mild')) return 'Very Mild'
  return prediction
}

export function toFrontendPatient(patient) {
  return {
    id: patient.patient_id,
    patientId: patient.patient_id,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    latestStage: stageFromPrediction(patient.latest_prediction),
    lastAnalysis: patient.latest_analysis_date
      ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(patient.latest_analysis_date))
      : 'No analyses',
    analysisCount: patient.analysis_count,
  }
}
