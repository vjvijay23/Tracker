import { WalkingPoint, JitterFilterConfig } from '../types';

export const DEFAULT_FILTER_CONFIG: JitterFilterConfig = {
  maxHorizontalAccuracyMeters: 25.0,     // Reject readings with accuracy > 25m
  maxHumanSpeedMps: 10.0,                // 10 m/s = 36 km/h max plausible walking/sprint limit
  minStationaryDistanceMeters: 2.5,      // Minimum movement to defeat GPS drift
  minStationarySpeedThresholdMps: 0.4,   // Under 0.4 m/s (1.4 km/h) is stationary wander
};

/**
 * Calculates geodesic distance between two points on the Earth surface using the Haversine formula.
 * Earth mean radius: 6,371,000 meters.
 * Complexity: O(1)
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface FilterResult {
  accepted: boolean;
  reason?: 'low_accuracy' | 'stationary_noise' | 'impossible_speed_jump';
  incrementalDistanceMeters: number;
}

/**
 * Evaluates whether an incoming raw GPS coordinate should be accepted into the route.
 * Rejects low accuracy, stationary jitter, and teleportation speed anomalies.
 */
export function filterAndComputeIncrementalDistance(
  previousPoint: WalkingPoint | null,
  newPoint: WalkingPoint,
  config: JitterFilterConfig = DEFAULT_FILTER_CONFIG
): FilterResult {
  // 1. Accuracy Filter: Reject points with excessive horizontal uncertainty
  if (newPoint.accuracy <= 0 || newPoint.accuracy > config.maxHorizontalAccuracyMeters) {
    return {
      accepted: false,
      reason: 'low_accuracy',
      incrementalDistanceMeters: 0,
    };
  }

  // First valid point is accepted unconditionally
  if (!previousPoint) {
    return {
      accepted: true,
      incrementalDistanceMeters: 0,
    };
  }

  // 2. Incremental Haversine computation (O(1))
  const distanceMeters = calculateHaversineDistanceMeters(
    previousPoint.latitude,
    previousPoint.longitude,
    newPoint.latitude,
    newPoint.longitude
  );

  const timeDeltaSeconds = Math.max(0.1, (newPoint.timestamp - previousPoint.timestamp) / 1000);
  const calculatedSpeedMps = distanceMeters / timeDeltaSeconds;

  // 3. Teleportation / Impossible Speed Jump Filter
  if (calculatedSpeedMps > config.maxHumanSpeedMps) {
    return {
      accepted: false,
      reason: 'impossible_speed_jump',
      incrementalDistanceMeters: 0,
    };
  }

  // 4. Stationary Drift / GPS Noise Filter
  // If displacement is less than threshold and sensor indicates stationary speed
  const reportedSpeed = newPoint.speed !== null && newPoint.speed !== undefined ? newPoint.speed : calculatedSpeedMps;
  if (
    distanceMeters < config.minStationaryDistanceMeters &&
    reportedSpeed < config.minStationarySpeedThresholdMps
  ) {
    return {
      accepted: false,
      reason: 'stationary_noise',
      incrementalDistanceMeters: 0,
    };
  }

  return {
    accepted: true,
    incrementalDistanceMeters: distanceMeters,
  };
}

/**
 * Formats elapsed seconds into athletic HH:MM:SS format.
 */
export function formatElapsedSeconds(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Formats distance in meters into human-readable Strava format (km or m).
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Computes live or average pace in seconds per kilometer, handling edge cases.
 */
export function computePaceSecondsPerKm(
  distanceMeters: number,
  durationSeconds: number
): number {
  if (distanceMeters < 15 || durationSeconds < 3) {
    return 0; // Not enough movement yet
  }
  const distanceKm = distanceMeters / 1000;
  return Math.round(durationSeconds / distanceKm);
}

/**
 * Formats pace in seconds per km to standard "MM:SS /km" format.
 */
export function formatPace(paceSecPerKm: number): string {
  if (paceSecPerKm <= 0 || !isFinite(paceSecPerKm) || paceSecPerKm > 3600) {
    return '--:-- /km';
  }
  const mins = Math.floor(paceSecPerKm / 60);
  const secs = paceSecPerKm % 60;
  return `${mins}:${secs.toString().padStart(2, '0')} /km`;
}
