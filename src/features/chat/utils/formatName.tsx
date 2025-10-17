export const formatName = (name?: string) => {
  if (!name) return 'Ẩn danh';
  if (name.startsWith('BLE')) {
    return name.slice(3);
  }
  return name;
};
