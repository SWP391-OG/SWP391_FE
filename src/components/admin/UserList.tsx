import type { User } from '../../types';

interface UserListProps {
  users: User[];
  loading?: boolean;
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onEditClick: (user: User) => void;
}

const UserList = ({
  users,
  loading = false,
  searchQuery,
  currentPage,
  itemsPerPage,
  totalPages,
  onSearchChange,
  onPageChange,
  onEditClick,
}: UserListProps) => {
  const filteredUsers = users.filter((user: User) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.fullName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });
  
  const paginatedFilteredUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Danh sách Người dùng
        </h3>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã người dùng, họ tên, email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Mã người dùng
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Họ tên
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Trạng thái
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Loading skeleton
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3.5"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-4 py-3.5"><div className="h-8 bg-gray-200 rounded w-16"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr key="no-users">
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-sm">
                        {searchQuery ? 'Không tìm thấy người dùng nào phù hợp với từ khóa tìm kiếm' : 'Chưa có người dùng nào'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedFilteredUsers.map((user: User) => {
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-gray-900 font-semibold">
                        {user.username}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-900">
                        {user.fullName}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3.5 text-sm">
                        <div className="inline-flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className={`font-semibold text-sm ${
                            user.status === 'active' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {user.status === 'active' ? 'Hoạt động' : user.status === 'banned' ? 'Bị khóa' : 'Ngừng hoạt động'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => onEditClick(user)}
                          disabled={loading}
                          title="Chỉnh sửa"
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
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                          <span className="text-sm">Sửa</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            Sau
          </button>
        </div>
      )}
    </>
  );
};

export default UserList;
