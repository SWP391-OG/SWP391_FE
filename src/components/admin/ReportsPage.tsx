import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { Ticket, Category, Department, User, TicketFromApi } from '../../types';

interface ReportsPageProps {
  tickets: (Ticket | TicketFromApi)[];
  categories: Category[];
  departments: Department[];
  users: User[];
  adminDepartments: Department[];
}

const ReportsPage = ({
  tickets,
  categories,
  departments,
  adminDepartments,
}: ReportsPageProps) => {
  // Debug logging
  console.log('📊 ReportsPage Data:', {
    ticketsCount: tickets.length,
    categoriesCount: categories.length,
    departmentsCount: departments.length,
    adminDepartmentsCount: adminDepartments.length,
    ticketsSample: tickets.slice(0, 2),
    categoriesSample: categories.slice(0, 2),
  });
  // Filter tickets by admin's departments
  const adminDepartmentIds = adminDepartments.map(d => d.id);
  const adminTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Handle both API tickets and local tickets
      const categoryCode = 'categoryCode' in ticket ? ticket.categoryCode : ticket.categoryId;
      const category = categories.find(c => 
        (typeof c.id === 'number' && typeof categoryCode === 'number' && c.id === categoryCode) ||
        (typeof c.id === 'string' && typeof categoryCode === 'string' && c.id === categoryCode) ||
        (c.categoryCode === categoryCode) ||
        (c.categoryName === ('categoryName' in ticket ? ticket.categoryName : ''))
      );
      return category && adminDepartmentIds.includes(category.departmentId);
    });
  }, [tickets, categories, adminDepartmentIds]);

  // Total tickets statistics
  const totalTicketsCount = useMemo(() => {
    return adminTickets.length;
  }, [adminTickets]);

  // Cancelled and Completed tickets statistics - ALL STATUSES
  const ticketStatusReport = useMemo(() => {
    // Count by all statuses
    const completedTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'closed').length;
    const resolvedTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'resolved').length;
    const pendingReviewTickets = resolvedTickets; // resolved = chờ đánh giá
    const assignedTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'assigned').length;
    const newTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'new' || String(t.status).toLowerCase() === 'open').length;
    const cancelledTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'cancelled').length;
    const inProgressTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'in-progress' || String(t.status).toLowerCase() === 'in_progress').length;
    const acknowledgedTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'acknowledged').length;

    // Calculate percentages
    const completedPercentage = totalTicketsCount > 0 ? Math.round((completedTickets / totalTicketsCount) * 100) : 0;
    const cancelledPercentage = totalTicketsCount > 0 ? Math.round((cancelledTickets / totalTicketsCount) * 100) : 0;

    return {
      totalTickets: totalTicketsCount,
      completedTickets,
      pendingReviewTickets,
      assignedTickets,
      newTickets,
      cancelledTickets,
      inProgressTickets,
      acknowledgedTickets,
      completedPercentage,
      cancelledPercentage,
      pieData: [
        { name: `Hoàn thành (${completedPercentage}%)`, value: completedPercentage, count: completedTickets },
        { name: `Hủy (${cancelledPercentage}%)`, value: cancelledPercentage, count: cancelledTickets },
        { name: `Khác (${100 - completedPercentage - cancelledPercentage}%)`, value: 100 - completedPercentage - cancelledPercentage, count: totalTicketsCount - completedTickets - cancelledTickets },
      ]
    };
  }, [adminTickets, totalTicketsCount]);

  // Category statistics - most frequent issues
  const categoryStatistics = useMemo(() => {
    const categoryCount: Record<string, { count: number; categoryName: string; categoryId: string | number }> = {};

    adminTickets.forEach(ticket => {
      // Get category name - handle both API and local formats
      let categoryName = '';
      let categoryId = '';
      
      if ('categoryName' in ticket && 'categoryCode' in ticket) {
        // TicketFromApi format
        categoryName = ticket.categoryName || '';
        categoryId = (ticket as any).categoryCode || '';
      } else {
        // Ticket format - need to find in categories array
        const category = categories.find(c => c.id === (ticket as any).categoryId);
        if (category) {
          categoryName = category.categoryName;
          categoryId = String(category.id);
        }
      }

      if (categoryName) {
        if (!categoryCount[categoryId]) {
          categoryCount[categoryId] = {
            count: 0,
            categoryName: categoryName,
            categoryId: categoryId,
          };
        }
        categoryCount[categoryId].count++;
      }
    });

    return Object.values(categoryCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 categories
  }, [adminTickets, categories]);

  // Department statistics - departments handling most errors
  const departmentStatistics = useMemo(() => {
    const departmentCount: Record<string, { count: number; departmentName: string; departmentId: string | number }> = {};

    adminTickets.forEach(ticket => {
      let category = null;
      
      if ('categoryName' in ticket && 'categoryCode' in ticket) {
        // TicketFromApi format - find category by categoryCode
        category = categories.find(c => c.categoryCode === (ticket as any).categoryCode);
      } else {
        // Ticket format
        category = categories.find(c => c.id === (ticket as any).categoryId);
      }

      if (category) {
        const dept = departments.find(d => d.id === category.departmentId);
        if (dept) {
          const deptId = String(dept.id);
          if (!departmentCount[deptId]) {
            departmentCount[deptId] = {
              count: 0,
              departmentName: dept.deptName || dept.name || 'Không xác định',
              departmentId: dept.id,
            };
          }
          departmentCount[deptId].count++;
        }
      }
    });

    return Object.values(departmentCount)
      .sort((a, b) => b.count - a.count);
  }, [adminTickets, categories, departments]);

  const COLORS = ['#10b981', '#ef4444', '#9ca3af']; // Green for completed, Red for cancelled, Gray for others

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Báo cáo Quản lý Tickets</h2>

      {/* Total Tickets Statistics - All Statuses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Thống kê Tổng số Tickets</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* Tổng số Tickets */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-xs text-blue-600 font-medium mb-1">Tổng số Tickets</div>
            <div className="text-3xl font-bold text-blue-900">{ticketStatusReport.totalTickets}</div>
          </div>

          {/* Đã Hoàn thành */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-xs text-green-600 font-medium mb-1">Đã Hoàn thành</div>
            <div className="text-3xl font-bold text-green-900">{ticketStatusReport.completedTickets}</div>
          </div>

          {/* Chờ đánh giá */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-xs text-purple-600 font-medium mb-1">Chờ đánh giá</div>
            <div className="text-3xl font-bold text-purple-900">{ticketStatusReport.pendingReviewTickets}</div>
          </div>

          {/* Đã được giao */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="text-xs text-yellow-600 font-medium mb-1">Đã được giao</div>
            <div className="text-3xl font-bold text-yellow-900">{ticketStatusReport.assignedTickets}</div>
          </div>

          {/* Mới tạo */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="text-xs text-orange-600 font-medium mb-1">Mới tạo</div>
            <div className="text-3xl font-bold text-orange-900">{ticketStatusReport.newTickets}</div>
          </div>

          {/* Đã hủy */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-xs text-red-600 font-medium mb-1">Đã hủy</div>
            <div className="text-3xl font-bold text-red-900">{ticketStatusReport.cancelledTickets}</div>
          </div>
        </div>
      </div>

      {/* Pie Chart - Cancelled vs Completed */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Tỷ lệ Tickets Hủy & Hoàn thành</h3>
        <div className="flex flex-col items-center">
          {ticketStatusReport.totalTickets > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ticketStatusReport.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name }) => `${name}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ticketStatusReport.pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-2xl">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium mb-2">Hoàn thành</div>
                  <div className="text-2xl font-bold text-green-900">{ticketStatusReport.completedPercentage}%</div>
                  <div className="text-xs text-green-500 mt-1">({ticketStatusReport.completedTickets} tickets)</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-sm text-red-600 font-medium mb-2">Hủy</div>
                  <div className="text-2xl font-bold text-red-900">{ticketStatusReport.cancelledPercentage}%</div>
                  <div className="text-xs text-red-500 mt-1">({ticketStatusReport.cancelledTickets} tickets)</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium mb-2">Khác</div>
                  <div className="text-2xl font-bold text-gray-900">{100 - ticketStatusReport.completedPercentage - ticketStatusReport.cancelledPercentage}%</div>
                  <div className="text-xs text-gray-500 mt-1">({ticketStatusReport.totalTickets - ticketStatusReport.completedTickets - ticketStatusReport.cancelledTickets} tickets)</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Chưa có dữ liệu tickets
            </div>
          )}
        </div>
      </div>

      {/* Category Statistics - Top Issues */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Thống kê Loại Lỗi Phổ biến nhất</h3>
        {categoryStatistics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có dữ liệu categories
          </div>
        ) : (
          <div className="space-y-3">
            {categoryStatistics.map((category, index) => {
              const percentage = totalTicketsCount > 0 
                ? Math.round((category.count / totalTicketsCount) * 100)
                : 0;
              return (
                <div key={category.categoryId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-bold text-gray-400 w-8">#{index + 1}</div>
                    <div>
                      <div className="text-gray-900 font-semibold">{category.categoryName}</div>
                      <div className="text-sm text-gray-500">{category.count} tickets</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Department Statistics - Most Active Departments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Thống kê Phòng ban Xử lý Lỗi Nhiều nhất</h3>
        {departmentStatistics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có dữ liệu departments
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Xếp hạng</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Tên Phòng ban</th>
                  <th className="text-center p-3 text-sm font-semibold text-gray-700">Số lỗi xử lý</th>
                  <th className="text-center p-3 text-sm font-semibold text-gray-700">Tỷ lệ (%)</th>
                </tr>
              </thead>
              <tbody>
                {departmentStatistics.map((dept, index) => {
                  const percentage = totalTicketsCount > 0
                    ? Math.round((dept.count / totalTicketsCount) * 100)
                    : 0;
                  return (
                    <tr key={dept.departmentId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-3 text-gray-900 font-medium">{dept.departmentName}</td>
                      <td className="p-3 text-center text-gray-700 font-semibold">{dept.count}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="font-semibold text-green-600 min-w-12">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;

