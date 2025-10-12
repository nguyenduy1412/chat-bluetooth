// import * as Location from 'expo-location';

// export type Position = {
//   latitude: number;
//   longitude: number;
//   accuracy?: number | null;
//   altitude?: number | null;
//   heading?: number | null;
//   speed?: number | null;
//   timestamp?: number | null;
// };

// /**
//  * Lấy vị trí hiện tại một lần (yêu cầu permission). Trả về latitude/longitude.
//  * @param options Location options từ expo-location (tuỳ chỉnh độ chính xác, timeout...)
//  */
// export async function getCurrentLocation(options?: Location.LocationOptions): Promise<Position> {
//   const { status } = await Location.requestForegroundPermissionsAsync();
//   if (status !== 'granted') {
//     throw new Error('Location permission not granted');
//   }

//   const loc = await Location.getCurrentPositionAsync(options ?? { accuracy: Location.Accuracy.Balanced });

//   return {
//     latitude: loc.coords.latitude,
//     longitude: loc.coords.longitude,
//     accuracy: loc.coords.accuracy ?? null,
//     altitude: loc.coords.altitude ?? null,
//     heading: loc.coords.heading ?? null,
//     speed: loc.coords.speed ?? null,
//     timestamp: loc.timestamp ?? null,
//   };
// }

// /**
//  * Bắt đăng ký cập nhật vị trí (foreground). Trả về hàm unsubscribe.
//  * callback sẽ nhận Position mỗi lần có cập nhật.
//  */
// export async function startLocationUpdates(
//   callback: (pos: Position) => void,
//   options?: Location.LocationOptions
// ): Promise<() => Promise<void>> {
//   const { status } = await Location.requestForegroundPermissionsAsync();
//   if (status !== 'granted') {
//     throw new Error('Location permission not granted');
//   }

//   const sub = await Location.watchPositionAsync(options ?? { accuracy: Location.Accuracy.Balanced, timeInterval: 1000, distanceInterval: 1 }, (loc) => {
//     callback({
//       latitude: loc.coords.latitude,
//       longitude: loc.coords.longitude,
//       accuracy: loc.coords.accuracy ?? null,
//       altitude: loc.coords.altitude ?? null,
//       heading: loc.coords.heading ?? null,
//       speed: loc.coords.speed ?? null,
//       timestamp: loc.timestamp ?? null,
//     });
//   });

//   return async () => {
//     sub.remove();
//   };
// }

// /**
//  * Ví dụ sử dụng:
//  *
//  * import { getCurrentLocation, startLocationUpdates } from '@/utils/getCurrentLocation';
//  *
//  * // lấy 1 lần
//  * try {
//  *   const pos = await getCurrentLocation();
//  *   console.log(pos.latitude, pos.longitude);
//  * } catch (e) { console.warn(e); }
//  *
//  * // subscribe
//  * const stop = await startLocationUpdates((pos) => console.log('update', pos));
//  * // khi cần dừng: await stop();
//  */
