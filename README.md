# NeuroVision AI

NeuroVision AI is a full-stack clinical decision-support platform for Alzheimer's Disease detection and severity staging from structural brain MRI scans. It couples a modern React 19 frontend with a FastAPI backend, PostgreSQL database, and a two-stage hierarchical deep learning inference pipeline featuring Grad-CAM visual explainability and a doctor feedback loop.

---

## System Architecture

```
                                 [ User / Clinician ]
                                          │
                                          ▼
                         React 19 + Vite Frontend (Port 5173)
                   (Dashboard, Patients, MRI Analysis, Reports, Feedback)
                                          │
                                   REST API / JWT
                                          │
                                          ▼
                           FastAPI Backend (Port 8001)
                     (Auth, Patients, Analysis, Review, Metrics)
                                    │           │
                    ┌───────────────┘           └───────────────┐
                    ▼                                           ▼
       PostgreSQL 16 (Docker: 5433)             Hierarchical ML Inference Pipeline
       - users                                  - Feature Extractor: EfficientNet-B0 (1280-d)
       - patients                               - Stage 1: Screening SVM (Demented / Non-Demented)
       - analyses                               - Stage 2: Staging SVM (Very Mild / Mild / Moderate)
       - doctor_reviews                         - Visual Explainability: Grad-CAM Heatmaps
```

---

## Key Features

- **Hierarchical Diagnostic Pipeline**:
  - **Stage 1 (Primary Screening)**: Binary classification detecting Non-Demented vs. Demented scans with 97.80% benchmark accuracy.
  - **Stage 2 (Severity Staging)**: For demented scans, categorizes severity into Very Mild, Mild, or Moderate with 97.92% benchmark accuracy.
  - **Raw SVM Decision Scores**: Distinguishes distance-to-hyperplane decision scores from calibrated probabilities for clinical transparency.
- **Grad-CAM Visual Explainability**: Real-time attention heatmaps highlighting key diagnostic anatomical regions (ventricles, hippocampus, temporal lobes).
- **Doctor Review & Clinical Feedback Loop**:
  - Clinicians can validate or dispute AI predictions directly from the analysis result view.
  - Record detailed clinician remarks, agreements, or diagnostic discrepancies.
  - Dedicated `/clinical-feedback` dashboard monitoring clinical agreement rate, confirmation counts, and audit logs.
- **Patient Management & Longitudinal History**:
  - Centralized patient directory with demographic details and analysis history.
  - Track individual patient disease progression over time across multiple MRI scans.
- **Clinical PDF Report Generation**: One-click generation and download of clinical summary reports including scan visuals, Grad-CAM overlays, decision scores, and doctor review remarks.
- **Clinical Dashboard**: Real-time overview of total patients, total analyses, high-risk cases, today's scans, and stage distributions.
- **Authentication & Security**: JWT bearer token authentication, bcrypt password hashing, and user profile management.

---

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router 7, Lucide Icons, jsPDF, html2canvas
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, Uvicorn
- **Machine Learning**: PyTorch, Torchvision, Scikit-learn, Joblib, Pillow, Matplotlib, NumPy
- **Database**: PostgreSQL 16 running in Docker Compose
- **Authentication**: JWT bearer tokens (`python-jose`) with bcrypt password hashing

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v18+) and **npm**
- **Python** (3.11 or newer)
- **Docker Desktop** with Docker Compose

> PostgreSQL does not need to be installed locally; it runs in a Docker container.

---

## First-time Setup

From the repository root (`neurovision-ai`):

### 1. Environment Configuration

```powershell
Copy-Item .env.example .env
```

### 2. Start PostgreSQL Container

```powershell
docker compose up -d
```

> **Database Port Note**: The database container is mapped to host port `5433` (e.g. `localhost:5433`) to prevent conflicts with any pre-existing local PostgreSQL service running on `5432`. Internally within Docker, PostgreSQL continues to listen on `5432`.

