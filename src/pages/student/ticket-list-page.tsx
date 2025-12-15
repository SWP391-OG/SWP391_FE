import { useState, useMemo, useEffect } from 'react';
import type { Ticket, TicketFromApi } from '../../types';
import { ticketService } from '../../services/ticketService';

interface TicketListPageProps {
  onViewDetail: (ticket: Ticket) => void;
  onBack: () => void;
}

const TicketListPage = ({ onViewDetail, onBack }: TicketListPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Ticket['status'] | 'all'>('all');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await ticketService.getMyTickets(1, 100); // Get student's tickets
        
        // Map API response to Ticket format
        const mappedTickets: Ticket[] = response.data.items.map((apiTicket: TicketFromApi) => ({
          id: apiTicket.ticketCode,
          title: apiTicket.title,
          description: apiTicket.description,
          status: mapApiStatus(apiTicket.status),
          priority: 'medium' as const, // API doesn't have priority, default to medium
          categoryId: apiTicket.categoryCode,
          categoryName: apiTicket.categoryName || undefined,
          location: apiTicket.locationName,
          locationName: apiTicket.locationName || undefined,
          roomNumber: '',
          createdBy: apiTicket.requesterCode,
          createdByName: apiTicket.requesterName || undefined,
          assignedTo: apiTicket.assignedToCode || undefined,
          assignedToName: apiTicket.assignedToName || undefined,
          managedByCode: apiTicket.managedByCode || undefined,
          managedByName: apiTicket.managedByName || undefined,
          createdAt: apiTicket.createdAt,
          updatedAt: apiTicket.createdAt,
          resolvedAt: apiTicket.resolvedAt || undefined,
          closedAt: apiTicket.closedAt || undefined,
          imageUrl: apiTicket.imageUrl || undefined,
          contactPhone: apiTicket.contactPhone || undefined,
          note: apiTicket.note || undefined,
          notes: apiTicket.note || undefined,
          resolveDeadline: apiTicket.resolveDeadline || undefined,
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
        
        setTickets(mappedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

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

  // Filter and search tickets
  const filteredTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Sort by status: open (NEW) → assigned (ASSIGNED) → in-progress (IN_PROGRESS) → resolved (RESOLVED) → closed (CLOSED)
    const statusOrder: Record<string, number> = {
      'open': 1,
      'assigned': 2,
      'acknowledged': 2,
      'in-progress': 3,
      'resolved': 4,
      'closed': 5,
      'cancelled': 6
    };

    return filtered.sort((a, b) => {
      const statusDiff = (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
      if (statusDiff !== 0) return statusDiff;
      // Nếu cùng status, sort theo ngày tạo (mới nhất trước)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tickets, searchQuery, filterStatus]);

  // Status colors
  const statusColors: Record<string, { bg: string; text: string }> = {
    open: { bg: 'bg-blue-100', text: 'text-blue-800' },
    assigned: { bg: 'bg-purple-100', text: 'text-purple-800' },
    acknowledged: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'in-progress': { bg: 'bg-amber-100', text: 'text-amber-800' },
    resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  // Status labels
  const statusLabels: Record<string, string> = {
    open: 'Mới tạo',
    assigned: 'Đã được giao việc',
    acknowledged: 'Mới tạo',
    created: 'Mới tạo',
    'in-progress': 'Đang xử lý',
    resolved: 'Đã giải quyết',
    closed: 'Đã đóng',
    cancelled: 'Đã hủy',
  };

  // Calculate stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress' || t.status === 'assigned').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    cancelled: tickets.filter(t => t.status === 'cancelled').length,
  };

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


  return (
    <div className="max-w-[1400px] mx-auto p-8">
      {loading ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-lg text-gray-500">Đang tải tickets...</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl m-0 text-gray-800">📋 Danh Sách Ticket</h2>
          <button 
            className="py-3 px-6 bg-gray-200 text-gray-700 border-none rounded-lg cursor-pointer text-[0.95rem] font-medium transition-all duration-200 hover:bg-gray-300"
            onClick={onBack}
          >
            ← Quay lại
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-[0.85rem] text-gray-500 mb-2">Tổng số ticket</div>
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-[0.85rem] text-gray-500 mb-2">Mới tạo</div>
            <div className="text-3xl font-bold text-blue-500">{stats.open}</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-[0.85rem] text-gray-500 mb-2">Đang xử lý</div>
            <div className="text-3xl font-bold text-amber-500">{stats.inProgress}</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-[0.85rem] text-gray-500 mb-2">Hoàn thành</div>
            <div className="text-3xl font-bold text-emerald-500">{stats.resolved}</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-[0.85rem] text-gray-500 mb-2">Bị hủy</div>
            <div className="text-3xl font-bold text-red-500">{stats.cancelled}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl mb-8 border border-gray-200 shadow-sm">
          <div className="flex gap-2 p-4 flex-wrap">
            <button
              className={`py-3 px-5 rounded-lg font-semibold text-[0.95rem] transition-all duration-200 border-2 ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-500'
              }`}
              onClick={() => setFilterStatus('all')}
            >
              📋 Tất cả
            </button>
            <button
              className={`py-3 px-5 rounded-lg font-semibold text-[0.95rem] transition-all duration-200 border-2 ${
                filterStatus === 'open'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-500'
              }`}
              onClick={() => setFilterStatus('open')}
            >
              🆕 Mới tạo ({stats.open})
            </button>
            <button
              className={`py-3 px-5 rounded-lg font-semibold text-[0.95rem] transition-all duration-200 border-2 ${
                filterStatus === 'in-progress'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-amber-500'
              }`}
              onClick={() => setFilterStatus('in-progress')}
            >
              ⏳ Đang xử lý ({stats.inProgress})
            </button>
            <button
              className={`py-3 px-5 rounded-lg font-semibold text-[0.95rem] transition-all duration-200 border-2 ${
                filterStatus === 'resolved'
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-500'
              }`}
              onClick={() => setFilterStatus('resolved')}
            >
              ✅ Đã hoàn thành ({stats.resolved})
            </button>
            <button
              className={`py-3 px-5 rounded-lg font-semibold text-[0.95rem] transition-all duration-200 border-2 ${
                filterStatus === 'cancelled'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-red-500'
              }`}
              onClick={() => setFilterStatus('cancelled')}
            >
              🚫 Bị hủy ({stats.cancelled})
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">🔍 Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-3 px-4 text-base border-2 border-gray-200 rounded-lg transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Ticket List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 px-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Không tìm thấy ticket</h3>
          <p className="text-base text-gray-500">
            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredTickets.map((ticket) => {
            return (
              <div
                key={ticket.id}
                className="bg-white rounded-xl p-6 border-2 border-gray-200 cursor-pointer transition-all duration-200 flex flex-col gap-4 hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5"
                onClick={() => onViewDetail(ticket)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="text-[0.85rem] font-semibold text-gray-500 mb-2">{ticket.id}</div>
                    <h3 className="text-lg font-semibold text-gray-800 m-0 mb-2">{ticket.title}</h3>
                    <div className="flex gap-4 flex-wrap items-center">
                      <span className={`inline-flex items-center gap-1 py-1 px-3 rounded-xl text-[0.85rem] font-semibold ${statusColors[ticket.status]?.bg || 'bg-gray-100'} ${statusColors[ticket.status]?.text || 'text-gray-800'}`}>
                        {statusLabels[ticket.status] || ticket.status}
                      </span>
                      {ticket.categoryId && (
                        <span className="flex items-center gap-2 text-sm text-gray-500">
                          <span>🔧</span>
                          <span>{ticket.categoryId}</span>
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
                      onViewDetail(ticket);
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
        </>
      )}
    </div>
  );
};

export default TicketListPage;
