/**
 * Formats a Date object to YYYY-MM-DD string format.
 * @param date - The date to format (can be null)
 * @returns Formatted date string or empty string if date is null
 */
export const formatDateToYYYYMMDD = (date: Date | null): string => {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string or Date object to a localized display format.
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDisplayDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(undefined, options);
};
