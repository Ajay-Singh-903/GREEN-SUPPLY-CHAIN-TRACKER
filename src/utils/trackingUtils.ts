import { Shipment } from '../types/shipment';

const SPEED_KM_PER_HOUR = 20; // Package travels 20 km per hour

export interface TrackingPosition {
  currentDistance: number; // km traveled
  remainingDistance: number; // km remaining
  progressPercentage: number; // 0-100
  estimatedArrival: Date;
  currentLat: number;
  currentLng: number;
}

export function calculateCurrentPosition(shipment: Shipment): TrackingPosition {
  if (shipment.status === 'pending') {
    return {
      currentDistance: 0,
      remainingDistance: shipment.distance,
      progressPercentage: 0,
      estimatedArrival: new Date(shipment.createdAt.getTime() + (shipment.distance / SPEED_KM_PER_HOUR) * 60 * 60 * 1000),
      currentLat: 0,
      currentLng: 0,
    };
  }

  if (shipment.status === 'delivered') {
    return {
      currentDistance: shipment.distance,
      remainingDistance: 0,
      progressPercentage: 100,
      estimatedArrival: shipment.deliveredAt || new Date(),
      currentLat: 0,
      currentLng: 0,
    };
  }

  if (shipment.status === 'cancelled') {
    return {
      currentDistance: 0,
      remainingDistance: shipment.distance,
      progressPercentage: 0,
      estimatedArrival: new Date(),
      currentLat: 0,
      currentLng: 0,
    };
  }

  // For in-transit: Calculate based on time elapsed
  const now = new Date();
  const startTime = shipment.createdAt;
  const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  
  // Distance traveled = hours elapsed * speed (20 km/h)
  const distanceTraveled = Math.min(hoursElapsed * SPEED_KM_PER_HOUR, shipment.distance);
  const remainingDistance = shipment.distance - distanceTraveled;
  const progressPercentage = (distanceTraveled / shipment.distance) * 100;
  
  // Estimated arrival time
  const remainingHours = remainingDistance / SPEED_KM_PER_HOUR;
  const estimatedArrival = new Date(now.getTime() + remainingHours * 60 * 60 * 1000);

  return {
    currentDistance: distanceTraveled,
    remainingDistance,
    progressPercentage,
    estimatedArrival,
    currentLat: 0,
    currentLng: 0,
  };
}

export function formatTimeRemaining(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}

export function getStatusColor(status: Shipment['status']): string {
  switch (status) {
    case 'pending':
      return '#f59e0b'; // amber
    case 'in-transit':
      return '#3b82f6'; // blue
    case 'delivered':
      return '#10b981'; // green
    case 'cancelled':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}
