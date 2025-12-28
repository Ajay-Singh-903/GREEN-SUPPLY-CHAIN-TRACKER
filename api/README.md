# Green Supply Chain Tracker - Python API

This is the Python backend API that provides machine learning capabilities for emission prediction and anomaly detection.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Create models directory:
```bash
mkdir -p models
```

3. Run the API server:
```bash
python api/app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Emission Prediction
- `POST /api/predict-emission` - Predict CO2 emissions for a shipment
  ```json
  {
    "vehicleType": "truck",
    "fuelType": "electric",
    "weight": 2000,
    "distance": 500
  }
  ```

### Anomaly Detection
- `POST /api/detect-anomalies` - Detect anomalies in shipment data
  ```json
  {
    "shipments": [
      {
        "id": "1",
        "vehicleType": "truck",
        "fuelType": "diesel",
        "weight": 2000,
        "distance": 500,
        "emissionsCO2": 620
      }
    ]
  }
  ```

### Efficiency Analysis
- `POST /api/analyze-efficiency` - Analyze overall efficiency metrics
  ```json
  {
    "shipments": [...]
  }
  ```

## Model Training

Models are automatically trained on first API call if saved models don't exist. Trained models are saved in the `models/` directory for faster subsequent loads.

