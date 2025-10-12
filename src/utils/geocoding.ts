// import * as Location from 'expo-location';

// export interface LocationInfo {
//   name: string;
//   country: string;
//   city: string;
//   address: string;
//   latitude: number;
//   longitude: number;
// }

// export const reverseGeocode = async (
//   latitude: number,
//   longitude: number
// ): Promise<LocationInfo | null> => {
//   try {
//     const result = await Location.reverseGeocodeAsync({
//       latitude,
//       longitude,
//     });

//     if (result.length > 0) {
//       const location = result[0];

//       const addressParts = [location.streetNumber, location.street].filter(
//         Boolean
//       );

//       const name =
//         location.name ||
//         location.street ||
//         location.district ||
//         location.subregion ||
//         location.city ||
//         'Unknown Location';

//       const city =
//         location.city ||
//         location.subregion ||
//         location.region ||
//         'Unknown City';

//       const country = location.country || 'Unknown Country';

//       const fullAddressParts = [
//         ...addressParts,
//         location.district,
//         location.city,
//         location.region,
//         location.country,
//       ].filter(Boolean);

//       const address =
//         fullAddressParts.length > 0
//           ? fullAddressParts.join(', ')
//           : `${city}, ${country}`;

//       return {
//         name,
//         country,
//         city,
//         address,
//         latitude,
//         longitude,
//       };
//     }

//     return null;
//   } catch (error) {
//     console.error('Error in reverse geocoding:', error);
//     return null;
//   }
// };

// export const geocode = async (
//   address: string
// ): Promise<LocationInfo | null> => {
//   try {
//     if (!address.trim()) {
//       return null;
//     }

//     const result = await Location.geocodeAsync(address);

//     if (result.length > 0) {
//       const location = result[0];

//       const name = address.split(',')[0].trim() || 'Searched Location';

//       const addressParts = address.split(',').map(part => part.trim());
//       let city = 'Unknown City';
//       let country = 'Unknown Country';

//       if (addressParts.length > 1) {
//         city = addressParts[addressParts.length - 2] || city;
//         country = addressParts[addressParts.length - 1] || country;
//       } else if (addressParts.length === 1) {
//         city = addressParts[0];
//       }

//       return {
//         name,
//         country,
//         city,
//         address,
//         latitude: location.latitude,
//         longitude: location.longitude,
//       };
//     }

//     return null;
//   } catch (error) {
//     console.error('Error in geocoding:', error);
//     return null;
//   }
// };

// export const formatLocationString = (locationInfo: LocationInfo): string => {
//   const parts = [];

//   if (locationInfo.address && locationInfo.address !== locationInfo.name) {
//     parts.push(locationInfo.address);
//   } else if (locationInfo.name) {
//     parts.push(locationInfo.name);
//   }

//   if (
//     locationInfo.city &&
//     !parts.some(part => part.includes(locationInfo.city))
//   ) {
//     parts.push(locationInfo.city);
//   }

//   if (
//     locationInfo.country &&
//     !parts.some(part => part.includes(locationInfo.country))
//   ) {
//     parts.push(locationInfo.country);
//   }

//   return parts.join(', ');
// };

// export const formatShortLocationString = (
//   locationInfo: LocationInfo
// ): string => {
//   const parts = [];

//   if (locationInfo.name && locationInfo.name !== 'Unknown Location') {
//     parts.push(locationInfo.name);
//   }

//   if (locationInfo.city && locationInfo.city !== 'Unknown City') {
//     parts.push(locationInfo.city);
//   }

//   return parts.join(', ') || locationInfo.address || 'Unknown Location';
// };
