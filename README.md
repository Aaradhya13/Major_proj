# NeuroVision AI

NeuroVision AI is a React frontend for an explainable, AI-assisted clinical decision-support workflow for MRI analysis and Alzheimer's disease stage prediction. It provides a realistic dashboard experience for reviewing patients, running mock MRI assessments, and viewing clinical analysis reports.

## Features

- Dashboard with clinical activity summaries
- Patient management and patient selection
- New MRI analysis workflow
- MRI file upload with image preview support
- AI prediction result display
- Predicted Alzheimer's stage and confidence score
- Stage probability breakdown
- AI assessment summary and clinical disclaimer
- Full MRI scan preview for supported image files
- Prediction history
- Clinical analysis reports
- View and download PDF reports
- Start a new analysis from result and patient views

## Tech Stack

- React 19
- JavaScript with JSX
- Vite 8
- Tailwind CSS 4 with `@tailwindcss/vite`
- React Router DOM 7
- Recharts 3
- Lucide React
- ESLint 10

The current application uses static mock data and browser session storage for generated analyses. It does not include a backend, database, or external API integration.

## Project Structure

```text
neurovision-ai/
├── public/                         # Static public assets (currently empty)
├── src/
│   ├── assets/                     # Application assets (currently empty)
│   ├── components/
│   │   ├── analysis/               # Analysis-related component space
│   │   ├── common/                 # Shared component space
│   │   ├── dashboard/              # Dashboard cards, charts, and activity feeds
│   │   ├── layout/                 # Sidebar, header, and main layout
│   │   └── patients/               # Patient-related component space
│   ├── data/
│   │   └── mockData.js             # Patients, analyses, predictions, and activity data
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Patients.jsx
│   │   ├── PatientDetails.jsx
│   │   ├── NewAnalysis.jsx
│   │   ├── PredictionResult.jsx
│   │   ├── History.jsx
│   │   ├── Reports.jsx
│   │   └── Settings.jsx
│   ├── utils/
│   │   └── reportGenerator.js      # Browser-generated PDF report utilities
│   ├── App.jsx                     # BrowserRouter and route definitions
│   ├── App.css                    # Application-level component styles
│   ├── index.css                  # Tailwind import and global styles
│   └── main.jsx                   # React application entry point
├── eslint.config.js                # ESLint configuration
├── index.html                     # Vite HTML entry point
├── package.json                    # Dependencies and npm scripts
└── vite.config.js                  # Vite, React, and Tailwind plugins
```

## Getting Started

### Prerequisites

- Node.js compatible with the versions required by the installed Vite and ESLint dependencies
- npm

### Installation

```bash
git clone <repository-url>
cd <project-folder>
npm install
npm run dev
```

Vite starts the local development server at:

[http://localhost:5173](http://localhost:5173)

The project can also be opened at the equivalent loopback URL `http://127.0.0.1:5173`.

## Available Scripts

These scripts are defined in `package.json`:

| Command           | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `npm run dev`     | Starts the Vite development server with hot module replacement. |
| `npm run build`   | Creates a production build in `dist/`.                          |
| `npm run lint`    | Runs ESLint across the project.                                 |
| `npm run preview` | Serves the production build locally for preview.                |

## Application Routes

The main routes currently include:

- `/dashboard` - Dashboard
- `/patients` - Patient management
- `/patients/:id` - Patient details and MRI analysis history
- `/analysis/new` - New MRI analysis form
- `/analysis/:id` - Prediction results
- `/history` - Prediction history
- `/reports` - Clinical analysis reports
- `/settings` - Settings placeholder

The root path `/` redirects to `/dashboard`. The legacy `/new-analysis` path redirects to `/analysis/new`.

## Application Workflow

1. Select a patient from the patient picker.
2. Upload an MRI scan.
3. Add optional clinical notes.
4. Run the AI analysis.
5. View the generated prediction results.
6. View the full uploaded scan when the file is a supported image format.
7. Download the generated PDF report.

Generated analyses are added to the in-memory analysis collection and persisted in browser session storage for the current session. They are then available from the patient analysis history, Prediction History, and Reports pages.

## Screenshots

Screenshots are not currently included in the repository. To add them later:

1. Capture the relevant application views from the running development server.
2. Add the images to a repository folder such as `docs/screenshots/`.
3. Reference them here with standard Markdown image syntax, for example:

```markdown
![NeuroVision AI Dashboard](docs/screenshots/dashboard.png)
```

## Disclaimer

NeuroVision AI is a demonstration and clinical decision-support frontend. Its predictions, assessments, mock data, and generated reports are for development and demonstration purposes only. AI-generated results should support, not replace, evaluation and judgment by qualified healthcare professionals. The application is not a diagnostic device and is not connected to a clinical backend or patient record system.
