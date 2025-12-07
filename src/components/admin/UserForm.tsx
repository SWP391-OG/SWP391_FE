import { useState } from 'react';
import type { User, Ticket } from '../../types';

interface UserFormProps {
  editingUser: User | null;
  userFormData?: {
    username: string;
    password: string;
    fullName: string;
    email: string;
  };
  userTickets: Ticket[];
  onFormDataChange?: (data: UserFormProps['userFormData']) => void;
  onSubmit?: () => void;
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

  const statusColors: Record<string, { bg: string; text: string }> = {
    open: { bg: 'bg-blue-100', text: 'text-blue-800' },
    acknowledged: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    resolved: { bg: 'bg-green-100', text: 'text-green-800' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
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
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            {editingUser ? 'Thông tin Người dùng' : 'Thêm Người dùng mới'}
          </h3>
          <button
            className="bg-none border-none text-2xl cursor-pointer text-gray-500 p-1 hover:text-gray-700 transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {editingUser ? (
            // View mode - chỉ hiển thị thông tin
            <>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Mã người dùng
                </label>
                <div className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 text-gray-600">
                  {editingUser.id}
                </div>
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Họ tên
                </label>
                <div className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 text-gray-600">
                  {editingUser.fullName}
                </div>
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Email
                </label>
                <div className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 text-gray-600">
                  {editingUser.email}
                </div>
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Trạng thái
                </label>
                <div className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 text-gray-600">
                  {editingUser.status === 'active' ? 'Hoạt động' : editingUser.status === 'banned' ? 'Đã khóa' : editingUser.status}
                </div>
              </div>
            </>
          ) : (
            // Add mode - form để thêm mới
            <form
              id="user-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (onSubmit) onSubmit();
              }}
            >
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Tên đăng nhập *
                </label>
                <input
                  type="text"
                  required
                  value={userFormData?.username || ''}
                  onChange={(e) => onFormDataChange?.({ ...userFormData!, username: e.target.value })}
                  placeholder="VD: student001"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  required
                  value={userFormData?.password || ''}
                  onChange={(e) => onFormDataChange?.({ ...userFormData!, password: e.target.value })}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Họ tên *
                </label>
                <input
                  type="text"
                  required
                  value={userFormData?.fullName || ''}
                  onChange={(e) => onFormDataChange?.({ ...userFormData!, fullName: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={userFormData?.email || ''}
                  onChange={(e) => onFormDataChange?.({ ...userFormData!, email: e.target.value })}
                  placeholder="VD: student@fpt.edu.vn"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </form>
          )}

          {editingUser && onToggleBan && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-base font-semibold text-gray-800 mb-4">
                Quản lý tài khoản
              </h4>
              <div className="flex gap-4 flex-wrap">
                {editingUser.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn khóa tài khoản sinh viên này? Sinh viên sẽ không thể đăng nhập hoặc gửi yêu cầu mới.')) {
                        onToggleBan();
                      }
                    }}
                    className="px-6 py-3 border border-red-600 rounded-lg bg-white text-red-600 font-semibold cursor-pointer hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                    className="px-6 py-3 border border-green-500 rounded-lg bg-white text-green-500 font-semibold cursor-pointer hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Mở khóa tài khoản
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowTicketHistory(!showTicketHistory)}
                  className="px-6 py-3 border border-blue-500 rounded-lg bg-white text-blue-500 font-semibold cursor-pointer hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {showTicketHistory ? 'Ẩn' : 'Xem'} lịch sử tickets ({userTickets.length})
                </button>
              </div>
            </div>
          )}

          {showTicketHistory && editingUser && userTickets.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-[300px] overflow-y-auto">
              <h4 className="text-base font-semibold text-gray-800 mb-4">
                Lịch sử Tickets
              </h4>
              <div className="flex flex-col gap-3">
                {userTickets.map((ticket) => {
                  const statusInfo = statusColors[ticket.status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                  return (
                    <div
                      key={ticket.id}
                      className="p-3 bg-white rounded-md border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-800 text-sm">
                          {ticket.title}
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusLabels[ticket.status] || ticket.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(ticket.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {showTicketHistory && editingUser && userTickets.length === 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
              Người dùng này chưa có ticket nào
            </div>
          )}

          {editingUser ? (
            // View mode - chỉ có nút đóng
            <div className="flex gap-4 justify-end mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg font-semibold cursor-pointer hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Đóng
              </button>
            </div>
          ) : (
            // Add mode - có nút hủy và thêm mới
            <div className="flex gap-4 justify-end mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg font-semibold cursor-pointer hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="user-form"
                onClick={(e) => {
                  e.preventDefault();
                  if (onSubmit) onSubmit();
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none rounded-lg font-semibold cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
              >
                Thêm mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserForm;
