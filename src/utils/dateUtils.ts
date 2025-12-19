// ════════════════════════════════════════════════════════════════════════════════════
// 🕐 [DATE UTILITIES] - Xử lý ngày tháng & múi giờ
// ════════════════════════════════════════════════════════════════════════════════════
// Công dụng:
// - Backend trả về tất cả timestamps ở múi giờ UTC
// - Frontend cần convert sang Vietnam Time (UTC+7) để hiển thị
// - Kiểm tra deadline & trạng thái overdue
// ════════════════════════════════════════════════════════════════════════════════════

/**
 * 📅 Format ngày/giờ sang múi giờ Vietnam (UTC+7)
 * @param dateString - ISO date string từ backend (UTC)
 * @param format - 'datetime' | 'date' | 'time'
 * @returns Chuỗi định dạng theo múi giờ Vietnam (ví dụ: "14:30 25/12/2025")
 * 
 * @example
 * formatDateToVN('2025-12-25T07:30:00Z', 'datetime') → "14:30 25/12/2025"
 * formatDateToVN('2025-12-25T07:30:00Z', 'date') → "25/12/2025"
 * formatDateToVN('2025-12-25T07:30:00Z', 'time') → "14:30"
 */
export const formatDateToVN = (
  dateString: string | undefined | null,
  format: 'datetime' | 'date' | 'time' = 'datetime'
): string => {
  if (!dateString) return '-';

  try {
    // ─────────────────────────────────────────────────────────────────────────────
    // 🔄 NORMALIZE DATE STRING
    // ─────────────────────────────────────────────────────────────────────────────
    
    // Backend trả về timestamp không có Z, ta thêm Z để báo là UTC
    const normalizedDateString = dateString.includes('Z') ? dateString : `${dateString}Z`;
    const date = new Date(normalizedDateString);

    // ─────────────────────────────────────────────────────────────────────────────
    // 🌏 FORMAT THEO MÚI GIỜ VIETNAM
    // ─────────────────────────────────────────────────────────────────────────────
    
    // Intl.DateTimeFormat với timeZone 'Asia/Ho_Chi_Minh' (UTC+7)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Dùng format 24 giờ, không AM/PM
    };

    const formatter = new Intl.DateTimeFormat('vi-VN', options);
    const parts = formatter.formatToParts(date);

    // Extract từng phần: năm, tháng, ngày, giờ, phút
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';

    // ─────────────────────────────────────────────────────────────────────────────
    // 📌 RETURN THEO FORMAT YÊU CẦU
    // ─────────────────────────────────────────────────────────────────────────────
    
    if (format === 'date') {
      return `${day}/${month}/${year}`; // 25/12/2025
    }

    if (format === 'time') {
      return `${hour}:${minute}`; // 14:30
    }

    // datetime (default): 14:30 25/12/2025
    return `${hour}:${minute} ${day}/${month}/${year}`;
  } catch (error) {
    console.error('❌ Error formatting date:', error, dateString);
    return dateString;
  }
};

/**
 * 🌍 Lấy Date object trong múi giờ Vietnam (để so sánh, kiểm tra deadline)
 * @param dateString - ISO date string từ backend (UTC)
 * @returns Date object converted sang Vietnam timezone
 * 
 * @example
 * const vnTime = getDateInVN('2025-12-25T07:30:00Z');
 * vnTime.getHours() → 14 (giờ Vietnam, không phải UTC)
 */
export const getDateInVN = (dateString: string | undefined | null): Date => {
  if (!dateString) return new Date();

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔄 NORMALIZE & CREATE DATE OBJECT
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Normalize: Thêm Z nếu chưa có
  const normalizedDateString = dateString.includes('Z') ? dateString : `${dateString}Z`;
  const date = new Date(normalizedDateString);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 🌏 FORMAT THEO MÚI GIỜ VIETNAM
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Dùng locale 'sv-SE' (Swedish format YYYY-MM-DD HH:MM:SS) để dễ parse
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
  // parts[0]=YYYY, [1]=MM, [2]=DD, [3]=HH, [4]=MM, [5]=SS
  return new Date(`${parts[0]}-${parts[1]}-${parts[2]}T${parts[3]}:${parts[4]}:${parts[5]}`);
};

