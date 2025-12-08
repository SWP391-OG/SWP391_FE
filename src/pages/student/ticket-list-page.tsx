import { useState, useMemo } from 'react';
import type { Ticket } from '../../types';
import { mockTickets } from '../../data/mockData';

interface TicketListPageProps {
  onViewDetail: (ticket: Ticket) => void;
  onBack: () => void;
}

const TicketListPage = ({ onViewDetail, onBack }: TicketListPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Ticket['status'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Ticket['priority'] | 'all'>('all');


  // Filter and search tickets
  const filteredTickets = useMemo(() => {
    return mockTickets.filter((ticket) => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchQuery, filterStatus, filterPriority]);

  // Status colors
  const statusColors = {
    open: { bg: 'bg-blue-100', text: 'text-blue-800' },
    acknowledged: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'in-progress': { bg: 'bg-amber-100', text: 'text-amber-800' },
    resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  // Priority colors
  const priorityColors = {
    low: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-800' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700' },
    urgent: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  // Priority labels
  const priorityLabels = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    urgent: 'Khẩn cấp',
  };

  // Status labels
  const statusLabels = {
    open: 'Mở',
    acknowledged: 'Đã xác nhận',
    'in-progress': 'Đang xử lý',
    resolved: 'Đã giải quyết',
    closed: 'Đã đóng',
    cancelled: 'Đã hủy',
  };

  // Calculate stats
  const stats = {
    total: mockTickets.length,
    open: mockTickets.filter(t => t.status === 'open').length,
    inProgress: mockTickets.filter(t => t.status === 'in-progress').length,
    resolved: mockTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-[0.85rem] text-gray-500 mb-2">Tổng số ticket</div>
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-[0.85rem] text-gray-500 mb-2">Đang mở</div>
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
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tìm theo tiêu đề hoặc mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 px-4 text-base border-2 border-gray-200 rounded-lg transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as Ticket['status'] | 'all')}
                className="py-3 px-4 text-base border-2 border-gray-200 rounded-lg bg-white cursor-pointer transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="open">Mở</option>
                <option value="in-progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Ưu tiên</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as Ticket['priority'] | 'all')}
                className="py-3 px-4 text-base border-2 border-gray-200 rounded-lg bg-white cursor-pointer transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="urgent">Khẩn cấp</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>
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
                      <span className={`inline-flex items-center gap-1 py-1 px-3 rounded-xl text-[0.85rem] font-semibold ${statusColors[ticket.status].bg} ${statusColors[ticket.status].text}`}>
                        {statusLabels[ticket.status]}
                      </span>
                      <span className={`inline-flex items-center gap-1 py-1 px-3 rounded-xl text-[0.85rem] font-semibold ${priorityColors[ticket.priority].bg} ${priorityColors[ticket.priority].text}`}>
                        {priorityLabels[ticket.priority]}
                      </span>
                      <span className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{ticket.issueType.icon}</span>
                        <span>{ticket.issueType.name}</span>
                      </span>
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
    </div>
  );
};

export default TicketListPage;