### 3. Backend Setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
python seed.py
```

The database migrations apply four revisions:
1. `0001_create_users`: User authentication and profile accounts
2. `0002_create_analyses`: Persisted MRI scan results, predictions, scores, and upload paths
3. `0003_create_patients`: Patient demographic and medical tracking records
4. `0004_create_doctor_reviews`: Doctor validation, agreement status, and clinical remarks

The seed command creates the default demo clinician account and eight sample patients:

```text
Clinician Email:    sarah.mitchell@neurovision.ai
Clinician Password: NeuroVision123!
```

> The ML model checkpoints are loaded from `../efficientnet/models` relative to the repository root. If your artifacts are in another folder, configure `ML_MODEL_DIR` in `.env`.

---

## Starting the Application

Use two terminals:

### Terminal 1: Backend API (FastAPI)

From `backend/` with the virtual environment activated:

```powershell
uvicorn app.main:app --reload --port 8001
```

FastAPI interactive documentation is available at [http://localhost:8001/docs](http://localhost:8001/docs).

### Terminal 2: Frontend (React / Vite)

From the `neurovision-ai` repository root:

```powershell
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How Frontend and Backend Connect

```text
React / Vite (:5173) ──► FastAPI Backend (:8001) ──► PostgreSQL Docker (:5433)
                                │
                                └──► ML Pipeline (EfficientNet-B0 + SVMs)
```

- Frontend API client is in `src/services/api.js`.
- By default, requests are routed to `http://localhost:8001/api`.
- JWT access tokens are stored in browser `localStorage` and sent in the `Authorization: Bearer <token>` header.
- To override the backend URL without changing source files, create `.env.local` in the repository root:
  ```text
  VITE_API_URL=http://localhost:8002/api
  ```
  Restart Vite after editing `.env.local`.

---

## Live MRI Inference Pipeline

When a doctor submits a scan via **New MRI Analysis** (`/analysis/new`):

1. **Request**: Sent to `POST /api/analysis/predict` with `multipart/form-data` containing:
   - `file`: 2D brain MRI scan (`.png`, `.jpg`, `.jpeg`)
   - `patient_id`: Selected patient ID (e.g. `NV-2026-0184`)
   - `clinical_notes`: Optional clinical observations
2. **Inference Flow**:
   - The image is validated and preprocessed (resized to 224x224, normalized using ImageNet statistics).
   - **Feature Extraction**: EfficientNet-B0 extracts a 1280-dimensional feature embedding vector.
   - **Stage 1 (Screening)**: Evaluated by `stage1_model.joblib`. If classified as **Non-Demented**, the diagnosis concludes as Non-Demented.
   - **Stage 2 (Staging)**: If Stage 1 detects dementia, the embedding is passed to `stage2_3class_model.joblib` to classify severity into **Very Mild**, **Mild**, or **Moderate**.
   - **Grad-CAM Generation**: Backpropagates gradients to the final convolutional layer of EfficientNet-B0, generating a visual attention heatmap overlaid on the original scan.
3. **Persistence**:
   - The scan image is saved to `backend/uploads/mri/`.
   - The Grad-CAM heatmap is saved to `backend/uploads/gradcam/`.
   - The analysis record, prediction labels, raw decision scores, and file paths are saved to PostgreSQL.
4. **Response**: Returns the complete record with prediction, scores, and base64-encoded Grad-CAM image data URL for instant rendering.

---

## Demonstration Walkthrough

Follow this sequence to demo the full application workflow:

