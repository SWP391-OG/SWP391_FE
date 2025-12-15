import { useState, useEffect } from 'react';
import type { Ticket, TicketFromApi } from '../types';
import { ticketService } from '../services/ticketService';

export const useTicketByCode = (ticketCode: string | null) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketCode) {
      setTicket(null);
      return;
    }

    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📢 Fetching ticket:', ticketCode);
        
        // Fetch ticket từ API
        const response = await ticketService.getTicketByCode(ticketCode);
        console.log('📢 Ticket response:', response);
        
        if (response && response.data) {
          const apiData = response.data as unknown as TicketFromApi;
          
          // Convert API response to Ticket format
          const convertedTicket: Ticket = {
            id: apiData.ticketCode,
            ticketCode: apiData.ticketCode,
            title: apiData.title,
            description: apiData.description,
            status: (apiData.status || 'open').toLowerCase().replace(/_/g, '-') as any,
            createdAt: apiData.createdAt,
            updatedAt: apiData.createdAt,
            resolveDeadline: apiData.resolveDeadline,
            resolvedAt: apiData.resolvedAt || undefined,
            closedAt: apiData.closedAt || undefined,
            ratingStars: apiData.ratingStars || 0,
            ratingComment: apiData.ratingComment || '',
            locationName: apiData.locationName,
            locationId: apiData.locationCode,
            categoryId: apiData.categoryCode,
            assignedToName: apiData.assignedToName,
            createdByName: apiData.requesterName,
          };
          
          setTicket(convertedTicket);
        }
      } catch (err) {
        console.error('❌ Failed to fetch ticket:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch ticket');
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketCode]);

  return { ticket, loading, error };
};
