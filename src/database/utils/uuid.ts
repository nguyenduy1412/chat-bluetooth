/**
 * Generate UUID v4
 * Sử dụng crypto.randomUUID() nếu có, fallback sang Math.random()
 */
export const generateUUID = (): string => {
  // Thử dùng crypto.randomUUID() (có sẵn trong React Native 0.64+)
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  // Fallback: generate UUID v4 bằng Math.random()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
