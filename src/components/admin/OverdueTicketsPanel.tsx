import { useState } from 'react';
import type { TicketFromApi } from '../../types';
import { formatDateToVN } from '../../utils/dateUtils';

interface OverdueTicketsProps {
  overdueTickets: TicketFromApi[];
  loading: boolean;
  error: string | null;
  onEscalate: (ticketCode: string) => Promise<void>;
  isEscalating: boolean;
  onRefresh: () => Promise<void>;
}

/**
 * Component hiển thị danh sách tickets quá hạn cho Admin
 * Cho phép Admin escalate tickets đó
 */
export const OverdueTicketsPanel = ({
  overdueTickets,
  loading,
  error,
  onEscalate,
  isEscalating,
  onRefresh,
}: OverdueTicketsProps) => {
  const [expandedTicketCode, setExpandedTicketCode] = useState<string | null>(null);
  const [escalatingTicketCode, setEscalatingTicketCode] = useState<string | null>(null);

  const handleEscalate = async (ticketCode: string) => {
    setEscalatingTicketCode(ticketCode);
    try {
      await onEscalate(ticketCode);
      setExpandedTicketCode(null);
    } catch (err) {
      console.error('Failed to escalate ticket:', err);
    } finally {
      setEscalatingTicketCode(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin">⏳</div>
          <span className="text-blue-700">Đang tải danh sách tickets quá hạn...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-red-700 font-semibold mb-2">❌ Lỗi</div>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          🔄 Thử lại
        </button>
      </div>
    );
  }

  if (overdueTickets.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-2xl mb-2">✅</div>
        <p className="text-green-700 font-semibold">Không có tickets quá hạn</p>
        <p className="text-green-600 text-sm mt-1">Tất cả tickets đều trong thời hạn!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🔴 Tickets Quá Hạn ({overdueTickets.length})
        </h3>
        <button
          onClick={onRefresh}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
        >
          🔄 Làm mới
        </button>
      </div>

      <div className="grid gap-3">
        {overdueTickets.map((ticket) => (
          <div
            key={ticket.ticketCode}
            className="border border-red-300 rounded-lg overflow-hidden bg-white hover:shadow-md transition"
          >
            {/* Header */}
            <button
              onClick={() =>
                setExpandedTicketCode(
                  expandedTicketCode === ticket.ticketCode ? null : ticket.ticketCode
                )
              }
              className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 transition flex items-center justify-between"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-700">{ticket.ticketCode}</span>
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                    🔴 Quá hạn
                  </span>
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1 line-clamp-1">{ticket.title}</p>
              </div>
              <div className="text-lg text-gray-400">
                {expandedTicketCode === ticket.ticketCode ? '▼' : '▶'}
              </div>
            </button>

            {/* Details */}
            {expandedTicketCode === ticket.ticketCode && (
              <div className="px-4 py-3 bg-gray-50 border-t border-red-200 space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Mô tả:</span>
                  <p className="text-gray-600 mt-1">{ticket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-gray-700">Người báo cáo:</span>
                    <p className="text-gray-600">{ticket.requesterName}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Giao cho:</span>
                    <p className="text-gray-600">{ticket.assignedToName || 'Chưa giao'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-gray-700">Loại:</span>
                    <p className="text-gray-600">{ticket.categoryName}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Địa điểm:</span>
                    <p className="text-gray-600">{ticket.locationName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-gray-700">Tạo lúc:</span>
                    <p className="text-gray-600">
                      {formatDateToVN(ticket.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Hạn giải quyết:</span>
                    <p className="text-red-600 font-semibold">
                      {formatDateToVN(ticket.resolveDeadline)}
                    </p>
                  </div>
                </div>

                {/* Overdue Warning Section */}
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <div className="font-semibold text-red-700 flex items-center gap-2">
                    🚨 TICKET ĐÃ QUÁ HẠN
                  </div>
                  <p className="text-red-600 mt-1 text-sm">
                    Ticket này đã quá hạn giải quyết. Vui lòng xử lý hoặc escalate ngay.
                  </p>
                </div>

                {ticket.note && (
                  <div>
                    <span className="font-semibold text-gray-700">Ghi chú từ staff:</span>
                    <p className="text-gray-600 mt-1">{ticket.note}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-300">
                  <button
                    onClick={() => handleEscalate(ticket.ticketCode)}
                    disabled={isEscalating && escalatingTicketCode === ticket.ticketCode}
                    className={`flex-1 px-4 py-2 rounded font-semibold transition ${
                      isEscalating && escalatingTicketCode === ticket.ticketCode
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isEscalating && escalatingTicketCode === ticket.ticketCode ? (
                      <>⏳ Đang escalate...</>
                    ) : (
                      <>⬆️ Escalate Ngay</>
                    )}
                  </button>
                  <button
                    onClick={() => setExpandedTicketCode(null)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition font-semibold"
                  >
                    ✕ Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverdueTicketsPanel;
