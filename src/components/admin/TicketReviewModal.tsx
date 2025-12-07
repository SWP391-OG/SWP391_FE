import { useState } from 'react';
import type { Ticket } from '../../types';

interface TicketReviewModalProps {
  ticket: Ticket;
  onApprove: (ticketId: string) => void;
  onReject: (ticketId: string, reason: string) => void;
  onClose: () => void;
}

const TicketReviewModal = ({
  ticket,
  onApprove,
  onReject,
  onClose,
}: TicketReviewModalProps) => {
  const [rejectReason, setRejectReason] = useState('');

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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>
            Duyệt Ticket
          </h3>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.25rem',
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Ticket Info */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>ID Ticket:</span>
              <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace', color: '#1f2937' }}>{ticket.id}</span>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Tiêu đề:</span>
              <div style={{ marginTop: '0.25rem', fontSize: '1rem', color: '#1f2937', fontWeight: 600 }}>
                {ticket.title}
              </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Mô tả:</span>
              <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.5' }}>
                {ticket.description}
              </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Vị trí:</span>
              <span style={{ marginLeft: '0.5rem', color: '#1f2937' }}>{ticket.location || 'N/A'}</span>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Ngày tạo:</span>
              <span style={{ marginLeft: '0.5rem', color: '#1f2937' }}>{formatDate(ticket.createdAt)}</span>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Trạng thái:</span>
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: '#dbeafe',
                color: '#1e40af',
              }}>
                {ticket.status === 'open' ? 'Mới tạo' : ticket.status}
              </span>
            </div>
          </div>

          {/* Images if any */}
          {ticket.images && ticket.images.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Hình ảnh:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                {ticket.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Ticket image ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reject Reason Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Lý do từ chối (nếu từ chối):
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối ticket này..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            marginTop: '2rem',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f3f4f6',
                color: '#4b5563',
                border: '1px solid #d1d5db',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
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
              style={{
                background: 'none',
                color: '#dc2626',
                border: '1px solid #dc2626',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              Từ chối
            </button>
            <button
              type="button"
              onClick={() => {
                onApprove(ticket.id);
                onClose();
              }}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669)';
              }}
            >
              Chấp nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketReviewModal;

