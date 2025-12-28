# Green Supply Chain Tracker — Project Report

## Overview

The Green Supply Chain Tracker is a full-stack project focused on measuring, predicting, and improving CO2 emissions for shipments. It combines a React + TypeScript frontend with a Python (Flask) backend that provides ML-powered emission prediction, anomaly detection, and efficiency analysis.

## Quick Facts

- **Repository root:** `C:/Users/PANKAJ/Downloads/Green Supply Chain Tracker`
- **Frontend:** React + TypeScript (Vite)
- **Backend:** Python (Flask) with scikit-learn models
- **ML:** Random Forest for emission prediction; Isolation Forest for anomaly detection
- **Notebooks:** `emission_predict.ipynb`, `Anomaly & Efficiency Detection.ipynb`

## Project Structure (high level)

- **`api/`**: Flask API server and ML model training/loading (`app.py`, `README.md`).
- **`src/`**: React app with components (`components/`), services (`services/api.ts`), styles, and utilities.
- **`models/`**: Persisted model files (created at runtime by the API).
- **Root files**: `package.json`, `requirements.txt`, `start-api.bat`, `start-api.sh`, notebooks and docs.

## Tech Stack and Dependencies

- **Frontend packages**: React 18, Vite, Recharts, Radix UI primitives, Tailwind-related utilities.
- **Backend packages** (from `requirements.txt`): `flask==3.0.0`, `flask-cors==4.0.0`, `pandas==2.1.3`, `numpy>=1.22.4,<2.3.0`, `scikit-learn==1.3.2`, `joblib==1.3.2`.

## How to Run (developer quick start)

1. Install Node deps and start frontend:

```powershell
npm i
npm run dev
```

Frontend default: `http://localhost:5173` (Vite).

2. Install Python deps and start backend API:

```powershell
pip install -r requirements.txt
cd api
python app.py
# or from repo root on Windows PowerShell
.\start-api.bat
```

API default: `http://localhost:5000`.

Environment variable (optional): create `.env` with `VITE_API_URL=http://localhost:5000` to point the frontend to the API.

## API Endpoints (implemented in `api/app.py`)

- `GET /api/health` — health check
- `POST /api/predict-emission` — accepts JSON with `vehicleType`, `fuelType`, `weight`, `distance`; returns ML prediction vs formula and a confidence indicator
- `POST /api/detect-anomalies` — accepts a `shipments` array; returns per-shipment anomaly flags and efficiency metrics
- `POST /api/analyze-efficiency` — aggregated efficiency and emissions statistics

Implementation notes:
- The API will attempt to load models from `models/` if present; otherwise it trains synthetic data on startup and persists models under `models/`.
- Emission factors are defined in `EMISSION_FACTORS` inside `api/app.py` and used both for formula calculations and to simulate training data.

## Notebooks and ML

- `emission_predict.ipynb`: notebook for training/evaluating emission prediction models.
- `Anomaly & Efficiency Detection.ipynb`: notebook for exploring anomaly detection and efficiency scoring.

The Flask API uses a saved `RandomForestRegressor` for predictions and an `IsolationForest` for anomalies (trained on synthetic data if no saved models are found).

## Observations & Recommendations

- **Model persistence:** The API saves models to `models/` on first training. For real deployments, check-in a model versioning strategy or use a model registry rather than training on startup.
- **NumPy compatibility:** `requirements.txt` pins `numpy>=1.22.4,<2.3.0` to avoid scikit-learn compatibility issues; test upgrades carefully.
- **Input validation:** Some endpoints assume fields are present and will raise errors if types are unexpected. Add stricter validation and clear error responses for production readiness.
- **Testing:** Add unit tests for API endpoints and integration tests for end-to-end flows (frontend -> API). Consider `pytest` + `requests` or `flask` test client.
- **CI/CD:** Add automated linting (ESLint/Prettier for frontend, flake8/black for backend), tests, and a CI pipeline to run them on PRs.
- **Security:** If exposing the API, add rate limiting, authentication, and CORS policy tightening as needed.
- **Performance:** Model training happens in-process; long-running training could block startup. Pre-train models offline and load them at startup for production.

## Suggested Next Steps

- Add an end-to-end README `CONTRIBUTING.md` and a short `QUICK_START.md` (there is already a `QUICK_START.md` — review/expand it).
- Add automated tests for the API (happy/error paths) and run them in CI.
- Add sample data and a script to seed `models/` and demo datasets to speed developer onboarding.
- Create a small postman/insomnia collection demonstrating payload formats for `predict-emission` and `detect-anomalies`.

## Files of interest

- `api/app.py` — main API and ML logic
- `package.json` — frontend deps and scripts (`npm run dev`)
- `requirements.txt` — Python deps
- `start-api.bat` / `start-api.sh` — quick-start for API
- `src/services/api.ts` — TypeScript client used by the frontend (inspect to confirm request shapes)

## Contact / Maintainers

If you (the developer) want, I can:

- run the API locally and exercise endpoints with sample payloads,
- scaffold tests and CI workflow,
- or expand this report into `REPORT.pdf` or a `docs/` site.

---
Generated automatically: high-level summary and actionable recommendations. Ask me to expand any section or to open and modify files (tests, CI, or documentation).
