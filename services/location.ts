import * as Location from 'expo-location';
import { Alert } from 'react-native';

export async function ensureForegroundLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Location permission is required');
    return false;
  }

  return true;
}

export async function getCurrentLocation() {
  const granted = await ensureForegroundLocationPermission();
  if (!granted) {
    return null;
  }

  try {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });
  } catch {
    return null;
  }
}
