import { useState, useEffect } from 'react';
import { Shipment } from '../types/shipment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { apiService, AnomalyResult } from '../services/api';

interface EfficiencyAnalysisProps {
  shipments: Shipment[];
}

export function EfficiencyAnalysis({ shipments }: EfficiencyAnalysisProps) {
  const [anomalyResults, setAnomalyResults] = useState<AnomalyResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeShipments = async () => {
    if (shipments.length === 0) {
      setError('No shipments to analyze');
      setSummary(null);
      setAnomalyResults([]);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const shipmentData = shipments.map(s => ({
        id: s.id,
        vehicleType: s.vehicleType,
        fuelType: s.fuelType,
        weight: s.weight,
        distance: s.distance,
        emissionsCO2: s.emissionsCO2,
      }));

      const result = await apiService.detectAnomalies({ shipments: shipmentData });
      setAnomalyResults(result.results);
      setSummary(result.summary);
      setError(null);
    } catch (err: any) {
      console.error('Anomaly detection failed:', err);
      const errorMessage = err?.message || 'Failed to analyze shipments. Make sure the Python API is running at http://localhost:5000';
      setError(errorMessage);
      setSummary(null);
      setAnomalyResults([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (shipments.length > 0) {
      analyzeShipments();
    } else {
      setAnomalyResults([]);
      setSummary(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipments.length]);

  const anomalies = anomalyResults.filter(r => r.isAnomaly);
  const inefficient = anomalyResults.filter(r => r.isInefficient);
  const routeInefficient = anomalyResults.filter(r => r.routeInefficient);

  // Prepare chart data
  const efficiencyData = anomalyResults.map((result, idx) => ({
    id: shipments[idx]?.id || `shipment-${idx}`,
    efficiency: result.efficiencyScore,
    emissionsPerKm: result.emissionsPerKm,
    anomaly: result.isAnomaly ? 'Anomaly' : 'Normal',
  }));

  const vehicleEfficiency = shipments.reduce((acc, shipment, idx) => {
    const result = anomalyResults[idx];
    if (!result) return acc;

    const vehicle = shipment.vehicleType;
    if (!acc[vehicle]) {
      acc[vehicle] = { total: 0, count: 0 };
    }
    acc[vehicle].total += result.efficiencyScore;
    acc[vehicle].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const vehicleEfficiencyData = Object.entries(vehicleEfficiency).map(([vehicle, data]) => ({
    vehicle,
    avgEfficiency: data.total / data.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Efficiency & Anomaly Analysis</h2>
          <p className="text-gray-600">AI-powered analysis of shipment efficiency and anomalies</p>
        </div>
        <Button
          onClick={analyzeShipments}
          disabled={isAnalyzing || shipments.length === 0}
          className="!bg-gradient-to-r !from-indigo-600 !to-purple-600 hover:!from-indigo-700 hover:!to-purple-700 !text-white !shadow-md hover:!shadow-lg transition-all duration-200 font-semibold px-6 py-2.5 border-0"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="size-4 mr-2" />
              Re-analyze
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="size-4" />
          <AlertDescription className="text-red-800 font-medium">
            {error}
            <div className="mt-3">
              <Button
                onClick={analyzeShipments}
                disabled={isAnalyzing || shipments.length === 0}
                size="sm"
                className="!bg-red-600 hover:!bg-red-700 !text-white border-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="size-3 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Retry Analysis'
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!summary && !error && shipments.length > 0 && (
        <div className="text-center py-8 text-gray-600">
          <Loader2 className="size-8 mx-auto mb-2 animate-spin text-indigo-600" />
          <p className="font-medium">Analyzing shipments...</p>
        </div>
      )}

      {!summary && !error && shipments.length === 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            No shipments available to analyze. Add shipments first.
          </AlertDescription>
        </Alert>
      )}

      {summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
                  <div className={`p-2.5 rounded-xl ring-2 ${
                    summary.anomaliesDetected > 0 ? 'bg-red-50 ring-red-100' : 'bg-green-50 ring-green-100'
                  }`}>
                    {summary.anomaliesDetected > 0 ? (
                      <AlertTriangle className="size-5 text-red-600" />
                    ) : (
                      <CheckCircle className="size-5 text-green-600" />
                    )}
                  </div>
                  Anomalies Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {summary.anomaliesDetected} / {summary.totalShipments}
                </div>
                <p className="text-sm text-slate-500 font-medium">Flagged shipments</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
                  <div className="p-2.5 bg-orange-50 rounded-xl ring-2 ring-orange-100">
                    <TrendingDown className="size-5 text-orange-600" />
                  </div>
                  Inefficient Shipments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {summary.inefficientShipments} / {summary.totalShipments}
                </div>
                <p className="text-sm text-slate-500 font-medium">Low efficiency</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
                  <div className="p-2.5 bg-yellow-50 rounded-xl ring-2 ring-yellow-100">
                    <AlertTriangle className="size-5 text-yellow-600" />
                  </div>
                  Route Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {summary.routeInefficiencies} / {summary.totalShipments}
                </div>
                <p className="text-sm text-slate-500 font-medium">Optimization needed</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
                  <div className="p-2.5 bg-emerald-50 rounded-xl ring-2 ring-emerald-100">
                    <TrendingUp className="size-5 text-emerald-600" />
                  </div>
                  Avg Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {summary.averageEfficiency.toFixed(1)} / 100
                </div>
                <p className="text-sm text-slate-500 font-medium">Overall score</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900">Efficiency Score Distribution</CardTitle>
                <CardDescription className="text-slate-600 font-medium">Efficiency scores across all shipments</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="id" tick={false} stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar dataKey="efficiency" fill="#16a34a" name="Efficiency Score" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900">Average Efficiency by Vehicle</CardTitle>
                <CardDescription className="text-slate-600 font-medium">Efficiency comparison across vehicle types</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehicleEfficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="vehicle" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar dataKey="avgEfficiency" fill="#8b5cf6" name="Avg Efficiency" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Anomalies List */}
          {anomalies.length > 0 && (
            <Card className="border border-red-200/60 bg-gradient-to-br from-red-50/80 to-rose-50/60 shadow-md">
              <CardHeader className="border-b border-red-200/40">
                <CardTitle className="flex items-center gap-3 text-red-900">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertTriangle className="size-5 text-red-700" />
                  </div>
                  <span className="text-lg font-bold">Detected Anomalies</span>
                </CardTitle>
                <CardDescription className="text-red-800/80 font-medium">Shipments flagged as anomalies by ML model</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {anomalies.map((anomaly) => {
                    const shipment = shipments.find(s => s.id === anomaly.id);
                    return (
                      <div
                        key={anomaly.id}
                        className="p-5 bg-white/90 rounded-xl border border-red-200/60 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="font-bold text-slate-900 text-base mb-1.5">
                              {shipment?.clientName || `Shipment ${anomaly.id}`}
                            </div>
                            <div className="text-sm text-slate-600 font-medium mb-2">
                              {shipment?.vehicleType} • {shipment?.fuelType} • {shipment?.distance} km
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-slate-600">
                                <span className="font-semibold">Efficiency:</span> {anomaly.efficiencyScore.toFixed(1)}/100
                              </div>
                              <div className="text-slate-600">
                                <span className="font-semibold">Emissions/km:</span> {anomaly.emissionsPerKm.toFixed(3)} kg
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200/60">
                              Score: {anomaly.anomalyScore.toFixed(3)}
                            </div>
                          </div>
                        </div>
                        {anomaly.recommendations.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-red-100">
                            <div className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Recommendations:</div>
                            <ul className="text-sm text-slate-600 space-y-2">
                              {anomaly.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <div className="mt-1.5 size-1.5 rounded-full bg-red-600"></div>
                                  <span className="font-medium">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inefficient Shipments */}
          {inefficient.length > 0 && (
            <Card className="border border-orange-200/60 bg-gradient-to-br from-orange-50/80 to-amber-50/60 shadow-md">
              <CardHeader className="border-b border-orange-200/40">
                <CardTitle className="flex items-center gap-3 text-orange-900">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <TrendingDown className="size-5 text-orange-700" />
                  </div>
                  <span className="text-lg font-bold">Inefficient Shipments</span>
                </CardTitle>
                <CardDescription className="text-orange-800/80 font-medium">Shipments with low efficiency scores</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {inefficient.slice(0, 5).map((item) => {
                    const shipment = shipments.find(s => s.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className="p-5 bg-white/90 rounded-xl border border-orange-200/60 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-900 text-base mb-1">
                              {shipment?.clientName || `Shipment ${item.id}`}
                            </div>
                            <div className="text-sm text-slate-600 font-medium">
                              <span className="font-semibold">Efficiency:</span> {item.efficiencyScore.toFixed(1)}/100
                            </div>
                          </div>
                          {item.recommendations.length > 0 && (
                            <div className="text-sm text-slate-600 font-medium bg-orange-50 px-4 py-2 rounded-lg border border-orange-200/60 max-w-md">
                              {item.recommendations[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

