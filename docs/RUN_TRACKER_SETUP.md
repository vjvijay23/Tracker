# AVFIT running and walking tracker

This project adds a real GPS workout recorder to the existing AVFIT Expo app. The recorder uses `expo-location` for filtered foreground fixes and a TaskManager location task for screen-locked updates in a native build. `expo-sensors` supplies device pedometer readings. Workouts are saved locally first; precise route points are not sent to Supabase by this feature.

## Project entry points

- `src/screens/activity/RecordActivityScreen.tsx` — workout type selection, live map, GPS status, stats, pause/resume/finish and save.
- `src/hooks/useLocationTracker.ts` — permissions, foreground GPS, distance filters, elapsed time, pedometer and cadence.
- `src/services/backgroundWorkoutLocation.ts` — background location task and pending route queue.
- `src/services/localWorkoutStore.ts` — per-user local workout JSON archive.
- `src/services/activityService.ts` — combines local history with the existing in-memory activity model.
- `src/components/map/GoogleActivityMap.tsx` — Google map, marker, route line, recenter control.
- `src/navigation/RootNavigator.tsx` and `src/screens/ActivityTrackerScreen.tsx` — existing dashboard/history entry points.

## Install and run

Use Node 18 or newer for this existing project. From the project root:

```sh
npm install
npx expo start --dev-client
```

This tracker uses native location and motion modules. Expo Go is not sufficient to verify the native background location task. Build a development client after configuring the Maps key and native permissions:

```sh
npx expo prebuild
npx expo run:android
```

The repository currently uses Expo SDK 51 / React Native 0.74.2. The tracker code and `expo-task-manager` dependency match that installed SDK, but SDK 51 is an older project baseline. Before a new store release, plan an Expo SDK upgrade and verify the existing camera, navigation, Supabase and other native modules against that SDK. Do not update only the `expo` version in `package.json`; follow Expo's sequential SDK upgrade guide and regenerate native projects deliberately.

## Google Maps setup

1. Create a Google Cloud project and enable **Maps SDK for Android**. Enable Maps SDK for iOS too if you intend to build iOS.
2. Configure a billing account and restrict each API key to the relevant Maps SDK and app identifier. For Android, restrict by `com.avfit.app` and the signing certificate SHA-1. Set quotas and budget alerts.
3. Set `GOOGLE_MAPS_API_KEY` in your local environment before `npx expo prebuild` or a native Gradle build. `app.config.js` supplies it to Expo, and the Android manifest uses a Gradle placeholder. Put an iOS Maps key in the `react-native-maps` iOS configuration if you use Google tiles on iOS. Keep actual API keys out of Git; restrict the Android key to `com.avfit.app`, your signing certificate SHA-1 and the Maps SDK.
4. Rebuild after key or native config changes; changing `app.json` does not update an already installed APK.

Google Maps Platform requires billing for Maps SDK use and prices by SKU/region and current usage thresholds. Review the live [Google Maps Platform Android pricing and billing page](https://developers.google.com/maps/documentation/android-sdk/usage-and-billing).

## Permissions and background tracking

`app.json` configures `expo-location` and `expo-sensors`, including Android location foreground-service support, iOS location background mode and motion-use text. Android also declares activity recognition and location permissions in the native manifest. Run `npx expo prebuild` or an EAS native build after changing config plugins so native files include their generated declarations.

At workout start, the app requests foreground location first and then background location. Background permission is optional. Android 11+ may send the user to Settings for “Allow all the time”; if it is declined, the foreground workout remains available and the app warns that tracking can pause with the screen locked. On Android 14+, location foreground services must be started while the app is visible and have the location service type and permissions. The task starts from the visible workout screen and shows an ongoing notification.

iOS requires an Always location grant and the location background mode for continuous screen-locked updates. The system can still suspend or terminate apps. Background delivery, OEM battery settings and app-store policy all affect actual behavior. Explain the user-facing benefit before asking for Always/background permission and request only what the app needs. Review [Android location permission guidance](https://developer.android.com/develop/sensors-and-location/location/permissions) and current store policies before submission.

## Step counting

`Pedometer.watchStepCount` supplies steps within the current workout subscription. Pause removes the subscription and resumes with a new baseline, so paused steps do not count and the app does not double-count the sensor's cumulative value. The app displays “Unavailable” when the sensor or permission is unavailable. Cadence is workout steps divided by active minutes.

Daily totals are queried from the iOS pedometer history API when motion access is granted. Expo's pedometer API does not provide an Android historical daily total; showing one on Android needs a separate native Health Connect / platform integration with its own permissions. Step readings are hardware dependent and can be delayed; they are not inferred from GPS. Continuous daily counting outside an active workout requires a native background sensor/Health Connect design and is not implemented here.

## Offline data and cloud

Saved activities, timestamps, statistics, steps and route coordinates are written to the app's document directory in `workout-history.json`, partitioned by user ID. No cloud route sync is enabled in this tracker. Removing the app removes its local archive unless the device backup includes app documents. If adding sync later, require explicit consent before uploading route history and enforce row-level ownership in the database.

## GPS filtering and metrics

The recorder asks for high-accuracy updates at a 3-second / 3-meter target. It rejects fixes with reported horizontal accuracy above 25m, non-increasing timestamps, movement faster than 12m/s, and small low-speed drift. Route distance is the sum of accepted consecutive fixes using Haversine distance. When paused, it stops both location subscriptions; on resume, the next good fix seeds a new segment so the route does not draw a straight line over the pause. No synthetic coordinates are inserted. Pace and calories are estimates; GPS distance/pace can be poor indoors, under cover or in urban canyons. Altitude gain is not stored as a fabricated fixed number.

## Physical Android verification

Use an actual Android phone with Google Play services and a clear view of the sky. Install a development or preview APK, grant precise location and motion access, enable system Location, and try an outdoor route of at least 10 minutes. Compare the route with a known path and another GPS recorder. Verify marker updates, no route changes while paused, step counts with the phone carried, resume behavior, app background/locked behavior, notification visibility, and stopping the task after Finish. Also test with location denied, motion denied, location services off and weak GPS. Simulator results do not validate real sensors or battery management.

This workspace has no connected physical Android device, so the physical-device checks remain to be run by the app owner.

## Signed APK with EAS

The repository's `eas.json` already has `preview` and `production` profiles with `android.buildType: apk`.

```sh
npm install
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

For the production signing credential, allow EAS to generate/manage an Android keystore or configure the existing keystore in EAS credentials. Keep credentials private and back them up. The APK URL from EAS can be installed directly on a device. For Google Play distribution, use an AAB profile instead; APKs are useful for direct testing, not the recommended Play upload format. See [Expo's APK build guide](https://docs.expo.dev/build-reference/apk/).

## Limitations and costs

- Google Maps requires a Google Cloud project, enabled billing and API-key restrictions; cost depends on usage and region.
- EAS cloud builds require an Expo account; paid EAS tiers may be needed for higher build concurrency/limits.
- Firebase/Supabase cloud workout sync is not enabled; history is local-first only.
- Daily historical steps are iOS-only through the Expo API; Android daily totals need Health Connect/native work.
- Background task delivery is OS/OEM controlled, and this workspace has not been verified on a physical Android phone or iPhone.
- The existing app is on Expo SDK 51 and must be upgraded and device-tested before a current store submission.

