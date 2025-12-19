import { useState, useEffect, useCallback } from 'react';
import type { Ticket, Category, TicketFromApi } from '../../types';
import Pagination from '../../components/shared/Pagination';
import IssueSelectionPage from './issue-selection-page';
import CreateTicketPage from './create-ticket-page';
import TicketListPage from './ticket-list-page';
import EditTicketPage from './edit-ticket-page';
import TicketDetailModal from '../../components/shared/ticket-detail-modal';
import { ticketService } from '../../services/ticketService';
import { isTicketOverdueAndNotCompleted } from '../../utils/dateUtils';

// ════════════════════════════════════════════════════════════════════════════════════
// 👨‍🎓 [STUDENT HOME PAGE] - Dashboard chính cho sinh viên
// ════════════════════════════════════════════════════════════════════════════════════
// Chức năng:
// - Xem danh sách tickets của sinh viên (pending, processing, completed, v.v.)
// - Tạo ticket mới (chọn category → nhập thông tin → gửi)
// - Edit/Update ticket
// - Xem chi tiết ticket
// - Đánh giá ticket hoàn thành
// Luồng: home → issue-selection → create-ticket → ticket-list → edit-ticket
// ════════════════════════════════════════════════════════════════════════════════════

type StudentView = 'home' | 'issue-selection' | 'create-ticket' | 'ticket-list' | 'edit-ticket';
type StudentTab = 'pending' | 'processing' | 'waiting-feedback' | 'completed' | 'cancelled';

interface StudentHomePageProps {
  currentUser: { id: string | number; fullName?: string } | null;
  tickets: Ticket[];
  onTicketCreated: (ticket: Ticket) => void;
  onTicketUpdated?: (ticket: Ticket) => void;
  onFeedbackUpdated?: (ticketId: string, ratingStars: number, ratingComment: string) => void;
}

