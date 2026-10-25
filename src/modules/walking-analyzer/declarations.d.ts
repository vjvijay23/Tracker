declare module 'react-native-geolocation-service' {
  export interface GeoCoordinates {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  }

  export interface GeoPosition {
    coords: GeoCoordinates;
    timestamp: number;
  }

  export interface GeoError {
    code: number;
    message: string;
    PERMISSION_DENIED: number;
    POSITION_UNAVAILABLE: number;
    TIMEOUT: number;
  }

  export interface GeoWatchOptions {
    enableHighAccuracy?: boolean;
    distanceFilter?: number;
    interval?: number;
    fastestInterval?: number;
    showLocationDialog?: boolean;
    forceRequestLocation?: boolean;
    useSignificantChanges?: boolean;
    showsBackgroundLocationIndicator?: boolean;
  }

  export interface GeoOptions {
    timeout?: number;
    maximumAge?: number;
    enableHighAccuracy?: boolean;
    showLocationDialog?: boolean;
    forceRequestLocation?: boolean;
  }

  export type SuccessCallback = (position: GeoPosition) => void;
  export type ErrorCallback = (error: GeoError) => void;

  const Geolocation: {
    requestAuthorization(authorizationLevel: 'whenInUse' | 'always'): Promise<'granted' | 'denied' | 'disabled' | 'restricted'>;
    getCurrentPosition(
      success: SuccessCallback,
      error?: ErrorCallback,
      options?: GeoOptions
    ): void;
    watchPosition(
      success: SuccessCallback,
      error?: ErrorCallback,
      options?: GeoWatchOptions
    ): number;
    clearWatch(watchId: number): void;
    stopObserving(): void;
  };

  export default Geolocation;
}

declare module 'react-native-background-actions' {
  export interface BackgroundTaskOptions {
    taskName: string;
    taskTitle: string;
    taskDesc: string;
    taskIcon: {
      name: string;
      type: string;
      package?: string;
    };
    color?: string;
    linkingURI?: string;
    parameters?: Record<string, any>;
    progressBar?: {
      max: number;
      value: number;
      indeterminate?: boolean;
    };
  }

  export interface NotificationUpdateOptions {
    taskTitle?: string;
    taskDesc?: string;
    progressBar?: {
      max: number;
      value: number;
      indeterminate?: boolean;
    };
  }

  const BackgroundService: {
    start<T = any>(task: (taskDataArguments?: T) => Promise<void>, options: BackgroundTaskOptions): Promise<void>;
    stop(): Promise<void>;
    isRunning(): boolean;
    updateNotification(options: NotificationUpdateOptions): Promise<void>;
  };

  export default BackgroundService;
}
