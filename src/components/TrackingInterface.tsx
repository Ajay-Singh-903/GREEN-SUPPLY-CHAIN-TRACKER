import { useEffect, useRef, useState } from 'react';
import { Shipment, Waypoint } from '../types/shipment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Navigation, Clock, TrendingUp, CheckCircle, Circle, Truck } from 'lucide-react';
import { calculateCurrentPosition, formatTimeRemaining } from '../utils/trackingUtils';
import { CITY_COORDINATES, updateWaypointStatus, getCurrentWaypointIndex, getNextWaypoint } from '../utils/waypointUtils';

interface TrackingInterfaceProps {
  shipment: Shipment;
}

export function TrackingInterface({ shipment }: TrackingInterfaceProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [trackingInfo, setTrackingInfo] = useState(calculateCurrentPosition(shipment));
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const waypoints = shipment.waypoints || [
    { city: shipment.origin, distance: 0, status: 'departed' as const },
    { city: shipment.destination, distance: shipment.distance, status: 'pending' as const },
  ];

  const updatedWaypoints = updateWaypointStatus(waypoints, trackingInfo.currentDistance);
  const currentWaypointIndex = getCurrentWaypointIndex(updatedWaypoints, trackingInfo.currentDistance);
  const nextWaypoint = getNextWaypoint(updatedWaypoints, trackingInfo.currentDistance);

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

      // Create map centered on India
      const newMap = L.map(mapRef.current!).setView([20.5937, 78.9629], 5);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(newMap);

      const newMarkers: any[] = [];

      // Add waypoint markers
      updatedWaypoints.forEach((waypoint, index) => {
        const coords = CITY_COORDINATES[waypoint.city];
        if (!coords) return;

        const isOrigin = index === 0;
        const isDestination = index === updatedWaypoints.length - 1;
        const isCurrent = index === currentWaypointIndex && shipment.status === 'in-transit';
        const isPassed = waypoint.status === 'departed';

        let iconHtml = '';
        let iconColor = '';

        if (isCurrent) {
          iconColor = '#f59e0b'; // orange
          iconHtml = `<div style="background: ${iconColor}; width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(245,158,11,0.6); display: flex; align-items: center; justify-content: center; position: relative;">
            <div style="position: absolute; width: 60px; height: 60px; background: rgba(245,158,11,0.3); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <path d="M9 17H7A5 5 0 0 1 7 7h2m6 0h2a5 5 0 1 1 0 10h-2"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>`;
        } else if (isPassed) {
          iconColor = '#10b981'; // green
          iconHtml = `<div style="background: ${iconColor}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <path d="M5 12l5 5L20 7"/>
            </svg>
          </div>`;
        } else if (isOrigin) {
          iconColor = '#3b82f6'; // blue
          iconHtml = `<div style="background: ${iconColor}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(59,130,246,0.4); display: flex; align-items: center; justify-content: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>`;
        } else if (isDestination) {
          iconColor = '#8b5cf6'; // purple
          iconHtml = `<div style="background: ${iconColor}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(139,92,246,0.4); display: flex; align-items: center; justify-content: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>`;
        } else {
          iconColor = '#6b7280'; // gray
          iconHtml = `<div style="background: ${iconColor}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(107,116,128,0.3); display: flex; align-items: center; justify-content: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="12" r="4"/>
            </svg>
          </div>`;
        }

        const icon = L.divIcon({
          className: 'custom-marker',
          html: iconHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker(coords, { icon })
          .addTo(newMap)
          .bindPopup(`
            <div style="min-width: 150px;">
              <strong style="color: ${iconColor}; font-size: 14px;">${waypoint.city}</strong><br/>
              <span style="color: #6b7280; font-size: 12px;">Distance: ${waypoint.distance.toFixed(0)} km</span><br/>
              <span style="color: #6b7280; font-size: 12px;">Status: ${waypoint.status}</span>
              ${isCurrent ? '<br/><strong style="color: #f59e0b;">📍 Current Location</strong>' : ''}
            </div>
          `);

        marker.on('click', () => {
          setSelectedCity(waypoint.city);
        });

        newMarkers.push(marker);
      });

      // Draw route lines
      const routeCoords = updatedWaypoints
        .map(w => CITY_COORDINATES[w.city])
        .filter(c => c !== undefined);

      // Passed route (green)
      const passedIndex = currentWaypointIndex;
      if (passedIndex > 0) {
        const passedCoords = routeCoords.slice(0, passedIndex + 1);
        L.polyline(passedCoords, {
          color: '#10b981',
          weight: 4,
          opacity: 0.8,
        }).addTo(newMap);
      }

      // Remaining route (dashed blue)
      if (passedIndex < routeCoords.length - 1) {
        const remainingCoords = routeCoords.slice(passedIndex);
        L.polyline(remainingCoords, {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.5,
          dashArray: '10, 10',
        }).addTo(newMap);
      }

      // Fit map to show entire route
      if (routeCoords.length > 0) {
        newMap.fitBounds(routeCoords, { padding: [50, 50] });
      }

      setMap(newMap);
      setMarkers(newMarkers);
    };

    loadLeaflet();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [shipment, updatedWaypoints, currentWaypointIndex]);

  const timeRemaining = trackingInfo.estimatedArrival.getTime() - new Date().getTime();

  return (
    <div className="space-y-6">
      {/* Map */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Navigation className="size-5 text-blue-600" />
            Live Tracking Map
          </CardTitle>
          <CardDescription>
            Click on any city marker to view details • Updating every second
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

          {/* Current Location Info */}
          {shipment.status === 'in-transit' && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 p-2 rounded-full">
                  <Truck className="size-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-amber-900">
                    Currently at: <strong>{updatedWaypoints[currentWaypointIndex].city}</strong>
                  </p>
                  {nextWaypoint && (
                    <p className="text-amber-700">
                      Next stop: {nextWaypoint.city} ({(nextWaypoint.distance - trackingInfo.currentDistance).toFixed(0)} km away)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Journey Progress</span>
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
        </CardContent>
      </Card>

      {/* Route Timeline */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Route Timeline</CardTitle>
          <CardDescription>Step-by-step journey progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updatedWaypoints.map((waypoint, index) => {
              const isOrigin = index === 0;
              const isDestination = index === updatedWaypoints.length - 1;
              const isCurrent = index === currentWaypointIndex && shipment.status === 'in-transit';
              const isPassed = waypoint.status === 'departed';
              const isReached = waypoint.status === 'reached';

              return (
                <div key={index} className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex flex-col items-center">
                    <div className={`rounded-full p-2 ${
                      isCurrent ? 'bg-amber-100' :
                      isPassed || isReached ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      {isPassed || isReached ? (
                        <CheckCircle className={`size-5 ${
                          isCurrent ? 'text-amber-600' : 'text-green-600'
                        }`} />
                      ) : (
                        <Circle className="size-5 text-gray-400" />
                      )}
                    </div>
                    {index < updatedWaypoints.length - 1 && (
                      <div className={`w-0.5 h-16 ${
                        isPassed ? 'bg-green-300' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`${
                        isCurrent ? 'text-amber-900' :
                        isPassed || isReached ? 'text-green-900' :
                        'text-gray-700'
                      }`}>
                        {waypoint.city}
                      </h3>
                      {isOrigin && <Badge className="bg-blue-100 text-blue-800 border-blue-200">Origin</Badge>}
                      {isDestination && <Badge className="bg-purple-100 text-purple-800 border-purple-200">Destination</Badge>}
                      {isCurrent && <Badge className="bg-amber-100 text-amber-800 border-amber-200 animate-pulse">Current Location</Badge>}
                    </div>
                    <p className="text-gray-600">
                      Distance: {waypoint.distance.toFixed(0)} km from origin
                    </p>
                    {waypoint.arrivalTime && (
                      <p className="text-gray-500">
                        ETA: {waypoint.arrivalTime.toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected City Info */}
      {selectedCity && (
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-blue-900 mb-1">Selected: {selectedCity}</h3>
                <p className="text-blue-700">Click on map markers to view city details</p>
              </div>
              <button
                onClick={() => setSelectedCity(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
