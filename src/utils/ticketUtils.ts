import type { Ticket, IssueType } from '../types';

/**
 * Parse imageUrl string from backend into images array
 * Backend returns: "url1,url2,url3" or single URL
 * Frontend expects: string[]
 * @param ticket - Ticket object (with imageUrl or images)
 * @returns Array of image URLs
 */
export const parseTicketImages = (ticket: Ticket | { imageUrl?: string; images?: string[] }): string[] => {
  // Check if images array already exists
  if (ticket.images && Array.isArray(ticket.images) && ticket.images.length > 0) {
    return ticket.images;
  }
  
  // Parse from imageUrl string (backend format: "url1,url2,url3")
  const imageUrl = (ticket as { imageUrl?: string }).imageUrl;
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
    return imageUrl.split(',').map(url => url.trim()).filter(url => url);
  }
  
  return [];
};

/**
 * Kiểm tra xem ticket mới có trùng với ticket hiện có không
 * @param newTicket - Ticket mới đang được tạo
 * @param existingTickets - Danh sách tickets hiện có
 * @returns Ticket trùng (nếu có) hoặc null
 */
export const checkDuplicateTicket = (
  newTicket: {
    title: string;
    description: string;
    location?: string;
    roomNumber?: string;
    issueType?: IssueType;
  },
  existingTickets: Ticket[]
): Ticket | null => {
  // Chỉ kiểm tra tickets đang mở hoặc đang xử lý
  const activeTickets = existingTickets.filter(t => 
    t.status === 'open' || t.status === 'acknowledged' || t.status === 'in-progress'
  );

  // So sánh với từng ticket hiện có
  for (const ticket of activeTickets) {
    // So sánh title (không phân biệt hoa thường)
    const titleMatch = ticket.title.toLowerCase().trim() === newTicket.title.toLowerCase().trim();
    
    // So sánh description (kiểm tra độ tương đồng > 80%)
    const descSimilarity = calculateSimilarity(
      ticket.description.toLowerCase().trim(),
      newTicket.description.toLowerCase().trim()
    );
    
    // So sánh location
    const locationMatch = 
      (!ticket.location && !newTicket.location) ||
      (ticket.location && newTicket.location && 
       ticket.location.toLowerCase().trim() === newTicket.location.toLowerCase().trim());
    
    // So sánh roomNumber
    const roomMatch = 
      (!ticket.roomNumber && !newTicket.roomNumber) ||
      (ticket.roomNumber && newTicket.roomNumber && 
       ticket.roomNumber.toLowerCase().trim() === newTicket.roomNumber.toLowerCase().trim());
    
    // So sánh issueType - removed vì Ticket interface không có issueType
    // const issueTypeMatch = true; // Always match since issueType is not in Ticket interface

    // Nếu title giống nhau và (description tương đồng > 80% hoặc location/roomNumber giống nhau)
    if (titleMatch && (descSimilarity > 0.8 || (locationMatch && roomMatch))) {
      return ticket;
    }

    // Hoặc nếu description tương đồng > 90% và location/roomNumber giống nhau
    // Removed issueTypeMatch vì Ticket interface không có issueType
    if (descSimilarity > 0.9 && locationMatch && roomMatch) {
      return ticket;
    }
  }

  return null;
};

/**
 * Tính độ tương đồng giữa 2 chuỗi (sử dụng Jaccard similarity)
 * @param str1 - Chuỗi thứ nhất
 * @param str2 - Chuỗi thứ hai
 * @returns Độ tương đồng từ 0 đến 1
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  // Tách thành các từ
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));

  // Tính intersection và union
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  // Jaccard similarity
  return intersection.size / union.size;
};

