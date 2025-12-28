import { useEffect, useRef, useState } from 'react';
import { Shipment } from '../types/shipment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { MapPin, Navigation, Clock, TrendingUp } from 'lucide-react';
import { calculateCurrentPosition, formatTimeRemaining } from '../utils/trackingUtils';

interface LeafletMapProps {
  shipment: Shipment;
}

// City coordinates for India
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

export function LeafletMap({ shipment }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [trackingInfo, setTrackingInfo] = useState(calculateCurrentPosition(shipment));
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any>({ origin: null, destination: null, current: null });
  const [polyline, setPolyline] = useState<any>(null);

  // Update tracking info every second
  useEffect(() => {
    const updateTracking = () => {
      setTrackingInfo(calculateCurrentPosition(shipment));
    };

    updateTracking();
    const interval = setInterval(updateTracking, 1000);

    return () => clearInterval(interval);
  }, [shipment]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      // Add Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      const L = await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js');

      // Fix default marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const origin = CITY_COORDINATES[shipment.origin] || [20, 77];
      const dest = CITY_COORDINATES[shipment.destination] || [25, 80];

      // Create map centered on India
      const newMap = L.map(mapRef.current!).setView([20.5937, 78.9629], 5);

      // Add OpenStreetMap tiles (Google Maps style)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(newMap);

      // Custom icons
      const originIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const destIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #10b981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
            <path d="M5 12l5 5L20 7"/>
          </svg>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const currentIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #f59e0b; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(245,158,11,0.5); display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
            <path d="M9 17H7A5 5 0 0 1 7 7h2m6 0h2a5 5 0 1 1 0 10h-2"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Add markers
      const originMarker = L.marker(origin, { icon: originIcon })
        .addTo(newMap)
        .bindPopup(`<b>Origin</b><br/>${shipment.origin}`);

      const destMarker = L.marker(dest, { icon: destIcon })
        .addTo(newMap)
        .bindPopup(`<b>Destination</b><br/>${shipment.destination}`);

      // Draw route line
      const routeLine = L.polyline([origin, dest], {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.5,
        dashArray: '10, 10',
      }).addTo(newMap);

      // Fit map to show entire route
      newMap.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

      setMap(newMap);
      setMarkers({ origin: originMarker, destination: destMarker, current: null });
      setPolyline(routeLine);
    };

    loadLeaflet();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [shipment]);

  // Update current position marker
  useEffect(() => {
    if (!map || shipment.status !== 'in-transit') return;

    const loadLeaflet = async () => {
      const L = await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js');

      const origin = CITY_COORDINATES[shipment.origin] || [20, 77];
      const dest = CITY_COORDINATES[shipment.destination] || [25, 80];
      
      const progress = trackingInfo.progressPercentage / 100;
      const currentLat = origin[0] + (dest[0] - origin[0]) * progress;
      const currentLng = origin[1] + (dest[1] - origin[1]) * progress;

      const currentIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #f59e0b; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(245,158,11,0.5); display: flex; align-items: center; justify-content: center; position: relative;">
          <div style="position: absolute; width: 50px; height: 50px; background: rgba(245,158,11,0.3); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
            <path d="M9 17H7A5 5 0 0 1 7 7h2m6 0h2a5 5 0 1 1 0 10h-2"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Remove old current marker
      if (markers.current) {
        map.removeLayer(markers.current);
      }

      // Add new current marker
      const currentMarker = L.marker([currentLat, currentLng], { icon: currentIcon })
        .addTo(map)
        .bindPopup(`<b>Current Position</b><br/>${trackingInfo.currentDistance.toFixed(1)} km traveled<br/>${trackingInfo.progressPercentage.toFixed(0)}% complete`);

      // Draw traveled path
      if (polyline) {
        map.removeLayer(polyline);
      }
      const traveledLine = L.polyline([origin, [currentLat, currentLng]], {
        color: '#10b981',
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      const remainingLine = L.polyline([[currentLat, currentLng], dest], {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.5,
        dashArray: '10, 10',
      }).addTo(map);

      setMarkers({ ...markers, current: currentMarker });
      setPolyline(traveledLine);
    };

    loadLeaflet();
  }, [trackingInfo, shipment.status]);

  const timeRemaining = trackingInfo.estimatedArrival.getTime() - new Date().getTime();

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Navigation className="size-5 text-blue-600" />
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
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-1 text-blue-700 mb-1">
              <Clock className="size-4" />
              <span className="text-xs">ETA</span>
            </div>
            <p className="text-blue-900 text-xs">
              {shipment.status === 'in-transit' ? formatTimeRemaining(timeRemaining) : '-'}
            </p>
          </div>
        </div>

        {/* Leaflet Map */}
        <div className="relative rounded-lg border-2 border-blue-200 overflow-hidden">
          <div ref={mapRef} className="h-96 w-full" />
          
          {/* Live indicator */}
          {shipment.status === 'in-transit' && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2 z-[1000] shadow-lg">
              <div className="size-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs">LIVE</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Delivery Progress</span>
            <span className="text-blue-600">{trackingInfo.progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000 relative"
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
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <MapPin className="size-4" />
              <span>Destination</span>
            </div>
            <p className="text-blue-900">{shipment.destination}</p>
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
      </CardContent>
    </Card>
  );
}

// Add ping animation CSS
if (typeof document !== 'undefined' && !document.getElementById('ping-animation')) {
  const style = document.createElement('style');
  style.id = 'ping-animation';
  style.textContent = `
    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
