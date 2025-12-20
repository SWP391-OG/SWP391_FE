// Modal chi tiết ticket cho Admin: xem thông tin, assign staff, hủy ticket...
import { useState, useMemo } from 'react';
import type { Ticket, TicketFromApi, Category } from '../../types';
import { ticketService } from '../../services/ticketService';
import { parseTicketImages } from '../../utils/ticketUtils';
import { isTicketOverdueAndNotCompleted, generateOverdueNote, convertUTCTimestampsToVN } from '../../utils/dateUtils';

// Kiểu dữ liệu staff được truyền vào để assign ticket
interface Staff {
  id: string;
  name: string;
  userCode?: string; // Mã nhân viên cần cho backend
  departmentId?: string; // Department của staff
}

// Props cho TicketReviewModal
interface TicketReviewModalProps {
  ticket: Ticket | TicketFromApi;
  staffList: Staff[];
  categories?: Category[]; // Optional: để filter staff theo category
  onApprove: (ticketId: string) => void;
  onReject: (ticketId: string, reason: string) => void;
  onAssign?: (ticketId: string, staffId: string) => void;
  onClose: () => void;
  onAssignSuccess?: () => void; // Callback để refresh tickets sau khi assign
}

// Helper function để check xem ticket có phải TicketFromApi (dữ liệu từ backend) không
const isTicketFromApi = (ticket: Ticket | TicketFromApi): ticket is TicketFromApi => {
  return 'ticketCode' in ticket && 'requesterCode' in ticket;
};

