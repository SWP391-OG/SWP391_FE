import { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticketService';
import AssignedTicketsList from '../../components/staff/AssignedTicketsList';
import type { TicketFromApi } from '../../types';
import { parseTicketImages } from '../../utils/ticketUtils';
import { formatDateToVN } from '../../utils/dateUtils';
const StaffPage = () => {
  const [tickets, setTickets] = useState<TicketFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketFromApi | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);

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
        // Nếu chuyển sang RESOLVED, hiển thị dialog nhập note
        setShowNoteDialog(true);
        setIsUpdatingStatus(false);
        return;
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

  const handleConfirmResolution = async () => {
    if (!selectedTicket) return;

    if (!resolutionNote.trim()) {
      setNoteError('Vui lòng nhập ghi chú giải quyết');
      return;
    }

    try {
      setIsUpdatingStatus(true);
      setNoteError(null);

      console.log(`📤 Updating ticket ${selectedTicket.ticketCode} to RESOLVED with note`);
      
      const response = await ticketService.updateTicketStatus(
        selectedTicket.ticketCode,
        'RESOLVED',
        resolutionNote
      );
      
      console.log('📥 API Response:', response);
      
      if (response.status) {
        console.log('✅ Status updated with note successfully');
        
        // Cập nhật ticket trong danh sách
        setTickets(prevTickets => 
          prevTickets.map(t => 
            t.ticketCode === selectedTicket.ticketCode 
              ? { ...t, status: 'RESOLVED', note: resolutionNote }
              : t
          )
        );
        
        // Cập nhật selectedTicket
        setSelectedTicket({ ...selectedTicket, status: 'RESOLVED', note: resolutionNote });
        
        // Đóng dialog
        setShowNoteDialog(false);
        setResolutionNote('');
        
        alert('Cập nhật trạng thái thành công! Ticket đã hoàn thành.');
        
        // Đóng modal sau 1 giây
        setTimeout(() => {
          handleCloseDetail();
        }, 1000);
      } else {
        alert('Không thể cập nhật trạng thái ticket');
      }
    } catch (err) {
      console.error('❌ Error updating ticket status:', err);
      setNoteError('Đã xảy ra lỗi khi cập nhật trạng thái ticket');
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
    closed: tickets.filter(t => t.status === 'CLOSED').length,
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
        <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-3xl font-bold text-gray-600">{stats.closed}</div>
          <div className="text-sm text-gray-600 mt-1">Đã đóng</div>
        </div>
      </div>

      {/* Tickets List */}
      <AssignedTicketsList tickets={tickets} onViewDetail={handleViewDetail} />

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between border-b border-blue-800">
              <div>
                <div className="text-sm font-semibold text-blue-100 mb-1">{selectedTicket.ticketCode}</div>
                <h2 className="text-2xl font-bold text-white">{selectedTicket.title}</h2>
              </div>
              <button
                onClick={handleCloseDetail}
                className="text-blue-100 hover:text-white transition-colors bg-blue-500/30 hover:bg-blue-500/50 rounded-full p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                  selectedTicket.status === 'ASSIGNED' ? 'bg-purple-100 text-purple-800' :
                  selectedTicket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                  selectedTicket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTicket.status === 'ASSIGNED' && '🔔 Được giao'}
                  {selectedTicket.status === 'IN_PROGRESS' && '🔧 Đang sửa chữa'}
                  {selectedTicket.status === 'RESOLVED' && '✅ Đã hoàn thành'}
                </span>
              </div>

              {/* Description */}
              <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  📝 Mô Tả Chi Tiết
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Images */}
              {parseTicketImages(selectedTicket).length > 0 && (
                <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🖼️ Hình Ảnh
                  </h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                    {parseTicketImages(selectedTicket).map((image, index) => (
                      <div key={index} className="rounded-lg overflow-hidden border-2 border-gray-200 aspect-square">
                        <img 
                          src={image} 
                          alt={`Ticket image ${index + 1}`} 
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(image, '_blank')}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Information Grid */}
              <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  ℹ️ Thông Tin Chi Tiết
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Loại sự cố */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">🔧 Loại sự cố</div>
                    <div className="text-base font-semibold text-gray-800">{selectedTicket.categoryName}</div>
                  </div>

                  {/* Địa điểm */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">📍 Địa điểm</div>
                    <div className="text-base font-semibold text-gray-800">{selectedTicket.locationName}</div>
                  </div>

                  {/* Người yêu cầu */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">👤 Người yêu cầu</div>
                    <div className="text-base font-semibold text-gray-800">{selectedTicket.requesterName}</div>
                    <div className="text-xs text-gray-500 mt-1">({selectedTicket.requesterCode})</div>
                  </div>

                  {/* Người quản lý */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">👨‍💼 Người quản lý</div>
                    <div className="text-base font-semibold text-gray-800">{selectedTicket.managedByName}</div>
                    <div className="text-xs text-gray-500 mt-1">({selectedTicket.managedByCode})</div>
                  </div>

                  {/* Ngày tạo */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">📅 Ngày tạo</div>
                    <div className="text-base font-semibold text-gray-800">{formatDateToVN(selectedTicket.createdAt)}</div>
                  </div>

                  {/* Hạn xử lý */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">⏰ Hạn xử lý</div>
                    <div className="text-base font-semibold text-gray-800">{formatDateToVN(selectedTicket.resolveDeadline)}</div>
                  </div>

                  {/* Ngày hoàn thành */}
                  {selectedTicket.resolvedAt && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">✅ Ngày hoàn thành</div>
                      <div className="text-base font-semibold text-green-800">{formatDateToVN(selectedTicket.resolvedAt)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-100 to-gray-50 border-t-2 border-gray-200 px-8 py-6 flex items-center justify-end gap-4">
              <button
                onClick={handleCloseDetail}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold"
                disabled={isUpdatingStatus}
              >
                Đóng
              </button>
              
              {/* Nút tùy theo trạng thái */}
              {selectedTicket.status === 'ASSIGNED' && (
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdatingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdatingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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
                <div className="px-8 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-lg font-semibold flex items-center gap-2 border-2 border-green-300">
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

      {/* Resolution Note Dialog */}
      {showNoteDialog && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ghi Chú Giải Quyết</h3>
            <p className="text-gray-600 mb-4">
              Vui lòng nhập ghi chú về cách giải quyết vấn đề:
            </p>
            
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Nhập ghi chú giải quyết..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 resize-none focus:outline-none focus:border-blue-500"
              rows={5}
            />

            {noteError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                ❌ {noteError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNoteDialog(false);
                  setResolutionNote('');
                  setNoteError(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmResolution}
                disabled={isUpdatingStatus}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingStatus ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;