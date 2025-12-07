import { useState } from 'react';
import type { User, Ticket } from '../../types';

interface UserFormProps {
  editingUser: User | null;
  userFormData: {
    username: string;
    password: string;
    fullName: string;
    email: string;
  };
  userTickets: Ticket[];
  onFormDataChange: (data: UserFormProps['userFormData']) => void;
  onSubmit: () => void;
  onToggleBan?: () => void;
  onClose: () => void;
}

const UserForm = ({
  editingUser,
  userFormData,
  userTickets,
  onFormDataChange,
  onSubmit,
  onToggleBan,
  onClose,
}: UserFormProps) => {
  const [showTicketHistory, setShowTicketHistory] = useState(false);

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

  const statusLabels: Record<string, string> = {
    open: 'Mở',
    acknowledged: 'Đã xác nhận',
    'in-progress': 'Đang xử lý',
    resolved: 'Đã giải quyết',
    closed: 'Đã đóng',
    cancelled: 'Đã hủy',
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>
            {editingUser ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới'}
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

        <form
          style={{ padding: '1.5rem' }}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Tên đăng nhập *
            </label>
            <input
              type="text"
              required
              value={userFormData.username}
              onChange={(e) => onFormDataChange({ ...userFormData, username: e.target.value })}
              placeholder="VD: student001"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Mật khẩu *
            </label>
            <input
              type="password"
              required
              value={userFormData.password}
              onChange={(e) => onFormDataChange({ ...userFormData, password: e.target.value })}
              placeholder="Nhập mật khẩu"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Họ tên *
            </label>
            <input
              type="text"
              required
              value={userFormData.fullName}
              onChange={(e) => onFormDataChange({ ...userFormData, fullName: e.target.value })}
              placeholder="VD: Nguyễn Văn A"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Email *
            </label>
            <input
              type="email"
              required
              value={userFormData.email}
              onChange={(e) => onFormDataChange({ ...userFormData, email: e.target.value })}
              placeholder="VD: student@fpt.edu.vn"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>

          {editingUser && onToggleBan && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1f2937', fontWeight: 600 }}>
                Quản lý tài khoản
              </h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {editingUser.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn khóa tài khoản sinh viên này? Sinh viên sẽ không thể đăng nhập hoặc gửi yêu cầu mới.')) {
                        onToggleBan();
                      }
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #dc2626',
                      borderRadius: '8px',
                      background: 'none',
                      color: '#dc2626',
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
                    Khóa tài khoản
                  </button>
                ) : editingUser.status === 'banned' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn mở khóa tài khoản sinh viên này?')) {
                        onToggleBan();
                      }
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #10b981',
                      borderRadius: '8px',
                      background: 'none',
                      color: '#10b981',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#d1fae5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    Mở khóa tài khoản
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowTicketHistory(!showTicketHistory)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    background: 'none',
                    color: '#3b82f6',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  {showTicketHistory ? 'Ẩn' : 'Xem'} lịch sử tickets ({userTickets.length})
                </button>
              </div>
            </div>
          )}

          {showTicketHistory && editingUser && userTickets.length > 0 && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              maxHeight: '300px',
              overflowY: 'auto',
            }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1f2937', fontWeight: 600 }}>
                Lịch sử Tickets
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {userTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    style={{
                      padding: '0.75rem',
                      background: 'white',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>
                        {ticket.title}
                      </div>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: ticket.status === 'open' ? '#dbeafe' : ticket.status === 'resolved' ? '#d1fae5' : '#f3f4f6',
                        color: ticket.status === 'open' ? '#1e40af' : ticket.status === 'resolved' ? '#065f46' : '#374151',
                      }}>
                        {statusLabels[ticket.status] || ticket.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {formatDate(ticket.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showTicketHistory && editingUser && userTickets.length === 0 && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              textAlign: 'center',
              color: '#6b7280',
            }}>
              Người dùng này chưa có ticket nào
            </div>
          )}

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
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {editingUser ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

