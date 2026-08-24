export const recentPredictions = [
	{
		id: 'pred-1042',
		patientId: 'NV-2026-0184',
		patientName: 'Eleanor Bennett',
		age: 71,
		analysisDate: 'Aug 24, 2026',
		predictedStage: 'Very Mild',
		confidence: 91.8,
		status: 'Reviewed',
	},
	{
		id: 'pred-1041',
		patientId: 'NV-2026-0179',
		patientName: 'Robert Campbell',
		age: 68,
		analysisDate: 'Aug 23, 2026',
		predictedStage: 'Mild',
		confidence: 88.4,
		status: 'Needs Review',
	},
	{
		id: 'pred-1040',
		patientId: 'NV-2026-0175',
		patientName: 'Margaret Wilson',
		age: 64,
		analysisDate: 'Aug 22, 2026',
		predictedStage: 'Normal',
		confidence: 96.2,
		status: 'Reviewed',
	},
	{
		id: 'pred-1039',
		patientId: 'NV-2026-0168',
		patientName: 'Thomas Anderson',
		age: 76,
		analysisDate: 'Aug 21, 2026',
		predictedStage: 'Moderate',
		confidence: 93.6,
		status: 'Needs Review',
	},
	{
		id: 'pred-1038',
		patientId: 'NV-2026-0161',
		patientName: 'Dorothy Harris',
		age: 70,
		analysisDate: 'Aug 20, 2026',
		predictedStage: 'Very Mild',
		confidence: 89.7,
		status: 'Reviewed',
	},
]

export const stageDistribution = [
	{ stage: 'Normal', count: 82 },
	{ stage: 'Very Mild', count: 64 },
	{ stage: 'Mild', count: 51 },
	{ stage: 'Moderate', count: 31 },
]

export const recentActivities = [
	{
		id: 'activity-501',
		type: 'analysis-completed',
		title: 'New MRI Analysis Completed',
		description: 'Analysis for Eleanor Bennett is ready for review.',
		timestamp: '10 minutes ago',
	},
	{
		id: 'activity-500',
		type: 'high-risk-detected',
		title: 'High-Risk Case Detected',
		description: 'A Moderate-stage prediction requires review.',
		timestamp: '32 minutes ago',
	},
	{
		id: 'activity-499',
		type: 'patient-added',
		title: 'New Patient Added',
		description: 'Michael Johnson was added to the system.',
		timestamp: '1 hour ago',
	},
	{
		id: 'activity-498',
		type: 'prediction-reviewed',
		title: 'AI Prediction Reviewed',
		description: "Dr. Sarah Mitchell reviewed Robert Campbell's result.",
		timestamp: '2 hours ago',
	},
	{
		id: 'activity-497',
		type: 'report-generated',
		title: 'Report Generated',
		description: 'The monthly clinical insights report is ready.',
		timestamp: 'Yesterday',
	},
]

export const patients = [
	{
		id: 'patient-0184',
		patientId: 'NV-2026-0184',
		name: 'Eleanor Bennett',
		age: 71,
		gender: 'Female',
		latestStage: 'Very Mild',
		lastAnalysis: 'Aug 24, 2026',
	},
	{
		id: 'patient-0179',
		patientId: 'NV-2026-0179',
		name: 'Robert Campbell',
		age: 68,
		gender: 'Male',
		latestStage: 'Mild',
		lastAnalysis: 'Aug 23, 2026',
	},
	{
		id: 'patient-0175',
		patientId: 'NV-2026-0175',
		name: 'Margaret Wilson',
		age: 64,
		gender: 'Female',
		latestStage: 'Normal',
		lastAnalysis: 'Aug 22, 2026',
	},
	{
		id: 'patient-0168',
		patientId: 'NV-2026-0168',
		name: 'Thomas Anderson',
		age: 76,
		gender: 'Male',
		latestStage: 'Moderate',
		lastAnalysis: 'Aug 21, 2026',
	},
	{
		id: 'patient-0161',
		patientId: 'NV-2026-0161',
		name: 'Dorothy Harris',
		age: 70,
		gender: 'Female',
		latestStage: 'Very Mild',
		lastAnalysis: 'Aug 20, 2026',
	},
	{
		id: 'patient-0156',
		patientId: 'NV-2026-0156',
		name: 'Michael Johnson',
		age: 73,
		gender: 'Male',
		latestStage: 'Mild',
		lastAnalysis: 'Aug 19, 2026',
	},
	{
		id: 'patient-0149',
		patientId: 'NV-2026-0149',
		name: 'Patricia Moore',
		age: 67,
		gender: 'Female',
		latestStage: 'Normal',
		lastAnalysis: 'Aug 18, 2026',
	},
	{
		id: 'patient-0142',
		patientId: 'NV-2026-0142',
		name: 'William Taylor',
		age: 79,
		gender: 'Male',
		latestStage: 'Moderate',
		lastAnalysis: 'Aug 17, 2026',
	},
]

