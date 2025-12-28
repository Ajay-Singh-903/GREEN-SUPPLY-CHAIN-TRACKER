const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface EmissionPredictionRequest {
  vehicleType: string;
  fuelType: string;
  weight: number;
  distance: number;
}

export interface EmissionPredictionResponse {
  predictedEmissions: number;
  formulaEmissions: number;
  difference: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface AnomalyDetectionRequest {
  shipments: Array<{
    id: string;
    vehicleType: string;
    fuelType: string;
    weight: number;
    distance: number;
    emissionsCO2: number;
  }>;
}

export interface AnomalyResult {
  id: string;
  isAnomaly: boolean;
  anomalyScore: number;
  efficiencyScore: number;
  isInefficient: boolean;
  routeInefficient: boolean;
  emissionsPerKm: number;
  recommendations: string[];
}

export interface AnomalyDetectionResponse {
  results: AnomalyResult[];
  summary: {
    totalShipments: number;
    anomaliesDetected: number;
    inefficientShipments: number;
    routeInefficiencies: number;
    averageEfficiency: number;
    averageEmissionsPerKm: number;
  };
}

export interface EfficiencyAnalysisResponse {
  overall: {
    totalEmissions: number;
    totalDistance: number;
    totalWeight: number;
    avgEmissionsPerKm: number;
    avgEmissionsPerKg: number;
  };
  byVehicle: Record<string, {
    totalEmissions: number;
    avgEmissions: number;
    count: number;
    totalDistance: number;
    totalWeight: number;
  }>;
  byFuel: Record<string, {
    totalEmissions: number;
    avgEmissions: number;
    count: number;
  }>;
  efficiencyTrend: Record<string, number>;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API request failed: ${endpoint}`, error);
      // Provide more helpful error messages
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        throw new Error('Cannot connect to Python API. Make sure it is running at http://localhost:5000');
      }
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/api/health');
  }

  async predictEmission(
    data: EmissionPredictionRequest
  ): Promise<EmissionPredictionResponse> {
    return this.request('/api/predict-emission', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async detectAnomalies(
    data: AnomalyDetectionRequest
  ): Promise<AnomalyDetectionResponse> {
    return this.request('/api/detect-anomalies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeEfficiency(
    shipments: AnomalyDetectionRequest['shipments']
  ): Promise<EfficiencyAnalysisResponse> {
    return this.request('/api/analyze-efficiency', {
      method: 'POST',
      body: JSON.stringify({ shipments }),
    });
  }
}

export const apiService = new ApiService();

