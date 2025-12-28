import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Shipment, VehicleType, FuelType, calculateEmissions, calculateEcoPoints } from '../types/shipment';
import { AlertCircle, Leaf, Sparkles, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { apiService } from '../services/api';

interface ShipmentFormProps {
  onSubmit: (shipment: Shipment) => void;
  onCancel: () => void;
}

export function ShipmentForm({ onSubmit, onCancel }: ShipmentFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    goodsDescription: '',
    weight: '',
    vehicleType: '' as VehicleType,
    fuelType: '' as FuelType,
    distance: '',
    origin: '',
    destination: '',
  });

  const [calculatedEmissions, setCalculatedEmissions] = useState<number | null>(null);
  const [mlPrediction, setMlPrediction] = useState<{
    predicted: number;
    formula: number;
    difference: number;
    confidence: string;
  } | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handleCalculate = () => {
    if (formData.vehicleType && formData.fuelType && formData.distance && formData.weight) {
      const emissions = calculateEmissions(
        formData.vehicleType,
        formData.fuelType,
        parseFloat(formData.distance),
        parseFloat(formData.weight)
      );
      setCalculatedEmissions(emissions);
    }
  };

  const handleMLPredict = async () => {
    if (!formData.vehicleType || !formData.fuelType || !formData.distance || !formData.weight) {
      return;
    }

    setIsPredicting(true);
    try {
      const prediction = await apiService.predictEmission({
        vehicleType: formData.vehicleType,
        fuelType: formData.fuelType,
        weight: parseFloat(formData.weight),
        distance: parseFloat(formData.distance),
      });
      
      setMlPrediction({
        predicted: prediction.predictedEmissions,
        formula: prediction.formulaEmissions,
        difference: prediction.difference,
        confidence: prediction.confidence,
      });
      
      // Also update calculated emissions with ML prediction
      setCalculatedEmissions(prediction.predictedEmissions);
    } catch (error) {
      console.error('ML prediction failed:', error);
      // Fallback to formula calculation
      handleCalculate();
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emissions = calculateEmissions(
      formData.vehicleType,
      formData.fuelType,
      parseFloat(formData.distance),
      parseFloat(formData.weight)
    );

    const ecoPoints = calculateEcoPoints(emissions, parseFloat(formData.distance));

    const shipment: Shipment = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: Math.random().toString(36).substr(2, 9),
      clientName: formData.clientName,
      goodsDescription: formData.goodsDescription,
      weight: parseFloat(formData.weight),
      vehicleType: formData.vehicleType,
      fuelType: formData.fuelType,
      distance: parseFloat(formData.distance),
      origin: formData.origin,
      destination: formData.destination,
      status: 'pending',
      emissionsCO2: emissions,
      createdAt: new Date(),
      ecoPoints: ecoPoints,
    };

    onSubmit(shipment);
  };

  return (
    <Card className="border border-slate-200/60 shadow-lg bg-white/95 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/20 pointer-events-none"></div>
      <CardHeader className="relative z-10 bg-gradient-to-r from-slate-50/90 to-blue-50/50 border-b border-slate-200/60 py-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Add New Shipment
        </CardTitle>
        <CardDescription className="text-slate-600 font-medium mt-1.5">
          Enter shipment details to calculate and track carbon emissions
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                placeholder="e.g., TechCorp Industries"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goodsDescription">Goods Description</Label>
              <Input
                id="goodsDescription"
                placeholder="e.g., Electronics Components"
                value={formData.goodsDescription}
                onChange={(e) => setFormData({ ...formData, goodsDescription: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 500"
                value={formData.weight}
                onChange={(e) => {
                  setFormData({ ...formData, weight: e.target.value });
                  setCalculatedEmissions(null);
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                placeholder="e.g., 150"
                value={formData.distance}
                onChange={(e) => {
                  setFormData({ ...formData, distance: e.target.value });
                  setCalculatedEmissions(null);
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select
                value={formData.vehicleType}
                onValueChange={(value) => {
                  setFormData({ ...formData, vehicleType: value as VehicleType });
                  setCalculatedEmissions(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="ship">Ship</SelectItem>
                  <SelectItem value="plane">Plane</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select
                value={formData.fuelType}
                onValueChange={(value) => {
                  setFormData({ ...formData, fuelType: value as FuelType });
                  setCalculatedEmissions(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="cng">CNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                placeholder="e.g., Mumbai"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="e.g., Pune"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={handleCalculate}
              disabled={!formData.vehicleType || !formData.fuelType || !formData.distance || !formData.weight}
            >
                Calculate (Formula)
              </Button>
              <Button
                type="button"
                onClick={handleMLPredict}
                disabled={!formData.vehicleType || !formData.fuelType || !formData.distance || !formData.weight || isPredicting}
                className="!bg-gradient-to-r !from-purple-600 !to-purple-700 hover:!from-purple-700 hover:!to-purple-800 !text-white !border-0 disabled:!opacity-50"
              >
                {isPredicting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    ML Predict
                  </>
                )}
            </Button>
            </div>
            
            {calculatedEmissions !== null && (
              <Alert className="flex-1">
                <Leaf className="size-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div>
                  Estimated CO₂: <strong>{calculatedEmissions.toFixed(2)} kg</strong>
                  {' • '}
                  EcoPoints: <strong>{calculateEcoPoints(calculatedEmissions, parseFloat(formData.distance))}</strong>
                    </div>
                    {mlPrediction && (
                      <div className="text-sm text-gray-600 mt-1">
                        ML Prediction: {mlPrediction.predicted.toFixed(2)} kg
                        {' • '}
                        Formula: {mlPrediction.formula.toFixed(2)} kg
                        {' • '}
                        Difference: {mlPrediction.difference.toFixed(2)} kg
                        {' • '}
                        Confidence: <span className={`font-semibold ${
                          mlPrediction.confidence === 'high' ? 'text-green-600' : 
                          mlPrediction.confidence === 'medium' ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>{mlPrediction.confidence}</span>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              Add Shipment
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}