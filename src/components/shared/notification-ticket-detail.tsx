import type { Ticket, TicketFromApi } from '../../types';
import { isTicketOverdueAndNotCompleted, generateOverdueNote, convertUTCTimestampsToVN } from '../../utils/dateUtils';

// Props cho component NotificationTicketDetail
interface NotificationTicketDetailProps {
  ticket: Ticket | TicketFromApi | null; // Ticket cần hiển thị chi tiết (có thể là Ticket hoặc TicketFromApi)
  onClose: () => void; // Callback khi đóng modal
}

// Component hiển thị chi tiết ticket trong modal khi user click vào notification
// - Hiển thị thông tin đầy đủ của ticket (mã, tiêu đề, mô tả, địa điểm, ngày tạo, deadline, trạng thái)
// - Hỗ trợ cả Ticket và TicketFromApi type
// - Format ngày giờ theo timezone Việt Nam
const NotificationTicketDetail = ({ ticket, onClose }: NotificationTicketDetailProps) => {
  // Nếu không có ticket, không render gì
  if (!ticket) return null;

  // Extract các thông tin từ ticket (hỗ trợ cả Ticket và TicketFromApi với các tên field khác nhau)
  const ticketCode = (ticket as any).ticketCode || (ticket as any).id; // Mã ticket (ticketCode hoặc id)
  const title = ticket.title || 'No title'; // Tiêu đề ticket
  const description = ticket.description || 'No description'; // Mô tả ticket
  const locationName = (ticket as any).locationName || (ticket as any).location || 'N/A'; // Tên địa điểm
  const createdAt = ticket.createdAt || new Date().toISOString(); // Ngày tạo
  const resolveDeadline = (ticket as any).resolveDeadline || (ticket as any).deadlineAt; // Deadline xử lý
  const status = ((ticket as any).status || 'open').toLowerCase(); // Trạng thái ticket (chuyển về lowercase)

  // Format ngày giờ theo định dạng Việt Nam (dd/mm/yyyy, hh:mm)
  // Xử lý timezone Asia/Ho_Chi_Minh và thêm 'Z' nếu thiếu để đảm bảo parse đúng
  const formatDateTime = (dateString: string) => {
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

  // Trả về thông tin hiển thị cho trạng thái ticket (text, màu nền, icon)
  // Hỗ trợ nhiều format status khác nhau (open/new, in-progress/in_progress/assigned, resolved, closed)
  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'new':
        return { text: 'Mở', bg: 'bg-blue-100',  icon: '🔵' };
      case 'in-progress':
      case 'in_progress':
      case 'assigned':
        return { text: 'Trung bình', bg: 'bg-yellow-100', icon: '🟡' };
      case 'resolved':
        return { text: 'chờ đánh giá', bg: 'bg-blue-100',  icon: '🔵' };
      case 'closed':
        return { text: 'Đã hoàn thành', bg: 'bg-emerald-100',  icon: '✅' };
      default:
        return { text: 'Mở', bg: 'bg-gray-100', icon: '⚪' };
    }
  };

  // Lấy thông tin hiển thị cho trạng thái ticket
  const statusDisplay = getStatusDisplay(status);

  return (
    // Modal overlay - click bên ngoài để đóng
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      {/* Modal content - stopPropagation để không đóng khi click bên trong */}
      <div 
        className="bg-white rounded-2xl max-w-[900px] w-full max-h-[85vh] overflow-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b-2 border-gray-100 sticky top-0 bg-white">
          <button
            className="absolute top-6 right-6 bg-gray-100 border-none rounded-full w-10 h-10 cursor-pointer text-2xl flex items-center justify-center transition-all duration-200 text-gray-500 hover:bg-gray-200"
            onClick={onClose}
          >
            ×
          </button>
          
          <div className="flex items-center justify-between gap-4 mb-4 pr-12">
            <div className="text-2xl font-bold text-gray-900">{ticketCode}</div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusDisplay.bg} ${statusDisplay.text}`}>
              {statusDisplay.icon} {statusDisplay.text}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Mô Tả Chi Tiết Section */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📝 Mô Tả Chi Tiết
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-lg border border-gray-200">
              {description}
            </p>
          </div>

          {/* Thông Tin Grid */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              ℹ️ Thông Tin
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Location */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="text-sm font-semibold text-gray-500 mb-2">📍 Địa điểm</div>
                <div className="text-lg text-gray-900 font-medium">{locationName}</div>
              </div>

              {/* Created Date */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="text-sm font-semibold text-gray-500 mb-2">📅 Ngày tạo</div>
                <div className="text-lg text-gray-900 font-medium">{formatDateTime(createdAt)}</div>
              </div>

              {/* Deadline */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="text-sm font-semibold text-gray-500 mb-2">⏰ Deadline</div>
                <div className="text-lg text-gray-900 font-medium">{resolveDeadline ? formatDateTime(resolveDeadline) : 'N/A'}</div>
              </div>

             
            </div>
          </div>

          {/* Overdue Warning Section - hiển thị nếu ticket bị overdue */}
          {(() => {
            const isOverdue = isTicketOverdueAndNotCompleted(resolveDeadline, status);
            const overdueNote = generateOverdueNote(
              { 
                resolveDeadline, 
                status, 
                slaDeadline: resolveDeadline 
              },
              (ticket as any).note || (ticket as any).notes
            );

            if (isOverdue || overdueNote.includes('TICKET ĐÃ QUÁ HẠN')) {
              return (
                <div className="mb-8 p-6 rounded-lg bg-red-50 border-2 border-red-300">
                  <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                    🚨 ⚠️ THÔNG BÁO QUAN TRỌNG
                  </h3>
                  <p className="text-red-800 font-medium whitespace-pre-wrap">
                    {convertUTCTimestampsToVN(overdueNote)}
                  </p>
                </div>
              );
            }

            // Hiển thị ghi chú thông thường nếu có
            if ((ticket as any).note || (ticket as any).notes) {
              return (
                <div className="mb-8 p-6 rounded-lg bg-emerald-50 border border-emerald-200">
                  <h3 className="text-lg font-bold text-emerald-700 mb-3 flex items-center gap-2">
                    📝 Ghi chú
                  </h3>
                  <p className="text-emerald-900 font-medium whitespace-pre-wrap">
                    {convertUTCTimestampsToVN((ticket as any).note || (ticket as any).notes)}
                  </p>
                </div>
              );
            }

            return null;
          })()}
        </div>

      
      </div>
    </div>
  );
};

export default NotificationTicketDetail;
