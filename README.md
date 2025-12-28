
  # Green Supply Chain Tracker

  This is a code bundle for Green Supply Chain Tracker. The original project is available at https://www.figma.com/design/pEah3IUZzeqRceqLBuFlwA/Green-Supply-Chain-Tracker.

## Features

- **Emission Tracking**: Track CO2 emissions for shipments across different vehicle and fuel types
- **ML-Powered Predictions**: Machine learning models for accurate emission predictions
- **Anomaly Detection**: AI-powered anomaly and efficiency detection
- **Analytics Dashboard**: Comprehensive analytics and insights
- **Efficiency Analysis**: Identify inefficient shipments and optimization opportunities

## Setup

### Frontend (React/TypeScript)

1. Install dependencies:
```bash
npm i
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port Vite assigns)

### Backend (Python API)

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Create models directory:
```bash
mkdir -p models
```

3. Start the Python API server:
```bash
# Option 1: Direct command
python api/app.py

# Option 2: Using the startup script
# Windows PowerShell:
.\start-api.bat

# Windows CMD:
start-api.bat

# Linux/Mac:
./start-api.sh
```

The API will be available at `http://localhost:5000`

**Note**: If you see a NumPy version warning, update your packages:
```bash
pip install --upgrade "numpy>=1.22.4,<2.3.0"
```

### Environment Variables (Optional)

Create a `.env` file in the root directory to configure the API URL:
```
VITE_API_URL=http://localhost:5000
```

If not set, it defaults to `http://localhost:5000`

## Project Structure

```
├── api/                    # Python backend API
│   ├── app.py             # Flask API server
│   └── README.md         # API documentation
├── src/
│   ├── components/       # React components
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── EfficiencyAnalysis.tsx  # New ML-powered analysis
│   │   ├── ShipmentForm.tsx        # Enhanced with ML prediction
│   │   └── ...
│   ├── services/         # API services
│   │   └── api.ts        # TypeScript API client
│   └── ...
├── emission_predict.ipynb           # Jupyter notebook for emission prediction
├── Anomaly & Efficiency Detection.ipynb  # Jupyter notebook for anomaly detection
├── requirements.txt      # Python dependencies
└── package.json         # Node.js dependencies
```

## Usage

### ML Emission Prediction

1. Open the Shipment Form
2. Fill in vehicle type, fuel type, weight, and distance
3. Click "ML Predict" to get AI-powered emission predictions
4. Compare with formula-based calculations

### Anomaly Detection

1. Navigate to Analytics Dashboard
2. Click on "Efficiency Analysis" tab
3. View detected anomalies, inefficient shipments, and recommendations
4. Review efficiency scores and optimization suggestions

## Jupyter Notebooks

The project includes two Jupyter notebooks:

1. **emission_predict.ipynb**: Train and evaluate emission prediction models
2. **Anomaly & Efficiency Detection.ipynb**: Analyze anomalies and efficiency patterns

These notebooks can be run independently for data analysis and model development.

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/predict-emission` - Predict CO2 emissions
- `POST /api/detect-anomalies` - Detect anomalies in shipments
- `POST /api/analyze-efficiency` - Analyze overall efficiency metrics

See `api/README.md` for detailed API documentation.

## Technologies

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Python, Flask, scikit-learn, pandas, numpy
- **ML Models**: Random Forest, Isolation Forest
  