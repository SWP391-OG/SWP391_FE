import { useEffect } from 'react';
import type { Ticket } from '../types';
import { mockSLAEvents, type SLAEvent } from '../data/mockData';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
}

const TicketDetailModal = ({ ticket, onClose }: TicketDetailModalProps) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Get SLA events for this ticket
  const slaEvents = mockSLAEvents[ticket.id] || [];

  // Calculate SLA progress
  const getSLAProgress = () => {
    const now = new Date();
    const created = new Date(ticket.createdAt);
    const deadline = new Date(ticket.slaDeadline);
    
    const totalDuration = deadline.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    const progress = Math.min((elapsed / totalDuration) * 100, 100);
    
    return {
      progress,
      isOverdue: now > deadline,
      hoursTotal: totalDuration / (1000 * 60 * 60),
      hoursElapsed: elapsed / (1000 * 60 * 60),
      hoursRemaining: (deadline.getTime() - now.getTime()) / (1000 * 60 * 60),
    };
  };

  const slaProgress = getSLAProgress();

  // Get SLA color based on progress
  const getSLAColor = () => {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      const resolvedAt = new Date(ticket.updatedAt || ticket.createdAt);
      const deadline = new Date(ticket.slaDeadline);
      return resolvedAt <= deadline ? '#10b981' : '#f59e0b';
    }
    
    if (slaProgress.isOverdue) return '#ef4444';
    if (slaProgress.progress > 90) return '#f97316';
    if (slaProgress.progress > 70) return '#f59e0b';
    return '#10b981';
  };

  // Status colors
  const statusColors = {
    open: { bg: 'bg-blue-100', text: 'text-blue-800' },
    'in-progress': { bg: 'bg-amber-100', text: 'text-amber-800' },
    resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-700' },
  };

  // Priority colors
  const priorityColors = {
    low: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-800' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700' },
    urgent: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  // Event colors
  const eventColors: Record<SLAEvent['eventType'], string> = {
    created: '#3b82f6',
    assigned: '#8b5cf6',
    in_progress: '#f59e0b',
    resolved: '#10b981',
    closed: '#6b7280',
    comment: '#6366f1',
  };

  // Format date
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Format hours
  const formatHours = (hours: number) => {
    if (hours < 0) {
      return `${Math.abs(Math.floor(hours))}h (quá hạn)`;
    }
    if (hours < 1) {
      return `${Math.floor(hours * 60)}m`;
    }
    if (hours < 24) {
      return `${Math.floor(hours)}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[1000] p-8"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-[900px] w-full max-h-[90vh] overflow-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b-2 border-gray-100 sticky top-0 bg-white z-10">
          <button
            className="absolute top-6 right-6 bg-gray-100 border-none rounded-full w-10 h-10 cursor-pointer text-2xl flex items-center justify-center transition-all duration-200 text-gray-500 hover:bg-gray-200"
            onClick={onClose}
          >
            ×
          </button>
          
          <div className="text-sm font-semibold text-gray-500 mb-2">{ticket.id}</div>
          <h2 className="text-[1.75rem] font-bold text-gray-800 m-0 mb-4 pr-12">{ticket.title}</h2>
          
          <div className="flex gap-3 flex-wrap mb-4">
            <span className={`inline-flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold ${statusColors[ticket.status].bg} ${statusColors[ticket.status].text}`}>
              {ticket.status === 'open' && 'Mở'}
              {ticket.status === 'in-progress' && 'Đang xử lý'}
              {ticket.status === 'resolved' && 'Đã giải quyết'}
              {ticket.status === 'closed' && 'Đã đóng'}
            </span>
            <span className={`inline-flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold ${priorityColors[ticket.priority].bg} ${priorityColors[ticket.priority].text}`}>
              {ticket.priority === 'urgent' && 'Khẩn cấp'}
              {ticket.priority === 'high' && 'Cao'}
              {ticket.priority === 'medium' && 'Trung bình'}
              {ticket.priority === 'low' && 'Thấp'}
            </span>
            <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
              {ticket.issueType.name}
            </span>
          </div>
        </div>

        <div className="p-8">
          {/* SLA Tracking */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ⏱️ SLA Tracking
            </h3>
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-bold text-gray-800">Tiến Độ Xử Lý</div>
                <div 
                  className="py-2 px-4 rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: getSLAColor() }}
                >
                  {slaProgress.isOverdue && ticket.status !== 'resolved' && ticket.status !== 'closed' && 'Quá hạn'}
                  {!slaProgress.isOverdue && ticket.status !== 'resolved' && ticket.status !== 'closed' && 'Đang xử lý'}
                  {ticket.status === 'resolved' && new Date(ticket.updatedAt || '') <= new Date(ticket.slaDeadline) && 'Hoàn thành đúng hạn'}
                  {ticket.status === 'resolved' && new Date(ticket.updatedAt || '') > new Date(ticket.slaDeadline) && 'Hoàn thành trễ'}
                  {ticket.status === 'closed' && 'Đã đóng'}
                </div>
              </div>
              
              <div className="w-full h-3 bg-gray-200 rounded-md overflow-hidden mb-4 relative">
                <div 
                  className="h-full transition-all duration-300 rounded-md"
                  style={{ 
                    width: `${slaProgress.progress}%`, 
                    backgroundColor: getSLAColor() 
                  }}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-[0.85rem] text-gray-500 mb-1">Tổng thời gian SLA</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {formatHours(slaProgress.hoursTotal).split(' ')[0]}
                    <span className="text-sm font-normal text-gray-500">{formatHours(slaProgress.hoursTotal).split(' ')[1] || ''}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[0.85rem] text-gray-500 mb-1">Đã trôi qua</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {formatHours(slaProgress.hoursElapsed).split(' ')[0]}
                    <span className="text-sm font-normal text-gray-500">{formatHours(slaProgress.hoursElapsed).split(' ')[1] || ''}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[0.85rem] text-gray-500 mb-1">Còn lại</div>
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: getSLAColor() }}
                  >
                    {formatHours(slaProgress.hoursRemaining).split(' ')[0]}
                    <span className="text-sm font-normal text-gray-500">{formatHours(slaProgress.hoursRemaining).split(' ')[1] || ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📝 Mô Tả Chi Tiết
            </h3>
            <div className="text-base text-gray-600 leading-[1.8]">{ticket.description}</div>
          </div>

          {/* Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ℹ️ Thông Tin
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {ticket.location && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">Địa điểm</div>
                  <div className="text-base text-gray-800 font-medium">{ticket.location}</div>
                </div>
              )}
              {ticket.roomNumber && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">Số phòng</div>
                  <div className="text-base text-gray-800 font-medium">{ticket.roomNumber}</div>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">Ngày tạo</div>
                <div className="text-base text-gray-800 font-medium">{formatDateTime(ticket.createdAt)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">Deadline SLA</div>
                <div className="text-base text-gray-800 font-medium">{formatDateTime(ticket.slaDeadline)}</div>
              </div>
              {ticket.assignedTo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">Người xử lý</div>
                  <div className="text-base text-gray-800 font-medium">{ticket.assignedTo}</div>
                </div>
              )}
              {ticket.updatedAt && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">Cập nhật lần cuối</div>
                  <div className="text-base text-gray-800 font-medium">{formatDateTime(ticket.updatedAt)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          {ticket.images && ticket.images.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🖼️ Hình Ảnh
              </h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                {ticket.images.map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden border-2 border-gray-200 aspect-square">
                    <img src={image} alt={`Ticket image ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📅 Lịch Sử Xử Lý
            </h3>
            <div className="relative pl-8">
              <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-gray-200"></div>
              {slaEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className={index === slaEvents.length - 1 ? 'relative' : 'relative pb-6'}
                >
                  <div 
                    className="absolute -left-6 top-1 w-4 h-4 rounded-full border-[3px] border-white"
                    style={{ 
                      backgroundColor: eventColors[event.eventType],
                      boxShadow: `0 0 0 2px ${eventColors[event.eventType]}`
                    }}
                  ></div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-base font-semibold text-gray-800 mb-1">{event.title}</div>
                    <div className="text-sm text-gray-500 mb-2">{event.description}</div>
                    <div className="flex justify-between text-[0.85rem] text-gray-400">
                      <span>👤 {event.performedBy}</span>
                      <span>{formatDateTime(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {slaEvents.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Chưa có lịch sử xử lý
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
