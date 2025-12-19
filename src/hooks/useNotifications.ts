import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

// Kiểu dữ liệu notification từ API backend
export interface ApiNotification {
  id: number; // ID của notification
  userId: number; // ID người dùng nhận notification
  message: string; // Nội dung thông báo
  type: 'TICKET_CREATED' | 'TICKET_ASSIGNED' | 'OTHER'; // Loại notification
  ticketCode: string; // Mã ticket liên quan
  isRead: boolean; // Đã đọc hay chưa
  createdAt: string; // Thời gian tạo notification
}

// Kiểu dữ liệu notification sau khi transform cho frontend
export interface NotificationItem {
  id: string; // ID notification (string)
  type?: 'TICKET_CREATED' | 'TICKET_ASSIGNED' | 'OTHER'; // Loại notification
  title: string; // Tiêu đề notification
  description?: string; // Mô tả chi tiết
  time: string; // Thời gian tạo (ISO string)
  read?: boolean; // Đã đọc hay chưa
  ticketCode?: string; // Mã ticket liên quan
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

// Hook quản lý notifications của người dùng hiện tại
// - Lấy danh sách notifications từ API
// - Hỗ trợ xem tất cả hoặc chỉ chưa đọc
// - Đánh dấu đã đọc (một hoặc tất cả)
// - Tự động poll notifications mới mỗi 30 giây
export const useNotifications = () => {
  // Danh sách notifications đang hiển thị (có thể là tất cả hoặc chỉ chưa đọc, tùy showAll)
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  // Danh sách tất cả notifications từ API
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  // Trạng thái đang tải dữ liệu
  const [loading, setLoading] = useState(false);
  // Lỗi nếu có khi fetch notifications
  const [error, setError] = useState<string | null>(null);
  // Flag để hiển thị tất cả notifications hay chỉ chưa đọc
  const [showAll, setShowAll] = useState(false);

  // Lấy danh sách notifications từ API
  // - Gọi API /Notification/my-notifications để lấy notifications của user hiện tại
  // - Transform dữ liệu từ ApiNotification sang NotificationItem
  // - Lưu tất cả vào allNotifications
  // - Mặc định chỉ hiển thị notifications chưa đọc
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📢 Fetching notifications...');
      
      // Gọi API để lấy notifications của user hiện tại
      const response = await apiClient.get<ApiResponse>(
        '/Notification/my-notifications'
      );

      console.log('📢 Notifications response:', response);

      // Nếu API trả về thành công, transform dữ liệu
      if (response.status && response.data?.items) {
        // Transform từ ApiNotification sang NotificationItem
        const transformed = response.data.items.map((item) => ({
          id: item.id.toString(), // Convert id từ number sang string
          type: item.type,
          title: `Vé ${item.ticketCode}`, // Tiêu đề: "Vé TKT123456"
          description: item.message, // Mô tả là message từ API
          time: item.createdAt, // Thời gian tạo
          read: item.isRead, // Trạng thái đã đọc
          ticketCode: item.ticketCode, // Mã ticket
        }));
        console.log('📢 Transformed notifications:', transformed);
        
        // Lưu tất cả notifications
        setAllNotifications(transformed);
        
        // Mặc định chỉ hiển thị notifications chưa đọc
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

  // Đánh dấu tất cả notifications là đã đọc
  // - Gọi API /Notification/mark-all-read để cập nhật trên server
  // - Cập nhật state local để đánh dấu tất cả notifications là đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      // Gọi API để đánh dấu tất cả notifications là đã đọc trên server
      await apiClient.patch('/Notification/mark-all-read');
      
      // Cập nhật state local - đánh dấu cả notifications và allNotifications là đã đọc
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

  // Đánh dấu một notification cụ thể là đã đọc
  // - Kiểm tra notification đã đọc chưa, nếu rồi thì skip API call
  // - Gọi API /Notification/{id}/mark-read để cập nhật trên server
  // - Cập nhật state local cho cả notifications và allNotifications
  // - Nếu API lỗi (có thể do đã đọc rồi), vẫn cập nhật state local
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const notification = allNotifications.find(n => n.id === notificationId);
      
      // Nếu notification đã đọc rồi, không cần gọi API
      if (notification?.read) {
        console.log('📢 Notification already read, skipping API call');
        return;
      }
      
      // Gọi API để đánh dấu notification là đã đọc trên server
      await apiClient.patch(`/Notification/${notificationId}/mark-read`);
      
      // Cập nhật state local - đánh dấu notification là đã đọc
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('❌ Failed to mark notification as read:', err);
      // Nếu API lỗi (có thể do đã đọc rồi), vẫn cập nhật state local để đảm bảo UI nhất quán
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    }
  }, [allNotifications]);

  // Tự động fetch notifications khi component mount
  // - Gọi fetchNotifications ngay lập tức
  // - Poll notifications mới mỗi 30 giây để cập nhật real-time
  // - Cleanup interval khi component unmount
  useEffect(() => {
    fetchNotifications();
    
    // Poll notifications mới mỗi 30 giây để cập nhật real-time
    const interval = setInterval(fetchNotifications, 30000);
    
    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Trả về các giá trị và functions để component sử dụng
  return {
    notifications: showAll ? allNotifications : notifications, // Danh sách notifications hiển thị (tất cả hoặc chưa đọc)
    allNotifications, // Tất cả notifications từ API
    showAll, // Flag hiển thị tất cả hay chỉ chưa đọc
    setShowAll, // Function để toggle showAll
    loading, // Trạng thái đang tải
    error, // Lỗi nếu có
    fetchNotifications, // Function để fetch lại notifications
    markAllAsRead, // Function đánh dấu tất cả đã đọc
    markAsRead, // Function đánh dấu một notification đã đọc
  };
};
