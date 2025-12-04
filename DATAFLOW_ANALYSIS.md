# 📊 Phân Tích Dataflow So Với ERD Mới

## 🔄 So Sánh Dataflow Hiện Tại vs ERD Mới

### ✅ Đã Có Trong Code Hiện Tại

#### 1. Tạo Ticket (User Flow)
- ✅ **Title**: Đã có field `title` trong Ticket interface và CreateTicketPage
- ✅ **Description**: Đã có field `description`
- ✅ **Location & RoomNumber**: Đã có fields `location` và `roomNumber`
- ✅ **Images**: Đã có field `images` (base64)
- ✅ **Priority**: Đã có field `priority` (low, medium, high, urgent)
- ✅ **Category**: Đã có field `category` (IssueCategory)
- ✅ **createdBy**: Đã có field `createdBy` (requester_id)
- ✅ **createdAt**: Đã có field `createdAt`
- ✅ **status**: Đã có field `status` với giá trị mặc định 'open'
- ✅ **slaDeadline**: Đã có field `slaDeadline` và logic tính toán dựa trên `slaResolveHours`

#### 2. Phân Công (Admin Flow)
- ✅ **assignedTo**: Đã có field `assignedTo` (Staff ID)
- ✅ **assignedToName**: Đã có field `assignedToName`
- ✅ **Auto status change**: Khi assign, status tự động đổi từ 'open' → 'acknowledged'

#### 3. SLA Tracking
- ✅ **slaTracking**: Đã có interface `SLATracking` với đầy đủ timeline events
- ✅ **Timeline events**: Đã có `SLATimelineEvent` với các trạng thái

---

## ❌ Chưa Có Trong Code Hiện Tại (Theo ERD Mới)

### 🔴 1. Quản Lý Quyền Động (Dynamic Roles)

**ERD Mới**: Tách bảng `Roles` thay vì enum cố định

**Hiện Tại**:
```typescript
export type UserRole = 'student' | 'it-staff' | 'facility-staff' | 'admin';
```

**Cần Thay Đổi**:
- ❌ Chưa có bảng/interface `Role`
- ❌ `UserRole` đang là enum cố định
- ❌ Không thể thêm role mới (Manager, Supervisor) mà không sửa code

**Cần Làm**:
1. Tạo interface `Role`:
```typescript
export interface Role {
  id: string;
  name: string;
  code: string; // 'student', 'it-staff', 'facility-staff', 'admin'
  description: string;
  permissions: string[];
  createdAt: string;
}
```

2. Cập nhật `User` interface:
```typescript
export interface User {
  // ... existing fields
  roleId: string; // Thay vì role: UserRole
  role?: Role; // Populated từ bảng Roles
}
```

3. Tạo mock data cho Roles
4. Cập nhật tất cả logic sử dụng `UserRole` enum

**File Cần Tạo/Sửa**:
- `src/types/index.ts` (thêm Role interface)
- `src/data/mockRoles.ts` (mới)
- `src/data/mockUsers.ts` (cập nhật)
- `src/app.tsx` (cập nhật logic role checking)
- Tất cả components sử dụng `UserRole`

---

### 🔴 2. Bảo Mật & Khôi Phục Tài Khoản (VerificationCodes)

**ERD Mới**: Bảng `VerificationCodes` cho Forgot Password / Verify Email

**Hiện Tại**:
- ❌ Chưa có interface `VerificationCode`
- ❌ Chưa có chức năng "Quên mật khẩu"
- ❌ Chưa có chức năng "Xác thực email"
- ❌ Chưa có form Forgot Password
- ❌ Chưa có logic gửi email

**Cần Làm**:

1. Tạo interface `VerificationCode`:
```typescript
export interface VerificationCode {
  id: string;
  userId: string;
  email: string;
  code: string;
  type: 'password_reset' | 'email_verification';
  expiresAt: string;
  used: boolean;
  createdAt: string;
}
```

2. Tạo Forgot Password Flow:
   - Form nhập email
   - Generate verification code
   - Gửi email (mock)
   - Form nhập code + mật khẩu mới
   - Reset password

3. Tạo Email Verification Flow:
   - Khi đăng ký, tạo verification code
   - Gửi email với link/code
   - Verify email trước khi login

**File Cần Tạo**:
- `src/types/index.ts` (thêm VerificationCode interface)
- `src/data/mockVerificationCodes.ts` (mới)
- `src/pages/forgot-password-page.tsx` (mới)
- `src/pages/reset-password-page.tsx` (mới)
- `src/components/forgot-password-modal.tsx` (mới)
- `src/components/login-modal.tsx` (thêm link "Quên mật khẩu")
- `src/app.tsx` (thêm handlers)

---

