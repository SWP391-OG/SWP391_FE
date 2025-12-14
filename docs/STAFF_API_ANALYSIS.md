# Phân tích API cho Quản lý Staff

**Ngày tạo:** 2024-12-15  
**Mục đích:** Kiểm tra xem các chức năng hiển thị, chỉnh sửa, và thêm staff đã phù hợp với Swagger API chưa

---

## 📋 Tổng quan

Staff management sử dụng User API (`/api/User`) với role là `it-staff` (roleId: 2) hoặc `facility-staff` (roleId: 5).

---

## 1. Hiển thị danh sách Staff

### Frontend Implementation

**Component:** `StaffList.tsx`  
**Data Source:** `adminStaffUsers` từ `useUsers` hook  
**Filter:** Lọc users có role là `it-staff` hoặc `facility-staff`

**API Call:**
```typescript
// userService.ts
GET /api/User
```

**Response Format (Frontend mong đợi):**
```typescript
{
  status: boolean;
  message: string;
  data: UserDto[];  // Array of users
  errors: string[];
}
```

**UserDto Structure:**
```typescript
{
  userCode: string;
  fullName: string;
  passwordHash: string;  // Not used in frontend
  email: string;
  phoneNumber: string | null;
  roleId: number;  // 2 = it-staff, 5 = facility-staff
  departmentId: number | null;
  status: string;  // "ACTIVE" | "INACTIVE" | "BANNED"
  createdAt: string | null;
}
```

**Frontend Mapping:**
- `userCode` → `id` và `userCode`
- `email` → `username` (frontend only)
- `roleId` → `role` (mapped via ROLE_ID_MAP)
- `status` → `status` (lowercase: 'active' | 'inactive' | 'banned')
- `departmentId` → `departmentId` (converted to string)

### ✅ Checklist với Swagger

- [ ] Endpoint path: `GET /api/User` (hoặc `GET /api/Users`)
- [ ] Response format khớp với Swagger
- [ ] UserDto fields khớp:
  - [ ] `userCode: string`
  - [ ] `fullName: string`
  - [ ] `email: string`
  - [ ] `phoneNumber: string | null`
  - [ ] `roleId: number`
  - [ ] `departmentId: number | null`
  - [ ] `status: string` (ACTIVE/INACTIVE/BANNED)
  - [ ] `createdAt: string | null`

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

## 2. Thêm Staff mới

### Frontend Implementation

**Component:** `StaffForm.tsx`  
**Handler:** `onSubmit` trong `admin-page.tsx`

**Form Fields:**
- `username` (string) - Tên đăng nhập (frontend only, không gửi lên API)
- `password` (string) - Mật khẩu
- `fullName` (string) - Họ tên
- `email` (string) - Email
- `phoneNumber` (string, optional) - Số điện thoại
- `role` (UserRole) - Vai trò: 'it-staff' hoặc 'facility-staff'
- `departmentId` (string) - Bộ phận (selected from dropdown)

**API Call:**
```typescript
// userService.ts
POST /api/User
```

**Request Body (Frontend gửi):**
```typescript
{
  userCode: string;        // Từ field "username" trong form
  fullName: string;        // Từ field "fullName"
  passwordHash: string;     // Từ field "password" (backend sẽ hash)
  email: string;            // Từ field "email"
  phoneNumber?: string;    // Từ field "phoneNumber" (optional)
  roleId: number;           // Mapped từ role: 2 (it-staff) hoặc 5 (facility-staff)
  departmentId?: number;   // Parsed từ string sang number
  status: "ACTIVE";         // Mặc định là ACTIVE
}
```

**Code trong admin-page.tsx:**
```typescript
const onSubmit = async () => {
  if (editingStaff) {
    // Update logic
  } else {
    // Create logic
    try {
      // Parse departmentId từ string sang number
      const deptId = staffFormData.departmentId 
        ? parseInt(staffFormData.departmentId, 10) 
        : undefined;
      
      await createUser({
        userCode: staffFormData.username,  // ⚠️ Dùng username làm userCode
        fullName: staffFormData.fullName,
        password: staffFormData.password,
        email: staffFormData.email,
        phoneNumber: staffFormData.phoneNumber || undefined,
        role: staffFormData.role,
        departmentId: deptId,
      });
      
      loadUsers();
      setIsFormOpen(false);
    } catch (error) {
      alert('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
};
```

### ⚠️ Vấn đề tiềm ẩn

1. **userCode mapping:** Frontend dùng `username` field để làm `userCode`. Cần đảm bảo Swagger API chấp nhận `userCode` là string và có thể là bất kỳ giá trị nào (không chỉ email).

2. **passwordHash:** Frontend gửi `passwordHash` nhưng giá trị thực tế là plain password. Backend có hash password không?

3. **departmentId:** Frontend parse từ string sang number. Cần đảm bảo departmentId là number hoặc null trong Swagger.

### ✅ Checklist với Swagger

- [ ] Endpoint path: `POST /api/User` (hoặc `POST /api/Users`)
- [ ] Request body fields:
  - [ ] `userCode: string` (required)
  - [ ] `fullName: string` (required)
  - [ ] `passwordHash: string` (required) - hoặc `password: string`?
  - [ ] `email: string` (required)
  - [ ] `phoneNumber: string` (optional)
  - [ ] `roleId: number` (required) - 2 hoặc 5 cho staff
  - [ ] `departmentId: number` (optional)
  - [ ] `status: string` (required) - "ACTIVE" mặc định
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

## 3. Chỉnh sửa Staff

### Frontend Implementation

**Component:** `StaffForm.tsx` (khi `editingStaff` không null)  
**Handler:** `onSubmit` trong `admin-page.tsx`

