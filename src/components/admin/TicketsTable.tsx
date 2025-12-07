import type { Ticket, Location, User } from '../../types';

interface Staff {
  id: string;
  name: string;
}

interface TicketsTableProps {
  tickets: Ticket[];
  locations: Location[];
  staffList: Staff[];
  onAssignTicket: (ticketId: string, staffId: string) => void;
  onViewTicket: (ticket: Ticket) => void;
}

const TicketsTable = ({
  tickets,
  locations,
  staffList,
  onAssignTicket,
  onViewTicket,
}: TicketsTableProps) => {
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
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Danh sách Tickets
        </h3>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  ID
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Tiêu đề & Mô tả
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Vị trí
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Trạng thái
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Độ ưu tiên
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Người xử lý
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Ngày tạo
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.length > 0 ? (
                tickets.map((ticket) => {
                  const statusInfo = {
                    open: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Mới tạo' },
                    'acknowledged': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Đã giao việc' },
                    'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang xử lý' },
                    resolved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã giải quyết' },
                    closed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Đã đóng' },
                    cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
                  }[ticket.status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: ticket.status };

                  const priorityInfo = {
                    low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Thấp' },
                    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Trung bình' },
                    high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Cao' },
                    urgent: { bg: 'bg-red-100', text: 'text-red-800', label: 'Khẩn cấp' },
                  }[ticket.priority];

                  // Get location name
                  const location = locations.find(l => l.id === ticket.location);
                  const locationName = location ? location.name : ticket.location || 'N/A';

                  // Get assigned staff name
                  const assignedStaff = staffList.find(s => s.id === ticket.assignedTo);

                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      {/* ID */}
                      <td className="px-4 py-3.5 text-sm text-gray-500 font-mono">
                        {ticket.id.substring(0, 8)}
                      </td>
                      
                      {/* Tiêu đề & Mô tả */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-semibold text-sm text-gray-900 mb-1">
                          {ticket.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[280px]">
                          {ticket.description}
                        </div>
                      </td>
                      
                      {/* Vị trí */}
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {locationName}
                      </td>
                      
                      {/* Trạng thái */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      
                      {/* Độ ưu tiên */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${priorityInfo.bg} ${priorityInfo.text}`}>
                          {priorityInfo.label}
                        </span>
                      </td>
                      
                      {/* Người xử lý */}
                      <td className="px-4 py-3.5 text-sm">
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <span className={`${assignedStaff ? 'text-gray-900 font-medium' : 'text-red-600 font-semibold'}`}>
                              {assignedStaff ? assignedStaff.name : `ID: ${ticket.assignedTo} (Không tìm thấy)`}
                            </span>
                            <select
                              className="px-2 py-1 text-xs border border-gray-300 rounded-md cursor-pointer bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              value={ticket.assignedTo}
                              onChange={(e) => {
                                if (e.target.value) {
                                  onAssignTicket(ticket.id, e.target.value);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">-- Chọn staff --</option>
                              {staffList.map(staff => (
                                <option key={staff.id} value={staff.id}>
                                  {staff.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <button
                            className="px-2.5 py-1.5 text-xs font-semibold border border-orange-500 rounded-md cursor-pointer bg-white text-orange-500 hover:bg-orange-50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (staffList.length > 0) {
                                const firstStaff = staffList[0];
                                onAssignTicket(ticket.id, firstStaff.id);
                              }
                            }}
                            title="Giao việc"
                          >
                            Assign +
                          </button>
                        )}
                      </td>
                      
                      {/* Ngày tạo */}
                      <td className="px-4 py-3.5 text-xs text-gray-500">
                        {formatDate(ticket.createdAt)}
                      </td>
                      
                      {/* Thao tác */}
                      <td className="px-4 py-3.5">
                        <button
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                          onClick={() => onViewTicket(ticket)}
                          title="Xem chi tiết"
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-8 py-12 text-center text-gray-500">
                    Không có ticket nào trong department của bạn
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TicketsTable;
