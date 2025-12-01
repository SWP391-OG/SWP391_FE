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

  const styles = {
    page: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
    },
    header: {
      marginBottom: '2rem',
      textAlign: 'center' as const,
    },
    badge: {
      display: 'inline-block',
      padding: '0.5rem 1.5rem',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: 600,
      marginBottom: '1rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: 'white',
    },
    title: {
      fontSize: '2rem',
      margin: '0.5rem 0',
      color: '#1f2937',
    },
    description: {
      fontSize: '1rem',
      color: '#6b7280',
      maxWidth: '800px',
      margin: '0.5rem auto',
      lineHeight: 1.6,
    },
    tabs: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      borderBottom: '2px solid #e5e7eb',
    },
    tabBtn: {
      padding: '1rem 1.5rem',
      border: 'none',
      background: 'transparent',
      color: '#6b7280',
      fontSize: '1rem',
      fontWeight: 500,
      cursor: 'pointer',
      borderBottom: '3px solid transparent',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      bottom: '-2px',
    },
    tabBtnActive: {
      padding: '1rem 1.5rem',
      border: 'none',
      background: 'transparent',
      color: '#f97316',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      borderBottom: '3px solid #f97316',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      bottom: '-2px',
    },
    content: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
  };

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
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.badge}>Department Admin</div>
        <h2 style={styles.title}>Admin Dashboard</h2>
        <p style={styles.description}>
          Chào mừng quản trị viên! Quản lý phòng/bộ phận, cấu hình hệ thống và giám sát hoạt động.
        </p>
      </div>

      <div style={styles.tabs}>
        <button
          style={activeTab === 'departments' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => setActiveTab('departments')}
        >
          📋 Quản lý Bộ phận
        </button>
        <button
          style={activeTab === 'rooms' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => setActiveTab('rooms')}
        >
          🏢 Quản lý Phòng
        </button>
      </div>

      <div style={styles.content}>
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

