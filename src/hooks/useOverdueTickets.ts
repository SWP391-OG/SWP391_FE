import { useState, useEffect } from 'react';
import type { TicketFromApi } from '../types';
import { ticketService } from '../services/ticketService';

export interface UseOverdueTicketsReturn {
  overdueTickets: TicketFromApi[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  escalateTicket: (ticketCode: string) => Promise<void>;
  isEscalating: boolean;
}

/**
 * Hook để fetch danh sách tickets overdue từ API
 * Chỉ dành cho Admin
 * 
 * @returns {UseOverdueTicketsReturn} Overdue tickets, loading state, error state, refetch function
 */
export const useOverdueTickets = (): UseOverdueTicketsReturn => {
  const [overdueTickets, setOverdueTickets] = useState<TicketFromApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEscalating, setIsEscalating] = useState(false);

  // Fetch overdue tickets
  const fetchOverdueTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ticketService.getOverdueTickets();
      setOverdueTickets(response.data.items || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch overdue tickets';
      setError(errorMsg);
      console.error('❌ Error fetching overdue tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refetch on mount
  useEffect(() => {
    fetchOverdueTickets();
    
    // Optional: Refresh every 5 minutes to check for new overdue tickets
    const interval = setInterval(fetchOverdueTickets, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Escalate a ticket
  const escalateTicket = async (ticketCode: string) => {
    setIsEscalating(true);
    try {
      const response = await ticketService.escalateTicket(ticketCode);
      if (response.status) {
        // Remove escalated ticket from list
        setOverdueTickets(prev => 
          prev.filter(t => t.ticketCode !== ticketCode)
        );
        console.log(`✅ Ticket ${ticketCode} escalated successfully`);
      } else {
        throw new Error(response.errors?.[0] || 'Failed to escalate ticket');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to escalate ticket';
      setError(errorMsg);
      console.error('❌ Error escalating ticket:', err);
    } finally {
      setIsEscalating(false);
    }
  };

  return {
    overdueTickets,
    loading,
    error,
    refetch: fetchOverdueTickets,
    escalateTicket,
    isEscalating,
  };
};
