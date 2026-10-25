import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Colors } from '../../theme/colors';
import { GPSPoint } from '../../types';
import { Navigation, Compass, Layers, Maximize2 } from 'lucide-react-native';
import InbuiltRouteMap from './InbuiltRouteMap';

interface GoogleActivityMapProps {
  currentLocation: GPSPoint | null;
  routeCoordinates: GPSPoint[];
  isTracking: boolean;
  status: string;
  onRecenter?: () => void;
  height?: number | string;
}

export default function GoogleActivityMap({
  currentLocation,
  routeCoordinates,
  isTracking,
  status,
  onRecenter,
  height = '100%',
}: GoogleActivityMapProps) {
  const mapRef = useRef<MapView | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [hasMapError, setHasMapError] = useState(false);
  const [autoCenter, setAutoCenter] = useState(true);

  // Initial region or fallback to San Francisco / current coordinates
  const initialRegion: Region = {
    latitude: currentLocation?.latitude || 37.7749,
    longitude: currentLocation?.longitude || -122.4194,
    latitudeDelta: 0.006,
    longitudeDelta: 0.006,
  };

  // Center map on user location as they move (if autoCenter is enabled)
  useEffect(() => {
    if (mapRef.current && currentLocation && autoCenter) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500
      );
    }
  }, [currentLocation, autoCenter]);

  // Handle manual recenter button click
  const handleRecenter = useCallback(() => {
    setAutoCenter(true);
    if (mapRef.current && currentLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        },
        400
      );
    }
    if (onRecenter) onRecenter();
  }, [currentLocation, onRecenter]);

  // Render fallback map if native Google Maps encounters an environment issue
  if (hasMapError) {
    return (
      <View style={[styles.container, { height: height as any }]}>
        <InbuiltRouteMap
          routePoints={routeCoordinates}
          currentLocation={currentLocation}
          isLiveTracking={isTracking}
          distanceKm={0}
        />
        <TouchableOpacity style={styles.recenterBtn} onPress={handleRecenter}>
          <Navigation size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: height as any }]}>
      {/* Loading overlay while GPS initializes */}
      {(!currentLocation || status === 'initializing') && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Acquiring GPS Signal...</Text>
          <Text style={styles.loadingSub}>Ensure you have a clear view of the sky</Text>
        </View>
      )}

      {/* Interactive Google Map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={false} // Custom styled high-visibility beacon marker used below
        showsCompass={true}
        showsScale={true}
        showsMyLocationButton={false}
        onMapReady={() => setMapReady(true)}
        onTouchStart={() => setAutoCenter(false)} // User is panning map
      >
        {/* Live Route Polyline */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates.map((pt) => ({
              latitude: pt.latitude,
              longitude: pt.longitude,
            }))}
            strokeColor={Colors.accentOrange} // AVFIT Athletic Terracotta
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Start Position Marker (Green Flag) */}
        {routeCoordinates.length > 0 && (
          <Marker
            coordinate={{
              latitude: routeCoordinates[0].latitude,
              longitude: routeCoordinates[0].longitude,
            }}
            title="Start"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.startMarkerBadge}>
              <Text style={styles.startMarkerText}>START</Text>
            </View>
          </Marker>
        )}

        {/* Live Current Position Marker (Pulsing Forest Green Beacon) */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Current Location"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.beaconOuterHalo}>
              <View style={styles.beaconInnerCore}>
                <View style={styles.beaconCenterPoint} />
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Recenter Floating Action Button */}
      <TouchableOpacity
        style={[styles.recenterBtn, autoCenter && styles.recenterBtnActive]}
        onPress={handleRecenter}
        activeOpacity={0.8}
      >
        <Navigation size={18} color={autoCenter ? '#FFFFFF' : Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#EAE5D9',
    overflow: 'hidden',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249, 246, 240, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  loadingSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  recenterBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 5,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  recenterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  beaconOuterHalo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(36, 74, 50, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beaconInnerCore: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  beaconCenterPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  startMarkerBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  startMarkerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
