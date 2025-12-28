# Quick Start Guide

## Fix NumPy Version Warning

If you see a NumPy version warning when starting the API, run:

```bash
pip install --upgrade "numpy>=1.22.4,<2.3.0"
```

Or reinstall all requirements:

```bash
pip install -r requirements.txt --upgrade
```

## Starting the Application

### 1. Start Python API (Terminal 1)

**Windows PowerShell:**
```powershell
.\start-api.bat
```

**Windows CMD:**
```cmd
start-api.bat
```

**Linux/Mac:**
```bash
./start-api.sh
```

**Or directly:**
```bash
python api/app.py
```

The API will start at `http://localhost:5000`

### 2. Start Frontend (Terminal 2)

```bash
npm run dev
```

The frontend will start at `http://localhost:5173` (or similar)

## Testing the Integration

1. Open the frontend in your browser
2. Go to Manager Dashboard → Shipments
3. Click "New Shipment"
4. Fill in the form and click **"ML Predict"** to test the ML prediction
5. Go to Analytics → **Efficiency Analysis** tab to see anomaly detection

## Troubleshooting

### API not connecting?
- Make sure the Python API is running on port 5000
- Check that CORS is enabled (it should be by default)
- Verify the API health endpoint: `http://localhost:5000/api/health`

### NumPy warnings?
- The warning is safe to ignore, but you can fix it by downgrading NumPy:
  ```bash
  pip install "numpy<2.3.0"
  ```

### Models not training?
- Make sure the `models/` directory exists
- Check Python console for error messages
- Models will auto-train on first API call

