import BackgroundService from 'react-native-background-actions';
import Geolocation, { GeoPosition, GeoError } from 'react-native-geolocation-service';
import {
  WalkingPoint,
  WalkingTelemetry,
  WalkingSummary,
  TrackerStatus,
  BackgroundServiceOptions,
} from '../types';
import {
  filterAndComputeIncrementalDistance,
  formatElapsedSeconds,
  formatDistance,
  computePaceSecondsPerKm,
  formatPace,
  DEFAULT_FILTER_CONFIG,
} from './HaversineCalculator';

type TelemetryListener = (telemetry: WalkingTelemetry) => void;

class WalkingForegroundServiceManager {
  private status: TrackerStatus = 'idle';
  private watchId: number | null = null;
  private listeners: Set<TelemetryListener> = new Set();

  // Route & Metrics state
  private routeCoordinates: WalkingPoint[] = [];
  private lastValidPoint: WalkingPoint | null = null;
  private totalDistanceMeters = 0;
  private startTimestamp = 0;
  private totalPausedDurationMs = 0;
  private pauseStartTimestamp: number | null = null;
  private currentSpeedMps: number | null = null;
  private currentAccuracy: number | null = null;
  private pointsRecorded = 0;
  private pointsRejected = 0;
  private maxSpeedMps = 0;

  // Moving pace buffer for rolling window pace calculations (last 20 seconds)
  private paceBuffer: { timestamp: number; distanceMeters: number }[] = [];

