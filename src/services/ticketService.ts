import type { Ticket, GetAllTicketsResponse } from '../types';
import { loadTickets, saveTickets } from '../utils/localStorage';
import { apiClient } from './api';

// Request/Response types for API
interface CreateTicketRequest {
  title: string;
  description: string;
  imageUrl: string;
  locationCode: string;
  categoryCode: string;
}

interface CreateTicketResponse {
  status: boolean;
  message: string;
  data: {
    ticketCode: string;
    title: string;
    description: string;
    imageUrl: string;
    requesterCode: string;
    requesterName: string;
    assignedToCode: string;
    assignedToName: string;
    managedByCode: string;
    managedByName: string;
    locationCode: string;
    locationName: string;
    categoryCode: string;
    categoryName: string;
    status: string;
    contactPhone: string;
    note: string;
    createdAt: string;
    resolveDeadline: string;
    resolvedAt: string;
    closedAt: string;
    ratingStars: number;
    ratingComment: string;
  };
  errors: string[];
}

export const ticketService = {
  // Lấy tất cả tickets từ API (cho Admin)
  async getAllTicketsFromApi(pageNumber: number = 1, pageSize: number = 10): Promise<GetAllTicketsResponse> {
    try {
      const response = await apiClient.get<GetAllTicketsResponse>(
        `/Ticket?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      throw error;
    }
  },

  // Lấy tickets của student hiện tại từ API
  async getMyTickets(pageNumber: number = 1, pageSize: number = 10): Promise<GetAllTicketsResponse> {
    try {
      const response = await apiClient.get<GetAllTicketsResponse>(
        `/Ticket/my-tickets?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching my tickets:', error);
      throw error;
    }
  },

  // Lấy tickets được assign cho staff hiện tại từ API
  async getMyAssignedTickets(pageNumber: number = 1, pageSize: number = 10): Promise<GetAllTicketsResponse> {
    try {
      const response = await apiClient.get<GetAllTicketsResponse>(
        `/Ticket/my-assigned-tickets?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching assigned tickets:', error);
      throw error;
    }
  },

  // Lấy ticket theo mã ticket code
  async getTicketByCode(ticketCode: string): Promise<{ status: boolean; message: string; data: Ticket; errors: string[] }> {
    try {
      const response = await apiClient.get<{ status: boolean; message: string; data: Ticket; errors: string[] }>(
        `/Ticket/${ticketCode}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching ticket by code:', error);
      throw error;
    }
  },

  // Assign ticket tự động (cho Admin) - PATCH method
  async assignTicketAuto(ticketCode: string): Promise<{ status: boolean; message: string; data: unknown; errors: string[] }> {
    try {
      const response = await apiClient.patch<{ status: boolean; message: string; data: unknown; errors: string[] }>(
        `/Ticket/${ticketCode}/assign`,
        {} // Empty body for auto-assign
      );
      return response;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    }
  },

  // Assign ticket thủ công (cho Admin) - PATCH method
  async assignTicketManual(ticketCode: string, manualStaffCode: string): Promise<{ status: boolean; message: string; data: unknown; errors: string[] }> {
    try {
      const response = await apiClient.patch<{ status: boolean; message: string; data: unknown; errors: string[] }>(
        `/Ticket/${ticketCode}/assign/manual`,
        { manualStaffCode }
      );
      return response;
    } catch (error) {
      console.error('Error manually assigning ticket:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái ticket (cho Staff) - PATCH method
  async updateTicketStatus(ticketCode: string, newStatus: 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED'): Promise<{ status: boolean; message: string; data: unknown; errors: string[] }> {
    try {
      // Thử nhiều format khác nhau
      console.log('🔍 Trying to update status with:', { ticketCode, newStatus });
      
      // Format 1: Query parameter
      try {
        const response = await apiClient.patch<{ status: boolean; message: string; data: unknown; errors: string[] }>(
          `/Ticket/${ticketCode}/status?newStatus=${newStatus}`,
          {}
        );
        console.log('✅ Success with query parameter format');
        return response;
      } catch (err1) {
        console.log('❌ Failed with query parameter, trying body format...');
        
        // Format 2: Body với key "status"
        try {
          const response = await apiClient.patch<{ status: boolean; message: string; data: unknown; errors: string[] }>(
            `/Ticket/${ticketCode}/status`,
            { status: newStatus }
          );
          console.log('✅ Success with body format (status key)');
          return response;
        } catch (err2) {
          console.log('❌ Failed with body format (status key), trying newStatus key...');
          
          // Format 3: Body với key "newStatus"
          const response = await apiClient.patch<{ status: boolean; message: string; data: unknown; errors: string[] }>(
            `/Ticket/${ticketCode}/status`,
            { newStatus }
          );
          console.log('✅ Success with body format (newStatus key)');
          return response;
        }
      }
    } catch (error) {
      console.error('❌ All formats failed. Error updating ticket status:', error);
      throw error;
    }
  },

  // Lấy tất cả tickets (legacy - localStorage)
  getAll(): Ticket[] {
    return loadTickets();
  },

  // Lấy ticket theo ID
  getById(id: string): Ticket | null {
    const tickets = this.getAll();
    return tickets.find(t => t.id === id) || null;
  },

  // Lấy tickets của một user
  getByUserId(userId: string): Ticket[] {
    return this.getAll().filter(ticket => ticket.createdBy === userId);
  },

  // Tạo ticket mới qua API
  async createTicket(data: CreateTicketRequest): Promise<CreateTicketResponse> {
    try {
      const response = await apiClient.post<CreateTicketResponse>('/Ticket', data);
      return response;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Tạo ticket mới (legacy - localStorage)
  create(ticket: Omit<Ticket, 'id' | 'createdAt' | 'slaTracking'>): Ticket {
    const tickets = this.getAll();
    const now = new Date();
    const slaDeadline = new Date(now.getTime() + (ticket.priority === 'urgent' ? 4 : ticket.priority === 'high' ? 24 : ticket.priority === 'medium' ? 48 : 72) * 60 * 60 * 1000);
    
    const newTicket: Ticket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      createdAt: now.toISOString(),
      slaDeadline: slaDeadline.toISOString(),
      slaTracking: {
        createdAt: now.toISOString(),
        deadline: slaDeadline.toISOString(),
        isOverdue: false,
        timeline: [{
          id: `event-${Date.now()}`,
          timestamp: now.toISOString(),
          status: 'open',
          actor: ticket.createdBy || 'Unknown',
          actorRole: 'student',
          action: 'Ticket created',
        }],
      },
    };
    tickets.push(newTicket);
    saveTickets(tickets);
    return newTicket;
  },

  // Cập nhật ticket qua API (PUT method)
  async updateTicket(
    ticketCode: string, 
    description: string, 
    imageUrl?: string
  ): Promise<{ status: boolean; message: string; data: unknown; errors: string[] }> {
    try {
      const body: { description: string; imageUrl?: string } = { description };
      if (imageUrl !== undefined) {
        body.imageUrl = imageUrl;
      }
      
      const response = await apiClient.put<{ status: boolean; message: string; data: unknown; errors: string[] }>(
        `/Ticket/${ticketCode}`,
        body
      );
      return response;
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  },

  // Cập nhật ticket (legacy - localStorage)
  update(id: string, updates: Partial<Ticket>): Ticket {
    const tickets = this.getAll();
    const index = tickets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Ticket not found');
    
    tickets[index] = { 
      ...tickets[index], 
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveTickets(tickets);
    return tickets[index];
  },

  // Assign ticket to staff
  assign(ticketId: string, staffId: string, staffName: string): Ticket {
    const ticket = this.getById(ticketId);
    if (!ticket) throw new Error('Ticket not found');
    
    const newStatus = ticket.status === 'open' ? 'acknowledged' : ticket.status;
    return this.update(ticketId, {
      assignedTo: staffId,
      assignedToName: staffName,
      status: newStatus,
    });
  },

  // Update ticket status
  updateStatus(ticketId: string, newStatus: Ticket['status']): Ticket {
    return this.update(ticketId, { status: newStatus });
  },

  // Update ticket priority
  updatePriority(ticketId: string, newPriority: 'low' | 'medium' | 'high' | 'urgent'): Ticket {
    return this.update(ticketId, { priority: newPriority });
  },

  // Cancel ticket
  cancel(ticketId: string, reason: string): Ticket {
    const ticket = this.getById(ticketId);
    if (!ticket) throw new Error('Ticket not found');
    
    return this.update(ticketId, {
      status: 'cancelled',
      notes: ticket.notes ? `${ticket.notes}\n[Hủy bởi Admin]: ${reason}` : `[Hủy bởi Admin]: ${reason}`,
    });
  },

  // Xóa ticket (nếu cần)
  delete(id: string): void {
    const tickets = this.getAll().filter(t => t.id !== id);
    saveTickets(tickets);
  },

  // Cập nhật feedback cho ticket - PATCH method
  async updateFeedback(
    ticketCode: string,
    ratingStars: number,
    ratingComment: string
  ): Promise<{ status: boolean; message: string; data: unknown; errors: string[] }> {
    try {
      const response = await apiClient.patch<{ status: boolean; message: string; data: unknown; errors: string[] }>(
        `/Ticket/${ticketCode}/feedback`,
        {
          ratingStars,
          ratingComment
        }
      );
      return response;
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },
};
