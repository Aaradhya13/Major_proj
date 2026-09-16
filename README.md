# NeuroVision AI

NeuroVision AI is a React + Vite clinical decision-support frontend with a FastAPI backend for authentication and user settings. MRI analysis remains mock data for now; the backend is structured so a future Python ML prediction service can be added separately.

## Technology

- Frontend: React 19, Vite, Tailwind CSS, React Router
- Backend: Python, FastAPI, SQLAlchemy, Alembic, Pydantic
- Database: PostgreSQL 16 running in Docker Compose
- Authentication: JWT bearer tokens and bcrypt password hashing

## Prerequisites

Install or have available:

- Node.js and npm
- Python 3.11 or newer
- Docker Desktop with Docker Compose

PostgreSQL does not need to be installed locally.

## First-time Setup

From the repository root:

```powershell
git clone <repository-url>
cd neurovision-ai

Copy-Item .env.example .env
docker compose up -d

cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
python seed.py
```

The Docker database is exposed on host port `5433`. This project uses `5433` because port `5432` is already used by another local PostgreSQL process on the development machine. PostgreSQL still listens on its normal internal container port `5432`.

The seed command creates this development/demo account if it does not already exist:

```text
Email:    sarah.mitchell@neurovision.ai
Password: NeuroVision123!
```

The password is stored as a bcrypt hash. Do not use this account in production.

## Start the Application

Use two terminals.

Terminal 1, from `backend/` with the virtual environment active:

```powershell
uvicorn app.main:app --reload --port 8001
```

Terminal 2, from the repository root:

```powershell
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The frontend calls the API at `http://localhost:8001/api` by default.

### How Frontend and Backend Connect

The local request flow is:

```text
React/Vite:5173
   -> FastAPI:8001
      -> PostgreSQL Docker container:5433
```

The frontend API client is in `src/services/api.js`. It uses the default URL `http://localhost:8001/api`, sends the JWT as a bearer token, and stores that token in browser `localStorage`. Do not change the backend URL in code for a different machine; create `.env.local` in the repository root instead:

```text
VITE_API_URL=http://localhost:8002/api
```

Restart Vite after changing `.env.local`.

## Demo Session: Test the Backend Through the Frontend

This is the recommended sequence to show during a demo:

1. Confirm PostgreSQL is running:

   ```powershell
   docker compose ps
   ```

   The `neurovision-postgres` service should show `healthy`.

2. Start FastAPI on port `8001` and start Vite on port `5173`.
3. Open the frontend. An unauthenticated visitor is redirected to `/login`.
4. Sign in with the demo email and password above.
5. Confirm the dashboard opens and the signed-in doctor name appears in the top navigation.
6. Open **Settings**.
7. Change the name or email and select **Save profile**. The success message confirms the update was persisted through FastAPI and PostgreSQL.
8. Refresh the browser. The saved profile should still be displayed.
9. Enter the current password and a new password, then select **Change password**.
10. Select the logout icon. The app should return to `/login` and remove the frontend token.
11. Sign in again with the new password to prove password persistence.
12. For repeatable demos, restore the documented password from Settings before finishing, or run the password change flow again with the current password.

The dashboard, patient, analysis, history, and report content is still mock frontend data. The login, logout, `/me`, profile, and password operations are the live backend-connected portion.

## API Port Override

If port `8001` is unavailable, start FastAPI on another port, for example:

```powershell
uvicorn app.main:app --reload --port 8002
```

Before starting or restarting Vite, create a frontend `.env.local` file in the repository root:

```text
VITE_API_URL=http://localhost:8002/api
```

Then run `npm run dev` again. `.env.local` is ignored by Git through the existing `*.local` rule.

## API Endpoints

All routes are under `/api` unless noted. Protected routes require `Authorization: Bearer <access_token>`.

| Method | Endpoint                 | Purpose                                            |
| ------ | ------------------------ | -------------------------------------------------- |
| GET    | `/health`                | API health check                                   |
| POST   | `/api/auth/login`        | Validate credentials and issue a JWT               |
| POST   | `/api/auth/logout`       | End the frontend authentication session            |
| GET    | `/api/auth/me`           | Return the authenticated user                      |
| GET    | `/api/settings/profile`  | Read the authenticated user's profile              |
| PUT    | `/api/settings/profile`  | Update the user's name and email                   |
| PUT    | `/api/settings/password` | Verify the current password and save a bcrypt hash |

Password fields are never returned in API responses.

## Database Commands

Run these from `backend/` with the virtual environment active:

```powershell
alembic upgrade head
python seed.py
```

Docker lifecycle commands run from the repository root:

```powershell
docker compose up -d
docker compose ps
docker compose logs postgres
docker compose down       # Stop PostgreSQL and keep the volume
docker compose down -v    # Stop PostgreSQL and delete all database data
```

### View Saved Database Data

The PostgreSQL server runs inside Docker. Use `docker exec` to inspect it; PostgreSQL does not need to be installed on the host machine.

Check the container:

```powershell
docker compose ps
```

Open a PostgreSQL shell inside the container:

```powershell
docker exec -it neurovision-postgres psql -U postgres -d neurovision
```

Then run SQL commands at the `neurovision=#` prompt:

```sql
\dt
SELECT id, name, email, role, created_at, updated_at FROM users;
\q
```

Or run a query directly from PowerShell without opening an interactive shell:

```powershell
docker exec neurovision-postgres psql -U postgres -d neurovision -c "SELECT id, name, email, role, created_at, updated_at FROM users;"
```

The `users` table stores the profile and a bcrypt password hash. Plain-text passwords are never stored or returned. The JWT is stored only in the browser. Dashboard, patient, analysis, history, and report records are currently mock frontend data and are not stored in PostgreSQL yet.

## Frontend Commands

Run these from the repository root:

```powershell
npm run dev
npm run lint
npm run build
npm run preview
```

## Project Structure

```text
backend/
├── app/
│   ├── core/security.py
│   ├── dependencies/auth.py
│   ├── models/user.py
│   ├── routers/auth.py
│   ├── routers/settings.py
│   ├── schemas/auth.py
│   ├── schemas/user.py
│   ├── services/auth_service.py
│   └── main.py
├── alembic/
├── alembic.ini
├── requirements.txt
└── seed.py
src/
├── context/              # Frontend authentication state
├── pages/Login.jsx       # Login screen
├── pages/Settings.jsx    # Profile and password forms
└── services/api.js       # Fetch wrapper and token handling
```

## Environment Variables

Copy `.env.example` to `.env` for local backend configuration:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/neurovision
JWT_SECRET=change-this-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173
```

Use a strong, private `JWT_SECRET` outside development.

## Disclaimer

NeuroVision AI is a demonstration and clinical decision-support application. Its mock predictions are not medical advice, a diagnosis, or a clinical device.
