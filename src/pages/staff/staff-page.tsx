import { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticketService';
import AssignedTicketsList from '../../components/staff/AssignedTicketsList';
import type { TicketFromApi } from '../../types';
const StaffPage = () => {
  const [tickets, setTickets] = useState<TicketFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketFromApi | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch assigned tickets
  useEffect(() => {
    fetchAssignedTickets();
  }, []);

  const fetchAssignedTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // GỌI TRỰC TIẾP API - Tạm thời để debug
      console.log('🔍 Calling API: /Ticket/my-assigned-tickets');
      const response = await ticketService.getMyAssignedTickets(1,100);
      
      console.log('✅ API Response:', response);
      
      if (response.status) {
        setTickets(response.data.items);
      } else {
        setError('Không thể tải danh sách ticket');
      }
    } catch (err) {
      console.error('❌ Error fetching assigned tickets:', err);
      const error = err as { response?: { status?: number; data?: { message?: string } }; config?: { url?: string } };
      console.error('❌ Error details:', {
        status: error?.response?.status,
        message: error?.response?.data?.message,
        url: error?.config?.url
      });
      
      if (error?.response?.status === 403) {
        setError('Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản Staff.');
      } else {
        setError('Đã xảy ra lỗi khi tải danh sách ticket');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (ticket: TicketFromApi) => {
    setSelectedTicket(ticket);
  };

  const handleCloseDetail = () => {
    setSelectedTicket(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket) return;

    try {
      setIsUpdatingStatus(true);
      
      // Xác định trạng thái tiếp theo
      let nextStatus: 'IN_PROGRESS' | 'RESOLVED';
      
      if (selectedTicket.status === 'ASSIGNED') {
        nextStatus = 'IN_PROGRESS';
      } else if (selectedTicket.status === 'IN_PROGRESS') {
        nextStatus = 'RESOLVED';
      } else {
        // Ticket đã RESOLVED, không làm gì
        alert('Ticket đã được giải quyết');
        return;
      }

      console.log(`🔄 Current status: ${selectedTicket.status}`);
      console.log(`🔄 Next status: ${nextStatus}`);
      console.log(`📤 Updating ticket ${selectedTicket.ticketCode} status to ${nextStatus}`);
      console.log(`📤 API URL: /Ticket/${selectedTicket.ticketCode}/status?newStatus=${nextStatus}`);
      
      const response = await ticketService.updateTicketStatus(selectedTicket.ticketCode, nextStatus);
      
      console.log('📥 API Response:', response);
      
      if (response.status) {
        console.log('✅ Status updated successfully');
        
        // Cập nhật ticket trong danh sách
        setTickets(prevTickets => 
          prevTickets.map(t => 
            t.ticketCode === selectedTicket.ticketCode 
              ? { ...t, status: nextStatus }
              : t
          )
        );
        
        // Cập nhật selectedTicket
        setSelectedTicket({ ...selectedTicket, status: nextStatus });
        
        // Hiển thị thông báo thành công
        const statusText = nextStatus === 'IN_PROGRESS' ? 'đang sửa chữa' : 'đã hoàn thành';
        alert(`Cập nhật trạng thái thành công! Ticket ${statusText}.`);
        
        // Nếu đã RESOLVED, đóng modal sau 1 giây
        if (nextStatus === 'RESOLVED') {
          setTimeout(() => {
            handleCloseDetail();
          }, 1000);
        }
      } else {
        alert('Không thể cập nhật trạng thái ticket');
      }
    } catch (err) {
      console.error('❌ Error updating ticket status:', err);
      alert('Đã xảy ra lỗi khi cập nhật trạng thái ticket');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Stats
  const stats = {
    total: tickets.length,
    assigned: tickets.filter(t => t.status === 'ASSIGNED').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-800 mb-2">Lỗi</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchAssignedTickets}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tickets được giao</h1>
        <p className="text-gray-600">Quản lý và xử lý các ticket được giao cho bạn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500 mt-1">Tổng số</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 shadow-sm border border-purple-200">
          <div className="text-3xl font-bold text-purple-600">{stats.assigned}</div>
          <div className="text-sm text-purple-600 mt-1">Đã giao</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 shadow-sm border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-yellow-600 mt-1">Đang xử lý</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-200">
          <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-sm text-green-600 mt-1">Đã giải quyết</div>
        </div>
      </div>

      {/* Tickets List */}
      <AssignedTicketsList tickets={tickets} onViewDetail={handleViewDetail} />

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết Ticket</h2>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Ticket Code & Status */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-lg font-bold text-blue-600">
                  {selectedTicket.ticketCode}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedTicket.status === 'ASSIGNED' ? 'bg-purple-100 text-purple-800' :
                  selectedTicket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                  selectedTicket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTicket.status === 'ASSIGNED' ? '🔔 Được giao' :
                   selectedTicket.status === 'IN_PROGRESS' ? '🔧 Đang sửa chữa' :
                   selectedTicket.status === 'RESOLVED' ? '✅ Đã hoàn thành' :
                   selectedTicket.status}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tiêu đề</h3>
                <p className="text-lg font-semibold text-gray-900">{selectedTicket.title}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Mô tả</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Image */}
              {selectedTicket.imageUrl && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Hình ảnh</h3>
                  <img 
                    src={selectedTicket.imageUrl} 
                    alt="Ticket" 
                    className="rounded-lg border border-gray-200 max-w-full h-auto"
                  />
                </div>
              )}

              {/* Location */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Địa điểm</h3>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{selectedTicket.locationName}</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Loại sự cố</h3>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {selectedTicket.categoryName}
                </span>
              </div>

              {/* Deadline */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Hạn xử lý</h3>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{new Date(selectedTicket.resolveDeadline).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              {/* Requester Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Người yêu cầu</h3>
                <p className="text-gray-700">{selectedTicket.requesterName} ({selectedTicket.requesterCode})</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Người quản lí</h3>
                <p className="text-gray-700">{selectedTicket.managedByName} ({selectedTicket.managedByCode})</p>
              </div>
              {/* Created Date */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Ngày tạo</h3>
                <p className="text-gray-700">{new Date(selectedTicket.createdAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseDetail}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                disabled={isUpdatingStatus}
              >
                Đóng
              </button>
              
              {/* Hiển thị nút tùy theo trạng thái */}
              {selectedTicket.status === 'ASSIGNED' && (
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdatingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Bắt đầu sửa chữa</span>
                    </>
                  )}
                </button>
              )}
              
              {selectedTicket.status === 'IN_PROGRESS' && (
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdatingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Hoàn thành</span>
                    </>
                  )}
                </button>
              )}
              
              {selectedTicket.status === 'RESOLVED' && (
                <div className="px-6 py-2.5 bg-green-100 text-green-800 rounded-lg font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Đã hoàn thành</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;