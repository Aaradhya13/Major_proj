const stageByClass = ['Very Mild', 'Mild', 'Moderate']

export function toFrontendAnalysis(record) {
  return {
    id: record.analysis_id,
    patientId: record.patient_id,
    patientDetails: {
      id: record.patient_id,
      name: record.patient_name,
      patientId: record.patient_id,
    },
    date: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(record.analysis_date)),
    createdAt: record.created_at ?? record.analysis_date,
    predictedStage: record.stage1_class === 0 ? 'Normal' : record.stage2_prediction,
    file: {
      name: record.mri_filename,
      size: 0,
      type: '',
    },
    notes: record.clinical_notes,
    status: record.status,
    modelPrediction: true,
    finalPrediction: record.final_prediction,
    stage1Prediction: record.stage1_prediction,
    stage1Class: record.stage1_class,
    stage1DecisionScore: record.stage1_decision_score,
    stage2Prediction: record.stage2_prediction,
    stage2Class: record.stage2_class,
    stage2DecisionScore: record.stage2_decision_score,
    gradcam: record.gradcam,
    gradcamPath: record.gradcam_path,
    mriPath: record.mri_path,
  }
}

export function stageFromAnalysis(analysis) {
  if (!analysis) return 'Normal'
  if (analysis.stage1_class === 0 || analysis.stage1Prediction === 'Non-Demented') return 'Normal'
  return analysis.stage2_prediction ?? analysis.stage2Prediction ?? stageByClass[analysis.stage2_class] ?? 'Very Mild'
}
