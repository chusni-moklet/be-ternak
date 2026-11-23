import { UserGeoLocation } from './types';

/**
 * Mengambil koordinat GPS pengguna menggunakan Web Geolocation API (MDN standard).
 * Menangani feature detection, opsi akurasi tinggi, serta kode error standar.
 */
export function requestUserLocation(
  options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  }
): Promise<UserGeoLocation> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      reject(
        new Error(
          'Browser atau perangkat Anda tidak mendukung Web Geolocation API.'
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          timestamp: position.timestamp,
        });
      },
      (err: GeolocationPositionError) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(
              new Error(
                'Izin lokasi ditolak. Mohon aktifkan akses Lokasi/GPS pada pengaturan browser Anda.'
              )
            );
            break;
          case err.POSITION_UNAVAILABLE:
            reject(
              new Error(
                'Informasi lokasi tidak tersedia saat ini. Pastikan GPS atau jaringan aktif.'
              )
            );
            break;
          case err.TIMEOUT:
            reject(
              new Error(
                'Permintaan lokasi GPS melewati batas waktu (timeout). Silakan coba lagi.'
              )
            );
            break;
          default:
            reject(
              new Error(
                err.message || 'Gagal mendapatkan koordinat GPS dari perangkat.'
              )
            );
        }
      },
      options
    );
  });
}