/**
 * ⏰ Kiểm tra xem ticket có quá hạn không (tính theo Vietnam timezone)
 * @param resolveDeadline - ISO deadline string từ backend
 * @returns true nếu deadline đã qua ở múi giờ Vietnam
 * 
 * @example
 * isTicketOverdue('2025-12-20T07:30:00Z') → true (vì ngày nay là 25/12)
 * isTicketOverdue('2025-12-30T07:30:00Z') → false (vì ngày 30/12 chưa đến)
 */
export const isTicketOverdue = (resolveDeadline: string | undefined | null): boolean => {
  if (!resolveDeadline) return false;

  // ─────────────────────────────────────────────────────────────────────────────
  // 🕐 SO SÁNH TIME TRONG VIETNAM TIMEZONE
  // ─────────────────────────────────────────────────────────────────────────────
  
  const now = new Date();

  // Convert both timestamps to Vietnam timezone for accurate comparison
  const nowVN = getDateInVN(now.toISOString());
  const deadlineVN = getDateInVN(resolveDeadline);

  // So sánh: nếu bây giờ > deadline → ticket quá hạn
  return nowVN > deadlineVN;
};

/**
 * ⏱️ Tính thời gian còn lại cho đến deadline
 * @param resolveDeadline - ISO deadline string từ backend
 * @returns Object {hours, minutes, isOverdue} - thời gian còn lại & trạng thái
 * 
 * @example
 * getTimeUntilDeadline('2025-12-25T14:30:00Z')
 * → { hours: 5, minutes: 30, isOverdue: false }
 */
export const getTimeUntilDeadline = (
  resolveDeadline: string | undefined | null
): { hours: number; minutes: number; isOverdue: boolean } => {
  if (!resolveDeadline) {
    return { hours: 0, minutes: 0, isOverdue: false };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🕐 TÍNH HIỆU THỜI GIAN
  // ─────────────────────────────────────────────────────────────────────────────
  
  const now = new Date();
  // Normalize: Thêm Z nếu chưa có
  const normalizedDateString = resolveDeadline.includes('Z') ? resolveDeadline : `${resolveDeadline}Z`;
  const deadline = new Date(normalizedDateString);
  
  // Hiệu thời gian bằng milliseconds
  const diffMs = deadline.getTime() - now.getTime();

  // Nếu hiệu âm hoặc 0 → đã quá hạn
  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, isOverdue: true };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔢 CHUYỂN ĐỔI SANG GIỜ & PHÚT
  // ─────────────────────────────────────────────────────────────────────────────
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes, isOverdue: false };
};

/**
 * 🚨 Kiểm tra ticket quá hạn AND chưa hoàn thành
 * Dùng để hiển thị badge "Đã quá hạn" trên ticket đang xử lý
 * 
 * @param resolveDeadline - ISO deadline string từ backend
 * @param status - Trạng thái ticket hiện tại
 * @returns true nếu deadline đã qua VÀ ticket vẫn đang xử lý
 * 
 * @example
 * isTicketOverdueAndNotCompleted('2025-12-20T07:30:00Z', 'in-progress')
 * → true (vì deadline đã qua nhưng ticket chưa completed)
 * 
 * isTicketOverdueAndNotCompleted('2025-12-20T07:30:00Z', 'closed')
 * → false (vì ticket đã closed, không cần báo overdue)
 */
