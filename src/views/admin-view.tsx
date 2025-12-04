import { useState, useMemo, useEffect } from 'react';
import type { User, Category, Department, Location, Ticket, Priority } from '../types';
import TicketDetailModal from '../components/ticket-detail-modal';
import {
  loadCategories, saveCategories,
  loadDepartments, saveDepartments,
  loadLocations, saveLocations,
  loadTickets, saveTickets,
  loadUsers, saveUsers
} from '../utils/localStorage';

interface AdminViewProps {
  currentUser: User;
}

type ActiveTab = 'categories' | 'departments' | 'locations' | 'tickets' | 'staff' | 'users';

const AdminView = ({ currentUser }: AdminViewProps) => {
  // Data state
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [departments, setDepartments] = useState<Department[]>(() => loadDepartments());
  const [locations, setLocations] = useState<Location[]>(() => loadLocations());
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  const [users, setUsers] = useState<User[]>(() => loadUsers());

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('tickets');
  const [showMembersSubmenu, setShowMembersSubmenu] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Save to localStorage
  useEffect(() => { saveCategories(categories); }, [categories]);
  useEffect(() => { saveDepartments(departments); }, [departments]);
  useEffect(() => { saveLocations(locations); }, [locations]);
  useEffect(() => { saveTickets(tickets); }, [tickets]);
  useEffect(() => { saveUsers(users); }, [users]);

  // Auto open submenu
  useEffect(() => {
    if (activeTab === 'staff' || activeTab === 'users') {
      setShowMembersSubmenu(true);
    }
  }, [activeTab]);

  // Filter admin's departments
  const adminDepartments = useMemo(() => {
    return departments.filter(dept => dept.adminId === currentUser.id);
  }, [departments, currentUser.id]);

  const adminDepartmentIds = useMemo(() => {
    return adminDepartments.map(dept => dept.id);
  }, [adminDepartments]);

  // Filter admin's categories
  const adminCategories = useMemo(() => {
    return categories.filter(cat => adminDepartmentIds.includes(cat.departmentId));
  }, [categories, adminDepartmentIds]);

  // Filter admin's tickets (exclude cancelled)
  const adminTickets = useMemo(() => {
    const categoryNameMap: Record<string, string[]> = {
      'wifi': ['WiFi/Mạng'],
      'equipment': ['Thiết bị'],
      'facility': ['Cơ sở vật chất', 'Điện nước', 'Khẩn cấp'],
      'classroom': ['Vệ sinh'],
      'other': ['Cơ sở vật chất', 'Vệ sinh'],
    };

    return tickets.filter(ticket => {
      if (ticket.status === 'cancelled') return false;
      
      const matchingCategoryNames = categoryNameMap[ticket.category] || [];
      const matchingCategories = categories.filter(cat => 
        matchingCategoryNames.includes(cat.name)
      );
      
      return matchingCategories.some(cat => 
        adminDepartmentIds.includes(cat.departmentId)
      );
    });
  }, [tickets, categories, adminDepartmentIds]);

  return (
    <div className="max-w-[1400px] mx-auto p-8">
      <div className="text-center mb-8">
        <span className="inline-block px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          Department Admin
        </span>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Quản lý phòng/bộ phận, cấu hình hệ thống và giám sát hoạt động
        </p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar */}
        <div className="w-72 bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-8">
          <h3 className="m-0 mb-6 text-base text-gray-900 font-semibold uppercase tracking-wide pb-4 border-b border-gray-200">
            Quản lý hệ thống
          </h3>
          <nav className="flex flex-col gap-1">
            <button
              className={`py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 ${
                activeTab === 'tickets'
                  ? 'bg-orange-50 text-orange-700 font-semibold border-l-4 border-orange-600'
                  : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('tickets')}
            >
              Quản lý Tickets
            </button>
            
            <div>
              <button
                className={`w-full py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 flex items-center justify-between ${
                  (activeTab === 'staff' || activeTab === 'users')
                    ? 'bg-orange-50 text-orange-700 font-semibold border-l-4 border-orange-600'
                    : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setShowMembersSubmenu(!showMembersSubmenu)}
              >
                <span>Quản lý thành viên</span>
                <span className={`transition-transform duration-200 text-xs ${showMembersSubmenu ? 'rotate-90' : ''}`}>
                  ▶
                </span>
              </button>
              {showMembersSubmenu && (
                <div className="ml-4 mt-1 flex flex-col gap-1">
                  <button
                    className={`py-2 px-4 rounded-md cursor-pointer text-xs text-left transition-all duration-200 ${
                      activeTab === 'staff'
                        ? 'bg-orange-100 text-orange-700 font-semibold border-l-2 border-orange-600'
                        : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setActiveTab('staff')}
                  >
                    Quản lý Staff
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md cursor-pointer text-xs text-left transition-all duration-200 ${
                      activeTab === 'users'
                        ? 'bg-orange-100 text-orange-700 font-semibold border-l-2 border-orange-600'
                        : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setActiveTab('users')}
                  >
                    Quản lý Người dùng
                  </button>
                </div>
              )}
            </div>
            
            <button
              className={`py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 ${
                activeTab === 'categories'
                  ? 'bg-orange-50 text-orange-700 font-semibold border-l-4 border-orange-600'
                  : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('categories')}
            >
              Quản lý Danh mục
            </button>
            
            <button
              className={`py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 ${
                activeTab === 'departments'
                  ? 'bg-orange-50 text-orange-700 font-semibold border-l-4 border-orange-600'
                  : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('departments')}
            >
              Quản lý Bộ phận
            </button>
            
            <button
              className={`py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 ${
                activeTab === 'locations'
                  ? 'bg-orange-50 text-orange-700 font-semibold border-l-4 border-orange-600'
                  : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('locations')}
            >
              Quản lý Địa điểm
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl p-8 shadow-sm">
          {activeTab === 'tickets' && (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Danh sách Tickets ({adminTickets.length})
              </h3>
              <div className="text-gray-600">
                Tickets content here...
              </div>
            </>
          )}
          
          {activeTab === 'categories' && (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Danh sách Category ({adminCategories.length})
              </h3>
              <div className="text-gray-600">
                Categories content here...
              </div>
            </>
          )}
          
          {activeTab === 'departments' && (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Danh sách Bộ phận ({adminDepartments.length})
              </h3>
              <div className="text-gray-600">
                Departments content here...
              </div>
            </>
          )}
          
          {activeTab === 'locations' && (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Danh sách Địa điểm ({locations.length})
              </h3>
              <div className="text-gray-600">
                Locations content here...
              </div>
            </>
          )}
          
          {activeTab === 'staff' && (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Quản lý Staff
              </h3>
              <div className="text-gray-600">
                Staff management content here...
              </div>
            </>
          )}
          
          {activeTab === 'users' && (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Quản lý Người dùng
              </h3>
              <div className="text-gray-600">
                Users management content here...
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};

export default AdminView;