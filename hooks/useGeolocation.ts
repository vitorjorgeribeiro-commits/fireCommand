import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

export interface GeoLocation {
  lat: number;
  lon: number;
}

export interface GeoAddress {
  road: string | null;
  freguesia: string | null;
  municipio: string | null;
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback((): Promise<GeoLocation | null> => {
    return new Promise((resolve) => {
      setLoading(true);
      setError(null);

      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          setError('Geolocalização não disponível neste dispositivo');
          setLoading(false);
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };
            setLoading(false);
            resolve(loc);
          },
          (err) => {
            let msg = 'Erro ao obter localização';
            if (err.code === 1) msg = 'Permissão de localização negada';
            else if (err.code === 2) msg = 'Localização indisponível';
            else if (err.code === 3) msg = 'Tempo esgotado ao obter localização';
            setError(msg);
            setLoading(false);
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        setError('Geolocalização disponível apenas na web');
        setLoading(false);
        resolve(null);
      }
    });
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<GeoAddress | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=pt-PT`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'GuiaDeComando/1.0' },
      });
      if (!response.ok) return null;
      const data = await response.json();
      const addr = data.address || {};
      const road = addr.road || addr.pedestrian || addr.path || addr.cycleway || addr.residential || null;
      const freguesia = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.hamlet || null;
      const municipio = addr.city || addr.municipality || addr.county || addr.town || null;
      return { road, freguesia, municipio };
    } catch {
      return null;
    }
  }, []);

  const getLocationWithAddress = useCallback(async (): Promise<{ location: GeoLocation; address: GeoAddress } | null> => {
    const loc = await getLocation();
    if (!loc) return null;
    const address = await reverseGeocode(loc.lat, loc.lon);
    return { location: loc, address: address || { road: null, freguesia: null, municipio: null } };
  }, [getLocation, reverseGeocode]);

  return { getLocation, getLocationWithAddress, reverseGeocode, loading, error };
}