export const isTicketOverdueAndNotCompleted = (
  resolveDeadline: string | undefined | null,
  status: string | undefined | null
): boolean => {
  if (!resolveDeadline || !status) return false;

  // ─────────────────────────────────────────────────────────────────────────────
  // 🎯 CHỈ SHOW OVERDUE CHO TICKET ĐANG XỬ LÝ
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Chỉ hiển thị overdue cho tickets còn đang làm việc
  // Không hiển thị cho resolved, closed, cancelled
  const activeStatuses = ['in-progress', 'in_progress', 'IN_PROGRESS', 'assigned', 'ASSIGNED'];
  if (!activeStatuses.some(s => status.toLowerCase() === s.toLowerCase())) {
    return false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ⏰ KIỂM TRA XEM ĐÃ QUÁ HẠN HAY CHƯA
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Check if deadline has passed
  return isTicketOverdue(resolveDeadline);
};

/**
 * � Format ISO UTC timestamps trong text sang giờ Việt Nam
 * Tìm và thay thế tất cả timestamps ISO (VD: 2025-12-19T01:13:30Z) sang định dạng Việt Nam
 * 
 * @param text - Text có chứa ISO timestamps
 * @returns Text với timestamps đã được format sang giờ Việt Nam
 * 
 * @example
 * convertUTCTimestampsToVN('[CANCELLED] deadline at 2025-12-19T01:13:30.0876203Z')
 * → '[CANCELLED] deadline at 08:13 19/12/2025'
 */
export const convertUTCTimestampsToVN = (text: string | null | undefined): string => {
  if (!text) return '';

  // Regex để match ISO datetime format: YYYY-MM-DDTHH:MM:SS[.milliseconds]Z
  // Ví dụ: 2025-12-19T01:13:30.0876203Z hoặc 2025-12-19T01:13:30Z
  const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g;

  return text.replace(isoDateRegex, (match) => {
    try {
      // Format timestamp to Vietnam time
      const formatted = formatDateToVN(match, 'datetime');
      return formatted;
    } catch (error) {
      // Nếu có lỗi, trả về timestamp gốc
      console.warn('❌ Error converting timestamp:', match, error);
      return match;
    }
  });
};

/**
 * 🚨 Tạo ghi chú tự động cho ticket overdue
 * Dùng để thêm thông báo về trạng thái overdue vào note của ticket
 * 
 * @param ticket - Ticket object
 * @param existingNote - Ghi chú hiện tại từ staff/admin
 * @returns Ghi chú mới với thông báo overdue (nếu ticket overdue), hoặc ghi chú hiện tại
 * 
 * @example
 * generateOverdueNote(ticket, 'Đang xử lý...')
 * → "⚠️ TICKET ĐÃ QUÁ HẠN\n\nĐang xử lý..."
 */
export const generateOverdueNote = (
  ticket: {
    resolveDeadline?: string;
    slaDeadline?: string;
    status?: string;
  },
  existingNote?: string | null
): string => {
  const deadline = ticket.resolveDeadline || ticket.slaDeadline;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 🎯 KIỂM TRA TICKET CÓ OVERDUE KHÔNG
  // ─────────────────────────────────────────────────────────────────────────────
  
  if (isTicketOverdueAndNotCompleted(deadline, ticket.status)) {
    // Tạo overdue notice
    const overdueNotice = '🚨 ⚠️ TICKET ĐÃ QUÁ HẠN GIẢI QUYẾT';
    
    // Nếu có ghi chú hiện tại, thêm overdue notice ở đầu
    if (existingNote && existingNote.trim()) {
      // ─────────────────────────────────────────────────────────────────────────
      // 🔄 FORMAT UTC TIMESTAMPS → GIỜ VIỆT NAM
      // ─────────────────────────────────────────────────────────────────────────
      const formattedNote = convertUTCTimestampsToVN(existingNote);
      
      // Kiểm tra xem note đã chứa overdue notice chưa để không bị duplicate
      if (!formattedNote.includes('TICKET ĐÃ QUÁ HẠN')) {
        return `${overdueNotice}\n\n${formattedNote}`;
      }
      return formattedNote;
    }
    
    // Không có ghi chú hiện tại, chỉ trả về overdue notice
    return overdueNotice;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 🔄 FORMAT UTC TIMESTAMPS → GIỜ VIỆT NAM cho ghi chú bình thường
  // ─────────────────────────────────────────────────────────────────────────────
  
  const formattedExistingNote = convertUTCTimestampsToVN(existingNote);
  return formattedExistingNote || '';
};
