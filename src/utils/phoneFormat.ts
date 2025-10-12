// Phone formatting utility
export function formatPhoneNumber(value: string) {
  // Allow international numbers: if starts with '+', return as is
  if (value.startsWith('+')) return value;
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length <= 3) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  // If more than 10 digits, just return all digits (or handle as needed)
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}
