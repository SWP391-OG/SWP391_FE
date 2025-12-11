import { useEffect, useState } from 'react';
import type { Ticket } from '../../types';
import { mockSLAEvents, type SLAEvent } from '../../data/mockData';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
  onEscalate?: (ticketId: string) => void; // Optional - chỉ có khi mở từ staff page
  showEscalateButton?: boolean; // Hiển thị nút Escalate (chỉ cho staff)
  isStudentView?: boolean; // Phân biệt student view để ẩn SLA tracking
  onEdit?: (ticket: Ticket) => void; // Handler để edit ticket (chỉ cho student)
  onUpdateFeedback?: (ticketId: string, ratingStars: number, ratingComment: string) => void; // Handler để update feedback
}

const TicketDetailModal = ({ 
  ticket, 
  onClose, 
  onEscalate, 
  showEscalateButton = false,
  isStudentView = false,
  onEdit,
  onUpdateFeedback
}: TicketDetailModalProps) => {
  // State for feedback form
  const [ratingStars, setRatingStars] = useState<number>(ticket.ratingStars || 0);
  const [ratingComment, setRatingComment] = useState<string>(ticket.ratingComment || '');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Update local state when ticket changes
  useEffect(() => {
    setRatingStars(ticket.ratingStars || 0);
    setRatingComment(ticket.ratingComment || '');
  }, [ticket]);

  // Get SLA events for this ticket
  const slaEvents = mockSLAEvents[ticket.id] || [];

  // Calculate SLA progress
  const getSLAProgress = () => {
    const deadline = ticket.resolveDeadline || ticket.slaDeadline || ticket.deadlineAt;
    if (!deadline) {
      return {
        progress: 0,
        isOverdue: false,
        hoursTotal: 0,
        hoursElapsed: 0,
        hoursRemaining: 0,
      };
    }
    const now = new Date();
    const created = new Date(ticket.createdAt);
    const deadlineDate = new Date(deadline);
    
    const totalDuration = deadlineDate.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    const progress = Math.min((elapsed / totalDuration) * 100, 100);
    
    return {
      progress,
      isOverdue: now > deadlineDate,
      hoursTotal: totalDuration / (1000 * 60 * 60),
      hoursElapsed: elapsed / (1000 * 60 * 60),
      hoursRemaining: (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60),
    };
  };

  const slaProgress = getSLAProgress();

  // Get SLA color based on progress
  const getSLAColor = () => {
    const deadline = ticket.resolveDeadline || ticket.slaDeadline || ticket.deadlineAt;
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      if (!deadline) return '#10b981';
      const resolvedAt = new Date(ticket.updatedAt || ticket.createdAt);
      const deadlineDate = new Date(deadline);
      return resolvedAt <= deadlineDate ? '#10b981' : '#f59e0b';
    }
    
    if (slaProgress.isOverdue) return '#ef4444';
    if (slaProgress.progress > 90) return '#f97316';
    if (slaProgress.progress > 70) return '#f59e0b';
    return '#10b981';
  };

  // Status colors
  const statusColors: Record<string, { bg: string; text: string }> = {
    open: { bg: 'bg-blue-100', text: 'text-blue-800' },
    acknowledged: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    assigned: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'in-progress': { bg: 'bg-amber-100', text: 'text-amber-800' },
    'in_progress': { bg: 'bg-amber-100', text: 'text-amber-800' },
    resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
    new: { bg: 'bg-blue-100', text: 'text-blue-800' },
  };

  // Safe get status color with fallback
  const getSafeStatusColor = (status: string) => {
    const normalized = (status || 'open').toLowerCase().replace(/_/g, '-');
    return statusColors[normalized] || { bg: 'bg-gray-100', text: 'text-gray-800' };
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
          
          {isStudentView && (
            <div className="flex gap-3 flex-wrap mb-4">
              <span className={`inline-flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold ${getSafeStatusColor(ticket.status).bg} ${getSafeStatusColor(ticket.status).text}`}>
                {ticket.status === 'open' && '🔵 Mở'}
                {ticket.status === 'in-progress' && '🟡 Đang xử lý'}
                {ticket.status === 'resolved' && '🟢 Đã giải quyết'}
                {ticket.status === 'closed' && '⚫ Đã đóng'}
              </span>
              {ticket.priority && (
                <span className={`inline-flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold ${priorityColors[ticket.priority].bg} ${priorityColors[ticket.priority].text}`}>
                  {ticket.priority === 'urgent' && '🔴 Khẩn cấp'}
                  {ticket.priority === 'high' && '🟠 Cao'}
                  {ticket.priority === 'medium' && '🟡 Trung bình'}
                  {ticket.priority === 'low' && '🟢 Thấp'}
                </span>
              )}
              {ticket.issueType && (
                <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                  {ticket.issueType.icon} {ticket.issueType.name}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-8">
          {/* Description - only for student view */}
          {isStudentView && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📝 Mô Tả Chi Tiết
              </h3>
              <div className="text-base text-gray-600 leading-[1.8]">{ticket.description}</div>
            </div>
          )}

          {/* Information - ADMIN VIEW: only basic fields */}
          {!isStudentView ? (
            <div className="mb-8">
              <div className="space-y-4">
                {ticket.description && (
                  <div className="flex gap-3">
                    <span className="font-semibold text-gray-700 min-w-[120px]">Mô tả:</span>
                    <span className="text-gray-800">{ticket.description}</span>
                  </div>
                )}
                {(ticket.locationName || ticket.location) && (
                  <div className="flex gap-3">
                    <span className="font-semibold text-gray-700 min-w-[120px]">📍 Vị trí:</span>
                    <span className="text-gray-800">{ticket.locationName || ticket.location}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <span className="font-semibold text-gray-700 min-w-[120px]">📅 Ngày tạo:</span>
                  <span className="text-gray-800">
                    {new Intl.DateTimeFormat('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }).format(new Date(ticket.createdAt))}
                  </span>
                </div>
                {ticket.issueType && (
                  <div className="flex gap-3">
                    <span className="font-semibold text-gray-700 min-w-[120px]">Loại sự cố:</span>
                    <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      {ticket.issueType.icon} {ticket.issueType.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // STUDENT VIEW: full information grid
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ℹ️ Thông Tin
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {ticket.campusName && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">🏫 Campus</div>
                    <div className="text-base text-gray-800 font-medium">{ticket.campusName}</div>
                  </div>
                )}
                {(ticket.location || ticket.locationName) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">📍 Địa điểm</div>
                    <div className="text-base text-gray-800 font-medium">{ticket.locationName || ticket.location}</div>
                  </div>
                )}
                {ticket.roomNumber && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">Số phòng</div>
                    <div className="text-base text-gray-800 font-medium">{ticket.roomNumber}</div>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">📅 Ngày tạo</div>
                  <div className="text-base text-gray-800 font-medium">{formatDateTime(ticket.createdAt)}</div>
                </div>
                {(ticket.resolveDeadline || ticket.slaDeadline || ticket.deadlineAt) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">⏰ Deadline</div>
                    <div className="text-base text-gray-800 font-medium">
                      {formatDateTime(ticket.resolveDeadline || ticket.slaDeadline || ticket.deadlineAt || '')}
                    </div>
                  </div>
                )}
                {ticket.assignedTo && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">👤 Người xử lý</div>
                    <div className="text-base text-gray-800 font-medium">{ticket.assignedTo}</div>
                  </div>
                )}
                {ticket.updatedAt && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">🔄 Cập nhật lần cuối</div>
                    <div className="text-base text-gray-800 font-medium">{formatDateTime(ticket.updatedAt)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Images - only for student view */}
          {isStudentView && ticket.images && ticket.images.length > 0 && (
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

          {/* Timeline - Chỉ hiển thị khi không phải student view */}
          {!isStudentView && (
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
          )}

          {/* Feedback Section - Chỉ hiển thị khi ticket đã được xử lý (resolved/closed) và là student view */}
          {isStudentView && (ticket.status === 'resolved' || ticket.status === 'closed') && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ⭐ Phản Hồi
              </h3>
              {!isEditingFeedback && ticket.ratingStars ? (
                <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-lg font-semibold text-gray-800">Đánh giá:</div>
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
                    <div className="text-lg font-semibold text-gray-800">({ticket.ratingStars}/5)</div>
                  </div>
                  {ticket.ratingComment && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-500 mb-2">Mô tả:</div>
                      <div className="text-base text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                        {ticket.ratingComment}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setIsEditingFeedback(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200"
                  >
                    Chỉnh sửa phản hồi
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-xl p-6">
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Đánh giá sao (1-5):</div>
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingStars(star)}
                          className="text-3xl transition-all duration-200 hover:scale-110"
                          style={{ color: star <= ratingStars ? '#fbbf24' : '#d1d5db' }}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ml-2 text-base font-semibold text-gray-700">({ratingStars}/5)</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả phản hồi:</label>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Nhập mô tả phản hồi của bạn..."
                      className="w-full p-4 border-2 border-gray-200 rounded-lg text-base resize-none focus:outline-none focus:border-blue-500"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (onUpdateFeedback && ratingStars > 0) {
                          onUpdateFeedback(ticket.id, ratingStars, ratingComment);
                          setIsEditingFeedback(false);
                          alert('Phản hồi đã được cập nhật thành công!');
                        } else {
                          alert('Vui lòng chọn số sao đánh giá (từ 1-5)');
                        }
                      }}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200"
                    >
                      Lưu phản hồi
                    </button>
                    {ticket.ratingStars && (
                      <button
                        onClick={() => {
                          setIsEditingFeedback(false);
                          setRatingStars(ticket.ratingStars || 0);
                          setRatingComment(ticket.ratingComment || '');
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 pt-8 border-t-2 border-gray-100">
            <div className="flex justify-end gap-4">
              {/* Edit button - chỉ hiển thị khi status = 'open' và là student view */}
              {isStudentView && ticket.status === 'open' && onEdit && (
                <button
                  onClick={() => {
                    if (onEdit) {
                      onEdit(ticket);
                      // Modal sẽ tự đóng khi studentView thay đổi
                    }
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                  Chỉnh sửa Ticket
                </button>
              )}
              
              {/* Escalate button (only for staff) */}
              {showEscalateButton && onEscalate && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <button
                  onClick={() => {
                    if (confirm('Bạn có chắc chắn muốn escalate ticket này lên Admin? Ticket sẽ được chuyển cho Admin xử lý.')) {
                      onEscalate(ticket.id);
                      onClose();
                    }
                  }}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  Escalate lên Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