  public getStatus(): TrackerStatus {
    return this.status;
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    // Send immediate snapshot
    listener(this.getTelemetrySnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const snapshot = this.getTelemetrySnapshot();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (e) {
        // Suppress listener error
      }
    });
  }

  public getTelemetrySnapshot(): WalkingTelemetry {
    const now = Date.now();
    let elapsedMs = 0;

    if (this.startTimestamp > 0) {
      if (this.status === 'paused' && this.pauseStartTimestamp) {
        elapsedMs = this.pauseStartTimestamp - this.startTimestamp - this.totalPausedDurationMs;
      } else {
        elapsedMs = now - this.startTimestamp - this.totalPausedDurationMs;
      }
    }

    const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
    const avgPaceSec = computePaceSecondsPerKm(this.totalDistanceMeters, elapsedSeconds);
    const livePaceSec = this.calculateRollingWindowPace(now);

    return {
      currentLocation: this.lastValidPoint,
      routeCoordinates: [...this.routeCoordinates],
      totalDistanceMeters: Math.round(this.totalDistanceMeters * 10) / 10,
      totalDistanceKm: Math.round((this.totalDistanceMeters / 1000) * 100) / 100,
      elapsedSeconds,
      livePaceSecPerKm: livePaceSec,
      avgPaceSecPerKm: avgPaceSec,
      formattedTime: formatElapsedSeconds(elapsedSeconds),
      formattedDistance: formatDistance(this.totalDistanceMeters),
      formattedPace: formatPace(livePaceSec > 0 ? livePaceSec : avgPaceSec),
      gpsAccuracy: this.currentAccuracy,
      currentSpeedMps: this.currentSpeedMps,
      pointsRecorded: this.pointsRecorded,
      pointsRejected: this.pointsRejected,
    };
  }

  /**
   * Starts the continuous background tracking loop and Android foreground service.
   */
  public async startTracking(options?: Partial<BackgroundServiceOptions>): Promise<void> {
    if (this.status === 'tracking' || this.status === 'starting') {
      return;
    }

    this.status = 'starting';
    this.resetState();
    this.startTimestamp = Date.now();

    // 1. Configure the Background Service notification options
    const bgOptions = {
      taskName: 'LiveWalkingAnalyzer',
      taskTitle: options?.notificationTitle || 'Live Walking Analyzer',
      taskDesc: 'Acquiring GPS Signal... (0.00 km • 00:00)',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: options?.notificationColor || '#FC5200', // Strava Orange
      linkingURI: 'com.avfit.app://walking',
      parameters: {
        updateIntervalMs: options?.updateIntervalMs || 1000,
      },
    };

    // 2. Start Android Persistent Foreground Service
    await BackgroundService.start(this.backgroundTaskLoop.bind(this), bgOptions);

    // 3. Register high-accuracy Fused Location Provider watch
    this.watchId = Geolocation.watchPosition(
      this.handleIncomingLocation.bind(this),
      (error: GeoError) => {
        // Location provider error (e.g. GPS toggled off)
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 3,           // 3 meters to balance fidelity and battery
        interval: 2000,              // 2s standard interval
        fastestInterval: 1000,       // 1s fastest interval
        showLocationDialog: false,
        forceRequestLocation: true,
        useSignificantChanges: false,
        showsBackgroundLocationIndicator: true,
      }
    );

    this.status = 'tracking';
    this.notifyListeners();
  }

  /**
   * Continuous background task loop running inside the Foreground Service.
   * Keeps the CPU awake while the phone screen is OFF and periodically updates the notification.
   */
  private async backgroundTaskLoop(parameters?: { updateIntervalMs?: number }): Promise<void> {
    const sleepInterval = parameters?.updateIntervalMs || 1000;

    await new Promise<void>(async (resolve) => {
      while (BackgroundService.isRunning()) {
        if (this.status === 'tracking') {
          const snapshot = this.getTelemetrySnapshot();

          // Update Android system drawer persistent notification in real time
          try {
            await BackgroundService.updateNotification({
              taskTitle: 'Live Walking Analyzer',
              taskDesc: `${snapshot.formattedDistance} • ${snapshot.formattedTime} • ${snapshot.formattedPace}`,
            });
          } catch (e) {
            // Background notification update failed silently
          }

          this.notifyListeners();
        }

        // Sleep to avoid pegging CPU while preserving screen-off operation
        await new Promise((r) => setTimeout(r, sleepInterval));
      }
      resolve();
    });
  }

  /**
   * Processes each incoming raw location from Geolocation Fused Provider.
   */
  private handleIncomingLocation(position: GeoPosition): void {
    if (this.status !== 'tracking') {
      return;
    }

    const { latitude, longitude, altitude, accuracy, speed, heading } = position.coords;

    const newPoint: WalkingPoint = {
      latitude,
      longitude,
      altitude,
      accuracy,
      speed,
      heading,
      timestamp: position.timestamp || Date.now(),
    };

    this.currentAccuracy = accuracy;
    this.currentSpeedMps = speed;

    if (speed !== null && speed > this.maxSpeedMps) {
      this.maxSpeedMps = speed;
    }

    // Apply high-accuracy filtering and incremental Haversine distance
    const filterResult = filterAndComputeIncrementalDistance(
      this.lastValidPoint,
      newPoint,
      DEFAULT_FILTER_CONFIG
    );

    if (filterResult.accepted) {
      this.totalDistanceMeters += filterResult.incrementalDistanceMeters;
      this.lastValidPoint = newPoint;
      this.routeCoordinates.push(newPoint);
      this.pointsRecorded += 1;

      // Add to rolling pace buffer
      this.paceBuffer.push({
        timestamp: newPoint.timestamp,
        distanceMeters: filterResult.incrementalDistanceMeters,
      });

      // Purge entries older than 25 seconds
      const cutoff = newPoint.timestamp - 25000;
      this.paceBuffer = this.paceBuffer.filter((p) => p.timestamp >= cutoff);
    } else {
      this.pointsRejected += 1;
    }

    this.notifyListeners();
  }

  /**
   * Calculates smoothed pace over a moving 15–20 second rolling window.
   */
  private calculateRollingWindowPace(currentTimestamp: number): number {
    if (this.paceBuffer.length < 2) {
      return 0;
    }

    const oldest = this.paceBuffer[0];
    const durationSeconds = (currentTimestamp - oldest.timestamp) / 1000;
    const windowDistanceMeters = this.paceBuffer.reduce((sum, p) => sum + p.distanceMeters, 0);

    return computePaceSecondsPerKm(windowDistanceMeters, durationSeconds);
  }

  /**
   * Pauses the active tracking session and stops accumulating distance/time.
   */
  public async pauseTracking(): Promise<void> {
    if (this.status !== 'tracking') return;

    this.status = 'paused';
    this.pauseStartTimestamp = Date.now();

    try {
      await BackgroundService.updateNotification({
        taskTitle: 'Live Walking Analyzer (Paused)',
        taskDesc: `Session Paused • ${formatDistance(this.totalDistanceMeters)} recorded`,
      });
    } catch (e) {
      // Ignore
    }

    this.notifyListeners();
  }

  /**
   * Resumes the active tracking session from paused state.
   */
  public async resumeTracking(): Promise<void> {
    if (this.status !== 'paused') return;

    if (this.pauseStartTimestamp) {
      this.totalPausedDurationMs += Date.now() - this.pauseStartTimestamp;
      this.pauseStartTimestamp = null;
    }

    this.status = 'tracking';
    this.notifyListeners();
  }

  /**
   * Stops the foreground service, clears location subscriptions, and returns a complete session summary.
   */
  public async finishTracking(): Promise<WalkingSummary> {
    const snapshot = this.getTelemetrySnapshot();
    this.status = 'finished';

    // 1. Clear native Fused Location Provider watch
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    // 2. Stop Android Foreground Service notification
    if (BackgroundService.isRunning()) {
      await BackgroundService.stop();
    }

    // 3. Compute final summary analytics
    const endTime = Date.now();
    const totalDurationSeconds = Math.max(1, Math.floor((endTime - this.startTimestamp) / 1000));
    const activeDurationSeconds = snapshot.elapsedSeconds;
    const avgPaceSec = computePaceSecondsPerKm(this.totalDistanceMeters, activeDurationSeconds);
    const avgSpeedKmh =
      activeDurationSeconds > 0
        ? (this.totalDistanceMeters / 1000 / (activeDurationSeconds / 3600))
        : 0;
    const maxSpeedKmh = this.maxSpeedMps * 3.6;

    // Estimate calories burned (Walking MET = 3.8, avg body weight = 70kg)
    const hours = activeDurationSeconds / 3600;
    const estimatedCalories = Math.max(1, Math.round(3.8 * 70 * hours));

    const summary: WalkingSummary = {
      sessionTitle: `Morning Walk — ${new Date(this.startTimestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })}`,
      startTime: this.startTimestamp,
      endTime,
      totalDurationSeconds,
      activeDurationSeconds,
      totalDistanceMeters: Math.round(this.totalDistanceMeters),
      totalDistanceKm: snapshot.totalDistanceKm,
      avgPaceSecPerKm: avgPaceSec,
      formattedAvgPace: formatPace(avgPaceSec),
      maxSpeedKmh: Math.round(maxSpeedKmh * 10) / 10,
      avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
      estimatedCaloriesBurned: estimatedCalories,
      routeCoordinates: [...this.routeCoordinates],
    };

    this.notifyListeners();
    return summary;
  }

  /**
   * Resets internal tracking telemetry.
   */
  private resetState(): void {
    this.routeCoordinates = [];
    this.lastValidPoint = null;
    this.totalDistanceMeters = 0;
    this.startTimestamp = 0;
    this.totalPausedDurationMs = 0;
    this.pauseStartTimestamp = null;
    this.currentSpeedMps = null;
    this.currentAccuracy = null;
    this.pointsRecorded = 0;
    this.pointsRejected = 0;
    this.maxSpeedMps = 0;
    this.paceBuffer = [];
  }
}

export const WalkingForegroundService = new WalkingForegroundServiceManager();
