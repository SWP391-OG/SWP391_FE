// Hook quản lý danh sách Tickets được lưu local (localStorage) cho các màn hình nội bộ
import { useState, useEffect } from 'react';
import type { Ticket } from '../types';
import { ticketService } from '../services/ticketService';

export const useTickets = () => {
  // Danh sách ticket trong local (không phải dữ liệu API paging)
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  // Load tickets ban đầu và đồng bộ dữ liệu giữa các tab / component
  useEffect(() => {
    loadTickets();
    
    // Lắng nghe sự kiện storage để sync tickets giữa các tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tickets') {
        loadTickets();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Định kỳ (2s) kiểm tra localStorage để bắt được thay đổi trong cùng tab
    const interval = setInterval(() => {
      const currentTickets = ticketService.getAll();
      if (currentTickets.length !== tickets.length || 
          JSON.stringify(currentTickets) !== JSON.stringify(tickets)) {
        loadTickets();
      }
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [tickets.length]); // Re-run nếu số lượng ticket thay đổi

  // Load toàn bộ tickets từ ticketService (localStorage)
  const loadTickets = () => {
    setLoading(true);
    try {
      const data = ticketService.getAll();
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo ticket mới (lưu vào localStorage và cập nhật state)
  const createTicket = (ticket: Omit<Ticket, 'id' | 'createdAt' | 'slaTracking'>) => {
    try {
      const newTicket = ticketService.create(ticket);
      setTickets([...tickets, newTicket]);
      return newTicket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  };

  // Cập nhật thông tin ticket theo id
  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    try {
      const updated = ticketService.update(id, updates);
      setTickets(tickets.map(t => t.id === id ? updated : t));
      return updated;
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  };

  // Gán ticket cho staff (cập nhật localStorage + state)
  const assignTicket = (ticketId: string, staffId: string, staffName: string) => {
    try {
      const updated = ticketService.assign(ticketId, staffId, staffName);
      setTickets(tickets.map(t => t.id === ticketId ? updated : t));
      return updated;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    }
  };

  // Cập nhật trạng thái ticket
  const updateTicketStatus = (ticketId: string, newStatus: Ticket['status']) => {
    try {
      const updated = ticketService.updateStatus(ticketId, newStatus);
      setTickets(tickets.map(t => t.id === ticketId ? updated : t));
      return updated;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  };

  // Cập nhật độ ưu tiên ticket
  const updateTicketPriority = (ticketId: string, newPriority: 'low' | 'medium' | 'high' | 'urgent') => {
    try {
      const updated = ticketService.updatePriority(ticketId, newPriority);
      setTickets(tickets.map(t => t.id === ticketId ? updated : t));
      return updated;
    } catch (error) {
      console.error('Error updating ticket priority:', error);
      throw error;
    }
  };

  // Hủy ticket với lý do
  const cancelTicket = (ticketId: string, reason: string) => {
    try {
      const updated = ticketService.cancel(ticketId, reason);
      setTickets(tickets.map(t => t.id === ticketId ? updated : t));
      return updated;
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      throw error;
    }
  };

  // Xóa ticket khỏi localStorage
  const deleteTicket = (id: string) => {
    try {
      ticketService.delete(id);
      setTickets(tickets.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  };

  // Lấy danh sách ticket theo userId (dùng cho trang "My tickets")
  const getTicketsByUserId = (userId: string) => {
    return ticketService.getByUserId(userId);
  };

  return {
    tickets,
    loading,
    createTicket,
    updateTicket,
    assignTicket,
    updateTicketStatus,
    updateTicketPriority,
    cancelTicket,
    deleteTicket,
    getTicketsByUserId,
    loadTickets,
  };
};
