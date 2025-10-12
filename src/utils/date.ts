import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

export const formatEventTime = (startedAt: string, endedAt: string): string => {
  const start = dayjs(startedAt);
  const end = dayjs(endedAt);
  const today = dayjs();

  const isToday = start.isSame(today, 'day');

  const datePrefix = isToday ? 'Today' : start.format('ddd, MMM D');

  const startTime = start.format('h:mm A');
  const endTime = end.format('h:mm A');

  return `${datePrefix} ${startTime} - ${endTime}`;
};

export const formatDate = (
  date: string | Date,
  format: string = 'MMM D, YYYY'
): string => {
  return dayjs(date).format(format);
};

export const getRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

export const isToday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isPast = (date: string | Date): boolean => {
  return dayjs(date).isBefore(dayjs());
};

export const isFuture = (date: string | Date): boolean => {
  return dayjs(date).isAfter(dayjs());
};

export const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};