// Modal hiển thị chi tiết ticket: hỗ trợ xem mô tả, hình ảnh, rating, assign, cancel...
const TicketReviewModal = ({
  ticket,
  staffList,
  categories = [],
  onApprove: _onApprove,
  onReject: _onReject,
  onAssign: _onAssign,
  onClose,
  onAssignSuccess,
}: TicketReviewModalProps) => {
  // State điều khiển assign (tự động / thủ công) và trạng thái đang xử lý
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignMode, setAssignMode] = useState<'auto' | 'manual'>('auto');
  const [selectedStaffCode, setSelectedStaffCode] = useState<string>('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelNote, setCancelNote] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Phân biệt ticket local và ticket đến từ API
  const isFromApi = isTicketFromApi(ticket);
  const ticketCode = isFromApi ? ticket.ticketCode : ticket.ticketCode || ticket.id;
  const ticketLocation = isFromApi ? ticket.locationName : ticket.location || 'N/A';
  const assignedToName = isFromApi ? ticket.assignedToName : ticket.assignedToName || '';
  const requesterName = isFromApi ? ticket.requesterName : ticket.requesterName || '';
  const ticketImages = parseTicketImages(ticket);
  
  // Filter staff theo category của ticket (chỉ staff thuộc đúng department mới được assign)
  const filteredStaffList = useMemo(() => {
    console.log('🔍 Starting staff filter:', {
      isFromApi,
      categoriesLength: categories?.length || 0,
      categories,
      staffList: staffList.length,
    });

    if (!isFromApi) {
      console.log('❌ Not from API, returning all staff');
      return staffList;
    }

    if (!categories || categories.length === 0) {
      console.log('⚠️ No categories provided, returning all staff');
      return staffList;
    }
    
    const ticketCategoryCode = (ticket as TicketFromApi).categoryCode;
    console.log('🔎 Looking for category:', ticketCategoryCode);
    
    const ticketCategory = categories.find(c => {
      console.log(`  Comparing: "${c.categoryCode}" === "${ticketCategoryCode}" ?`, c.categoryCode === ticketCategoryCode);
      return c.categoryCode === ticketCategoryCode;
    });
    
    if (!ticketCategory) {
      console.log('❌ Category not found:', ticketCategoryCode);
      return staffList; // Nếu không tìm thấy category, return tất cả
    }
    
    console.log('✅ Found category:', ticketCategory);

    // Filter staff có departmentId matching với category's departmentId
    const filtered = staffList.filter(staff => {
      // Convert to number để so sánh chính xác (vì một cái có thể là string, một cái là number)
      const staffDeptId = Number(staff.departmentId);
      const categoryDeptId = Number(ticketCategory.departmentId);
      const match = staffDeptId === categoryDeptId;
      console.log(`  Staff ${staff.name}: departmentId=${staffDeptId} (type:${typeof staffDeptId}), categoryDeptId=${categoryDeptId} (type:${typeof categoryDeptId}), match=${match}`);
      return match;
    });
    
    console.log('🔍 Filtered staff result:', {
      categoryCode: ticketCategoryCode,
      categoryDepartmentId: ticketCategory.departmentId,
      totalStaff: staffList.length,
      filteredStaff: filtered.length,
      filtered: filtered.map(s => ({ id: s.id, name: s.name, deptId: s.departmentId })),
    });
    
    return filtered;
  }, [ticket, staffList, categories, isFromApi]);

  // Gọi API assign ticket theo chế độ tự động
  const handleAutoAssign = async () => {
    if (!isFromApi) {
      alert('Chỉ có thể assign ticket từ API');
      return;
    }

    setIsAssigning(true);
    try {
      const response = await ticketService.assignTicketAuto(ticket.ticketCode);
      console.log('✅ Assign ticket response:', response);
      
      if (response.status) {
        alert('✅ Đã assign ticket thành công!');
        if (onAssignSuccess) {
          onAssignSuccess(); // Refresh tickets list
        }
        onClose();
      } else {
        alert('❌ Assign ticket thất bại: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error assigning ticket:', error);
      alert('❌ Lỗi khi assign ticket: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsAssigning(false);
    }
  };

  // Gọi API assign ticket thủ công theo staff được chọn
  const handleManualAssign = async () => {
    if (!isFromApi) {
      alert('Chỉ có thể assign ticket từ API');
      return;
    }

    if (!selectedStaffCode) {
      alert('Vui lòng chọn staff để assign');
      return;
    }

    // Debug logging
    console.log('🔍 handleManualAssign - Debug info:', {
      selectedStaffCode,
      selectedStaffCodeType: typeof selectedStaffCode,
      staffListLength: staffList.length,
      staffListIds: staffList.map(s => ({ id: s.id, idType: typeof s.id, name: s.name }))
    });

    // Tìm staff được chọn để lấy userCode - fix type mismatch
    const selectedStaff = staffList.find(s => String(s.id) === String(selectedStaffCode));
    
    console.log('🔍 handleManualAssign - Selected staff:', {
      found: !!selectedStaff,
      selectedStaff
    });
    
    // Ưu tiên userCode, nếu không có thì dùng id
    const staffCode = selectedStaff?.userCode || selectedStaff?.id;
    
    if (!staffCode) {
      alert('Không thể xác định mã nhân viên');
      return;
    }

    setIsAssigning(true);
    try {
      const response = await ticketService.assignTicketManual(ticket.ticketCode, String(staffCode));
      console.log('✅ Manual assign ticket response:', response);
      
      if (response.status) {
        alert('✅ Đã assign ticket thành công!');
        if (onAssignSuccess) {
          onAssignSuccess(); // Refresh tickets list
        }
        onClose();
      } else {
        alert('❌ Assign ticket thất bại: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error manually assigning ticket:', error);
      alert('❌ Lỗi khi assign ticket: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsAssigning(false);
    }
  };

  // Chọn hàm assign tương ứng với mode hiện tại
  const handleAssign = () => {
    if (assignMode === 'auto') {
      handleAutoAssign();
    } else {
      handleManualAssign();
    }
  };

  // Mở popup xác nhận hủy ticket
  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  // Gọi API hủy ticket với lý do admin nhập
  const handleCancelConfirm = async () => {
    if (!cancelNote.trim()) {
      alert('Vui lòng nhập lý do hủy ticket');
      return;
    }

    if (!isFromApi) {
      alert('Chỉ có thể cancel ticket từ API');
      return;
    }

    setIsCancelling(true);
    try {
      const response = await ticketService.cancelTicketAsAdmin(ticket.ticketCode, cancelNote);
      console.log('✅ Cancel ticket response:', response);
      
      if (response.status) {
        alert('✅ Đã hủy ticket thành công!');
        setShowCancelModal(false);
        if (onAssignSuccess) {
          onAssignSuccess(); // Refresh tickets list
        }
        onClose();
      } else {
        alert('❌ Hủy ticket thất bại: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error cancelling ticket:', error);
      alert('❌ Lỗi khi hủy ticket: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCancelling(false);
    }
  };

  // Format ngày theo timezone Việt Nam (backend trả về UTC)
  const formatDate = (dateString: string) => {
    const normalizedDateString = dateString.includes('Z') ? dateString : `${dateString}Z`;
    const date = new Date(normalizedDateString);
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between border-b border-blue-800">
          <div>
            <div className="text-sm font-semibold text-blue-100 mb-1">{ticketCode}</div>
            <h3 className="text-2xl font-bold text-white">
              {ticket.title}
            </h3>
          </div>
          <button
            className="bg-blue-500/30 hover:bg-blue-500/50 border-none rounded-full p-2 cursor-pointer text-blue-100 hover:text-white transition-colors"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 inline-flex items-center gap-2">
              {ticket.status === 'open' || ticket.status === 'NEW' ? '🔵 Mới tạo' : 
               ticket.status === 'CANCELLED' || ticket.status === 'cancelled' ? '🚫 Đã hủy' : 
               ticket.status}
            </span>
          </div>

          {/* Note from Admin when cancelled */}
          {(ticket.status === 'CANCELLED' || ticket.status === 'cancelled') && ticket.note && (
            <div className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
                🚫 Lý Do Hủy Ticket
              </h3>
              <div className="text-red-700 bg-white p-4 rounded-lg border border-red-300">
                {ticket.note}
              </div>
            </div>
          )}

          {/* Overdue Warning Section */}
          {(() => {
            const resolveDeadline = (ticket as any).resolveDeadline || (ticket as any).slaDeadline;
            const isOverdue = isTicketOverdueAndNotCompleted(resolveDeadline, ticket.status);
            const overdueNote = generateOverdueNote(
              { 
                resolveDeadline, 
                status: ticket.status, 
                slaDeadline: resolveDeadline
              },
              (ticket as any).note || (ticket as any).notes
            );

            if (isOverdue || (overdueNote && overdueNote.includes('TICKET ĐÃ QUÁ HẠN'))) {
              return (
                <div className="bg-gradient-to-br from-red-50 to-white border-2 border-red-300 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                    🚨 ⚠️ THÔNG BÁO QUAN TRỌNG
                  </h3>
                  <div className="text-red-800 bg-white p-4 rounded-lg border border-red-300 whitespace-pre-wrap font-medium">
                    {overdueNote}
                  </div>
                </div>
              );
            }
            
            // Hiển thị ghi chú thông thường nếu có (nhưng không hiển thị nếu ticket đã bị cancelled - đã có section riêng "Lý Do Hủy Ticket")
            if (((ticket as any).note || (ticket as any).notes) && ticket.status !== 'CANCELLED' && ticket.status !== 'cancelled') {
              const rawNote = (ticket as any).note || (ticket as any).notes;
              const formattedNote = convertUTCTimestampsToVN(rawNote);
              return (
                <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-emerald-700 mb-3 flex items-center gap-2">
                    📝 Ghi Chú
                  </h3>
                  <div className="text-emerald-800 bg-white p-4 rounded-lg border border-emerald-300 whitespace-pre-wrap font-medium">
                    {formattedNote}
                  </div>
                </div>
              );
            }

            return null;
          })()}

          {/* Description Section */}
          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              📝 Mô Tả Chi Tiết
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Images if any */}
          {ticketImages && ticketImages.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                🖼️ Hình Ảnh
              </h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
                {ticketImages.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Ticket image ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-300 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => window.open(img, '_blank')}
                  />
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
              {/* Người gửi ticket */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">👤 Người gửi</div>
                <div className="text-base font-semibold text-gray-800">{requesterName}</div>
              </div>

              {/* Vị trí */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">📍 Vị trí</div>
                <div className="text-base font-semibold text-gray-800">{ticketLocation}</div>
              </div>

              {/* Ngày tạo */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">📅 Ngày tạo</div>
                <div className="text-base font-semibold text-gray-800">{formatDate(ticket.createdAt)}</div>
              </div>

              {/* Ngày xử lý */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">🔧 Ngày xử lý</div>
                <div className="text-base font-semibold text-gray-800">{ticket.resolvedAt ? formatDate(ticket.resolvedAt) : 'N/A'}</div>
              </div>

              {/* Người được assign */}
              {assignedToName && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">✅ Người được assign</div>
                  <div className="text-base font-semibold text-green-800">{assignedToName}</div>
                </div>
              )}
            </div>
          </div>

          {/* Rating Section - Hiển thị nếu có đánh giá */}
          {(ticket.ratingStars || ticket.ratingComment) && (
            <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                ⭐ Đánh Giá Của Người Dùng
              </h3>
              {ticket.ratingStars && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-sm font-semibold text-gray-800">Đánh giá:</div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="text-2xl"
                        style={{ color: star <= (ticket.ratingStars || 0) ? '#fbbf24' : '#d1d5db' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="text-sm font-semibold text-gray-800">({ticket.ratingStars}/5)</div>
                </div>
              )}
              {ticket.ratingComment && (
                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-2">Nhận xét:</div>
                  <div className="text-base text-gray-700 bg-white p-4 rounded-lg border border-yellow-300">
                    {ticket.ratingComment}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Assign Section - Chỉ hiển thị nếu là ticket từ API và chưa được assign */}
          {isFromApi && !assignedToName && (
            <div className="bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                🎯 Assign Ticket
              </h3>
              
              {/* Radio Buttons */}
              <div className="flex gap-8 mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="assignMode"
                    value="auto"
                    checked={assignMode === 'auto'}
                    onChange={() => {
                      setAssignMode('auto');
                      setSelectedStaffCode('');
                    }}
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="ml-3 text-base font-medium text-gray-700">Tự động</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="assignMode"
                    value="manual"
                    checked={assignMode === 'manual'}
                    onChange={() => setAssignMode('manual')}
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="ml-3 text-base font-medium text-gray-700">Thủ công</span>
                </label>
              </div>

              {/* Staff Dropdown - Chỉ hiển thị khi chọn manual */}
              {assignMode === 'manual' && (
                <div className="mb-6">
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Chọn Staff {filteredStaffList.length === 0 && <span className="text-red-600">(Không có staff phù hợp)</span>}
                  </label>
                  <select
                    value={selectedStaffCode}
                    onChange={(e) => setSelectedStaffCode(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    disabled={filteredStaffList.length === 0}
                  >
                    <option value="">-- Chọn staff --</option>
                    {filteredStaffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                  {filteredStaffList.length === 0 && (
                    <p className="text-sm text-red-600 mt-2">⚠️ Không có staff nào thuộc cùng department với category này</p>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-gray-600 mb-6 bg-white p-4 rounded-lg border border-orange-200">
                {assignMode === 'auto' 
                  ? '🤖 Hệ thống sẽ tự động chọn staff phù hợp nhất để xử lý ticket này'
                  : '👤 Chọn staff cụ thể để assign ticket này'
                }
              </p>

              {/* Assign Button */}
              <button
                type="button"
                onClick={handleAssign}
                disabled={isAssigning || (assignMode === 'manual' && (!selectedStaffCode || filteredStaffList.length === 0))}
                className={`w-full px-6 py-3 rounded-lg font-semibold text-white text-base transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center justify-center gap-2 ${
                  isAssigning || (assignMode === 'manual' && (!selectedStaffCode || filteredStaffList.length === 0))
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 cursor-pointer shadow-lg hover:shadow-xl'
                }`}
              >
                {isAssigning ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Đang assign...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Assign Staff</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Hiển thị thông báo nếu đã được assign */}
          {assignedToName && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 flex items-center gap-4">
              <div className="text-3xl">✅</div>
              <div>
                <div className="font-semibold text-green-800">Ticket đã được assign</div>
                <div className="text-green-700 mt-1">Người được giao: <span className="font-bold">{assignedToName}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-100 to-gray-50 border-t-2 border-gray-200 px-8 py-6 flex items-center justify-between">
          {/* Cancel button - Hiển thị cho ticket chưa cancelled, chưa IN_PROGRESS, RESOLVED, CLOSED */}
          {isFromApi && 
           ticket.status !== 'CANCELLED' && 
           ticket.status !== 'cancelled' && 
           ticket.status !== 'IN_PROGRESS' && 
           ticket.status !== 'RESOLVED' && 
           ticket.status !== 'CLOSED' && (
            <button
              type="button"
              onClick={handleCancelClick}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold cursor-pointer transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Hủy Ticket</span>
            </button>
          )}
          <div className="flex-1"></div>
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold cursor-pointer hover:bg-gray-100 transition-all duration-200"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1100]"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Xác nhận hủy ticket
              </h3>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">
                Vui lòng nhập lý do hủy ticket này:
              </p>
              <textarea
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                placeholder="Nhập lý do hủy ticket..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold cursor-pointer hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={isCancelling || !cancelNote.trim()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold cursor-pointer transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Đang hủy...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Xác nhận</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketReviewModal;