import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import { PermissionFlowState, PermissionStatus } from '../types';

export class PermissionManager {
  /**
   * Evaluates the current location, notification, and background permissions on the device.
   */
  static async checkPermissions(): Promise<PermissionFlowState> {
    if (Platform.OS !== 'android') {
      return {
        fineLocation: 'granted',
        notification: 'granted',
        backgroundLocation: 'granted',
        isBatteryOptimizationExempt: true,
        canStartForegroundTracking: true,
      };
    }

    const apiLevel = Platform.Version as number;

    const fineGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    let notificationStatus: PermissionStatus = 'not_applicable';
    if (apiLevel >= 33) {
      const notifGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      notificationStatus = notifGranted ? 'granted' : 'denied';
    } else {
      notificationStatus = 'granted';
    }

    let bgStatus: PermissionStatus = 'not_applicable';
    if (apiLevel >= 29) {
      const bgGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      );
      bgStatus = bgGranted ? 'granted' : 'denied';
    } else {
      bgStatus = 'granted';
    }

    return {
      fineLocation: fineGranted ? 'granted' : 'denied',
      notification: notificationStatus,
      backgroundLocation: bgStatus,
      isBatteryOptimizationExempt: false,
      canStartForegroundTracking: fineGranted && notificationStatus === 'granted',
    };
  }

  /**
   * Executes the sequential runtime permission flow required by Android.
   * Step 1: Foreground Fine Location
   * Step 2: Post Notifications (Android 13+ / API 33)
   * Step 3: Optional Background Location (Android 10+ / API 29) with disclosure
   */
  static async requestSequentialPermissions(): Promise<PermissionFlowState> {
    if (Platform.OS !== 'android') {
      return {
        fineLocation: 'granted',
        notification: 'granted',
        backgroundLocation: 'granted',
        isBatteryOptimizationExempt: true,
        canStartForegroundTracking: true,
      };
    }

    const apiLevel = Platform.Version as number;

    // STEP 1: Request Foreground Fine & Coarse Location
    const locationResults = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    const fineGranted =
      locationResults[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED;

    if (!fineGranted) {
      return {
        fineLocation: 'denied',
        notification: 'undetermined',
        backgroundLocation: 'undetermined',
        isBatteryOptimizationExempt: false,
        canStartForegroundTracking: false,
      };
    }

    // STEP 2: Request POST_NOTIFICATIONS on Android 13+ (API 33+)
    // Mandatory so the foreground service persistent notification is displayed
    let notificationGranted = true;
    if (apiLevel >= 33) {
      const notifResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission Required',
          message:
            'AVFIT needs notification access to display your live distance and pace while your phone screen is off.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );
      notificationGranted = notifResult === PermissionsAndroid.RESULTS.GRANTED;
    }

    // STEP 3: Request Background Location (Android 10+ / API 29+)
    // Note: Google Play policy prohibits bundling background location with foreground location.
    // Must be requested separately only after foreground location has been granted.
    let bgLocationGranted = true;
    if (apiLevel >= 29) {
      const hasBg = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      );

      if (!hasBg) {
        // Show in-context rationale before requesting
        const bgResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Allow All The Time Location Access',
            message:
              'To record continuous GPS routes with your phone screen turned off or while the app is in the background, select "Allow all the time" in the next screen.',
            buttonPositive: 'Open Settings',
            buttonNegative: 'While In Use Only',
          }
        );
        bgLocationGranted = bgResult === PermissionsAndroid.RESULTS.GRANTED;
      }
    }

    return {
      fineLocation: fineGranted ? 'granted' : 'denied',
      notification: notificationGranted ? 'granted' : 'denied',
      backgroundLocation: bgLocationGranted ? 'granted' : 'denied',
      isBatteryOptimizationExempt: false,
      canStartForegroundTracking: fineGranted && notificationGranted,
    };
  }

  /**
   * Prompts the user to exclude the app from aggressive Android / OEM battery savers.
   * Vital for Samsung, Xiaomi, Huawei, and OnePlus devices that kill foreground services.
   */
  static async requestIgnoreBatteryOptimizations(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        await Linking.openSettings();
      } catch (e) {
        Alert.alert(
          'Battery Optimization',
          'Please open Device Settings -> Battery -> Apps -> AVFIT, and choose "Unrestricted" so continuous background tracking is not killed when the screen turns off.'
        );
      }
    }
  }
}
