import { useState } from 'react';
import type { Department, Room } from '../types';
import { mockDepartments, mockRooms } from '../data/mockData';
import DepartmentManagement from '../components/department-management';
import RoomManagement from '../components/room-management';

type TabType = 'departments' | 'rooms';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('departments');
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);

  const handleAddDepartment = (dept: Omit<Department, 'id' | 'createdAt'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDepartments([...departments, newDept]);
  };

  const handleUpdateDepartment = (id: string, dept: Omit<Department, 'id' | 'createdAt'>) => {
    setDepartments(departments.map(d => 
      d.id === id ? { ...d, ...dept } : d
    ));
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
    setRooms(rooms.filter(r => r.departmentId !== id));
  };

  const handleAddRoom = (room: Omit<Room, 'id' | 'createdAt'>) => {
    const newRoom: Room = {
      ...room,
      id: `room-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRooms([...rooms, newRoom]);
  };

  const handleUpdateRoom = (id: string, room: Omit<Room, 'id' | 'createdAt'>) => {
    setRooms(rooms.map(r => 
      r.id === id ? { ...r, ...room } : r
    ));
  };

  const handleDeleteRoom = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8">
      <div className="mb-8 text-center">
        <div className="inline-block px-6 py-2 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          Department Admin
        </div>
        <h2 className="text-2xl my-2 text-gray-800">Admin Dashboard</h2>
        <p className="text-base text-gray-500 max-w-3xl mx-auto my-2 leading-relaxed">
          Chào mừng quản trị viên! Quản lý phòng/bộ phận, cấu hình hệ thống và giám sát hoạt động.
        </p>
      </div>

      <div className="flex gap-4 mb-8 border-b-2 border-gray-200">
        <button
          className={`py-4 px-6 border-none bg-transparent text-base font-medium cursor-pointer border-b-[3px] transition-all duration-300 ease-in-out relative -bottom-0.5 ${
            activeTab === 'departments'
              ? 'text-orange-500 font-semibold border-orange-500'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('departments')}
        >
          📋 Quản lý Bộ phận
        </button>
        <button
          className={`py-4 px-6 border-none bg-transparent text-base font-medium cursor-pointer border-b-[3px] transition-all duration-300 ease-in-out relative -bottom-0.5 ${
            activeTab === 'rooms'
              ? 'text-orange-500 font-semibold border-orange-500'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('rooms')}
        >
          🏢 Quản lý Phòng
        </button>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm">
        {activeTab === 'departments' && (
          <DepartmentManagement
            departments={departments}
            onAdd={handleAddDepartment}
            onUpdate={handleUpdateDepartment}
            onDelete={handleDeleteDepartment}
          />
        )}
        {activeTab === 'rooms' && (
          <RoomManagement
            rooms={rooms}
            departments={departments}
            onAdd={handleAddRoom}
            onUpdate={handleUpdateRoom}
            onDelete={handleDeleteRoom}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPage;