export const analysisHistory = [
	{ id: 'analysis-0184-03', patientId: 'patient-0184', date: 'Aug 24, 2026', predictedStage: 'Very Mild', confidence: 91.8, status: 'Reviewed' },
	{ id: 'analysis-0184-02', patientId: 'patient-0184', date: 'May 18, 2026', predictedStage: 'Very Mild', confidence: 89.6, status: 'Reviewed' },
	{ id: 'analysis-0184-01', patientId: 'patient-0184', date: 'Feb 10, 2026', predictedStage: 'Normal', confidence: 87.4, status: 'Reviewed' },
	{ id: 'analysis-0179-03', patientId: 'patient-0179', date: 'Aug 23, 2026', predictedStage: 'Mild', confidence: 88.4, status: 'Needs Review' },
	{ id: 'analysis-0179-02', patientId: 'patient-0179', date: 'May 12, 2026', predictedStage: 'Very Mild', confidence: 86.9, status: 'Reviewed' },
	{ id: 'analysis-0179-01', patientId: 'patient-0179', date: 'Jan 28, 2026', predictedStage: 'Very Mild', confidence: 84.2, status: 'Reviewed' },
	{ id: 'analysis-0175-03', patientId: 'patient-0175', date: 'Aug 22, 2026', predictedStage: 'Normal', confidence: 96.2, status: 'Reviewed' },
	{ id: 'analysis-0175-02', patientId: 'patient-0175', date: 'Apr 16, 2026', predictedStage: 'Normal', confidence: 94.7, status: 'Reviewed' },
	{ id: 'analysis-0175-01', patientId: 'patient-0175', date: 'Dec 09, 2025', predictedStage: 'Normal', confidence: 93.8, status: 'Reviewed' },
	{ id: 'analysis-0168-03', patientId: 'patient-0168', date: 'Aug 21, 2026', predictedStage: 'Moderate', confidence: 93.6, status: 'Needs Review' },
	{ id: 'analysis-0168-02', patientId: 'patient-0168', date: 'May 06, 2026', predictedStage: 'Mild', confidence: 90.1, status: 'Reviewed' },
	{ id: 'analysis-0168-01', patientId: 'patient-0168', date: 'Feb 02, 2026', predictedStage: 'Mild', confidence: 87.8, status: 'Reviewed' },
	{ id: 'analysis-0161-03', patientId: 'patient-0161', date: 'Aug 20, 2026', predictedStage: 'Very Mild', confidence: 89.7, status: 'Reviewed' },
	{ id: 'analysis-0161-02', patientId: 'patient-0161', date: 'Apr 28, 2026', predictedStage: 'Very Mild', confidence: 88.2, status: 'Reviewed' },
	{ id: 'analysis-0161-01', patientId: 'patient-0161', date: 'Jan 14, 2026', predictedStage: 'Normal', confidence: 91.3, status: 'Reviewed' },
	{ id: 'analysis-0156-03', patientId: 'patient-0156', date: 'Aug 19, 2026', predictedStage: 'Mild', confidence: 86.7, status: 'Needs Review' },
	{ id: 'analysis-0156-02', patientId: 'patient-0156', date: 'May 02, 2026', predictedStage: 'Mild', confidence: 85.9, status: 'Reviewed' },
	{ id: 'analysis-0156-01', patientId: 'patient-0156', date: 'Feb 18, 2026', predictedStage: 'Very Mild', confidence: 83.6, status: 'Reviewed' },
	{ id: 'analysis-0149-03', patientId: 'patient-0149', date: 'Aug 18, 2026', predictedStage: 'Normal', confidence: 95.4, status: 'Reviewed' },
	{ id: 'analysis-0149-02', patientId: 'patient-0149', date: 'Apr 11, 2026', predictedStage: 'Normal', confidence: 94.1, status: 'Reviewed' },
	{ id: 'analysis-0149-01', patientId: 'patient-0149', date: 'Dec 02, 2025', predictedStage: 'Normal', confidence: 92.8, status: 'Reviewed' },
	{ id: 'analysis-0142-03', patientId: 'patient-0142', date: 'Aug 17, 2026', predictedStage: 'Moderate', confidence: 92.5, status: 'Needs Review' },
	{ id: 'analysis-0142-02', patientId: 'patient-0142', date: 'Apr 23, 2026', predictedStage: 'Mild', confidence: 89.8, status: 'Reviewed' },
	{ id: 'analysis-0142-01', patientId: 'patient-0142', date: 'Jan 21, 2026', predictedStage: 'Mild', confidence: 86.5, status: 'Reviewed' },
]

const generatedAnalysisStorageKey = 'neurovision-generated-analyses'

function persistGeneratedAnalyses() {
	if (typeof window !== 'undefined') {
		window.sessionStorage.setItem(
			generatedAnalysisStorageKey,
			JSON.stringify(
				analysisHistory.filter((analysis) => analysis.generated),
			),
		)
	}
}

if (typeof window !== 'undefined') {
	try {
		const storedAnalyses = JSON.parse(
			window.sessionStorage.getItem(generatedAnalysisStorageKey) ?? '[]',
		)
		analysisHistory.unshift(
			...storedAnalyses.filter(
				(storedAnalysis) =>
					!analysisHistory.some(
						(analysis) => analysis.id === storedAnalysis.id,
					),
			),
		)
	} catch {
		window.sessionStorage.removeItem(generatedAnalysisStorageKey)
	}
}

export function createMockAnalysis({ patient, file, notes, previewUrl }) {
	const timestamp = Date.now()
	const analysis = {
		id: `analysis-${patient.id}-${timestamp}`,
		patientId: patient.id,
		patientDetails: { ...patient },
		date: new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}).format(new Date()),
		predictedStage: 'Very Mild',
		confidence: 91.8,
		probabilities: [
			{ stage: 'Normal', probability: 4.2 },
			{ stage: 'Very Mild', probability: 91.8 },
			{ stage: 'Mild', probability: 3.1 },
			{ stage: 'Moderate', probability: 0.9 },
		],
		file: {
			name: file.name,
			size: file.size,
			type: file.type,
		},
		previewUrl,
		notes,
		status: 'Completed',
		generated: true,
	}

	analysisHistory.unshift(analysis)
	persistGeneratedAnalyses()
	return analysis
}

export function updateMockAnalysisPreview(analysisId, previewUrl) {
	const analysis = analysisHistory.find((item) => item.id === analysisId)
	if (!analysis || !previewUrl) {
		return
	}

	analysis.previewUrl = previewUrl
	persistGeneratedAnalyses()
}
