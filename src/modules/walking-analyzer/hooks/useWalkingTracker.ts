import { useState, useEffect, useCallback, useRef } from 'react';
import {
  WalkingTelemetry,
  TrackerStatus,
  PermissionFlowState,
  WalkingSummary,
} from '../types';
import { WalkingForegroundService } from '../services/WalkingForegroundService';
import { PermissionManager } from '../services/PermissionManager';

export interface UseWalkingTrackerReturn {
  status: TrackerStatus;
  telemetry: WalkingTelemetry;
  permissionState: PermissionFlowState;
  lastSummary: WalkingSummary | null;
  startTracking: () => Promise<boolean>;
  pauseTracking: () => Promise<void>;
  resumeTracking: () => Promise<void>;
  finishTracking: () => Promise<WalkingSummary | null>;
  requestPermissions: () => Promise<PermissionFlowState>;
  openBatterySettings: () => Promise<void>;
}

export function useWalkingTracker(): UseWalkingTrackerReturn {
  const [status, setStatus] = useState<TrackerStatus>(WalkingForegroundService.getStatus());
  const [telemetry, setTelemetry] = useState<WalkingTelemetry>(
    WalkingForegroundService.getTelemetrySnapshot()
  );
  const [lastSummary, setLastSummary] = useState<WalkingSummary | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionFlowState>({
    fineLocation: 'undetermined',
    notification: 'undetermined',
    backgroundLocation: 'undetermined',
    isBatteryOptimizationExempt: false,
    canStartForegroundTracking: false,
  });

  const isMountedRef = useRef(true);

  // Check initial permissions
  useEffect(() => {
    isMountedRef.current = true;
    PermissionManager.checkPermissions().then((state) => {
      if (isMountedRef.current) {
        setPermissionState(state);
      }
    });

    // Subscribe to real-time telemetry stream from Foreground Service
    const unsubscribe = WalkingForegroundService.subscribe((updatedTelemetry) => {
      if (isMountedRef.current) {
        setTelemetry(updatedTelemetry);
        setStatus(WalkingForegroundService.getStatus());
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const requestPermissions = useCallback(async (): Promise<PermissionFlowState> => {
    const updated = await PermissionManager.requestSequentialPermissions();
    if (isMountedRef.current) {
      setPermissionState(updated);
    }
    return updated;
  }, []);

  const openBatterySettings = useCallback(async (): Promise<void> => {
    await PermissionManager.requestIgnoreBatteryOptimizations();
  }, []);

  const startTracking = useCallback(async (): Promise<boolean> => {
    // Verify foreground permissions before starting
    let currentPerms = permissionState;
    if (!currentPerms.canStartForegroundTracking) {
      currentPerms = await requestPermissions();
    }

    if (!currentPerms.canStartForegroundTracking) {
      return false;
    }

    setLastSummary(null);
    await WalkingForegroundService.startTracking();
    setStatus(WalkingForegroundService.getStatus());
    return true;
  }, [permissionState, requestPermissions]);

  const pauseTracking = useCallback(async (): Promise<void> => {
    await WalkingForegroundService.pauseTracking();
    setStatus(WalkingForegroundService.getStatus());
  }, []);

  const resumeTracking = useCallback(async (): Promise<void> => {
    await WalkingForegroundService.resumeTracking();
    setStatus(WalkingForegroundService.getStatus());
  }, []);

  const finishTracking = useCallback(async (): Promise<WalkingSummary | null> => {
    const summary = await WalkingForegroundService.finishTracking();
    if (isMountedRef.current) {
      setLastSummary(summary);
      setStatus(WalkingForegroundService.getStatus());
    }
    return summary;
  }, []);

  return {
    status,
    telemetry,
    permissionState,
    lastSummary,
    startTracking,
    pauseTracking,
    resumeTracking,
    finishTracking,
    requestPermissions,
    openBatterySettings,
  };
}
