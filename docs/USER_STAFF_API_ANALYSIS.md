# Phân tích Quản lý Thành viên (Staff & Student) - So sánh Frontend với API

## 📋 Tình trạng hiện tại

### ✅ Đã hoạt động
- **GET `/api/User`** - Lấy danh sách users ✅
- **userService** - Đã implement đầy đủ create, update, delete ✅
- **useUsers Hook** - Đã gọi API thực tế ✅

### ⚠️ Cần kiểm tra và sửa
- **StaffForm** - Form data có một số vấn đề
- **UserForm** - Chỉ có view mode, không có edit mode
- **admin-page.tsx** - Logic submit có một số vấn đề

---

## 🔍 Phân tích chi tiết

### 1. API Request/Response Format

**UserRequestDto (POST /api/User):**
```typescript
{
  userCode: string;        // REQUIRED
  fullName: string;        // REQUIRED
  passwordHash: string;    // REQUIRED (frontend gửi password, backend hash)
  email: string;           // REQUIRED
  phoneNumber?: string;    // Optional
  roleId: number;          // REQUIRED (1=admin, 2=it-staff, 3=student, 5=facility-staff)
  departmentId?: number;   // Optional (required cho staff)
  status: string;          // REQUIRED ("ACTIVE")
}
```

**UserUpdateDto (PUT /api/User/{userCode}):**
```typescript
{
  fullName?: string;
  phoneNumber?: string;
  roleId?: number;
  departmentId?: number;
  status?: string;         // "ACTIVE" | "INACTIVE" | "BANNED"
}
```

**Lưu ý:** API **KHÔNG** hỗ trợ update password qua PUT. Cần endpoint riêng hoặc API khác.

---

### 2. StaffForm Issues

**Form data hiện tại:**
```typescript
{
  username: string;        // → dùng làm userCode ✅
  password: string;        // → gửi lên API ✅
  fullName: string;        // ✅
  email: string;           // ✅
  role: UserRole;          // → cần convert sang roleId ✅
  departmentId: string;    // ❌ API cần number, form có string
}
```

**Vấn đề:**
1. ❌ `departmentId` là string, nhưng API cần number
2. ❌ Khi update: `phoneNumber: staffFormData.email` - SAI! Email không phải phoneNumber
3. ❌ `onResetPassword` gọi `updateUser` với password - API không hỗ trợ

---

### 3. UserForm Issues

**Form data hiện tại:**
```typescript
{
  username: string;        // → dùng làm userCode ✅
  password: string;        // ✅
  fullName: string;        // ✅
  email: string;           // ✅
}
```

**Vấn đề:**
1. ⚠️ UserForm chỉ có view mode khi edit - không có edit mode
2. ✅ Form data structure đúng cho create

---

### 4. admin-page.tsx Issues

**Staff submit logic:**
```typescript
// Create - ✅ Đúng
await createUser({
  userCode: staffFormData.username,
  fullName: staffFormData.fullName,
  password: staffFormData.password,
  email: staffFormData.email,
  phoneNumber: '', // Optional
  role: staffFormData.role,
  departmentId: parseInt(staffFormData.departmentId), // ✅ Parse sang number
});

// Update - ⚠️ Có vấn đề
await updateUser(editingStaff.userCode || editingStaff.id, {
  fullName: staffFormData.fullName,
  phoneNumber: staffFormData.email, // ❌ SAI - email không phải phoneNumber
  role: staffFormData.role,
  departmentId: parseInt(staffFormData.departmentId),
});
```

**User submit logic:**
```typescript
// Create - ✅ Đúng
await createUser({
  userCode: userFormData.username,
  fullName: userFormData.fullName,
  password: userFormData.password,
  email: userFormData.email,
  role: 'student',
});

// Update - ⚠️ Chỉ update fullName
await updateUser(editingUser.userCode || editingUser.id, {
  fullName: userFormData.fullName, // Chỉ có fullName
});
```

**Reset Password:**
```typescript
// ❌ SAI - API không hỗ trợ update password qua PUT
updateUser(editingStaff.id, { password: newPassword.trim() });
```

---

## 🛠️ Những gì cần sửa

### 1. **StaffForm.tsx**
- ✅ Form structure đã đúng
- ⚠️ Cần thêm field `phoneNumber` (optional)
- ⚠️ Cần kiểm tra dropdown department có hoạt động không

### 2. **admin-page.tsx - Staff logic**
- ❌ Sửa `phoneNumber: staffFormData.email` → `phoneNumber: staffFormData.phoneNumber || undefined`
- ❌ Xóa hoặc comment `onResetPassword` (API không hỗ trợ)
- ✅ Giữ logic parse `departmentId` sang number

### 3. **admin-page.tsx - User logic**
- ⚠️ UserForm chỉ view mode - OK nếu không cần edit
- ✅ Create logic đã đúng

### 4. **userService.ts**
- ✅ Đã implement đầy đủ
- ⚠️ Cần kiểm tra xem API có endpoint riêng để reset password không

---

## ✅ Checklist

- [ ] Sửa `phoneNumber` trong update staff (không dùng email)
- [ ] Thêm field `phoneNumber` vào StaffForm (optional)
- [ ] Xử lý `onResetPassword` (xóa hoặc tìm API endpoint riêng)
- [ ] Kiểm tra dropdown department trong StaffForm có hoạt động không
- [ ] Test create staff
- [ ] Test update staff
- [ ] Test delete staff
- [ ] Test create student
- [ ] Test update student (nếu cần)
- [ ] Test delete student
- [ ] Test toggle status

---

**Ngày tạo:** 2024
**Status:** ⚠️ Cần sửa một số issues

