export interface WalkingPoint {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export type TrackerStatus =
  | 'idle'
  | 'starting'
  | 'tracking'
  | 'paused'
  | 'finished'
  | 'error';

export type PermissionStatus =
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'permanently_denied'
  | 'not_applicable';

export interface PermissionFlowState {
  fineLocation: PermissionStatus;
  notification: PermissionStatus;
  backgroundLocation: PermissionStatus;
  isBatteryOptimizationExempt: boolean;
  canStartForegroundTracking: boolean;
}

export interface JitterFilterConfig {
  /** Maximum acceptable horizontal accuracy in meters (readings above this are discarded) */
  maxHorizontalAccuracyMeters: number;
  /** Maximum plausible human speed in m/s (10 m/s = 36 km/h; jumps faster than this are rejected) */
  maxHumanSpeedMps: number;
  /** Minimum distance to count as real movement rather than stationary GPS jitter (meters) */
  minStationaryDistanceMeters: number;
  /** Threshold under which user is considered stationary (m/s) */
  minStationarySpeedThresholdMps: number;
}

export interface WalkingTelemetry {
  currentLocation: WalkingPoint | null;
  routeCoordinates: WalkingPoint[];
  totalDistanceMeters: number;
  totalDistanceKm: number;
  elapsedSeconds: number;
  livePaceSecPerKm: number;
  avgPaceSecPerKm: number;
  formattedTime: string;      // HH:MM:SS
  formattedDistance: string;  // e.g. "3.42 km" or "850 m"
  formattedPace: string;      // e.g. "5:24 /km"
  gpsAccuracy: number | null;
  currentSpeedMps: number | null;
  pointsRecorded: number;
  pointsRejected: number;
}

export interface WalkingSummary {
  sessionTitle: string;
  startTime: number;
  endTime: number;
  totalDurationSeconds: number;
  activeDurationSeconds: number;
  totalDistanceMeters: number;
  totalDistanceKm: number;
  avgPaceSecPerKm: number;
  formattedAvgPace: string;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  estimatedCaloriesBurned: number;
  routeCoordinates: WalkingPoint[];
}

export interface BackgroundServiceOptions {
  notificationTitle: string;
  notificationColor?: string;
  updateIntervalMs?: number;
}