**Form Fields (khi edit):**
- `username` (disabled) - Không thể sửa userCode
- `password` (empty) - Không hiển thị password cũ
- `fullName` (string) - Có thể sửa
- `email` (string) - Có thể sửa
- `phoneNumber` (string, optional) - Có thể sửa
- `role` (UserRole) - Có thể sửa
- `departmentId` (string) - Có thể sửa

**API Call:**
```typescript
// userService.ts
PUT /api/User/{userCode}
```

**Request Body (Frontend gửi):**
```typescript
{
  fullName?: string;       // Từ field "fullName"
  phoneNumber?: string;    // Từ field "phoneNumber"
  roleId?: number;         // Mapped từ role
  departmentId?: number;   // Parsed từ string sang number
  status?: string;         // Từ onToggleStatus (nếu có)
}
```

**Code trong admin-page.tsx:**
```typescript
const onSubmit = async () => {
  if (editingStaff) {
    try {
      // Parse departmentId từ string sang number
      const deptId = staffFormData.departmentId 
        ? parseInt(staffFormData.departmentId, 10) 
        : undefined;
      
      await updateUser(editingStaff.userCode || editingStaff.id, {
        fullName: staffFormData.fullName,
        phoneNumber: staffFormData.phoneNumber || undefined,
        role: staffFormData.role,
        departmentId: deptId,
        // status không được update từ form, chỉ từ onToggleStatus
      });
      
      loadUsers();
      setIsFormOpen(false);
    } catch (error) {
      alert('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
};
```

### ⚠️ Vấn đề tiềm ẩn

1. **Path parameter:** Frontend dùng `PUT /api/User/{userCode}`. Swagger có thể dùng path parameter hoặc query parameter (`?code=`).

2. **userCode:** Frontend dùng `editingStaff.userCode || editingStaff.id`. Cần đảm bảo userCode luôn có giá trị.

3. **Optional fields:** Tất cả fields trong update request đều optional. Cần đảm bảo Swagger cho phép điều này.

4. **Status update:** Status được update riêng qua `onToggleStatus`, không qua form. Cần kiểm tra xem có endpoint riêng cho status update không.

### ✅ Checklist với Swagger

- [ ] Endpoint path: `PUT /api/User/{userCode}` (hoặc `PUT /api/Users/{userCode}` hoặc `PUT /api/User?code={userCode}`)
- [ ] Path parameter: `{userCode}` vs Query parameter: `?code=`
- [ ] Request body fields (tất cả optional):
  - [ ] `fullName?: string`
  - [ ] `phoneNumber?: string`
  - [ ] `roleId?: number`
  - [ ] `departmentId?: number`
  - [ ] `status?: string` (ACTIVE/INACTIVE/BANNED)
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

## 4. Các chức năng khác

### 4.1. Khóa/Mở khóa tài khoản

**Handler:** `onToggleStatus` trong `StaffForm.tsx`

**API Call:**
```typescript
// userService.ts
PUT /api/User/{userCode}
```

**Request Body:**
```typescript
{
  status: "INACTIVE" | "ACTIVE"  // Toggle giữa active và inactive
}
```

**Code trong admin-page.tsx:**
```typescript
onToggleStatus={async () => {
  if (!editingStaff) return;
  
  const newStatus = editingStaff.status === 'active' ? 'inactive' : 'active';
  
  try {
    await updateUser(editingStaff.userCode || editingStaff.id, {
      status: newStatus,
    });
    loadUsers();
  } catch (error) {
    alert('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}}
```

### 4.2. Reset Password

**Handler:** `onResetPassword` trong `StaffForm.tsx`

**Status:** ⚠️ Chưa có API endpoint riêng. Hiện tại chỉ hiển thị alert "Tính năng reset password đang được phát triển".

**Cần kiểm tra Swagger:**
- [ ] Có endpoint riêng cho reset password không? (ví dụ: `POST /api/User/{userCode}/reset-password`)
- [ ] Hoặc có thể update password qua `PUT /api/User/{userCode}` với field `passwordHash`?

---

## 📊 Tổng kết

### Endpoints được sử dụng:

1. **GET /api/User** - Lấy danh sách users (filter staff ở frontend)
2. **POST /api/User** - Tạo staff mới
3. **PUT /api/User/{userCode}** - Cập nhật staff (thông tin + status)

### Fields mapping:

| Frontend Form | API Request | Notes |
|--------------|-------------|-------|
| `username` | `userCode` | ⚠️ Cần kiểm tra xem Swagger có yêu cầu format đặc biệt không |
| `password` | `passwordHash` | ⚠️ Backend có hash không? |
| `fullName` | `fullName` | ✅ |
| `email` | `email` | ✅ |
| `phoneNumber` | `phoneNumber` | ✅ |
| `role` | `roleId` | ✅ Mapped: it-staff=2, facility-staff=5 |
| `departmentId` (string) | `departmentId` (number) | ✅ Parsed từ string sang number |

### ⚠️ Các điểm cần kiểm tra với Swagger:

1. **Endpoint paths:** Số ít (`/User`) vs số nhiều (`/Users`)
2. **Path vs Query parameters:** `/{userCode}` vs `?code=`
3. **Password field:** `passwordHash` vs `password`
4. **userCode format:** Có yêu cầu format đặc biệt không? (ví dụ: phải là email, hoặc phải có prefix)
5. **Reset password:** Có endpoint riêng không?

---

## 🔍 Next Steps

1. Mở Swagger UI và kiểm tra User API endpoints
2. So sánh với checklist trên
3. Ghi chú các khác biệt
4. Cập nhật code nếu cần

