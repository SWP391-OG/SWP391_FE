import { useState } from 'react';
import type { Ticket } from '../../types';

interface Staff {
  id: string;
  name: string;
}

interface TicketReviewModalProps {
  ticket: Ticket;
  staffList: Staff[];
  onApprove: (ticketId: string) => void;
  onReject: (ticketId: string, reason: string) => void;
  onAssign?: (ticketId: string, staffId: string) => void;
  onClose: () => void;
}

const TicketReviewModal = ({
  ticket,
  staffList,
  onApprove,
  onReject,
  onAssign,
  onClose,
}: TicketReviewModalProps) => {
  const [rejectReason, setRejectReason] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(ticket.assignedTo || '');

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
              <span className="text-sm text-gray-500 font-semibold">ID Ticket:</span>
              <span className="ml-2 font-mono text-gray-800">{ticket.id}</span>
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
              <span className="ml-2 text-gray-800">{ticket.location || 'N/A'}</span>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-500 font-semibold">Ngày tạo:</span>
              <span className="ml-2 text-gray-800">{formatDate(ticket.createdAt)}</span>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-500 font-semibold">Trạng thái:</span>
              <span className="ml-2 inline-flex px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                {ticket.status === 'open' ? 'Mới tạo' : ticket.status}
              </span>
            </div>
          </div>

          {/* Images if any */}
          {ticket.images && ticket.images.length > 0 && (
            <div className="mb-6">
              <span className="text-sm text-gray-500 font-semibold block mb-2">
                Hình ảnh:
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
                {ticket.images.map((img, idx) => (
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

          {/* Assign Staff */}
          {staffList.length > 0 && (
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Chọn người xử lý:
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">-- Chọn staff --</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
              {selectedStaffId && onAssign && (
                <button
                  type="button"
                  onClick={() => {
                    onAssign(ticket.id, selectedStaffId);
                    alert('Đã giao ticket cho staff thành công!');
                  }}
                  className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  Giao việc ngay
                </button>
              )}
            </div>
          )}

          {/* Reject Reason Input */}
          <div className="mb-6">
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
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg font-semibold cursor-pointer hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                if (rejectReason.trim()) {
                  onReject(ticket.id, rejectReason.trim());
                  onClose();
                } else {
                  alert('Vui lòng nhập lý do từ chối');
                }
              }}
              className="px-6 py-3 bg-white text-red-600 border border-red-600 rounded-lg font-semibold cursor-pointer hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Từ chối
            </button>
            <button
              type="button"
              onClick={() => {
                // If staff is selected, assign first, then approve
                if (selectedStaffId && onAssign) {
                  onAssign(ticket.id, selectedStaffId);
                }
                onApprove(ticket.id);
                onClose();
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none rounded-lg font-semibold cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
            >
              {selectedStaffId ? 'Chấp nhận và giao việc' : 'Chấp nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketReviewModal;
