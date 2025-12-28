from flask import Flask, request, jsonify
from flask_cors import CORS
import warnings
# Suppress NumPy version warnings (safe to ignore if NumPy 2.3+ works with scikit-learn)
warnings.filterwarnings('ignore', category=UserWarning, module='sklearn.utils._param_validation')
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Emission factors matching the TypeScript project
EMISSION_FACTORS = {
    ('truck', 'diesel'): 0.62,
    ('truck', 'petrol'): 0.68,
    ('truck', 'electric'): 0.15,
    ('truck', 'hybrid'): 0.35,
    ('truck', 'cng'): 0.45,
    ('van', 'diesel'): 0.48,
    ('van', 'petrol'): 0.52,
    ('van', 'electric'): 0.12,
    ('train', 'diesel'): 0.22,
    ('train', 'electric'): 0.05,
    ('ship', 'diesel'): 0.015,
    ('plane', 'petrol'): 1.2,
}

# Initialize models (will be loaded or trained on first use)
emission_model = None
vehicle_encoder = None
fuel_encoder = None
anomaly_model = None
anomaly_scaler = None

def initialize_models():
    """Initialize or train models"""
    global emission_model, vehicle_encoder, fuel_encoder, anomaly_model, anomaly_scaler
    
    # Try to load saved models
    if os.path.exists('models/emission_model.pkl'):
        try:
            emission_model = joblib.load('models/emission_model.pkl')
            vehicle_encoder = joblib.load('models/vehicle_encoder.pkl')
            fuel_encoder = joblib.load('models/fuel_encoder.pkl')
        except Exception as e:
            print(f"Error loading saved models: {e}")
            # Continue to train new models
    
    # Always ensure anomaly models are initialized
    train_anomaly_model()
    
    # Train emission model if not loaded
    if emission_model is None:
        train_emission_model()

def train_emission_model():
    """Train emission prediction model"""
    global emission_model, vehicle_encoder, fuel_encoder
    
    np.random.seed(42)
    vehicle_types = ['truck', 'train', 'ship', 'plane', 'van']
    n_samples = 1000
    data = []
    
    for i in range(n_samples):
        vehicle = np.random.choice(vehicle_types)
        if vehicle == 'truck':
            fuel = np.random.choice(['diesel', 'petrol', 'electric', 'hybrid', 'cng'])
        elif vehicle == 'van':
            fuel = np.random.choice(['diesel', 'petrol', 'electric'])
        elif vehicle == 'train':
            fuel = np.random.choice(['diesel', 'electric'])
        elif vehicle == 'ship':
            fuel = 'diesel'
        else:
            fuel = 'petrol'
        
        weight = np.random.uniform(100, 5000)
        distance = np.random.uniform(50, 2000)
        
        factor = EMISSION_FACTORS.get((vehicle, fuel), 0.5)
        base_emissions = factor * distance * (weight / 1000)
        noise = np.random.normal(0, base_emissions * 0.1)
        emissions = max(0, base_emissions + noise)
        
        data.append({
            'vehicle_type': vehicle,
            'fuel_type': fuel,
            'weight': weight,
            'distance': distance,
            'emissions_co2': emissions
        })
    
    df = pd.DataFrame(data)
    
    # Encode categorical variables
    vehicle_encoder = LabelEncoder()
    fuel_encoder = LabelEncoder()
    
    df['vehicle_type_encoded'] = vehicle_encoder.fit_transform(df['vehicle_type'])
    df['fuel_type_encoded'] = fuel_encoder.fit_transform(df['fuel_type'])
    
    # Feature engineering
    df['weight_ton'] = df['weight'] / 1000
    df['distance_weight_ratio'] = df['distance'] / df['weight']
    
    # Prepare features
    feature_cols = ['vehicle_type_encoded', 'fuel_type_encoded', 'weight', 'distance', 
                    'weight_ton', 'distance_weight_ratio']
    X = df[feature_cols]
    y = df['emissions_co2']
    
    # Train model
    emission_model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10)
    emission_model.fit(X, y)
    
    # Save models
    os.makedirs('models', exist_ok=True)
    joblib.dump(emission_model, 'models/emission_model.pkl')
    joblib.dump(vehicle_encoder, 'models/vehicle_encoder.pkl')
    joblib.dump(fuel_encoder, 'models/fuel_encoder.pkl')

