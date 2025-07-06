// /hooks/useGeolocation.ts
import { useEffect } from 'react';
import { useLocationStore } from '@/stores/weather_store';

export function useGeolocation() {
  const setLocation = useLocationStore((state) => state.setLocation);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      { timeout: 10000 }
    );
  }, [setLocation]);
}
