import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

export interface ApiNotification {
  id: number;
  userId: number;
  message: string;
  type: 'TICKET_CREATED' | 'TICKET_ASSIGNED' | 'OTHER';
  ticketCode: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type?: 'TICKET_CREATED' | 'TICKET_ASSIGNED' | 'OTHER';
  title: string;
  description?: string;
  time: string;
  read?: boolean;
  ticketCode?: string;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: ApiNotification[];
  };
  errors: string[];
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📢 Fetching notifications...');
      
      const response = await apiClient.get<ApiResponse>(
        '/Notification/my-notifications'
      );

      console.log('📢 Notifications response:', response);

      if (response.status && response.data?.items) {
        const transformed = response.data.items.map((item) => ({
          id: item.id.toString(),
          type: item.type,
          title: `Vé ${item.ticketCode}`,
          description: item.message,
          time: item.createdAt,
          read: item.isRead,
          ticketCode: item.ticketCode,
        }));
        console.log('📢 Transformed notifications:', transformed);
        
        // Store all notifications
        setAllNotifications(transformed);
        
        // Show only unread by default
        const unread = transformed.filter(n => !n.read);
        setNotifications(unread);
      }
    } catch (err) {
      console.error('❌ Failed to fetch notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Call API to mark all as read
      await apiClient.patch('/Notification/mark-all-read');
      
      // Update local state - mark both notifications and allNotifications as read
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setAllNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const notification = allNotifications.find(n => n.id === notificationId);
      
      // Nếu đã đọc rồi, không cần call API
      if (notification?.read) {
        console.log('📢 Notification already read, skipping API call');
        return;
      }
      
      await apiClient.patch(`/Notification/${notificationId}/mark-read`);
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('❌ Failed to mark notification as read:', err);
      // Nếu error vì đã read, vẫn update state local
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    }
  }, [allNotifications]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    
    // Optional: Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications: showAll ? allNotifications : notifications,
    allNotifications,
    showAll,
    setShowAll,
    loading,
    error,
    fetchNotifications,
    markAllAsRead,
    markAsRead,
  };
};
