import { useEffect, useRef, useState } from 'react';
import { Shipment } from '../types/shipment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { MapPin, Navigation, Clock, TrendingUp } from 'lucide-react';
import { calculateCurrentPosition, formatTimeRemaining, getStatusColor } from '../utils/trackingUtils';

interface MapTrackingProps {
  shipment: Shipment;
}

// City coordinates for demo (India)
const CITY_COORDINATES: { [key: string]: [number, number] } = {
  'Mumbai': [19.0760, 72.8777],
  'Pune': [18.5204, 73.8567],
  'Delhi': [28.7041, 77.1025],
  'Gurgaon': [28.4595, 77.0266],
  'Bangalore': [12.9716, 77.5946],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Hyderabad': [17.3850, 78.4867],
  'Ahmedabad': [23.0225, 72.5714],
  'Jaipur': [26.9124, 75.7873],
};

export function MapTracking({ shipment }: MapTrackingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [trackingInfo, setTrackingInfo] = useState(calculateCurrentPosition(shipment));
  const animationFrameRef = useRef<number>();

  // Update tracking info every second for real-time updates
  useEffect(() => {
    const updateTracking = () => {
      setTrackingInfo(calculateCurrentPosition(shipment));
    };

    // Update immediately
    updateTracking();

    // Then update every second
    const interval = setInterval(updateTracking, 1000);

    return () => clearInterval(interval);
  }, [shipment]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Get coordinates
    const origin = CITY_COORDINATES[shipment.origin] || [20, 77];
    const dest = CITY_COORDINATES[shipment.destination] || [25, 80];

    // Convert lat/lng to canvas coordinates
    const toCanvasX = (lng: number) => ((lng - 68) / (97 - 68)) * canvas.width;
    const toCanvasY = (lat: number) => ((35 - lat) / (35 - 8)) * canvas.height;

    const originX = toCanvasX(origin[1]);
    const originY = toCanvasY(origin[0]);
    const destX = toCanvasX(dest[1]);
    const destY = toCanvasY(dest[0]);

    let pulseRadius = 0;
    let pulseGrowing = true;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw India outline (simplified)
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(20, 20, canvas.width - 40, canvas.height - 40, 10);
      ctx.stroke();

      // Draw route line
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(destX, destY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw traveled path (thicker, solid)
      const progress = trackingInfo.progressPercentage / 100;
      const currentX = originX + (destX - originX) * progress;
      const currentY = originY + (destY - originY) * progress;

      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      // Draw origin marker
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(originX, originY, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw destination marker
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(destX, destY, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw current position for in-transit shipments
      if (shipment.status === 'in-transit' && progress < 1) {
        // Main marker
        ctx.fillStyle = getStatusColor(shipment.status);
        ctx.beginPath();
        ctx.arc(currentX, currentY, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pulsing effect
        ctx.strokeStyle = getStatusColor(shipment.status);
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1 - (pulseRadius / 20);
        ctx.beginPath();
        ctx.arc(currentX, currentY, 12 + pulseRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Animate pulse
        if (pulseGrowing) {
          pulseRadius += 0.3;
          if (pulseRadius >= 15) pulseGrowing = false;
        } else {
          pulseRadius -= 0.3;
          if (pulseRadius <= 0) pulseGrowing = true;
        }
      }

      // Draw labels
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 13px system-ui';
      ctx.textAlign = 'center';
      
      // Origin label with background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(originX - 35, originY - 30, 70, 20);
      ctx.fillStyle = '#1f2937';
      ctx.fillText(shipment.origin, originX, originY - 16);
      
      // Destination label with background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(destX - 35, destY - 30, 70, 20);
      ctx.fillStyle = '#1f2937';
      ctx.fillText(shipment.destination, destX, destY - 16);

      // Current position label for in-transit
      if (shipment.status === 'in-transit' && progress < 1) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.95)';
        ctx.fillRect(currentX - 50, currentY + 20, 100, 24);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px system-ui';
        ctx.fillText(`${trackingInfo.currentDistance.toFixed(1)} km`, currentX, currentY + 32);
        ctx.font = '10px system-ui';
        ctx.fillText(`${trackingInfo.progressPercentage.toFixed(0)}% complete`, currentX, currentY + 42);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shipment, trackingInfo]);

  const timeRemaining = trackingInfo.estimatedArrival.getTime() - new Date().getTime();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="size-5 text-green-600" />
          Live Tracking - Real-time Updates
        </CardTitle>
        <CardDescription>
          Package moving at 20 km/hour • Position updates every second
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Real-time Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-1 text-blue-700 mb-1">
              <TrendingUp className="size-4" />
              <span className="text-xs">Traveled</span>
            </div>
            <p className="text-blue-900">{trackingInfo.currentDistance.toFixed(1)} km</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <div className="flex items-center gap-1 text-amber-700 mb-1">
              <MapPin className="size-4" />
              <span className="text-xs">Remaining</span>
            </div>
            <p className="text-amber-900">{trackingInfo.remainingDistance.toFixed(1)} km</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-1 text-green-700 mb-1">
              <Clock className="size-4" />
              <span className="text-xs">ETA</span>
            </div>
            <p className="text-green-900 text-xs">
              {shipment.status === 'in-transit' ? formatTimeRemaining(timeRemaining) : '-'}
            </p>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-green-200 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-96"
            style={{ display: 'block' }}
          />
          
          {/* Live indicator */}
          {shipment.status === 'in-transit' && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
              <div className="size-2 bg-white rounded-full" />
              <span className="text-xs">LIVE</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Delivery Progress</span>
            <span className="text-green-600">{trackingInfo.progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-1000 relative"
              style={{ width: `${trackingInfo.progressPercentage}%` }}
            >
              {shipment.status === 'in-transit' && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Route Info */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <MapPin className="size-4" />
              <span>Origin</span>
            </div>
            <p className="text-blue-900">{shipment.origin}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <MapPin className="size-4" />
              <span>Destination</span>
            </div>
            <p className="text-green-900">{shipment.destination}</p>
          </div>
        </div>

        {/* Status Message */}
        <div className={`border rounded-lg p-3 text-center ${
          shipment.status === 'delivered' ? 'bg-green-50 border-green-200' :
          shipment.status === 'in-transit' ? 'bg-blue-50 border-blue-200' :
          shipment.status === 'pending' ? 'bg-amber-50 border-amber-200' :
          'bg-red-50 border-red-200'
        }`}>
          <p className={`${
            shipment.status === 'delivered' ? 'text-green-900' :
            shipment.status === 'in-transit' ? 'text-blue-900' :
            shipment.status === 'pending' ? 'text-amber-900' :
            'text-red-900'
          }`}>
            {shipment.status === 'delivered' && '✓ Package delivered successfully!'}
            {shipment.status === 'in-transit' && `🚚 Package is on the way... ETA: ${trackingInfo.estimatedArrival.toLocaleString('en-IN', { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}`}
            {shipment.status === 'pending' && '📦 Package ready for pickup'}
            {shipment.status === 'cancelled' && '✗ Shipment cancelled'}
          </p>
        </div>

        {/* Speed Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700">Current Speed</p>
              <p className="text-purple-900">20 km/hour</p>
            </div>
            <div className="text-right">
              <p className="text-purple-700">Total Distance</p>
              <p className="text-purple-900">{shipment.distance} km</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}