import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { GPSPoint } from '../types';

export const BACKGROUND_LOCATION_TASK = 'avfit-background-workout-location';
const SESSION_FILE = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}active-workout-route.json` : null;
type SessionQueue = { active: boolean; paused: boolean; points: GPSPoint[] };

async function readSession(): Promise<SessionQueue> {
  if (!SESSION_FILE) return { active: false, paused: true, points: [] };
  try {
    const info = await FileSystem.getInfoAsync(SESSION_FILE);
    return info.exists ? JSON.parse(await FileSystem.readAsStringAsync(SESSION_FILE)) as SessionQueue : { active: false, paused: true, points: [] };
  } catch {
    return { active: false, paused: true, points: [] };
  }
}

async function writeSession(session: SessionQueue): Promise<void> {
  if (SESSION_FILE) await FileSystem.writeAsStringAsync(SESSION_FILE, JSON.stringify(session));
}

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error || !data) return;
  const locations = (data as { locations?: Location.LocationObject[] }).locations ?? [];
  const session = await readSession();
  if (!session.active || session.paused) return;
  for (const location of locations) {
    const { latitude, longitude, altitude, accuracy, speed } = location.coords;
    if (accuracy != null && accuracy > 25) continue;
    const point: GPSPoint = { latitude, longitude, altitude: altitude ?? undefined, accuracy: accuracy ?? undefined, speed: speed ?? undefined, timestamp: location.timestamp };
    const previous = session.points[session.points.length - 1];
    if (previous) {
      const rad = (d: number) => d * Math.PI / 180;
      const dLat = rad(point.latitude - previous.latitude);
      const dLon = rad(point.longitude - previous.longitude);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(previous.latitude)) * Math.cos(rad(point.latitude)) * Math.sin(dLon / 2) ** 2;
      const meters = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const seconds = (point.timestamp - previous.timestamp) / 1000;
      if (seconds <= 0 || meters / seconds > 12 || (meters < 2 && (speed == null || speed < 0.5))) continue;
    }
    session.points.push(point);
  }
  await writeSession(session);
});

export const BackgroundWorkoutLocation = {
  async start(): Promise<boolean> {
    if (!(await TaskManager.isAvailableAsync())) return false;
    await writeSession({ active: true, paused: false, points: [] });
    const registered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (registered) await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 5,
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'AVFIT workout in progress',
        notificationBody: 'Recording your route. Tap to return to AVFIT.',
        notificationColor: '#244A32',
      },
    });
    return true;
  },

  async setPaused(paused: boolean): Promise<void> {
    const session = await readSession();
    session.paused = paused;
    await writeSession(session);
    if (paused && await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)) await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  },

  async resume(): Promise<void> {
    const session = await readSession();
    session.active = true;
    session.paused = false;
    await writeSession(session);
    if (await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)) await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5, pausesUpdatesAutomatically: false, showsBackgroundLocationIndicator: true,
      foregroundService: { notificationTitle: 'AVFIT workout in progress', notificationBody: 'Recording your route. Tap to return to AVFIT.', notificationColor: '#244A32' },
    });
  },

  async drain(): Promise<GPSPoint[]> {
    const session = await readSession();
    const points = session.points;
    session.points = [];
    await writeSession(session);
    return points;
  },

  async finish(): Promise<GPSPoint[]> {
    const session = await readSession();
    session.active = false;
    session.paused = true;
    await writeSession(session);
    if (await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
    const points = session.points;
    session.points = [];
    await writeSession(session);
    return points;
  },
};




