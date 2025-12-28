export type VehicleType = 'truck' | 'train' | 'ship' | 'plane' | 'van';
export type FuelType = 'diesel' | 'petrol' | 'electric' | 'hybrid' | 'cng';
export type ShipmentStatus = 'pending' | 'in-transit' | 'delivered' | 'cancelled';

export interface Shipment {
  id: string;
  clientId: string;
  clientName: string;
  goodsDescription: string;
  weight: number; // in kg
  vehicleType: VehicleType;
  fuelType: FuelType;
  distance: number; // in km
  origin: string;
  destination: string;
  status: ShipmentStatus;
  emissionsCO2: number; // in kg
  createdAt: Date;
  deliveredAt?: Date;
  ecoPoints: number;
}

export interface EmissionFactor {
  vehicleType: VehicleType;
  fuelType: FuelType;
  co2PerKm: number; // kg CO2 per km per ton
}

// Emission factors (simplified for demo)
export const EMISSION_FACTORS: EmissionFactor[] = [
  { vehicleType: 'truck', fuelType: 'diesel', co2PerKm: 0.62 },
  { vehicleType: 'truck', fuelType: 'petrol', co2PerKm: 0.68 },
  { vehicleType: 'truck', fuelType: 'electric', co2PerKm: 0.15 },
  { vehicleType: 'truck', fuelType: 'hybrid', co2PerKm: 0.35 },
  { vehicleType: 'truck', fuelType: 'cng', co2PerKm: 0.45 },
  { vehicleType: 'van', fuelType: 'diesel', co2PerKm: 0.48 },
  { vehicleType: 'van', fuelType: 'petrol', co2PerKm: 0.52 },
  { vehicleType: 'van', fuelType: 'electric', co2PerKm: 0.12 },
  { vehicleType: 'train', fuelType: 'diesel', co2PerKm: 0.22 },
  { vehicleType: 'train', fuelType: 'electric', co2PerKm: 0.05 },
  { vehicleType: 'ship', fuelType: 'diesel', co2PerKm: 0.015 },
  { vehicleType: 'plane', fuelType: 'petrol', co2PerKm: 1.2 },
];

export function calculateEmissions(
  vehicleType: VehicleType,
  fuelType: FuelType,
  distance: number,
  weight: number
): number {
  const factor = EMISSION_FACTORS.find(
    (f) => f.vehicleType === vehicleType && f.fuelType === fuelType
  );
  
  if (!factor) return 0;
  
  // Calculate emissions: factor * distance * weight (in tons)
  return factor.co2PerKm * distance * (weight / 1000);
}

export function calculateEcoPoints(emissionsCO2: number, distance: number): number {
  // Lower emissions = more points
  // Base: 1000 points - (emissions per km * 10)
  const emissionsPerKm = distance > 0 ? emissionsCO2 / distance : 0;
  return Math.max(0, Math.round(1000 - emissionsPerKm * 10));
}