const StudentHomePage = ({ currentUser, onTicketCreated, onTicketUpdated, onFeedbackUpdated }: StudentHomePageProps) => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // 🎯 [NAVIGATION STATE] - Quản lý điều hướng giữa các view
  // ─────────────────────────────────────────────────────────────────────────────────
  
  // Điều khiển view hiện tại: home | issue-selection | create-ticket | ticket-list | edit-ticket
  const [studentView, setStudentView] = useState<StudentView>('home');
  
  // ─────────────────────────────────────────────────────────────────────────────────
  // 📋 [TICKET CREATION STATE] - Quản lý dữ liệu tạo ticket
  // ─────────────────────────────────────────────────────────────────────────────────
  
  // Issue/Category được chọn khi tạo ticket
  const [selectedIssue, setSelectedIssue] = useState<Category | null>(null);
  
  // Ticket được chọn để edit/xem chi tiết
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // ─────────────────────────────────────────────────────────────────────────────────
  // 🔍 [FILTERING & SEARCH STATE] - Quản lý lọc & tìm kiếm
  // ─────────────────────────────────────────────────────────────────────────────────
  
  // Tab filter: pending | processing | waiting-feedback | completed | cancelled
  const [studentTab, setStudentTab] = useState<StudentTab>('pending');
  
  // Search query để tìm kiếm ticket
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  
  // ─────────────────────────────────────────────────────────────────────────────────
  // 📄 [PAGINATION STATE] - Quản lý phân trang
  // ─────────────────────────────────────────────────────────────────────────────────
  
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // ─────────────────────────────────────────────────────────────────────────────────
  // 🌐 [API DATA STATE] - Dữ liệu từ backend API
  // ─────────────────────────────────────────────────────────────────────────────────
  
  // State for API tickets - danh sách tickets từ API
  const [apiTickets, setApiTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────────
  // 📥 [FETCH TICKETS] - Lấy tickets của sinh viên từ API
  // ─────────────────────────────────────────────────────────────────────────────────
  
  // Function to fetch/refresh tickets from API
  const fetchMyTickets = useCallback(async () => {
    try {
      setLoadingTickets(true);
      setTicketsError(null);
      // Get student's tickets từ /Ticket/my-tickets endpoint
      const response = await ticketService.getMyTickets(1, 100);
      
      // Map API response to Ticket format
      const mappedTickets: Ticket[] = response.data.items.map((apiTicket: TicketFromApi) => ({
        // Sử dụng ticketCode làm id để hiển thị & tìm kiếm
        id: apiTicket.ticketCode,
        ticketCode: apiTicket.ticketCode,
        title: apiTicket.title,
        description: apiTicket.description,
        status: mapApiStatus(apiTicket.status),
        priority: 'medium' as const, // API doesn't have priority, default to medium
        issueType: {
          id: apiTicket.categoryCode,
          name: apiTicket.categoryName,
          icon: '🔧',
          description: ''
        },
        location: apiTicket.locationName,
        roomNumber: '',
        createdBy: apiTicket.requesterCode,
        createdByName: apiTicket.requesterName,
        assignedTo: apiTicket.assignedToCode || undefined,
        assignedToName: apiTicket.assignedToName || undefined,
        assignedToPhone: apiTicket.assignedToPhone || undefined,
        managedByPhone: apiTicket.managedByPhone || undefined,
        createdAt: apiTicket.createdAt,
        updatedAt: apiTicket.createdAt,
        resolvedAt: apiTicket.resolvedAt || undefined,
        imageUrl: apiTicket.imageUrl,
        contactPhone: apiTicket.contactPhone || undefined,
        notes: apiTicket.note || undefined,
        note: apiTicket.note || undefined,
        slaDeadline: apiTicket.resolveDeadline,
        ratingStars: apiTicket.ratingStars || undefined,
        ratingComment: apiTicket.ratingComment || undefined,
        slaTracking: {
          createdAt: apiTicket.createdAt,
          deadline: apiTicket.resolveDeadline,
          isOverdue: false,
          timeline: []
        }
      }));
      
      setApiTickets(mappedTickets);
    } catch (error) {
      console.error('Error fetching my tickets:', error);
      setTicketsError(error instanceof Error ? error.message : 'Failed to fetch tickets');
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  // Fetch tickets from API on component mount
  useEffect(() => {
    if (currentUser) {
      fetchMyTickets();
    }
  }, [currentUser, fetchMyTickets]);

  // Map API status to UI status
  const mapApiStatus = (apiStatus: string): Ticket['status'] => {
    const statusMap: Record<string, Ticket['status']> = {
      'OPEN': 'open',
      'ASSIGNED': 'assigned',
      'IN_PROGRESS': 'in-progress',
      'RESOLVED': 'resolved',
      'CLOSED': 'closed',
      'CANCELLED': 'cancelled'
    };
    return statusMap[apiStatus] || 'open';
  };

  // Use API tickets instead of prop tickets
  const studentTickets = apiTickets;

  // Filter tickets by tab
  const pendingTickets = studentTickets.filter(t => t.status === 'open');
  const processingTickets = studentTickets.filter(t => 
    t.status === 'assigned' || t.status === 'in-progress'
  );
  const waitingFeedbackTickets = studentTickets.filter(t => t.status === 'resolved');
  const completedTickets = studentTickets.filter(t => t.status === 'closed');
  const cancelledTickets = studentTickets.filter(t => t.status === 'cancelled');

  // Get tickets for current tab
  let tabTickets: Ticket[] = [];
  if (studentTab === 'pending') {
    tabTickets = pendingTickets;
  } else if (studentTab === 'processing') {
    tabTickets = processingTickets;
  } else if (studentTab === 'waiting-feedback') {
    tabTickets = waitingFeedbackTickets;
  } else if (studentTab === 'completed') {
    tabTickets = completedTickets;
  } else if (studentTab === 'cancelled') {
    tabTickets = cancelledTickets;
  }

  // Apply search
  const filteredTickets = tabTickets.filter((ticket) => {
    const query = studentSearchQuery.toLowerCase().trim();
    if (!query) return true;

    // Cho phép tìm theo mã ticket (ticketCode/id), tiêu đề, mô tả
    const code =
      (ticket.ticketCode && ticket.ticketCode.toLowerCase()) ||
      (ticket.id && String(ticket.id).toLowerCase()) ||
      '';
    const title = ticket.title?.toLowerCase?.() || '';
    const description = ticket.description?.toLowerCase?.() || '';

    return (
      code.includes(query) ||
      title.includes(query) ||
      description.includes(query)
    );
  });

  // Client-side pagination for displayed tickets
  const totalCount = filteredTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePageNumber = Math.min(pageNumber, totalPages);
  const startIndex = (safePageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedTickets = filteredTickets.slice(startIndex, endIndex);
  const hasPrevious = safePageNumber > 1;
  const hasNext = safePageNumber < totalPages;

  // Reset về trang 1 khi đổi tab hoặc thay đổi từ khóa tìm kiếm
  useEffect(() => {
    setPageNumber(1);
  }, [studentTab, studentSearchQuery]);

  // Format date
  const formatDate = (dateString: string) => {
    // Normalize timestamp by adding Z if missing (backend returns without Z)
    const normalizedDateString = dateString.includes('Z') ? dateString : `${dateString}Z`;
    const date = new Date(normalizedDateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} ngày trước`;
    }
  };

  // Format full date time (like in modal details)
  const formatDateTime = (dateString: string) => {
    const normalizedDateString = dateString.includes('Z') ? dateString : `${dateString}Z`;
    const date = new Date(normalizedDateString);
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  // Status colors
  const statusColors: Record<string, { bg: string; text: string }> = {
    open: { bg: 'bg-blue-100', text: 'text-blue-800' },
    assigned: { bg: 'bg-purple-100', text: 'text-purple-800' },
    acknowledged: { bg: 'bg-blue-100', text: 'text-blue-800' },
    'in-progress': { bg: 'bg-amber-100', text: 'text-amber-800' },
    resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  // Status labels
  // Function to get status label - changes based on tab and status
  const getStatusLabel = (status: string) => {
    if (status === 'resolved' && studentTab === 'waiting-feedback') {
      return 'Chờ đánh giá';
    }
    if (status === 'closed') {
      return 'Đã hoàn thành';
    }
    const statusLabelsMap: Record<string, string> = {
      open: 'Mới tạo',
      assigned: 'Đã được giao việc',
      'in-progress': 'Đang xử lý',
      resolved: 'chờ đánh giá',
      cancelled: 'Đã hủy',
    };
    return statusLabelsMap[status] || status;
  };

  // Handle create ticket
  const handleCreateTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'slaDeadline'>) => {
    // Calculate SLA deadline based on priority
    const calculateSLADeadline = (createdAt: string, priority: Ticket['priority']): string => {
      const created = new Date(createdAt);
      const slaHours = {
        urgent: 4,
        high: 24,
        medium: 48,
        low: 72,
      };
      const priorityKey = priority || 'medium';
      created.setHours(created.getHours() + slaHours[priorityKey]);
      return created.toISOString();
    };

    // Generate initial SLA tracking
    const createInitialSLATracking = (createdAt: string, slaDeadline: string): Ticket['slaTracking'] => {
      return {
        createdAt,
        deadline: slaDeadline,
        isOverdue: false,
        timeline: [
          {
            id: `evt-${Date.now()}-1`,
            timestamp: createdAt,
            status: 'open',
            actor: currentUser?.fullName || 'Sinh viên',
            actorRole: 'student',
            action: 'Ticket được tạo',
            note: 'Sinh viên tạo ticket mới',
            duration: 0,
          },
        ],
      };
    };

    // Generate new ticket ID
    const getNextTicketId = (): string => {
      const existingIds = apiTickets.map(t => t.id);
      const maxNumber = existingIds
        .map(id => {
          const match = id.match(/TKT-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .reduce((max, num) => Math.max(max, num), 0);
      return `TKT-${String(maxNumber + 1).padStart(3, '0')}`;
    };

    // Create new ticket
    const createdAt = new Date().toISOString();
    const newTicketId = getNextTicketId();
    const slaDeadline = calculateSLADeadline(createdAt, ticketData.priority);
    const slaTracking = createInitialSLATracking(createdAt, slaDeadline);

    const newTicket: Ticket = {
      id: newTicketId,
      title: ticketData.title,
      description: ticketData.description,
      categoryId: ticketData.categoryId,
      priority: ticketData.priority,
      status: ticketData.status,
      location: ticketData.location,
      locationId: ticketData.locationId,
      images: ticketData.images,
      createdBy: currentUser?.id ? String(currentUser.id) : 'unknown',
      requesterId: currentUser?.id ? String(currentUser.id) : 'unknown',
      createdByName: currentUser?.fullName,
      createdAt,
      updatedAt: createdAt,
      slaDeadline,
      deadlineAt: slaDeadline,
      slaTracking,
    };

    onTicketCreated(newTicket);
    alert('Ticket đã được gửi thành công! 🎉');
    
    // Reset view to home to show new ticket
    setStudentView('home');
    setSelectedIssue(null);
    
    // Refresh tickets from API to show the new ticket
    fetchMyTickets();
  };

  // Handle cancel ticket
  const handleCancelTicket = async (ticketId: string, reason: string) => {
    try {
      const response = await ticketService.cancelTicket(ticketId, reason);
      
      if (response.status) {
        // Refresh tickets to show cancelled ticket
        await fetchMyTickets();
      } else {
        throw new Error(response.message || 'Không thể hủy ticket');
      }
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8">
      {studentView === 'home' && (
        <>
          {loadingTickets ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-lg text-gray-500">Đang tải tickets...</p>
            </div>
          ) : ticketsError ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-lg text-red-500">Lỗi: {ticketsError}</p>
              <button
                className="mt-4 py-2 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          ) : (
          <>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl m-0 text-gray-800">My tickets</h2>
              <button
                className="py-3 px-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none rounded-lg cursor-pointer text-[0.95rem] font-medium transition-all duration-200 hover:bg-blue-700"
                onClick={() => setStudentView('issue-selection')}
              >
                + Tạo Ticket Mới
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 mb-6">
              <button
                className={`py-3 px-6 text-base font-medium transition-all duration-200 border-b-2 ${
                  studentTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setStudentTab('pending')}
              >
                Chưa xử lý ({pendingTickets.length})
              </button>
              <button
                className={`py-3 px-6 text-base font-medium transition-all duration-200 border-b-2 ${
                  studentTab === 'processing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setStudentTab('processing')}
              >
                Đang xử lý ({processingTickets.length})
              </button>
              <button
                className={`py-3 px-6 text-base font-medium transition-all duration-200 border-b-2 ${
                  studentTab === 'waiting-feedback'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setStudentTab('waiting-feedback')}
              >
                Đợi đánh giá ({waitingFeedbackTickets.length})
              </button>
              <button
                className={`py-3 px-6 text-base font-medium transition-all duration-200 border-b-2 ${
                  studentTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setStudentTab('completed')}
              >
                Đã hoàn thành ({completedTickets.length})
              </button>
              <button
                className={`py-3 px-6 text-base font-medium transition-all duration-200 border-b-2 ${
                  studentTab === 'cancelled'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setStudentTab('cancelled')}
              >
                Bị hủy ({cancelledTickets.length})
              </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Tìm theo mã ticket, tiêu đề hoặc mô tả..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="py-3 px-4 text-base border-2 border-gray-200 rounded-lg transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Ticket Cards */}
          {displayedTickets.length === 0 ? (
            <div className="text-center py-16 px-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {studentTab === 'pending'
                  ? 'Chưa có ticket chưa xử lý'
                  : studentTab === 'processing'
                  ? 'Chưa có ticket đang xử lý'
                  : studentTab === 'waiting-feedback'
                  ? 'Chưa có ticket đợi đánh giá'
                  : 'Chưa có ticket đã hoàn thành'}
              </h3>
              <p className="text-base text-gray-500">
                {studentTab === 'pending'
                  ? 'Bạn chưa có ticket nào chưa được xử lý hoặc bạn chưa tạo ticket nào'
                  : studentTab === 'processing'
                  ? 'Tất cả các ticket của bạn đã được xử lý hoặc bạn chưa tạo ticket nào'
                  : studentTab === 'waiting-feedback'
                  ? 'Tất cả các ticket đã được giải quyết và bạn đã hoàn thành đánh giá'
                  : 'Bạn chưa có ticket nào đã hoàn thành'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {displayedTickets.map((ticket) => {
                // Check if ticket is completed (resolved or closed)
                const isCompleted = ticket.status === 'resolved' || ticket.status === 'closed';

                return (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-xl p-6 border-2 border-gray-200 cursor-pointer transition-all duration-200 flex flex-col gap-4 hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="text-[0.85rem] font-semibold text-gray-500 mb-2">{ticket.id}</div>
                        <h3 className="text-lg font-semibold text-gray-800 m-0 mb-2">{ticket.title}</h3>
                        <div className="flex gap-4 flex-wrap items-center">
                          {isTicketOverdueAndNotCompleted(ticket.resolveDeadline, ticket.status) ? (
                            <span className={`inline-flex items-center gap-1 py-1 px-3 rounded-xl text-[0.85rem] font-semibold bg-red-100 text-red-800`}>
                              ⚠️ Quá hạn
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 py-1 px-3 rounded-xl text-[0.85rem] font-semibold ${statusColors[ticket.status]?.bg || 'bg-gray-100'} ${statusColors[ticket.status]?.text || 'text-gray-800'}`}>
                              {getStatusLabel(ticket.status)}
                            </span>
                          )}
                          {ticket.location && (
                            <span className="flex items-center gap-2 text-sm text-gray-500">
                              <span>📍</span>
                              <span>{ticket.location} {ticket.roomNumber && `- ${ticket.roomNumber}`}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-[0.95rem] text-gray-500 leading-relaxed line-clamp-2 overflow-hidden">
                      {ticket.description}
                    </p>

                    {/* Overdue Notification Box */}
                    {isTicketOverdueAndNotCompleted(ticket.resolveDeadline, ticket.status) && (
                      <div className="mt-3 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                        <div className="flex items-start gap-3">
                          <div className="text-xl">🚨</div>
                          <div>
                            <div className="font-semibold text-red-800 text-sm">Ticket đã quá hạn</div>
                            <div className="text-sm text-red-700 mt-1">Vui lòng ưu tiên hoàn thành.</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show note if exists */}
                    {ticket.note && (
                      <div className={`mt-3 p-3 rounded-lg border-2 ${
                        ticket.status === 'cancelled' 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <div className={`text-xs font-semibold mb-1 ${
                          ticket.status === 'cancelled' 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {ticket.status === 'cancelled' ? '🔴 Lý do hủy' : '📝 Ghi chú'}
                        </div>
                        <div className={`text-sm line-clamp-2 ${
                          ticket.status === 'cancelled' 
                            ? 'text-red-800' 
                            : 'text-green-800'
                        }`}>
                          {ticket.note}
                        </div>
                      </div>
                    )}

                    {/* Show staff info and phone number for all tickets with assigned staff */}
                    {ticket.assignedToName && (
                      <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                        <span className="text-lg">👤</span>
                        <div className="flex-1">
                          <div className="text-[0.8rem] font-semibold text-gray-500">Người xử lý</div>
                          <div className="text-sm font-medium text-gray-800">{ticket.assignedToName}</div>
                        </div>
                        {ticket.assignedToPhone && (
                          <div className="text-right">
                            <div className="text-[0.8rem] font-semibold text-gray-500">Điện thoại</div>
                            <div className="text-sm font-medium text-gray-800">{ticket.assignedToPhone}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show resolution date for completed tickets */}
                    {isCompleted && ticket.resolvedAt && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 flex items-center gap-3">
                        <span className="text-lg">✅</span>
                        <div>
                          <div className="text-[0.8rem] font-semibold text-gray-500">Được giải quyết vào</div>
                          <div className="text-sm font-medium text-gray-800">{formatDateTime(ticket.resolvedAt)}</div>
                        </div>
                      </div>
                    )}

                    {/* Show contact phone in separate box */}
                    {isCompleted && ticket.contactPhone && (
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 flex items-center gap-3">
                        <span className="text-lg">📱</span>
                        <div>
                          <div className="text-[0.8rem] font-semibold text-gray-500">Số điện thoại liên hệ</div>
                          <div className="text-sm font-medium text-gray-800">{ticket.contactPhone}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 text-[0.85rem]">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </div>
                      <button
                        className="py-2 px-4 bg-blue-500 text-white border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(ticket);
                        }}
                      >
                        Xem chi tiết →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination - giống admin ticket management, nằm dưới danh sách */}
          {totalCount > 0 && (
            <div className="mt-6">
              <Pagination
                pageNumber={safePageNumber}
                pageSize={pageSize}
                totalPages={totalPages}
                totalCount={totalCount}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onPageChange={setPageNumber}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPageNumber(1);
                }}
              />
            </div>
          )}
          </>
          )}
        </>
      )}

      {studentView === 'issue-selection' && (
        <IssueSelectionPage
          onSelectIssue={(category: Category) => {
            setSelectedIssue(category);
            setStudentView('create-ticket');
          }}
          onBack={() => setStudentView('home')}
        />
      )}

      {studentView === 'create-ticket' && selectedIssue && (
        <CreateTicketPage
          category={selectedIssue}
          onBack={() => setStudentView('issue-selection')}
          onSubmit={handleCreateTicket}
        />
      )}

      {studentView === 'ticket-list' && (
        <TicketListPage
          onViewDetail={(ticket: Ticket) => setSelectedTicket(ticket)}
          onBack={() => setStudentView('home')}
        />
      )}

      {studentView === 'edit-ticket' && selectedTicket && (
        <EditTicketPage
          ticket={selectedTicket}
          onBack={() => {
            setStudentView('home');
            setSelectedTicket(null);
          }}
          onSubmit={(updatedTicket) => {
            if (onTicketUpdated) {
              onTicketUpdated(updatedTicket);
            }
            setStudentView('home');
            setSelectedTicket(null);
          }}
        />
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && studentView !== 'edit-ticket' && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => {
            setSelectedTicket(null);
          }}
          isStudentView={true}
          onEdit={(ticket) => {
            setSelectedTicket(ticket);
            setStudentView('edit-ticket');
          }}
          onUpdateFeedback={onFeedbackUpdated}
          onCancelTicket={handleCancelTicket}
        />
      )}
    </div>
  );
};

export default StudentHomePage;

