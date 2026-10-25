import * as FileSystem from 'expo-file-system';
import { RecordedActivity } from '../types';

const FILE_URI = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}workout-history.json` : null;
type WorkoutFile = Record<string, RecordedActivity[]>;

/** Local-first activity archive. Route coordinates stay on this device unless a user opts into sync. */
export const LocalWorkoutStore = {
  async list(userId: string): Promise<RecordedActivity[]> {
    if (!FILE_URI) return [];
    try {
      const info = await FileSystem.getInfoAsync(FILE_URI);
      if (!info.exists) return [];
      const data = JSON.parse(await FileSystem.readAsStringAsync(FILE_URI)) as WorkoutFile;
      return Array.isArray(data[userId]) ? data[userId] : [];
    } catch (error) {
      console.warn('Could not read local workout history:', error);
      return [];
    }
  },

  async save(activity: RecordedActivity): Promise<void> {
    if (!FILE_URI) throw new Error('Local workout storage is unavailable on this platform.');
    let data: WorkoutFile = {};
    try {
      const info = await FileSystem.getInfoAsync(FILE_URI);
      if (info.exists) data = JSON.parse(await FileSystem.readAsStringAsync(FILE_URI)) as WorkoutFile;
    } catch { /* Start a clean archive if a previous file is incomplete. */ }
    const userWorkouts = Array.isArray(data[activity.userId]) ? data[activity.userId] : [];
    data[activity.userId] = [activity, ...userWorkouts.filter((item) => item.id !== activity.id)];
    await FileSystem.writeAsStringAsync(FILE_URI, JSON.stringify(data));
  },
};
