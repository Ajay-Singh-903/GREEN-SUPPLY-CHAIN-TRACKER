import { Waypoint } from '../types/shipment';

const SPEED_KM_PER_HOUR = 20;

// Common routes in India with waypoints
export const ROUTE_WAYPOINTS: { [key: string]: string[] } = {
  'Dehradun-Mumbai': ['Dehradun', 'Delhi', 'Jaipur', 'Ahmedabad', 'Mumbai'],
  'Mumbai-Dehradun': ['Mumbai', 'Ahmedabad', 'Jaipur', 'Delhi', 'Dehradun'],
  'Delhi-Chennai': ['Delhi', 'Jaipur', 'Ahmedabad', 'Mumbai', 'Bangalore', 'Chennai'],
  'Mumbai-Kolkata': ['Mumbai', 'Nagpur', 'Raipur', 'Kolkata'],
  'Bangalore-Delhi': ['Bangalore', 'Hyderabad', 'Nagpur', 'Bhopal', 'Jaipur', 'Delhi'],
  'Pune-Delhi': ['Pune', 'Mumbai', 'Ahmedabad', 'Jaipur', 'Delhi'],
  'Delhi-Pune': ['Delhi', 'Jaipur', 'Ahmedabad', 'Mumbai', 'Pune'],
};

// City coordinates
export const CITY_COORDINATES: { [key: string]: [number, number] } = {
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
  'Dehradun': [30.3165, 78.0322],
  'Nagpur': [21.1458, 79.0882],
  'Bhopal': [23.2599, 77.4126],
  'Raipur': [21.2514, 81.6296],
};

// Calculate distance between two cities (simplified)
function calculateDistance(city1: string, city2: string): number {
  const coord1 = CITY_COORDINATES[city1];
  const coord2 = CITY_COORDINATES[city2];
  
  if (!coord1 || !coord2) return 100; // default
  
  const lat1 = coord1[0];
  const lon1 = coord1[1];
  const lat2 = coord2[0];
  const lon2 = coord2[1];
  
  // Haversine formula (simplified)
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function generateWaypoints(origin: string, destination: string, startTime: Date): Waypoint[] {
  const routeKey = `${origin}-${destination}`;
  let cities = ROUTE_WAYPOINTS[routeKey];
  
  // If no predefined route, create direct route
  if (!cities) {
    cities = [origin, destination];
  }
  
  const waypoints: Waypoint[] = [];
  let cumulativeDistance = 0;
  let currentTime = new Date(startTime);
  
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    
    // Calculate distance from previous city
    if (i > 0) {
      const distance = calculateDistance(cities[i - 1], city);
      cumulativeDistance += distance;
      
      // Calculate travel time
      const travelHours = distance / SPEED_KM_PER_HOUR;
      currentTime = new Date(currentTime.getTime() + travelHours * 60 * 60 * 1000);
    }
    
    const waypoint: Waypoint = {
      city,
      distance: cumulativeDistance,
      status: i === 0 ? 'departed' : 'pending',
      departureTime: i === 0 ? startTime : undefined,
      arrivalTime: i > 0 ? currentTime : undefined,
    };
    
    waypoints.push(waypoint);
    
    // Add some stop time (30 minutes) except for last city
    if (i < cities.length - 1) {
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }
  }
  
  return waypoints;
}

export function updateWaypointStatus(
  waypoints: Waypoint[],
  currentDistance: number
): Waypoint[] {
  return waypoints.map((waypoint, index) => {
    if (currentDistance >= waypoint.distance) {
      return {
        ...waypoint,
        status: index === waypoints.length - 1 ? 'reached' : 'departed',
      };
    } else if (index > 0 && currentDistance >= waypoints[index - 1].distance) {
      return { ...waypoint, status: 'pending' };
    }
    return waypoint;
  });
}

export function getCurrentWaypointIndex(
  waypoints: Waypoint[],
  currentDistance: number
): number {
  for (let i = waypoints.length - 1; i >= 0; i--) {
    if (currentDistance >= waypoints[i].distance) {
      return i;
    }
  }
  return 0;
}

export function getNextWaypoint(
  waypoints: Waypoint[],
  currentDistance: number
): Waypoint | null {
  const currentIndex = getCurrentWaypointIndex(waypoints, currentDistance);
  if (currentIndex < waypoints.length - 1) {
    return waypoints[currentIndex + 1];
  }
  return null;
}