1. **Verify Services**: Ensure Docker PostgreSQL is running (`docker compose ps`).
2. **Sign In**: Navigate to [http://localhost:5173](http://localhost:5173). Sign in with `sarah.mitchell@neurovision.ai` / `NeuroVision123!`.
3. **Explore Dashboard**: View live database statistics (Total Patients, Total Analyses, High Risk Cases, Analyses Today, and Stage Distribution chart).
4. **Browse Patients**: Click **Patients** in the sidebar. View pre-seeded patients and their latest diagnostic summaries.
5. **Run New MRI Analysis**:
   - Click **New Analysis** in the sidebar.
   - Select an existing patient (e.g., `Eleanor Bennett`).
   - Upload a brain MRI slice image (`.png`, `.jpg`, or `.jpeg`).
   - Enter optional clinical notes and click **Run Analysis**.
6. **Review Diagnostic Results**:
   - Inspect the **Primary Screening (Stage 1)** result and raw decision score.
   - If dementia is detected, view the **Severity Staging (Stage 2)** classification.
   - Examine the side-by-side comparison of the original MRI and the **Grad-CAM attention heatmap**.
   - Click the MRI scan thumbnail to view the full-resolution modal.
7. **Submit Doctor Clinical Feedback**:
   - On the result page, locate the **Doctor Review & Feedback** section.
   - Select **I agree with this diagnosis** (or discrepancy status).
   - Add clinical remarks (e.g., *"Confirmed mild hippocampal volume reduction consistent with clinical presentation."*).
   - Click **Submit Clinical Review**.
8. **Inspect Clinical Feedback Hub**:
   - Click **Clinical Feedback** in the sidebar (or navigate to `/clinical-feedback`).
   - Observe the live **Clinical Agreement Rate**, confirmed count, and corrections needed.
   - Filter reviews by stage or agreement status, or search by patient name or doctor.
9. **Generate & Download Clinical Report**:
   - On the analysis result page or **Reports** page, click **Download PDF Report**.
   - A PDF report is generated with patient information, model findings, decision scores, clinician notes, and doctor review status.
10. **Account Settings**:
    - Navigate to **Settings** to update profile name/email or change password, verifying persistence across sessions.

---

## REST API Reference

All protected endpoints require `Authorization: Bearer <access_token>`.

### Authentication & Profile
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | API service health check |
| `POST` | `/api/auth/login` | Validate user credentials and return JWT access token |
| `POST` | `/api/auth/logout` | Terminate frontend session |
| `GET` | `/api/auth/me` | Fetch authenticated user information |
| `GET` | `/api/settings/profile` | Read user profile |
| `PUT` | `/api/settings/profile` | Update user name and email |
| `PUT` | `/api/settings/password` | Change user password (validates current password, stores bcrypt hash) |

### Patients
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/patients` | List all patients with latest analysis summary |
| `GET` | `/api/patients/{patient_id}` | Retrieve individual patient details and analysis count |
| `POST` | `/api/patients` | Register a new patient |
| `PUT` | `/api/patients/{patient_id}` | Update existing patient details |

### Dashboard
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Return summary counts, recent predictions, and stage distributions |

### MRI Analysis & Inference
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analysis/predict` | Upload MRI scan, run hierarchical inference & Grad-CAM, save analysis |
| `GET` | `/api/analysis` | List all completed analyses (newest first) |
| `GET` | `/api/analysis/{analysis_id}` | Get detailed analysis result by ID |
| `GET` | `/api/analysis/patient/{patient_id}` | Get all analyses for a specific patient |
| `GET` | `/api/analysis/{analysis_id}/image` | Stream saved original MRI scan file (authenticated) |

### Doctor Reviews & Clinical Feedback
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analysis/reviews` | List all doctor reviews across all analyses with patient and stage details |
| `GET` | `/api/analysis/{analysis_id}/review` | Fetch doctor review for a specific analysis |
| `POST` | `/api/analysis/{analysis_id}/review` | Submit or update doctor clinical feedback (agree/disagree and remarks) |
| `PUT` | `/api/analysis/{analysis_id}/review` | Update existing doctor clinical review |
| `DELETE` | `/api/analysis/{analysis_id}/review` | Delete doctor clinical review |

---

## Database Architecture

The PostgreSQL schema is managed via Alembic migrations:

```
┌────────────────┐          ┌────────────────┐          ┌───────────────────────┐
│     users      │          │    patients    │          │     doctor_reviews    │
├────────────────┤          ├────────────────┤          ├───────────────────────┤
│ id (PK)        │          │ id (PK)        │          │ id (PK)               │
│ name           │          │ patient_id (UQ)│◄───┐     │ analysis_id (FK) ─────┼──┐
│ email (UQ)     │          │ name           │    │     │ doctor_id (FK) ───────┼──┼──┐
│ password_hash  │          │ age            │    │     │ is_correct            │  │  │
│ role           │          │ gender         │    │     │ remarks               │  │  │
│ created_at     │          │ created_at     │    │     │ created_at            │  │  │
│ updated_at     │          │ updated_at     │    │     │ updated_at            │  │  │
└───────┬────────┘          └────────────────┘    │     └───────────────────────┘  │  │
        │                                         │                                │  │
        │                                         │                                │  │
        │                   ┌─────────────────────┴──────────┐                     │  │
        │                   │           analyses             │                     │  │
        │                   ├────────────────────────────────┤                     │  │
        │                   │ id (PK)                        │                     │  │
        │                   │ analysis_id (UQ) ──────────────┼─────────────────────┘  │
        │                   │ patient_id (FK)                │                        │
        │                   │ patient_name                   │                        │
        │                   │ mri_filename                   │                        │
        │                   │ mri_path                       │                        │
        │                   │ gradcam_path                   │                        │
        │                   │ stage1_prediction              │                        │
        │                   │ stage1_decision_score          │                        │
        │                   │ stage2_prediction              │                        │
        │                   │ stage2_decision_score          │                        │
        │                   │ final_prediction               │                        │
        │                   │ clinical_notes                 │                        │
        │                   │ status                         │                        │
        │                   │ analysis_date                  │                        │
        │                   │ created_at                     │                        │
        │                   └────────────────────────────────┘                        │
        └─────────────────────────────────────────────────────────────────────────────┘
```

### Database Management Commands

Run from `backend/` with the virtual environment active:

```powershell
alembic upgrade head       # Apply all pending database migrations
python seed.py             # Seed demo clinician and development patients
```

Docker lifecycle commands from repository root:

```powershell
docker compose up -d       # Start PostgreSQL container in background
docker compose ps          # Inspect container status and health
docker compose logs postgres  # View PostgreSQL logs
docker compose down        # Stop container while preserving data volume
docker compose down -v     # Stop container and wipe database volume
```

### Inspect Database Directly

```powershell
# Query users table
docker exec neurovision-postgres psql -U postgres -d neurovision -c "SELECT id, name, email, role FROM users;"

# Query patients table
docker exec neurovision-postgres psql -U postgres -d neurovision -c "SELECT patient_id, name, age, gender FROM patients;"

# Query analyses table
docker exec neurovision-postgres psql -U postgres -d neurovision -c "SELECT analysis_id, patient_id, final_prediction, status, analysis_date FROM analyses ORDER BY created_at DESC;"

# Query doctor reviews table
docker exec neurovision-postgres psql -U postgres -d neurovision -c "SELECT id, analysis_id, doctor_id, is_correct, remarks FROM doctor_reviews;"
```

---

## Project Structure

```text
neurovision-ai/
├── docker-compose.yml              # PostgreSQL 16 service definition
├── .env.example                    # Environment variable template
├── package.json                    # Frontend dependencies and scripts
├── vite.config.js                  # Vite configuration
│
├── backend/
│   ├── alembic.ini                 # Alembic migration configuration
│   ├── requirements.txt            # Python dependencies
│   ├── seed.py                     # Initial seed script (clinician & patients)
│   ├── alembic/
│   │   ├── env.py                  # Migration runner environment
│   │   └── versions/               # Version-controlled migrations (0001 - 0004)
│   │
│   ├── app/
│   │   ├── main.py                 # FastAPI application, CORS, lifespan handler
│   │   ├── config.py               # Settings and environment configuration
│   │   ├── database.py             # SQLAlchemy session and engine setup
│   │   ├── core/
│   │   │   └── security.py         # Passlib/bcrypt hashing & JWT generation
│   │   ├── dependencies/
│   │   │   └── auth.py             # Bearer token validation and user injection
│   │   ├── ml/
│   │   │   ├── service.py          # ML model loader & prediction coordinator
│   │   │   ├── pipeline.py         # Image preprocessing & feature extraction
│   │   │   └── gradcam.py          # Grad-CAM heatmap generator
│   │   ├── models/
│   │   │   ├── user.py             # User SQLAlchemy model
│   │   │   ├── patient.py          # Patient SQLAlchemy model
│   │   │   ├── analysis.py         # Analysis SQLAlchemy model
│   │   │   └── doctor_review.py    # DoctorReview SQLAlchemy model
│   │   ├── routers/
│   │   │   ├── auth.py             # Sign in, sign out, /me endpoints
│   │   │   ├── settings.py         # Profile & password management
│   │   │   ├── patients.py         # Patient CRUD endpoints
│   │   │   ├── analysis.py         # Prediction, analysis history, reviews, image serving
│   │   │   └── dashboard.py        # Aggregated statistics and distribution counts
│   │   ├── schemas/                # Pydantic v2 validation schemas
│   │   └── services/               # Internal business logic services
│   │
│   └── uploads/                    # Local storage (Git-ignored)
│       ├── mri/                    # Saved uploaded MRI scans
│       └── gradcam/                # Generated Grad-CAM heatmap images
│
└── src/
    ├── App.jsx                     # Application router and protected routes
    ├── main.jsx                    # React entrypoint
    ├── context/
    │   ├── AuthContext.jsx         # React authentication context provider
    │   └── useAuth.js              # Custom hook for auth state
    ├── components/
    │   ├── layout/                 # MainLayout, Sidebar, Header, PageBackground
    │   ├── dashboard/              # StatCard, RecentPredictions, StageDistribution
    │   └── common/                 # Reusable UI components
    ├── pages/
    │   ├── Login.jsx               # Clinician authentication screen
    │   ├── Dashboard.jsx           # Diagnostic metrics and overview
    │   ├── Patients.jsx            # Patient directory and registration
    │   ├── PatientDetails.jsx      # Individual patient profile & scan history
    │   ├── NewAnalysis.jsx         # MRI scan upload and inference trigger
    │   ├── PredictionResult.jsx    # Diagnostic result, Grad-CAM, feedback form, PDF export
    │   ├── History.jsx             # Comprehensive past analysis log
    │   ├── Reports.jsx             # Clinical report generator & download center
    │   ├── ClinicalFeedback.jsx    # Doctor review analytics, agreement rate, audit log
    │   └── Settings.jsx            # Account profile and password update forms
    ├── services/
    │   └── api.js                  # Frontend REST API client
    └── utils/
        ├── analysisAdapter.js      # Formats API analysis payloads for UI
        ├── patientAdapter.js       # Formats API patient payloads for UI
        └── reportGenerator.js      # Client-side PDF clinical report generator
```

---

## Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/neurovision` | PostgreSQL connection string |
| `JWT_SECRET` | `change-this-secret` | Cryptographic secret for signing JWT tokens |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Lifespan of access tokens in minutes |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed frontend origin URLs for CORS |
| `ML_MODEL_DIR` | `../efficientnet/models` | Path to trained Stage 1 & Stage 2 model checkpoints |
| `UPLOAD_DIR` | `uploads` | Directory for storing uploaded MRIs and Grad-CAMs |
| `VITE_API_URL` (frontend) | `http://localhost:8001/api` | API base URL for frontend requests (in `.env.local`) |

---

## Model Benchmark Summary

The underlying machine learning models were trained on 2D structural MRI slices from the OASIS dataset:

| Stage | Task | Architecture | Holdout Samples | Accuracy | Macro F1 |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Stage 1 (Screening)** | Non-Demented vs. Demented | EfficientNet-B0 + RBF SVM | 3,458 | **97.80%** | **0.9681** |
| **Stage 2 (Staging)** | Very Mild vs. Mild vs. Moderate | EfficientNet-B0 + RBF SVM | 769 | **97.92%** | **0.9279** |

---

## Clinical Safety Disclaimer

NeuroVision AI is developed for research, academic evaluation, and clinical decision-support demonstration purposes. While the underlying models achieve high diagnostic accuracy, automated predictions should not be used as the sole basis for clinical diagnosis or treatment without independent verification by qualified medical professionals.