### 🔴 3. Chi Tiết Hóa Phản Hồi (Rating & Comment)

**ERD Mới**: Tickets có `rating_stars` và `rating_comment`

**Hiện Tại**:
- ❌ Chưa có field `ratingStars` trong Ticket
- ❌ Chưa có field `ratingComment` trong Ticket
- ❌ Chưa có UI để Student đánh giá ticket
- ❌ Chưa có logic lưu rating khi ticket closed

**Cần Làm**:

1. Cập nhật Ticket interface:
```typescript
export interface Ticket {
  // ... existing fields
  ratingStars?: number; // 1-5
  ratingComment?: string;
  closedAt?: string; // Thời điểm đóng ticket (khi có rating)
}
```

2. Tạo Rating Form:
   - Hiển thị khi ticket status = 'resolved' hoặc 'closed'
   - Cho phép chọn 1-5 sao
   - Cho phép nhập comment
   - Submit → update ticket với rating và closedAt

3. Hiển thị Rating:
   - Trong TicketDetailModal
   - Trong TicketListPage (nếu có rating)

**File Cần Sửa**:
- `src/types/index.ts` (thêm ratingStars, ratingComment, closedAt)
- `src/components/ticket-rating-form.tsx` (mới)
- `src/components/ticket-detail-modal.tsx` (thêm rating section)
- `src/pages/ticket-list-page.tsx` (hiển thị rating nếu có)
- `src/app.tsx` (thêm handler submitRating)

---

### 🔴 4. Managed By (Admin Assignment Tracking)

**ERD Mới**: Ticket có field `managed_by` để track Admin nào đã assign

**Hiện Tại**:
- ❌ Chưa có field `managedBy` trong Ticket
- ❌ Không biết Admin nào đã thực hiện assign

**Cần Làm**:

1. Cập nhật Ticket interface:
```typescript
export interface Ticket {
  // ... existing fields
  managedBy?: string; // Admin ID thực hiện assign
  managedByName?: string;
}
```

2. Cập nhật `handleAssignTicket`:
```typescript
const handleAssignTicket = (ticketId: string, staffId: string) => {
  // ... existing code
  return {
    ...t,
    managedBy: currentAdminId, // Thêm dòng này
    managedByName: currentUser?.fullName,
    // ... rest
  };
};
```

**File Cần Sửa**:
- `src/types/index.ts` (thêm managedBy, managedByName)
- `src/app.tsx` (cập nhật handleAssignTicket)
- `src/components/ticket-detail-modal.tsx` (hiển thị managedBy nếu có)

---

## 📋 Tổng Kết Chức Năng Chưa Có

### 🔴 Quan Trọng (Theo ERD Mới)

1. **Dynamic Roles System**
   - Tách bảng Roles
   - User có roleId thay vì role enum
   - Có thể thêm role mới mà không sửa code

2. **Forgot Password / Email Verification**
   - Bảng VerificationCodes
   - Form Forgot Password
   - Form Reset Password
   - Logic gửi email (mock)

3. **Ticket Rating & Comment**
   - Field `ratingStars` (1-5)
   - Field `ratingComment`
   - Field `closedAt`
   - UI Rating Form
   - Hiển thị rating trong ticket detail

4. **Managed By Tracking**
   - Field `managedBy` trong Ticket
   - Track Admin nào đã assign ticket

---

## 🎯 Ưu Tiên Triển Khai

### Phase 1: Bắt Buộc (Theo ERD)
1. ✅ Ticket Rating & Comment (quan trọng cho feedback)
2. ✅ Managed By Tracking (quan trọng cho audit)
3. ⚠️ Dynamic Roles (có thể giữ enum tạm thời, implement sau)

### Phase 2: Bảo Mật
4. ✅ Forgot Password Flow
5. ✅ Email Verification Flow

### Phase 3: Mở Rộng
6. ✅ Dynamic Roles System (nếu cần thêm role mới)

---

## 📝 Ghi Chú Kỹ Thuật

### Về Dynamic Roles:
- **Hiện tại**: Enum cố định, đơn giản, dễ maintain
- **ERD mới**: Bảng Roles, linh hoạt hơn nhưng phức tạp hơn
- **Khuyến nghị**: Có thể giữ enum tạm thời, implement dynamic roles khi thực sự cần thêm role mới

### Về VerificationCodes:
- Cần mock email service (không gửi email thật)
- Code có thể là 6 số ngẫu nhiên
- Expires sau 15-30 phút

### Về Rating:
- Chỉ cho phép rating khi ticket status = 'resolved' hoặc 'closed'
- Mỗi ticket chỉ được rating 1 lần
- Rating không thể edit sau khi submit

---

**Last Updated**: December 2024
**Status**: Đang phân tích và so sánh với ERD mới

