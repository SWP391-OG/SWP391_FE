import { useEffect, useState } from 'react';
import type { Ticket } from '../../types';
import { parseTicketImages } from '../../utils/ticketUtils';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
  onEscalate?: (ticketId: string) => void; // Optional - chỉ có khi mở từ staff page
  showEscalateButton?: boolean; // Hiển thị nút Escalate (chỉ cho staff)
  isStudentView?: boolean; // Phân biệt student view để ẩn SLA tracking
  onEdit?: (ticket: Ticket) => void; // Handler để edit ticket (chỉ cho student)
  onUpdateFeedback?: (ticketId: string, ratingStars: number, ratingComment: string) => void; // Handler để update feedback
  onCancelTicket?: (ticketId: string, reason: string) => Promise<void>; // Handler để cancel ticket (chỉ cho student)
}

const TicketDetailModal = ({ 
  ticket, 
  onClose, 
  onEscalate, 
  showEscalateButton = false,
  isStudentView = false,
  onEdit,
  onUpdateFeedback,
  onCancelTicket
}: TicketDetailModalProps) => {
  // Parse images from ticket (handles both imageUrl string and images array)
  const ticketImages = parseTicketImages(ticket);

  // State for feedback form - initialize from ticket
  const [ratingStars, setRatingStars] = useState<number>(() => ticket.ratingStars || 0);
  const [ratingComment, setRatingComment] = useState<string>(() => ticket.ratingComment || '');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  // State để lưu feedback đã submit để hiển thị ngay lập tức
  const [submittedRating, setSubmittedRating] = useState<{stars: number; comment: string} | null>(
    ticket.ratingStars ? { stars: ticket.ratingStars, comment: ticket.ratingComment || '' } : null
  );

  // State for cancel dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Hiển thị rating: ưu tiên submittedRating, fallback về ticket props
  const displayRating = submittedRating || (ticket.ratingStars ? { stars: ticket.ratingStars, comment: ticket.ratingComment || '' } : null);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Status colors
  const statusColors: Record<string, { bg: string; text: string }> = {
    open: { bg: 'bg-blue-100', text: 'text-blue-800' },
    acknowledged: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    assigned: { bg: 'bg-purple-100', text: 'text-purple-800' },
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

  // Format date
  const formatDateTime = (dateString: string) => {
    // Backend returns timestamps without Z, so we treat them as UTC by adding Z
    const normalizedDateString = dateString.includes('Z') ? dateString : `${dateString}Z`;
    const date = new Date(normalizedDateString);
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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
            <span className={`inline-flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold ${getSafeStatusColor(ticket.status).bg} ${getSafeStatusColor(ticket.status).text}`}>
              {ticket.status === 'open' && '🔵 Mới tạo'}
              {ticket.status === 'assigned' && '🟣 Đã được giao việc'}
              {ticket.status === 'in-progress' && '🟡 Đang xử lý'}
              {ticket.status === 'resolved' && '🟢 Đã giải quyết'}
              {ticket.status === 'closed' && '⚫ Đã đóng'}
              {ticket.status === 'cancelled' && '🔴 Đã hủy'}
            </span>
          </div>
        </div>

        <div className="p-8">
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
              {(ticket.assignedTo || ticket.assignedToName) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">👤 Người xử lý</div>
                  <div className="text-base text-gray-800 font-medium">{ticket.assignedToName || ticket.assignedTo}</div>
                  {ticket.assignedToPhone && (
                    <div className="text-sm text-gray-600 mt-2">📱 {ticket.assignedToPhone}</div>
                  )}
                </div>
              )}
              {ticket.managedByName && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">👨‍💼 Người quản lý</div>
                  <div className="text-base text-gray-800 font-medium">{ticket.managedByName}</div>
                </div>
              )}
              {ticket.createdByName && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">👨‍💼 Người tạo</div>
                  <div className="text-base text-gray-800 font-medium">{ticket.createdByName}</div>
                </div>
              )}
              {ticket.categoryId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">🔧 Loại sự cố</div>
                  <div className="text-base text-gray-800 font-medium">{ticket.categoryId}</div>
                </div>
              )}
              {ticket.contactPhone && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">📱 Thông tin liên lạc</div>
                  <div className="text-base text-gray-800 font-medium">{ticket.contactPhone}</div>
                </div>
              )}
              {ticket.note && (
                <div className={`p-4 rounded-lg col-span-2 ${ticket.status === 'cancelled' ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className={`text-[0.85rem] font-semibold mb-1 ${ticket.status === 'cancelled' ? 'text-red-600' : 'text-gray-500'}`}>
                    {ticket.status === 'cancelled' ? '🔴 Lý do hủy' : '📝 Ghi chú'}
                  </div>
                  <div className={`text-base font-medium ${ticket.status === 'cancelled' ? 'text-red-800' : 'text-gray-800'}`}>{ticket.note}</div>
                </div>
              )}
              {ticket.notes && (
                <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">📝 Ghi chú</div>
                  <div className="text-base text-gray-800 font-medium">{ticket.notes}</div>
                </div>
              )}
              {ticket.resolvedAt && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">✅ Được giải quyết vào</div>
                  <div className="text-base text-gray-800 font-medium">{formatDateTime(ticket.resolvedAt)}</div>
                </div>
              )}
              {ticket.closedAt && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">🔒 Đóng vào</div>
                  <div className="text-base text-gray-800 font-medium">{formatDateTime(ticket.closedAt)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          {ticketImages.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🖼️ Hình Ảnh
              </h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                {ticketImages.map((image, index) => (
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

          {/* Rating Display for Admin/Staff - Chỉ hiển thị khi có rating và KHÔNG phải student view */}
          {!isStudentView && (ticket.ratingStars || ticket.ratingComment) && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ⭐ Đánh Giá Của Người Dùng
              </h3>
              <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-xl p-6">
                {ticket.ratingStars && (
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
                )}
                {ticket.ratingComment && (
                  <div>
                    <div className="text-sm font-semibold text-gray-500 mb-2">Nhận xét:</div>
                    <div className="text-base text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                      {ticket.ratingComment}
                    </div>
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
              {!isEditingFeedback && displayRating ? (
                <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-lg font-semibold text-gray-800">Đánh giá:</div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className="text-2xl"
                          style={{ color: star <= displayRating.stars ? '#fbbf24' : '#d1d5db' }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="text-lg font-semibold text-gray-800">({displayRating.stars}/5)</div>
                  </div>
                  {displayRating.comment && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-500 mb-2">Mô tả:</div>
                      <div className="text-base text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                        {displayRating.comment}
                      </div>
                    </div>
                  )}
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
                          disabled={isSavingFeedback}
                          className="text-3xl transition-all duration-200 hover:scale-110 disabled:opacity-50"
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
                      disabled={isSavingFeedback}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg text-base resize-none focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        if (ratingStars < 1) {
                          setFeedbackError('Vui lòng chọn số sao đánh giá (từ 1-5)');
                          return;
                        }

                        try {
                          setIsSavingFeedback(true);
                          setFeedbackError(null);
                          
                          // Call API to persist feedback
                          if (onUpdateFeedback) {
                            await onUpdateFeedback(ticket.id, ratingStars, ratingComment);
                          }
                          
                          // Update local state - this will trigger displayRating to update
                          // and the feedback will be visible immediately
                          setSubmittedRating({ stars: ratingStars, comment: ratingComment });
                          setIsEditingFeedback(false);
                          
                          // Show success message briefly
                          setFeedbackSuccess(true);
                          setTimeout(() => setFeedbackSuccess(false), 2000);
                          
                        } catch (error) {
                          const errorMsg = error instanceof Error ? error.message : 'Lưu feedback thất bại';
                          setFeedbackError(errorMsg);
                          console.error('❌ Error saving feedback:', error);
                        } finally {
                          setIsSavingFeedback(false);
                        }
                      }}
                      disabled={isSavingFeedback}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingFeedback ? 'Đang lưu...' : 'Lưu phản hồi'}
                    </button>
                    {displayRating && (
                      <button
                        onClick={() => {
                          setIsEditingFeedback(false);
                          setRatingStars(displayRating.stars);
                          setRatingComment(displayRating.comment);
                          setFeedbackError(null);
                        }}
                        disabled={isSavingFeedback}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                  {feedbackError && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                      ❌ {feedbackError}
                    </div>
                  )}
                  {feedbackSuccess && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm animate-pulse">
                      ✅ Cảm ơn bạn đã đánh giá! Phản hồi đã được lưu.
                    </div>
                  )}
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

              {/* Cancel button - chỉ hiển thị khi status = 'open' và là student view */}
              {isStudentView && ticket.status === 'open' && onCancelTicket && (
                <button
                  onClick={() => setShowCancelDialog(true)}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Hủy Ticket
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

        {/* Cancel Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Hủy Ticket</h3>
              <p className="text-gray-600 mb-4">
                Vui lòng nhập lý do tại sao bạn muốn hủy ticket này:
              </p>
              
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy ticket..."
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 resize-none focus:outline-none focus:border-blue-500"
                rows={4}
              />

              {cancelError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                  ❌ {cancelError}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCancelDialog(false);
                    setCancelReason('');
                    setCancelError(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    if (!cancelReason.trim()) {
                      setCancelError('Vui lòng nhập lý do hủy ticket');
                      return;
                    }

                    try {
                      setIsCancelling(true);
                      setCancelError(null);
                      
                      if (onCancelTicket) {
                        await onCancelTicket(ticket.id, cancelReason);
                      }
                      
                      setShowCancelDialog(false);
                      setCancelReason('');
                      onClose();
                    } catch (error) {
                      const errorMsg = error instanceof Error ? error.message : 'Hủy ticket thất bại';
                      setCancelError(errorMsg);
                    } finally {
                      setIsCancelling(false);
                    }
                  }}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailModal;
