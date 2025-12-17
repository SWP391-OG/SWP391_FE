import { useMemo } from 'react';
import type { Ticket, Category, Department, User } from '../../types';

interface ReportsPageProps {
  tickets: Ticket[];
  categories: Category[];
  departments: Department[];
  users: User[];
  adminDepartments: Department[];
}

const ReportsPage = ({
  tickets,
  categories,
  users,
  adminDepartments,
}: ReportsPageProps) => {
  // Filter tickets by admin's departments
  const adminDepartmentIds = adminDepartments.map(d => d.id);
  const adminTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const category = categories.find(c => c.id === ticket.categoryId);
      return category && adminDepartmentIds.includes(category.departmentId);
    });
  }, [tickets, categories, adminDepartmentIds]);

  // SLA Report Calculations
  const slaReport = useMemo(() => {
    const totalTickets = adminTickets.length;
    const resolvedTickets = adminTickets.filter(t => 
      t.status === 'resolved' || t.status === 'closed'
    );
    const overdueTickets = adminTickets.filter(t => 
      t.slaTracking?.isOverdue && (t.status !== 'resolved' && t.status !== 'closed')
    );
    const onTimeTickets = resolvedTickets.filter(t => 
      t.slaTracking?.resolvedAt && 
      new Date(t.slaTracking.resolvedAt) <= new Date(t.slaTracking.deadline)
    );
    const lateTickets = resolvedTickets.filter(t => 
      t.slaTracking?.resolvedAt && 
      new Date(t.slaTracking.resolvedAt) > new Date(t.slaTracking.deadline)
    );

    // Calculate average resolution time
    const resolutionTimes = resolvedTickets
      .map(t => t.slaTracking?.resolutionTime)
      .filter((time): time is number => time !== undefined);
    const avgResolutionTime = resolutionTimes.length > 0
      ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length)
      : 0;

    // Calculate average response time
    const responseTimes = adminTickets
      .map(t => t.slaTracking?.responseTime)
      .filter((time): time is number => time !== undefined);
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    const onTimeRate = resolvedTickets.length > 0
      ? Math.round((onTimeTickets.length / resolvedTickets.length) * 100)
      : 0;

    return {
      totalTickets,
      resolvedTickets: resolvedTickets.length,
      overdueTickets: overdueTickets.length,
      onTimeTickets: onTimeTickets.length,
      lateTickets: lateTickets.length,
      onTimeRate,
      avgResolutionTime, // in minutes
      avgResponseTime, // in minutes
    };
  }, [adminTickets]);

  // Ticket Volume Report
  const ticketVolumeReport = useMemo(() => {
    // By Category
    const byCategory: Record<string, number> = {};
    adminTickets.forEach(ticket => {
      const category = categories.find(c => c.id === ticket.categoryId);
      const categoryName = category?.categoryName || 'Không xác định';
      byCategory[categoryName] = (byCategory[categoryName] || 0) + 1;
    });

    // By Priority
    const byPriority: Record<string, number> = {
      'urgent': 0,
      'high': 0,
      'medium': 0,
      'low': 0,
    };
    adminTickets.forEach(ticket => {
      if (ticket.priority) {
        byPriority[ticket.priority] = (byPriority[ticket.priority] || 0) + 1;
      }
    });

    // By Status
    const byStatus: Record<string, number> = {
      'open': 0,
      'acknowledged': 0,
      'in-progress': 0,
      'resolved': 0,
      'closed': 0,
      'cancelled': 0,
    };
    adminTickets.forEach(ticket => {
      byStatus[ticket.status] = (byStatus[ticket.status] || 0) + 1;
    });

    return {
      byCategory,
      byPriority,
      byStatus,
    };
  }, [adminTickets, categories]);

  // Staff Performance Report
  const staffPerformanceReport = useMemo(() => {
    const staffMap: Record<string, {
      staff: User;
      totalTickets: number;
      resolvedTickets: number;
      onTimeTickets: number;
      lateTickets: number;
      avgResolutionTime: number;
    }> = {};

    // Get all staff from admin departments
    const staffUsers = users.filter(u => 
      u.role === 'it-staff' || u.role === 'facility-staff'
    );

    staffUsers.forEach(staff => {
      const staffTickets = adminTickets.filter(t => 
        t.assignedToId === staff.id || t.assignedTo === staff.id
      );
      const resolvedStaffTickets = staffTickets.filter(t => 
        t.status === 'resolved' || t.status === 'closed'
      );
      const onTimeStaffTickets = resolvedStaffTickets.filter(t => 
        t.slaTracking?.resolvedAt && 
        new Date(t.slaTracking.resolvedAt) <= new Date(t.slaTracking.deadline)
      );
      const lateStaffTickets = resolvedStaffTickets.filter(t => 
        t.slaTracking?.resolvedAt && 
        new Date(t.slaTracking.resolvedAt) > new Date(t.slaTracking.deadline)
      );

      const resolutionTimes = resolvedStaffTickets
        .map(t => t.slaTracking?.resolutionTime)
        .filter((time): time is number => time !== undefined);
      const avgResolutionTime = resolutionTimes.length > 0
        ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length)
        : 0;

      if (staffTickets.length > 0) {
        staffMap[staff.id] = {
          staff,
          totalTickets: staffTickets.length,
          resolvedTickets: resolvedStaffTickets.length,
          onTimeTickets: onTimeStaffTickets.length,
          lateTickets: lateStaffTickets.length,
          avgResolutionTime,
        };
      }
    });

    return Object.values(staffMap);
  }, [adminTickets, users]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours} giờ ${mins > 0 ? mins + ' phút' : ''}`;
    const days = Math.floor(hours / 24);
    const hrs = hours % 24;
    return `${days} ngày ${hrs > 0 ? hrs + ' giờ' : ''}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Báo cáo</h2>

      {/* SLA Report */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Báo cáo SLA</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Tổng số tickets</div>
            <div className="text-2xl font-bold text-blue-900">{slaReport.totalTickets}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">chờ đánh giá</div>
            <div className="text-2xl font-bold text-blue-900">{slaReport.resolvedTickets}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-sm text-red-600 font-medium mb-1">Quá hạn</div>
            <div className="text-2xl font-bold text-red-900">{slaReport.overdueTickets}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-600 font-medium mb-1">Tỷ lệ đúng hạn</div>
            <div className="text-2xl font-bold text-purple-900">{slaReport.onTimeRate}%</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 font-medium mb-1">Thời gian xử lý trung bình</div>
            <div className="text-xl font-bold text-gray-900">
              {formatTime(slaReport.avgResolutionTime)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 font-medium mb-1">Thời gian phản hồi trung bình</div>
            <div className="text-xl font-bold text-gray-900">
              {formatTime(slaReport.avgResponseTime)}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">Đúng hạn</div>
            <div className="text-xl font-bold text-green-900">{slaReport.onTimeTickets}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="text-sm text-orange-600 font-medium mb-1">Trễ hạn</div>
            <div className="text-xl font-bold text-orange-900">{slaReport.lateTickets}</div>
          </div>
        </div>
      </div>

      {/* Ticket Volume Report */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Báo cáo Khối lượng Tickets</h3>
        
        {/* By Category */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Theo Danh mục</h4>
          <div className="space-y-2">
            {Object.entries(ticketVolumeReport.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">{category}</span>
                  <span className="text-gray-900 font-bold">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* By Priority */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Theo Mức độ Ưu tiên</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(ticketVolumeReport.byPriority).map(([priority, count]) => {
              const priorityLabels: Record<string, { label: string; color: string }> = {
                'urgent': { label: 'Khẩn cấp', color: 'bg-red-100 text-red-800 border-red-300' },
                'high': { label: 'Cao', color: 'bg-orange-100 text-orange-800 border-orange-300' },
                'medium': { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
                'low': { label: 'Thấp', color: 'bg-green-100 text-green-800 border-green-300' },
              };
              const { label, color } = priorityLabels[priority] || { label: priority, color: 'bg-gray-100 text-gray-800 border-gray-300' };
              return (
                <div key={priority} className={`p-3 rounded-lg border ${color}`}>
                  <div className="text-sm font-medium mb-1">{label}</div>
                  <div className="text-2xl font-bold">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Status */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Theo Trạng thái</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(ticketVolumeReport.byStatus).map(([status, count]) => {
              const statusLabels: Record<string, { label: string; color: string }> = {
                'open': { label: 'Mở', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                'acknowledged': { label: 'Đã xác nhận', color: 'bg-purple-100 text-purple-800 border-purple-300' },
                'in-progress': { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
                'resolved': { label: 'chờ đánh giá', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                'closed': { label: 'Đã hoàn thành', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                'cancelled': { label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-300' },
              };
              const { label, color } = statusLabels[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-300' };
              return (
                <div key={status} className={`p-3 rounded-lg border ${color}`}>
                  <div className="text-sm font-medium mb-1">{label}</div>
                  <div className="text-2xl font-bold">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Staff Performance Report */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Báo cáo Hiệu suất Staff</h3>
        {staffPerformanceReport.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có dữ liệu hiệu suất staff
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Staff</th>
                  <th className="text-center p-3 text-sm font-semibold text-gray-700">Tổng tickets</th>
                  <th className="text-center p-3 text-sm font-semibold text-blue-700">chờ đánh giá</th>
                  <th className="text-center p-3 text-sm font-semibold text-gray-700">Đúng hạn</th>
                  <th className="text-center p-3 text-sm font-semibold text-gray-700">Trễ hạn</th>
                  <th className="text-center p-3 text-sm font-semibold text-gray-700">Tỷ lệ đúng hạn</th>
                  <th className="text-center p-3 text-sm font-semibold text-gray-700">Thời gian xử lý TB</th>
                </tr>
              </thead>
              <tbody>
                {staffPerformanceReport.map(({ staff, totalTickets, resolvedTickets, onTimeTickets, lateTickets, avgResolutionTime }) => {
                  const onTimeRate = resolvedTickets > 0
                    ? Math.round((onTimeTickets / resolvedTickets) * 100)
                    : 0;
                  return (
                    <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-900 font-medium">{staff.fullName}</td>
                      <td className="p-3 text-center text-gray-700">{totalTickets}</td>
                      <td className="p-3 text-center text-gray-700">{resolvedTickets}</td>
                      <td className="p-3 text-center text-green-600 font-semibold">{onTimeTickets}</td>
                      <td className="p-3 text-center text-red-600 font-semibold">{lateTickets}</td>
                      <td className="p-3 text-center">
                        <span className={`font-semibold ${onTimeRate >= 80 ? 'text-green-600' : onTimeRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {onTimeRate}%
                        </span>
                      </td>
                      <td className="p-3 text-center text-gray-700 text-sm">{formatTime(avgResolutionTime)}</td>
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

