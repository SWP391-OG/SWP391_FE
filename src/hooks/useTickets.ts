import { useState, useEffect } from 'react';
import type { Ticket } from '../types';
import { ticketService } from '../services/ticketService';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  // Load tickets
  useEffect(() => {
    loadTickets();
  }, []);

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

  // Tạo ticket mới
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

  // Cập nhật ticket
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

  // Assign ticket to staff
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

  // Update ticket status
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

  // Update ticket priority
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

  // Cancel ticket
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

  // Xóa ticket
  const deleteTicket = (id: string) => {
    try {
      ticketService.delete(id);
      setTickets(tickets.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  };

  // Get tickets by user ID
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
