// Trang báo cáo trong admin: tổng hợp số liệu tickets theo thời gian, trạng thái, category, department
import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfMonth } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import type { Ticket, Category, Department, User, TicketFromApi } from '../../types';
import { isTicketOverdueAndNotCompleted } from '../../utils/dateUtils';

// Props nhận dữ liệu đã được load từ AdminPage
interface ReportsPageProps {
  tickets: (Ticket | TicketFromApi)[];
  categories: Category[];
  departments: Department[];
  users: User[];
  adminDepartments: Department[];
  ticketTotalCount?: number; // Total count from server for statistics
}

type DateFilterType = 'all' | '7days' | 'month' | 'custom';

// Component chính hiển thị dashboard báo cáo
const ReportsPage = ({
  tickets,
  categories,
  departments,
  adminDepartments,
  ticketTotalCount = 0,
}: ReportsPageProps) => {
  // State filter theo thời gian - mặc định 7 ngày gần nhất
  const [dateFilter, setDateFilter] = useState<DateFilterType>('7days');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Debug logging: log nhanh số lượng dữ liệu đầu vào
  console.log('📊 ReportsPage Data:', {
    ticketsCount: tickets.length,
    categoriesCount: categories.length,
    departmentsCount: departments.length,
    adminDepartmentsCount: adminDepartments.length,
  });
  
  // Lọc tickets theo các bộ phận mà admin hiện tại quản lý
  const adminDepartmentIds = adminDepartments.map(d => d.id);

  // Tính toán khoảng thời gian (startDate, endDate) dựa trên loại filter ngày
  const getDateRange = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    let startDate = new Date(0); // Default to very old date

    if (dateFilter === '7days') {
      startDate = subDays(today, 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === 'month') {
      startDate = startOfMonth(today);
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);
      const endDateObj = new Date(customEndDate);
      endDateObj.setHours(23, 59, 59, 999);
      return { startDate, endDate: endDateObj };
    }

    return { startDate, endDate: today };
  }, [dateFilter, customStartDate, customEndDate]);

  // Danh sách ticket đã được filter theo department của admin và theo khoảng thời gian
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
      if (!category || !adminDepartmentIds.includes(category.departmentId)) {
        return false;
      }

      // Filter by date
      const createdAtStr = (ticket as any).createdAt;
      if (createdAtStr) {
        const ticketDate = new Date(createdAtStr);
        if (ticketDate < getDateRange.startDate || ticketDate > getDateRange.endDate) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, categories, adminDepartmentIds, getDateRange]);

  // Tổng số ticket dùng cho thống kê (ưu tiên số count từ server nếu có)
  const totalTicketsCount = useMemo(() => {
    // Use server total count if available, otherwise use filtered tickets count
    return ticketTotalCount > 0 ? ticketTotalCount : adminTickets.length;
  }, [adminTickets, ticketTotalCount]);

  // Thống kê theo trạng thái: đếm tất cả trạng thái từ danh sách tickets đã filter theo thời gian
  const ticketStatusReport = useMemo(() => {
    // Debug: log lại toàn bộ status để dễ kiểm tra
    const statusCounts: Record<string, number> = {};
    adminTickets.forEach(t => {
      const status = String(t.status).toLowerCase();
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    console.log('📊 Filtered ticket statuses (by date range):', statusCounts);
    console.log('📊 Total filtered tickets:', adminTickets.length);
    
    // Đếm số lượng ticket cho từng trạng thái dựa trên danh sách đã filter
    const closedTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'closed').length;
    const resolvedTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'resolved').length;
    const pendingReviewTickets = resolvedTickets; // resolved = chờ đánh giá
    const assignedTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'assigned').length;
    const newTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'new' || String(t.status).toLowerCase() === 'open').length;
    const cancelledTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'cancelled').length;
    const inProgressTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'in-progress' || String(t.status).toLowerCase() === 'in_progress').length;
    const acknowledgedTickets = adminTickets.filter(t => String(t.status).toLowerCase() === 'acknowledged').length;
    
    // Count overdue tickets - tickets quá hạn (có status OVERDUE từ backend HOẶC deadline < hiện tại AND chưa hoàn thành)
    const overdueTickets = adminTickets.filter(t => {
      // First check if backend already marked it as OVERDUE
      if (String(t.status).toLowerCase() === 'overdue') {
        return true;
      }
      
      // Also check if ticket was cancelled by system due to SLA
      const note = (t as any).note || '';
      if (String(t.status).toLowerCase() === 'cancelled' && 
          (note.includes('[CANCELLED BY SYSTEM]') || note.includes('exceeded SLA deadline'))) {
        return true;
      }
      
      // Otherwise check normal overdue logic
      const deadline = (t as any).resolveDeadline || (t as any).slaDeadline;
      const resolvedAt = (t as any).resolvedAt;
      return isTicketOverdueAndNotCompleted(deadline, t.status, resolvedAt);
    }).length;
    
    const totalFilteredCount = closedTickets + resolvedTickets + assignedTickets + newTickets + cancelledTickets + inProgressTickets + acknowledgedTickets + overdueTickets;
    console.log('📊 Status breakdown (filtered):', {
      closed: closedTickets,
      resolved: resolvedTickets,
      assigned: assignedTickets,
      new: newTickets,
      cancelled: cancelledTickets,
      inProgress: inProgressTickets,
      acknowledged: acknowledgedTickets,
      total: totalFilteredCount
    });

    // Tính phần trăm theo tổng số ticket đã filter
    const completedPercentage = totalFilteredCount > 0 ? Math.round((closedTickets / totalFilteredCount) * 100) : 0;
    const cancelledPercentage = totalFilteredCount > 0 ? Math.round((cancelledTickets / totalFilteredCount) * 100) : 0;

    // Chuẩn bị data hiển thị chi tiết từng trạng thái (kể cả khi value = 0)
    const statusData = [
      { name: 'Đã Quá Hạn', value: overdueTickets, color: '#ef4444', key: 'overdue', isHighlight: true },
      { name: 'Đã Hoàn thành', value: closedTickets, color: '#10b981', key: 'completed' },
      { name: 'Chờ đánh giá', value: pendingReviewTickets, color: '#8b5cf6', key: 'pending' },
      { name: 'Đã được giao', value: assignedTickets, color: '#eab308', key: 'assigned' },
      { name: 'Đang xử lý', value: inProgressTickets, color: '#f59e0b', key: 'in-progress' },
      { name: 'Mới tạo', value: newTickets, color: '#f97316', key: 'new' },
      { name: 'Đã hủy', value: cancelledTickets, color: '#ef4444', key: 'cancelled' },
    ]; // Show all statuses always

    // Data cho biểu đồ tròn: chỉ lấy các trạng thái có số lượng > 0
    const pieDataFiltered = statusData.filter(s => s.value > 0);
    const pieChartData = pieDataFiltered.length > 0 
      ? pieDataFiltered 
      : [{ name: 'Không có dữ liệu', value: 1, color: '#e5e7eb', key: 'empty' }];

    return {
      totalTickets: totalFilteredCount,
      completedTickets: closedTickets,
      pendingReviewTickets,
      assignedTickets,
      newTickets,
      cancelledTickets,
      inProgressTickets,
      acknowledgedTickets,
      overdueTickets,
      completedPercentage,
      cancelledPercentage,
      statusData,
      pieData: pieChartData,
      pieDataFiltered
    };
  }, [adminTickets]);

  // Thống kê theo Category: loại lỗi xuất hiện nhiều nhất trong khoảng thời gian đã chọn
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

  // Thống kê theo Phòng ban: phòng ban xử lý nhiều lỗi nhất
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Báo cáo Quản lý Tickets</h2>

      {/* Date Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lọc theo thời gian</h3>
        <div className="space-y-4">
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                dateFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                dateFilter === '7days'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                dateFilter === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => {
                setDateFilter('custom');
                setShowDatePicker(!showDatePicker);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                dateFilter === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tùy chỉnh
            </button>
          </div>

          {/* Unified Date Range Picker - Only show when custom is selected */}
          {dateFilter === 'custom' && showDatePicker && (
            <div className="mt-4 p-6 bg-white rounded-lg border border-gray-300">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Chọn khoảng ngày</h4>
              
              {/* Range Picker */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-center">
                <DayPicker
                  mode="range"
                  selected={{
                    from: customStartDate,
                    to: customEndDate,
                  }}
                  onSelect={(range) => {
                    if (range?.from) setCustomStartDate(range.from);
                    if (range?.to) setCustomEndDate(range.to);
                  }}
                  disabled={(date) => date > new Date()}
                  numberOfMonths={2}
                  defaultMonth={customStartDate || subDays(new Date(), 30)}
                  showOutsideDays={false}
                />
              </div>

              {/* Selected Range Display */}
              {customStartDate && customEndDate && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Khoảng thời gian:</span> {format(customStartDate, 'dd/MM/yyyy')} - {format(customEndDate, 'dd/MM/yyyy')}
                  </p>
                </div>
              )}

              {/* Close Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  ✓ Xong
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Total Tickets Statistics - All Statuses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Thống kê Tổng số Tickets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
          {/* Tổng số Tickets */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-xs text-blue-600 font-medium mb-1">Tổng số Tickets</div>
            <div className="text-3xl font-bold text-blue-900">{ticketStatusReport.totalTickets}</div>
          </div>

          {/* Quá hạn */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-md">
            <div className="text-xs text-red-600 font-medium mb-1">⚠️ Quá hạn</div>
            <div className="text-3xl font-bold text-red-900">{ticketStatusReport.overdueTickets}</div>
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
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
            <div className="text-xs text-gray-600 font-medium mb-1">Đã hủy</div>
            <div className="text-3xl font-bold text-gray-900">{ticketStatusReport.cancelledTickets}</div>
          </div>
        </div>
      </div>

      {/* Pie Chart - All Statuses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Tỷ lệ Tickets theo Trạng thái</h3>
        <div className="flex flex-col items-center">
          {ticketStatusReport.pieDataFiltered && ticketStatusReport.pieDataFiltered.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={ticketStatusReport.pieDataFiltered.map(item => ({
                      name: item.name,
                      value: item.value,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }: any) => {
                      const total = ticketStatusReport.totalTickets;
                      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                      return `${name} (${value} - ${percentage}%)`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ticketStatusReport.pieDataFiltered.map((item, index) => (
                      <Cell key={`cell-${index}`} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => {
                      const total = ticketStatusReport.totalTickets;
                      const percentage = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
                      return `${value} tickets (${percentage}%)`;
                    }}
                    contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Status Details Grid - Show ALL statuses including zeros */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
                {ticketStatusReport.statusData.map((item, index) => {
                  const percentage = ticketStatusReport.totalTickets > 0
                    ? Math.round((item.value / ticketStatusReport.totalTickets) * 100)
                    : 0;
                  const isHighlight = 'isHighlight' in item && item.isHighlight === true;
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg transition hover:shadow-lg ${isHighlight ? 'border-2 shadow-lg' : 'border-l-4'}`}
                      style={{ 
                        borderColor: item.color, 
                        backgroundColor: isHighlight ? item.color + '25' : item.color + '15',
                        boxShadow: isHighlight ? `0 4px 16px ${item.color}50` : 'none'
                      }}
                    >
                      <div className={`text-xs font-bold ${isHighlight ? 'uppercase tracking-widest' : 'font-semibold'}`} style={{ color: item.color }}>
                        {isHighlight && '🚨 '}{item.name}
                      </div>
                      <div className={`${isHighlight ? 'text-4xl' : 'text-3xl'} font-bold mt-2`} style={{ color: item.color }}>
                        {item.value}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Chưa có dữ liệu tickets trong khoảng thời gian này
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

