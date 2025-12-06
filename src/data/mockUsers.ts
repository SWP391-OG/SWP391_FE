import type { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-001',
    username: 'student',
    password: 'student123',
    fullName: 'Nguyễn Văn A',
    email: 'studentA@fpt.edu.vn',
    role: 'student',
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'user-002',
    username: 'itstaff',
    password: 'itstaff123',
    fullName: 'Trần Thị B',
    email: 'tranb@fpt.edu.vn',
    role: 'it-staff',
    status: 'active',
    createdAt: '2024-01-14T08:00:00Z',
  },
  {
    id: 'user-003',
    username: 'facilitystaff',
    password: 'facility123',
    fullName: 'Lê Văn C',
    email: 'lec@fpt.edu.vn',
    role: 'facility-staff',
    status: 'active',
    createdAt: '2024-01-13T08:00:00Z',
  },
  {
    id: 'user-004',
    username: 'admin',
    password: 'admin123',
    fullName: 'Phạm Thị D',
    email: 'phamd@fpt.edu.vn',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-12T08:00:00Z',
  },
];

export const authenticateUser = (username: string, password: string): User | null => {
  const user = mockUsers.find(
    (u) => u.username === username && u.password === password
  );
  return user || null;
};

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

interface RegisterResult {
  success: boolean;
  message?: string;
  user?: User;
}

export const registerUser = (data: RegisterData): RegisterResult => {
  // Check if email already exists
  const emailExists = mockUsers.some((u) => u.email === data.email);
  if (emailExists) {
    return {
      success: false,
      message: 'Email đã được sử dụng!',
    };
  }

  // Generate username from email (part before @)
  const baseUsername = data.email.split('@')[0];
  let username = baseUsername;
  let counter = 1;

  // Ensure username is unique
  while (mockUsers.some((u) => u.username === username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    password: data.password,
    fullName: data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    role: 'student', // Default role for new registrations
    status: 'active',
  };

  // Add to mockUsers array
  mockUsers.push(newUser);

  return {
    success: true,
    message: 'Đăng ký thành công!',
    user: newUser,
  };
};

interface ResetPasswordResult {
  success: boolean;
  message?: string;
}

export const resetPassword = (email: string, newPassword: string): ResetPasswordResult => {
  // Find user by email
  const userIndex = mockUsers.findIndex((u) => u.email === email);
  
  if (userIndex === -1) {
    return {
      success: false,
      message: 'Email không tồn tại trong hệ thống!',
    };
  }

  // Update password
  mockUsers[userIndex].password = newPassword;

  return {
    success: true,
    message: 'Đặt lại mật khẩu thành công!',
  };
};

interface UpdateUserData {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
}

interface UpdateUserResult {
  success: boolean;
  message?: string;
  user?: User;
}

export const updateUser = (userId: string, data: UpdateUserData): UpdateUserResult => {
  // Find user by id
  const userIndex = mockUsers.findIndex((u) => u.id === userId);
  
  if (userIndex === -1) {
    return {
      success: false,
      message: 'Người dùng không tồn tại!',
    };
  }

  // Check if email is being changed and already exists
  if (data.email && data.email !== mockUsers[userIndex].email) {
    const emailExists = mockUsers.some((u) => u.email === data.email && u.id !== userId);
    if (emailExists) {
      return {
        success: false,
        message: 'Email đã được sử dụng bởi người dùng khác!',
      };
    }
  }

  // Update user data
  if (data.fullName !== undefined) {
    mockUsers[userIndex].fullName = data.fullName;
  }
  if (data.phoneNumber !== undefined) {
    mockUsers[userIndex].phoneNumber = data.phoneNumber;
  }
  if (data.email !== undefined) {
    mockUsers[userIndex].email = data.email;
  }

  return {
    success: true,
    message: 'Cập nhật thông tin thành công!',
    user: mockUsers[userIndex],
  };
};

