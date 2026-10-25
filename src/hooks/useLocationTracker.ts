import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { AppState, Platform } from 'react-native';
import { BackgroundWorkoutLocation } from '../services/backgroundWorkoutLocation';
import { GPSPoint } from '../types';

export type TrackingStatus = 'idle' | 'initializing' | 'ready' | 'recording' | 'paused' | 'stopped' | 'error';
export type PermissionState = 'undetermined' | 'granted' | 'denied' | 'permanently_denied' | 'disabled';

export interface LocationTrackerState {
  status: TrackingStatus;
  permissionState: PermissionState;
  errorMessage: string | null;
  currentLocation: GPSPoint | null;
  routeCoordinates: GPSPoint[];
  totalDistanceKm: number;
  activeDurationSec: number;
  livePace: string;
  avgPace: string;
  gpsAccuracy: number | null;
  lastUpdateTime: string | null;
  pointsCount: number;
}

export function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 6371000;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatPace(secondsPerKm: number): string {
  if (!secondsPerKm || !isFinite(secondsPerKm) || secondsPerKm <= 0 || secondsPerKm > 3600) return '--:-- /km';
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.round(secondsPerKm % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs} /km`;
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return hrs > 0
    ? `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function useLocationTracker() {
  const [status, setStatus] = useState<TrackingStatus>('idle');
  const [permissionState, setPermissionState] = useState<PermissionState>('undetermined');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GPSPoint | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<GPSPoint[]>([]);
  const [totalDistanceKm, setTotalDistanceKm] = useState(0);
  const [activeDurationSec, setActiveDurationSec] = useState(0);
  const [livePace, setLivePace] = useState('--:-- /km');
  const [avgPace, setAvgPace] = useState('--:-- /km');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [workoutSteps, setWorkoutSteps] = useState(0);
  const [dailySteps, setDailySteps] = useState<number | null>(null);
  const [stepSensorAvailable, setStepSensorAvailable] = useState<boolean | null>(null);
  const [pauseEvents, setPauseEvents] = useState<Array<{ type: 'pause' | 'resume'; timestamp: string }>>([]);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const pedometerSubscription = useRef<{ remove: () => void } | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAcceptedPoint = useRef<GPSPoint | null>(null);
  const isTrackingActive = useRef(false);
  const isPausedRef = useRef(false);
  const activeSecondsRef = useRef(0);
  const distanceMetersRef = useRef(0);
  const stepCountBeforeSubscription = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const sessionStartTimestamp = useRef<number | null>(null);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setStatus('initializing');
    setErrorMessage(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setPermissionState(permission.canAskAgain ? 'denied' : 'permanently_denied');
        setErrorMessage('Allow precise location access to record a real GPS route.');
        setStatus('error');
        return false;
      }
      setPermissionState('granted');
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setPermissionState('disabled');
        setErrorMessage('Turn on Location Services to start a workout.');
        setStatus('error');
        return false;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const point: GPSPoint = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude ?? undefined,
        speed: position.coords.speed ?? undefined,
        accuracy: position.coords.accuracy ?? undefined,
        timestamp: position.timestamp,
      };
      setCurrentLocation(point);
      setGpsAccuracy(point.accuracy == null ? null : Math.round(point.accuracy));
      setLastUpdateTime(new Date(point.timestamp).toLocaleTimeString());
      setStatus('ready');
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not read your location. Check GPS and try again.');
      setStatus('error');
      return false;
    }
  }, []);

  useEffect(() => {
    void requestPermissions();
    let mounted = true;
    void Pedometer.isAvailableAsync().then(async (available) => {
      if (!mounted) return;
      setStepSensorAvailable(available);
      if (available) {
        try {
          // Android provides workout steps via watchStepCount; getStepCountAsync is supported on iOS only.
          const permission = await Pedometer.requestPermissionsAsync();
          if (permission.status === 'granted' && Platform.OS === 'ios') {
            const end = new Date();
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const result = await Pedometer.getStepCountAsync(start, end);
            if (mounted) setDailySteps(result.steps);
          }
        } catch { /* Daily totals are platform and permission dependent. */ }
      }
    }).catch(() => mounted && setStepSensorAvailable(false));
    return () => {
      mounted = false;
      locationSubscription.current?.remove();
      pedometerSubscription.current?.remove();
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [requestPermissions]);

  const processLocationUpdate = useCallback((location: Location.LocationObject) => {
    if (!isTrackingActive.current || isPausedRef.current) return;
    const { latitude, longitude, altitude, speed, accuracy } = location.coords;
    const timestamp = location.timestamp || Date.now();
    const point: GPSPoint = { latitude, longitude, altitude: altitude ?? undefined, speed: speed ?? undefined, accuracy: accuracy ?? undefined, timestamp };
    setGpsAccuracy(accuracy == null ? null : Math.round(accuracy));
    setLastUpdateTime(new Date(timestamp).toLocaleTimeString());
    if (accuracy != null && accuracy > 25) return;
    setCurrentLocation(point);

    const previous = lastAcceptedPoint.current;
    if (previous) {
      const seconds = (timestamp - previous.timestamp) / 1000;
      if (seconds <= 0) return;
      const meters = haversineDistanceMeters(previous.latitude, previous.longitude, latitude, longitude);
      const speedMps = meters / seconds;
      if (speedMps > 12) return;
      if (meters < 2 && (speed == null || speed < 0.5)) return;
      distanceMetersRef.current += meters;
      setTotalDistanceKm(distanceMetersRef.current / 1000);
      setLivePace(formatPace(seconds / (meters / 1000)));
    }
    lastAcceptedPoint.current = point;
    setRouteCoordinates((points) => [...points, point]);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active' || !isTrackingActive.current || isPausedRef.current) return;
      void BackgroundWorkoutLocation.drain().then((points) => {
        points.forEach((point) => processLocationUpdate({
          timestamp: point.timestamp,
          coords: {
            latitude: point.latitude,
            longitude: point.longitude,
            altitude: point.altitude ?? null,
            accuracy: point.accuracy ?? null,
            speed: point.speed ?? null,
            heading: null,
            altitudeAccuracy: null,
          },
        } as Location.LocationObject));
      }).catch(() => undefined);
    });
    return () => subscription.remove();
  }, [processLocationUpdate]);
  const startLocationWatch = useCallback(async () => {
    locationSubscription.current?.remove();
    locationSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 3 },
      processLocationUpdate,
    );
  }, [processLocationUpdate]);

  const stopSubscriptions = useCallback(() => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
    pedometerSubscription.current?.remove();
    pedometerSubscription.current = null;
  }, []);

  const startTracking = useCallback(async () => {
    if (isTrackingActive.current) return;
    if (permissionState !== 'granted') {
      const allowed = await requestPermissions();
      if (!allowed) return;
    }
    isTrackingActive.current = true;
    isPausedRef.current = false;
    startedAtRef.current = Date.now();
    sessionStartTimestamp.current = startedAtRef.current;
    stepCountBeforeSubscription.current = 0;
    setWorkoutSteps(0);
    setPauseEvents([]);
    setRouteCoordinates([]);
    distanceMetersRef.current = 0;
    setTotalDistanceKm(0);
    activeSecondsRef.current = 0;
    setActiveDurationSec(0);
    const seed = currentLocation;
    if (seed && (seed.accuracy == null || seed.accuracy <= 25)) {
      setRouteCoordinates([seed]);
      lastAcceptedPoint.current = seed;
    } else {
      lastAcceptedPoint.current = null;
    }
    setStatus('recording');
    setErrorMessage(null);
    try {
      await startLocationWatch();
      try {
        const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
        if (backgroundPermission.status === 'granted') await BackgroundWorkoutLocation.start();
        else setErrorMessage('Background location is off. GPS may pause when you lock the screen.');
      } catch { setErrorMessage('Background tracking is unavailable; keep AVFIT open during this workout.'); }
      const available = await Pedometer.isAvailableAsync();
      setStepSensorAvailable(available);
      if (available) {
        const permission = await Pedometer.requestPermissionsAsync();
        if (permission.status === 'granted') pedometerSubscription.current = Pedometer.watchStepCount(({ steps }) => {
          setWorkoutSteps(stepCountBeforeSubscription.current + steps);
        });
      }
    } catch (error) {
      isTrackingActive.current = false;
      stopSubscriptions();
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unable to start GPS tracking.');
      return;
    }
    if (timerInterval.current) clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => {
      if (isTrackingActive.current && !isPausedRef.current && startedAtRef.current != null) {
        const elapsed = activeSecondsRef.current + Math.floor((Date.now() - startedAtRef.current) / 1000);
        setActiveDurationSec(elapsed);
        if (distanceMetersRef.current > 20) setAvgPace(formatPace(elapsed / (distanceMetersRef.current / 1000)));
      }
    }, 1000);
  }, [permissionState, requestPermissions, currentLocation, startLocationWatch, stopSubscriptions]);

  const pauseTracking = useCallback(() => {
    if (!isTrackingActive.current || isPausedRef.current) return;
    if (startedAtRef.current != null) activeSecondsRef.current += Math.floor((Date.now() - startedAtRef.current) / 1000);
    startedAtRef.current = null;
    stepCountBeforeSubscription.current += workoutSteps - stepCountBeforeSubscription.current;
    isPausedRef.current = true;
    setPauseEvents((events) => [...events, { type: 'pause', timestamp: new Date().toISOString() }]);
    stopSubscriptions();
    void BackgroundWorkoutLocation.setPaused(true).catch(() => undefined);
    lastAcceptedPoint.current = null;
    setStatus('paused');
  }, [stopSubscriptions, workoutSteps]);

  const resumeTracking = useCallback(async () => {
    if (!isTrackingActive.current || !isPausedRef.current) return;
    try {
      await startLocationWatch();
      try { await BackgroundWorkoutLocation.resume(); } catch { /* Foreground GPS remains available. */ }
      const available = await Pedometer.isAvailableAsync();
      if (available && (await Pedometer.requestPermissionsAsync()).status === 'granted') {
        pedometerSubscription.current = Pedometer.watchStepCount(({ steps }) => {
          setWorkoutSteps(stepCountBeforeSubscription.current + steps);
        });
      }
      startedAtRef.current = Date.now();
      isPausedRef.current = false;
      setPauseEvents((events) => [...events, { type: 'resume', timestamp: new Date().toISOString() }]);
      setStatus('recording');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to resume GPS tracking.');
    }
  }, [startLocationWatch]);

  const stopTracking = useCallback(async () => {
    if (!isPausedRef.current && startedAtRef.current != null) activeSecondsRef.current += Math.floor((Date.now() - startedAtRef.current) / 1000);
    startedAtRef.current = null;
    setActiveDurationSec(activeSecondsRef.current);
    stopSubscriptions();
    const pending = await BackgroundWorkoutLocation.finish().catch(() => []);
    isPausedRef.current = false;
    pending.forEach((point) => processLocationUpdate({
      timestamp: point.timestamp,
      coords: { latitude: point.latitude, longitude: point.longitude, altitude: point.altitude ?? null, accuracy: point.accuracy ?? null, speed: point.speed ?? null, heading: null, altitudeAccuracy: null },
    } as Location.LocationObject));
    isTrackingActive.current = false;
    isPausedRef.current = false;
    if (timerInterval.current) clearInterval(timerInterval.current);
    timerInterval.current = null;
    setStatus('stopped');
  }, [stopSubscriptions, processLocationUpdate]);
  const resetTracking = useCallback(async () => {
    await stopTracking();
    setRouteCoordinates([]);
    setTotalDistanceKm(0);
    setActiveDurationSec(0);
    setLivePace('--:-- /km');
    setAvgPace('--:-- /km');
    setWorkoutSteps(0);
    distanceMetersRef.current = 0;
    activeSecondsRef.current = 0;
    sessionStartTimestamp.current = null;
    lastAcceptedPoint.current = null;
    setStatus('ready');
  }, [stopTracking]);

  return {
    status, permissionState, errorMessage, currentLocation, routeCoordinates, totalDistanceKm,
    activeDurationSec, livePace, avgPace, gpsAccuracy, lastUpdateTime,
    pointsCount: routeCoordinates.length, workoutSteps, dailySteps, stepSensorAvailable, pauseEvents,
    sessionStartTime: sessionStartTimestamp.current,
    requestPermissions, startTracking, pauseTracking, resumeTracking, stopTracking, resetTracking,
  };
}
