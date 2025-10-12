import dayjs from 'dayjs';

// Conversion constants
const MILES_TO_METERS = 1609.344; // 1 mile = 1609.344 meters
const METERS_TO_MILES = 1 / MILES_TO_METERS; // 1 meter = 0.000621371 miles

/**
 * Converts miles to meters
 * @param miles - The distance in miles
 * @returns The distance in meters
 */
export const milesToMeters = (miles: number): number => {
  return miles * MILES_TO_METERS;
};

/**
 * Converts meters to miles
 * @param meters - The distance in meters
 * @returns The distance in miles
 */
export const metersToMiles = (meters: number): number => {
  return meters * METERS_TO_MILES;
};

/**
 * Formats a distance in miles with proper formatting
 * @param miles - The distance in miles
 * @returns Formatted string like "3.4 miles" or "1 mile"
 */
export const formatMiles = (miles: number): string => {
  // Format the number with commas for thousands and limit decimal places
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(miles);

  // Handle singular vs plural
  const unit = Number(formattedNumber) === 1 ? 'mile' : 'miles';

  return `${formattedNumber} ${unit}`;
};

/**
 * Formats event start and end ISO strings into a display string like 'Today 13:00pm - 22:00pm'.
 * @param startedAt - ISO string for event start
 * @param endedAt - ISO string for event end
 * @returns Formatted string for display
 */
export function formatEventTimeRange(
  startedAt: string,
  endedAt: string
): string {
  const start = dayjs(startedAt);
  const end = dayjs(endedAt);
  const now = dayjs();

  const getDayLabel = (d: dayjs.Dayjs) =>
    d.isSame(now, 'day')
      ? 'Today'
      : d.isSame(now.add(1, 'day'), 'day')
        ? 'Tomorrow'
        : d.format('MMM D');

  const formatTime = (d: dayjs.Dayjs) => d.format('h:mm A');

  if (start.isSame(end, 'day')) {
    // Same day: Today 13:00pm - 22:00pm
    return `${getDayLabel(start)} ${formatTime(start)} - ${formatTime(end)}`;
  } else {
    // Different days: Today 23:00pm - Tomorrow 02:00pm
    return `${getDayLabel(start)} ${formatTime(start)} - ${getDayLabel(end)} ${formatTime(end)}`;
  }
}