def train_anomaly_model():
    """Train anomaly detection model"""
    global anomaly_model, anomaly_scaler
    
    # Initialize models (they will be fitted when data is provided)
    if anomaly_model is None:
        anomaly_model = IsolationForest(contamination=0.1, random_state=42)
    if anomaly_scaler is None:
        anomaly_scaler = StandardScaler()

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'API is running'})

@app.route('/api/predict-emission', methods=['POST'])
def predict_emission():
    """Predict CO2 emissions for a shipment"""
    global emission_model, vehicle_encoder, fuel_encoder
    
    if emission_model is None:
        initialize_models()
    
    try:
        data = request.json
        vehicle_type = data.get('vehicleType')
        fuel_type = data.get('fuelType')
        weight = float(data.get('weight', 0))
        distance = float(data.get('distance', 0))
        
        if not all([vehicle_type, fuel_type, weight, distance]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Encode categorical variables
        vehicle_encoded = vehicle_encoder.transform([vehicle_type])[0]
        fuel_encoded = fuel_encoder.transform([fuel_type])[0]
        
        # Feature engineering
        weight_ton = weight / 1000
        distance_weight_ratio = distance / weight if weight > 0 else 0
        
        # Prepare features
        features = np.array([[vehicle_encoded, fuel_encoded, weight, distance, 
                             weight_ton, distance_weight_ratio]])
        
        # Predict
        prediction = emission_model.predict(features)[0]
        
        # Also calculate using formula for comparison
        factor = EMISSION_FACTORS.get((vehicle_type, fuel_type), 0.5)
        formula_emission = factor * distance * (weight / 1000)
        
        return jsonify({
            'predictedEmissions': float(prediction),
            'formulaEmissions': float(formula_emission),
            'difference': float(abs(prediction - formula_emission)),
            'confidence': 'high' if abs(prediction - formula_emission) < formula_emission * 0.2 else 'medium'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/detect-anomalies', methods=['POST'])
def detect_anomalies():
    """Detect anomalies in shipment data"""
    global anomaly_model, anomaly_scaler
    
    # Ensure models are initialized
    if anomaly_model is None or anomaly_scaler is None:
        initialize_models()
        # Double-check after initialization
        if anomaly_model is None:
            train_anomaly_model()
        if anomaly_scaler is None:
            anomaly_scaler = StandardScaler()
    
    try:
        shipments = request.json.get('shipments', [])
        
        if not shipments:
            return jsonify({'error': 'No shipments provided'}), 400
        
        # Convert to DataFrame
        df = pd.DataFrame(shipments)
        
        # Calculate efficiency metrics
        df['emissions_per_km'] = df['emissionsCO2'] / df['distance'].replace(0, 1)
        df['emissions_per_kg'] = df['emissionsCO2'] / df['weight'].replace(0, 1)
        df['eco_points'] = df.apply(
            lambda x: max(0, round(1000 - (x['emissionsCO2'] / x['distance'] if x['distance'] > 0 else 0) * 10)),
            axis=1
        )
        
        # Prepare features for anomaly detection
        feature_cols = ['weight', 'distance', 'emissionsCO2', 'emissions_per_km', 
                       'emissions_per_kg', 'eco_points']
        X = df[feature_cols].values
        
        # Scale features (fit_transform will fit and transform in one step)
        X_scaled = anomaly_scaler.fit_transform(X)
        
        # Detect anomalies
        predictions = anomaly_model.fit_predict(X_scaled)
        scores = anomaly_model.score_samples(X_scaled)
        
        # Calculate efficiency scores
        def calculate_efficiency(row):
            max_emissions_per_km = 2.0
            max_emissions_per_kg = 0.5
            max_eco_points = 1000
            
            emissions_km_score = max(0, (1 - row['emissions_per_km'] / max_emissions_per_km) * 50)
            emissions_kg_score = max(0, (1 - row['emissions_per_kg'] / max_emissions_per_kg) * 30)
            eco_points_score = (row['eco_points'] / max_eco_points) * 20
            
            return emissions_km_score + emissions_kg_score + eco_points_score
        
        df['efficiency_score'] = df.apply(calculate_efficiency, axis=1)
        df['is_anomaly'] = predictions == -1
        df['anomaly_score'] = scores
        
        # Identify inefficient shipments
        inefficient_threshold = df['efficiency_score'].quantile(0.25)
        df['is_inefficient'] = df['efficiency_score'] < inefficient_threshold
        
        # Route inefficiency
        df['distance_weight_ratio'] = df['distance'] / df['weight'].replace(0, 1)
        df['route_inefficient'] = df['distance_weight_ratio'] > df['distance_weight_ratio'].quantile(0.9)
        
        # Prepare results
        results = []
        for idx, row in df.iterrows():
            results.append({
                'id': shipments[idx].get('id', str(idx)),
                'isAnomaly': bool(row['is_anomaly']),
                'anomalyScore': float(row['anomaly_score']),
                'efficiencyScore': float(row['efficiency_score']),
                'isInefficient': bool(row['is_inefficient']),
                'routeInefficient': bool(row['route_inefficient']),
                'emissionsPerKm': float(row['emissions_per_km']),
                'recommendations': generate_recommendations(row, shipments[idx])
            })
        
        summary = {
            'totalShipments': len(shipments),
            'anomaliesDetected': int(df['is_anomaly'].sum()),
            'inefficientShipments': int(df['is_inefficient'].sum()),
            'routeInefficiencies': int(df['route_inefficient'].sum()),
            'averageEfficiency': float(df['efficiency_score'].mean()),
            'averageEmissionsPerKm': float(df['emissions_per_km'].mean())
        }
        
        return jsonify({
            'results': results,
            'summary': summary
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_recommendations(row, shipment):
    """Generate recommendations for a shipment"""
    recommendations = []
    
    if row['is_inefficient']:
        recommendations.append('Consider optimizing vehicle and fuel type selection')
    
    if row['route_inefficient']:
        recommendations.append('Route optimization could reduce distance and emissions')
    
    if row['emissions_per_km'] > 1.0:
        recommendations.append('High emissions per km - consider electric or hybrid vehicles')
    
    vehicle_type = shipment.get('vehicleType', '')
    distance = row['distance']
    weight = row['weight']
    
    if distance < 200 and vehicle_type not in ['van', 'truck']:
        recommendations.append('For short distances, consider using van or truck')
    
    if distance > 500 and weight > 2000 and vehicle_type != 'train':
        recommendations.append('For long distances with heavy cargo, train transport is more efficient')
    
    if not recommendations:
        recommendations.append('Shipment is operating efficiently')
    
    return recommendations

@app.route('/api/analyze-efficiency', methods=['POST'])
def analyze_efficiency():
    """Analyze overall efficiency metrics"""
    try:
        shipments = request.json.get('shipments', [])
        
        if not shipments:
            return jsonify({'error': 'No shipments provided'}), 400
        
        df = pd.DataFrame(shipments)
        
        # Calculate metrics
        total_emissions = df['emissionsCO2'].sum()
        total_distance = df['distance'].sum()
        total_weight = df['weight'].sum()
        
        avg_emissions_per_km = total_emissions / total_distance if total_distance > 0 else 0
        avg_emissions_per_kg = total_emissions / total_weight if total_weight > 0 else 0
        
        # By vehicle type
        vehicle_stats = df.groupby('vehicleType').agg({
            'emissionsCO2': ['sum', 'mean', 'count'],
            'distance': 'sum',
            'weight': 'sum'
        }).to_dict()
        
        # By fuel type
        fuel_stats = df.groupby('fuelType').agg({
            'emissionsCO2': ['sum', 'mean', 'count']
        }).to_dict()
        
        # Efficiency trends
        df['emissions_per_km'] = df['emissionsCO2'] / df['distance'].replace(0, 1)
        efficiency_trend = df.groupby('vehicleType')['emissions_per_km'].mean().to_dict()
        
        return jsonify({
            'overall': {
                'totalEmissions': float(total_emissions),
                'totalDistance': float(total_distance),
                'totalWeight': float(total_weight),
                'avgEmissionsPerKm': float(avg_emissions_per_km),
                'avgEmissionsPerKg': float(avg_emissions_per_kg)
            },
            'byVehicle': {k: {
                'totalEmissions': float(v[('emissionsCO2', 'sum')]),
                'avgEmissions': float(v[('emissionsCO2', 'mean')]),
                'count': int(v[('emissionsCO2', 'count')]),
                'totalDistance': float(v[('distance', 'sum')]),
                'totalWeight': float(v[('weight', 'sum')])
            } for k, v in vehicle_stats.items()},
            'byFuel': {k: {
                'totalEmissions': float(v[('emissionsCO2', 'sum')]),
                'avgEmissions': float(v[('emissionsCO2', 'mean')]),
                'count': int(v[('emissionsCO2', 'count')])
            } for k, v in fuel_stats.items()},
            'efficiencyTrend': {k: float(v) for k, v in efficiency_trend.items()}
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize models on startup
    initialize_models()
    app.run(debug=True, port=5000, host='0.0.0.0')

