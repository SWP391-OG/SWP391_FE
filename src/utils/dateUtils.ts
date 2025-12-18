/**
 * Utility functions for handling timezone conversion
 * Backend returns all timestamps in UTC
 * Frontend should convert to Vietnam Time (UTC+7) for display
 */

/**
 * Format date/time to Vietnam timezone (UTC+7)
 * @param dateString - ISO date string from backend (UTC)
 * @param format - 'datetime', 'date', 'time'
 * @returns Formatted string in Vietnam timezone
 */
export const formatDateToVN = (
  dateString: string | undefined | null,
  format: 'datetime' | 'date' | 'time' = 'datetime'
): string => {
  if (!dateString) return '-';

  try {
    // Backend returns timestamps without Z, so we treat them as UTC by adding Z
    const normalizedDateString = dateString.includes('Z') ? dateString : `${dateString}Z`;
    const date = new Date(normalizedDateString);

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };

    const formatter = new Intl.DateTimeFormat('vi-VN', options);
    const parts = formatter.formatToParts(date);

    const year = parts.find((p) => p.type === 'year')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';

    if (format === 'date') {
      return `${day}/${month}/${year}`;
    }

    if (format === 'time') {
      return `${hour}:${minute}`;
    }

    // datetime (default)
    return `${hour}:${minute} ${day}/${month}/${year}`;
  } catch (error) {
    console.error('❌ Error formatting date:', error, dateString);
    return dateString;
  }
};

/**
 * Get date in Vietnam timezone for comparison (e.g., checking if overdue)
 * @param dateString - ISO date string from backend (UTC)
 * @returns Date object in Vietnam timezone
 */
export const getDateInVN = (dateString: string | undefined | null): Date => {
  if (!dateString) return new Date();

  // Backend returns timestamps without Z, so we treat them as UTC by adding Z
  const normalizedDateString = dateString.includes('Z') ? dateString : `${dateString}Z`;
  const date = new Date(normalizedDateString);
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = formatter.format(date).split(/[\s/:]/);
  // Format: YYYY-MM-DD HH:MM:SS
  return new Date(`${parts[0]}-${parts[1]}-${parts[2]}T${parts[3]}:${parts[4]}:${parts[5]}`);
};

/**
 * Check if ticket is overdue (accounting for Vietnam timezone)
 * @param resolveDeadline - ISO deadline string from backend
 * @returns true if deadline has passed in Vietnam time
 */
export const isTicketOverdue = (resolveDeadline: string | undefined | null): boolean => {
  if (!resolveDeadline) return false;

  const now = new Date();

  // Convert both to Vietnam timezone for comparison
  const nowVN = getDateInVN(now.toISOString());
  const deadlineVN = getDateInVN(resolveDeadline);

  return nowVN > deadlineVN;
};

/**
 * Calculate time remaining until deadline
 * @param resolveDeadline - ISO deadline string from backend
 * @returns Object with hours, minutes, and isOverdue flag
 */
export const getTimeUntilDeadline = (
  resolveDeadline: string | undefined | null
): { hours: number; minutes: number; isOverdue: boolean } => {
  if (!resolveDeadline) {
    return { hours: 0, minutes: 0, isOverdue: false };
  }

  const now = new Date();
  // Backend returns timestamps without Z, so we treat them as UTC by adding Z
  const normalizedDateString = resolveDeadline.includes('Z') ? resolveDeadline : `${resolveDeadline}Z`;
  const deadline = new Date(normalizedDateString);
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, isOverdue: true };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes, isOverdue: false };
};

/**
 * Check if ticket is overdue and not completed (not resolved or closed)
 * This is used to display "Đã quá hạn" status for in-progress tickets
 * @param resolveDeadline - ISO deadline string from backend
 * @param status - Current ticket status
 * @returns true if deadline has passed AND ticket is not in resolved/closed/cancelled status
 */
export const isTicketOverdueAndNotCompleted = (
  resolveDeadline: string | undefined | null,
  status: string | undefined | null
): boolean => {
  if (!resolveDeadline || !status) return false;

  // Only show overdue for in-progress or assigned tickets
  // Don't show for resolved, closed, or cancelled tickets
  const activeStatuses = ['in-progress', 'in_progress', 'IN_PROGRESS', 'assigned', 'ASSIGNED'];
  if (!activeStatuses.some(s => status.toLowerCase() === s.toLowerCase())) {
    return false;
  }

  // Check if deadline has passed
  return isTicketOverdue(resolveDeadline);
};
