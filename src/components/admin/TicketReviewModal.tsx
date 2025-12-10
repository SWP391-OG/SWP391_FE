import { useState } from 'react';
import type { Ticket, TicketFromApi } from '../../types';
import { ticketService } from '../../services/ticketService';

interface Staff {
  id: string;
  name: string;
}

interface TicketReviewModalProps {
  ticket: Ticket | TicketFromApi;
  staffList: Staff[];
  onApprove: (ticketId: string) => void;
  onReject: (ticketId: string, reason: string) => void;
  onAssign?: (ticketId: string, staffId: string) => void;
  onClose: () => void;
  onAssignSuccess?: () => void; // Callback để refresh tickets sau khi assign
}

// Helper function để check xem ticket có phải từ API không
const isTicketFromApi = (ticket: Ticket | TicketFromApi): ticket is TicketFromApi => {
  return 'ticketCode' in ticket && 'requesterCode' in ticket;
};

const TicketReviewModal = ({
  ticket,
  staffList,
  onApprove,
  onReject,
  onAssign,
  onClose,
  onAssignSuccess,
}: TicketReviewModalProps) => {
  const [isAssigning, setIsAssigning] = useState(false);

  const isFromApi = isTicketFromApi(ticket);
  const ticketCode = isFromApi ? ticket.ticketCode : ticket.ticketCode || ticket.id;
  const ticketLocation = isFromApi ? ticket.locationName : ticket.location || 'N/A';
  const assignedToName = isFromApi ? ticket.assignedToName : ticket.assignedToName || '';
  const ticketImages = 'images' in ticket ? ticket.images : undefined;

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
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
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            Duyệt Ticket
          </h3>
          <button
            className="bg-none border-none text-2xl cursor-pointer text-gray-500 p-1 hover:text-gray-700 transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Ticket Info */}
          <div className="mb-6">
            <div className="mb-3">
              <span className="text-sm text-gray-500 font-semibold">Mã Ticket:</span>
              <span className="ml-2 font-mono text-gray-800">{ticketCode}</span>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-500 font-semibold">Tiêu đề:</span>
              <div className="mt-1 text-base text-gray-800 font-semibold">
                {ticket.title}
              </div>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-500 font-semibold">Mô tả:</span>
              <div className="mt-1 text-sm text-gray-600 leading-relaxed">
                {ticket.description}
              </div>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-500 font-semibold">Vị trí:</span>
              <span className="ml-2 text-gray-800">{ticketLocation}</span>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-500 font-semibold">Ngày tạo:</span>
              <span className="ml-2 text-gray-800">{formatDate(ticket.createdAt)}</span>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-500 font-semibold">Trạng thái:</span>
              <span className="ml-2 inline-flex px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                {ticket.status === 'open' || ticket.status === 'NEW' ? 'Mới tạo' : ticket.status}
              </span>
            </div>
            {assignedToName && (
              <div className="mb-3">
                <span className="text-sm text-gray-500 font-semibold">Người được assign:</span>
                <span className="ml-2 text-gray-800 font-medium">{assignedToName}</span>
              </div>
            )}
          </div>

          {/* Images if any */}
          {ticketImages && ticketImages.length > 0 && (
            <div className="mb-6">
              <span className="text-sm text-gray-500 font-semibold block mb-2">
                Hình ảnh:
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
                {ticketImages.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Ticket image ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-md border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Auto Assign Button - Chỉ hiển thị nếu là ticket từ API và chưa được assign */}
          {isFromApi && !assignedToName && (
            <div className="mb-6">
              <button
                type="button"
                onClick={handleAutoAssign}
                disabled={isAssigning}
                className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  isAssigning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-500 hover:bg-orange-600 cursor-pointer'
                }`}
              >
                {isAssigning ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Đang assign...
                  </span>
                ) : (
                  '🎯 Assign Staff Tự Động'
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Hệ thống sẽ tự động chọn staff phù hợp nhất để xử lý ticket này
              </p>
            </div>
          )}

          {/* Hiển thị thông báo nếu đã được assign */}
          {assignedToName && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Ticket này đã được assign cho: <strong>{assignedToName}</strong>
              </p>
            </div>
          )}

          {/* Reject Reason Input - Ẩn đi vì không dùng approve/reject */}
          {/* <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Lý do từ chối (nếu từ chối):
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối ticket này..."
              rows={3}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm resize-y font-sans focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div> */}

          {/* Actions */}
          <div className="flex gap-4 justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg font-semibold cursor-pointer hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketReviewModal;
