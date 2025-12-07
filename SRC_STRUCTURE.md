# Cấu trúc và Nhiệm vụ các File trong Thư mục `src`

Tài liệu này mô tả chi tiết về cấu trúc thư mục `src` và nhiệm vụ của từng file/component trong dự án **SWP391 - Hệ thống Quản lý Tickets**.

---

## 📁 Tổng quan Cấu trúc

```
src/
├── app.tsx                    # Component chính, quản lý routing và authentication
├── main.tsx                   # Entry point của ứng dụng React
├── index.css                  # Global CSS styles
├── assets/                    # Tài nguyên tĩnh (images, icons)
├── components/                # Các React components có thể tái sử dụng
├── pages/                     # Các trang chính của ứng dụng
├── hooks/                     # Custom React hooks
├── services/                  # Business logic và API services
├── utils/                     # Utility functions
├── data/                      # Mock data và initial data
└── types/                     # TypeScript type definitions
```

---

## 📄 Files Gốc

### `main.tsx`
**Nhiệm vụ:** Entry point của ứng dụng React
- Khởi tạo React root và render component `App`
- Import global CSS styles
- Sử dụng `StrictMode` để phát hiện các vấn đề tiềm ẩn trong development

### `app.tsx`
**Nhiệm vụ:** Component chính quản lý toàn bộ ứng dụng
- **Authentication Management**: Quản lý đăng nhập, đăng xuất, session persistence
- **Routing Logic**: Điều hướng giữa các trang dựa trên role của user (admin, staff, student)
- **State Management**: Quản lý `currentUser`, `authView`, `tickets`
- **Auto-escalation**: Tự động escalate tickets quá hạn
- **Session Persistence**: Lưu và khôi phục session từ localStorage
- **Role-based Rendering**: Hiển thị trang phù hợp với role của user

### `index.css`
**Nhiệm vụ:** Global CSS styles và Tailwind CSS configuration
- Định nghĩa các biến CSS global
- Import Tailwind CSS directives
- Custom animations và utilities

---

## 📦 Components (`components/`)

### `components/admin/` - Admin Components

#### `CategoryList.tsx`
**Nhiệm vụ:** Hiển thị danh sách categories với tìm kiếm và pagination
- Hiển thị bảng danh sách categories
- Tìm kiếm theo mã và tên category
- Nút "Sửa" để chỉnh sửa category
- Nút "Thêm Category" để tạo mới

#### `CategoryForm.tsx`
**Nhiệm vụ:** Form modal để tạo/chỉnh sửa category
- Form nhập thông tin category (mã, tên, mô tả, SLA, priority, department, status)
- Validation và submit handler
- Nút "Xóa" khi ở chế độ edit
- Đóng modal khi hoàn thành

#### `DepartmentList.tsx`
**Nhiệm vụ:** Hiển thị danh sách departments
- Bảng danh sách departments với thông tin cơ bản
- Tìm kiếm theo tên department
- Nút "Sửa" để chỉnh sửa

#### `DepartmentForm.tsx`
**Nhiệm vụ:** Form modal để tạo/chỉnh sửa department
- Form nhập thông tin department (tên, mô tả, vị trí)
- Nút "Xóa" khi ở chế độ edit

#### `LocationList.tsx`
**Nhiệm vụ:** Hiển thị danh sách locations với filter
- Bảng danh sách locations
- Tìm kiếm theo mã và tên location
- Filter theo trạng thái (active/inactive)
- Nút "Sửa" để chỉnh sửa

#### `LocationForm.tsx`
**Nhiệm vụ:** Form modal để tạo/chỉnh sửa location
- Form nhập thông tin location (mã, tên, mô tả, loại, tầng, status)
- Nút "Xóa" khi ở chế độ edit

#### `TicketsTable.tsx`
**Nhiệm vụ:** Hiển thị bảng danh sách tickets cho admin
- Bảng tickets với các cột: ID, Tiêu đề, Vị trí, Trạng thái, Độ ưu tiên, Người xử lý, Ngày tạo, Thao tác
- Assign ticket cho staff
- Nút "Xem" để mở modal review ticket
- Hiển thị badge màu cho status và priority

#### `TicketReviewModal.tsx`
**Nhiệm vụ:** Modal để admin duyệt tickets
- Hiển thị chi tiết ticket (ID, tiêu đề, mô tả, vị trí, hình ảnh)
- Chọn staff để assign khi approve
- Input lý do từ chối
- Nút "Chấp nhận" và "Từ chối"
- Nút "Giao việc ngay" để assign mà không approve

#### `StaffList.tsx`
**Nhiệm vụ:** Hiển thị danh sách staff với pagination
- Bảng danh sách staff (mã, họ tên, email, vai trò, bộ phận, trạng thái)
- Tìm kiếm đa tiêu chí
- Pagination
- Nút "Sửa" để chỉnh sửa staff

#### `StaffForm.tsx`
**Nhiệm vụ:** Form modal để tạo/chỉnh sửa staff
- Form nhập thông tin staff (username, password, họ tên, email, role, department)
- Section "Quản lý tài khoản" khi edit: cập nhật mật khẩu, khóa/mở khóa tài khoản

#### `UserList.tsx`
**Nhiệm vụ:** Hiển thị danh sách users (students) với pagination
- Bảng danh sách users (mã, họ tên, email, trạng thái)
- Tìm kiếm
- Pagination
- Nút "Sửa" để xem thông tin và quản lý user

#### `UserForm.tsx`
**Nhiệm vụ:** Form modal để tạo/xem thông tin user
- **View mode**: Chỉ hiển thị thông tin (không cho sửa)
- **Add mode**: Form tạo user mới
- Section "Quản lý tài khoản": khóa/mở khóa, xem lịch sử tickets

#### `ReportsPage.tsx`
**Nhiệm vụ:** Trang báo cáo cho admin
- **SLA Report**: Tổng số tickets, đã giải quyết, quá hạn, tỷ lệ đúng hạn, thời gian xử lý trung bình
- **Ticket Volume Report**: Phân tích theo category, priority, status
- **Staff Performance Report**: Hiệu suất từng staff (số tickets, tỷ lệ đúng hạn, thời gian xử lý TB)

---

### `components/shared/` - Shared Components

#### `navbar-new.tsx`
**Nhiệm vụ:** Navigation bar chung cho toàn bộ ứng dụng
- Hiển thị logo và thông tin user
- Dropdown menu khi click avatar: "Thông tin" và "Đăng xuất"
- Responsive design

#### `login-modal.tsx`
**Nhiệm vụ:** Modal đăng nhập
- Form đăng nhập với username/email và password
- Validation và error handling
- Link đến đăng ký và quên mật khẩu

#### `register-modal.tsx`
**Nhiệm vụ:** Modal đăng ký tài khoản
- Form đăng ký với các trường: username, password, họ tên, email, mã người dùng
- Validation
- Submit handler

#### `forgot-password-modal.tsx`
**Nhiệm vụ:** Modal quên mật khẩu
- Form nhập email để reset password
- (Hiện tại chỉ là UI, chưa có logic backend)

#### `profile-modal.tsx`
**Nhiệm vụ:** Modal chỉnh sửa thông tin cá nhân
- Hiển thị và chỉnh sửa thông tin user (họ tên, email, phone)
- Cập nhật avatar (nếu có)
- Validation và submit

#### `ticket-detail-modal.tsx`
**Nhiệm vụ:** Modal hiển thị chi tiết ticket
- Hiển thị đầy đủ thông tin ticket (tiêu đề, mô tả, vị trí, trạng thái, priority, SLA, timeline)
- Hiển thị hình ảnh (nếu có)
- Các action buttons dựa trên role:
  - **Student**: Chỉ xem
  - **Staff**: Cập nhật trạng thái, escalate lên admin
  - **Admin**: Xem và quản lý

---

## 📄 Pages (`pages/`)

### `pages/admin/`

#### `admin-page.tsx`
**Nhiệm vụ:** Trang chính của admin
- **Sidebar Navigation**: Menu điều hướng giữa các sections (Categories, Departments, Locations, Tickets, Staff, Users, Reports)
- **Tab Management**: Quản lý các tabs và form states
- **CRUD Operations**: Tạo, đọc, cập nhật, xóa cho categories, departments, locations, staff, users
- **Ticket Management**: Duyệt tickets, assign cho staff, cập nhật priority
- **Reports**: Hiển thị các báo cáo thống kê
- **Search & Filter**: Tìm kiếm và lọc dữ liệu
- **Pagination**: Phân trang cho danh sách dài

---

### `pages/auth/`

#### `login-page.tsx`
**Nhiệm vụ:** Trang đăng nhập
- Form đăng nhập
- Xử lý authentication
- Redirect sau khi đăng nhập thành công

#### `register-page.tsx`
**Nhiệm vụ:** Trang đăng ký
- Form đăng ký tài khoản mới
- Validation
- Tạo user mới và đăng nhập tự động

#### `forgot-password-page.tsx`
**Nhiệm vụ:** Trang quên mật khẩu
- Form nhập email
- (Chưa có logic reset password)

---

### `pages/staff/`

#### `it-staff-page.tsx`
**Nhiệm vụ:** Trang chính cho IT Staff
- Hiển thị tickets được assign cho IT staff
- Filter theo trạng thái
- Cập nhật trạng thái ticket (acknowledge, in-progress, resolved)
- Xem chi tiết ticket

#### `facility-staff-page.tsx`
**Nhiệm vụ:** Trang chính cho Facility Staff
- Tương tự IT Staff nhưng cho Facility Staff
- Hiển thị tickets thuộc Facility Department

#### `staff-page.tsx`
**Nhiệm vụ:** Component wrapper để chọn loại staff
- Điều hướng đến IT Staff hoặc Facility Staff page dựa trên role

---

### `pages/student/`

#### `student-home-page.tsx`
**Nhiệm vụ:** Trang chủ của student
- Hiển thị các options: "Tạo ticket mới", "Xem danh sách tickets"
- Navigation đến các trang con

#### `student-page.tsx`
**Nhiệm vụ:** Trang chính của student (wrapper)
- Quản lý navigation giữa các trang student

#### `create-ticket-page.tsx`
**Nhiệm vụ:** Trang tạo ticket mới
- Form tạo ticket: chọn category, location, nhập tiêu đề, mô tả, upload hình ảnh
- **Duplicate Detection**: Kiểm tra và cảnh báo nếu có ticket tương tự đang mở
- Validation và submit

#### `ticket-list-page.tsx`
**Nhiệm vụ:** Trang danh sách tickets của student
- Hiển thị tất cả tickets mà student đã tạo
- Filter theo trạng thái
- Xem chi tiết từng ticket

#### `issue-selection-page.tsx`
**Nhiệm vụ:** Trang chọn loại vấn đề (deprecated hoặc không dùng)
- (Có thể đã được thay thế bởi create-ticket-page)

---

## 🎣 Hooks (`hooks/`)

### `useCategories.ts`
**Nhiệm vụ:** Custom hook quản lý categories
- CRUD operations cho categories
- State management với React hooks
- Tích hợp với `categoryService` và `localStorage`

### `useDepartments.ts`
**Nhiệm vụ:** Custom hook quản lý departments
- CRUD operations cho departments
- Load và lưu departments từ localStorage

### `useLocations.ts`
**Nhiệm vụ:** Custom hook quản lý locations
- CRUD operations cho locations
- State management

### `useTickets.ts`
**Nhiệm vụ:** Custom hook quản lý tickets
- CRUD operations cho tickets
- **Auto-sync**: Tự động đồng bộ với localStorage khi có thay đổi
- **Storage Event Listener**: Lắng nghe thay đổi từ các tab khác
- **Periodic Check**: Kiểm tra localStorage định kỳ để đồng bộ state

### `useUsers.ts`
**Nhiệm vụ:** Custom hook quản lý users
- CRUD operations cho users
- Tích hợp với `userService`

---

## 🔧 Services (`services/`)

### `api.ts`
**Nhiệm vụ:** API client template cho tương lai
- Cấu hình base URL, timeout từ environment variables
- Helper functions: `get()`, `post()`, `put()`, `patch()`, `delete()`
- Error handling và timeout handling
- Authentication token management (template)
- **Lưu ý**: Hiện tại chưa được sử dụng, chỉ là template cho tích hợp API thật sau này

### `authService.ts`
**Nhiệm vụ:** Service xử lý authentication
- Login, logout functions
- Session management
- (Hiện tại sử dụng localStorage, sẽ thay bằng API sau)

### `categoryService.ts`
**Nhiệm vụ:** Service quản lý categories
- CRUD operations với localStorage
- Tích hợp với `localStorage` utilities

### `departmentService.ts`
**Nhiệm vụ:** Service quản lý departments
- CRUD operations với localStorage

### `locationService.ts`
**Nhiệm vụ:** Service quản lý locations
- CRUD operations với localStorage

### `ticketService.ts`
**Nhiệm vụ:** Service quản lý tickets
- CRUD operations với localStorage
- **SLA Tracking**: Tính toán deadline, response time, resolution time
- **Auto-escalation**: Tự động escalate tickets quá hạn
- **Event Logging**: Ghi lại các sự kiện trong SLA timeline

### `userService.ts`
**Nhiệm vụ:** Service quản lý users
- CRUD operations với localStorage
- Login function để authenticate users
- Tích hợp với `localStorage` utilities

---

## 🛠️ Utils (`utils/`)

### `localStorage.ts`
**Nhiệm vụ:** Utility functions cho localStorage
- **Generic Functions**: `loadFromStorage()`, `saveToStorage()` - load/save dữ liệu generic
- **Specific Functions**:
  - `loadUsers()`, `saveUsers()` - Quản lý users
  - `loadCategories()`, `saveCategories()` - Quản lý categories
  - `loadDepartments()`, `saveDepartments()` - Quản lý departments
  - `loadLocations()`, `saveLocations()` - Quản lý locations
  - `loadTickets()`, `saveTickets()` - Quản lý tickets
  - `loadCurrentUser()`, `saveCurrentUser()` - Quản lý session user
- **Initialization**: Tự động load mock data nếu localStorage trống
- **Storage Keys**: Định nghĩa các keys cho từng loại dữ liệu

### `ticketUtils.ts`
**Nhiệm vụ:** Utility functions liên quan đến tickets
- **`checkDuplicateTicket()`**: Kiểm tra xem có ticket tương tự đang mở không
  - So sánh theo category, location, title, description
  - Chỉ kiểm tra tickets có status: `open`, `acknowledged`, `in-progress`
  - Trả về danh sách tickets trùng lặp

---

## 📊 Data (`data/`)

### `mockUsers.ts`
**Nhiệm vụ:** Mock data cho users và authentication
- Định nghĩa danh sách users mẫu (admin, staff, students)
- **`authenticateUser()`**: Function xác thực user
  - Kiểm tra localStorage trước (cho users được tạo động)
  - Fallback về mockUsers array (cho backward compatibility)
- Export mockUsers array để sử dụng trong các components

### `mockData.ts`
**Nhiệm vụ:** Mock data cho các entities khác
- Mock categories, departments, locations, tickets
- Dữ liệu mẫu để khởi tạo ứng dụng
- Sử dụng khi localStorage trống

### `issueTypes.ts`
**Nhiệm vụ:** Định nghĩa các loại vấn đề (issue types)
- Enum hoặc constants cho các loại issue
- (Có thể đã được thay thế bởi categories)

---

## 📝 Types (`types/`)

### `index.ts`
**Nhiệm vụ:** TypeScript type definitions cho toàn bộ ứng dụng
- **User Types**: `UserRole`, `UserStatus`, `User` interface
- **Department Types**: `Department` interface
- **Location Types**: `Location` interface
- **Category Types**: `Category`, `Priority` interface
- **Ticket Types**: `Ticket`, `TicketStatus`, `SlaTracking` interface
- **Comments**: Ghi chú về mapping giữa frontend và database schema
- **Deprecated Fields**: Đánh dấu các fields không còn dùng (để backward compatibility)

---

## 🔄 Luồng Dữ liệu

### 1. **Authentication Flow**
```
User Input → LoginPage/RegisterPage → authService → localStorage → app.tsx → Set currentUser → Route to appropriate page
```

### 2. **Data Flow (CRUD)**
```
Component → Hook (useCategories/useTickets/etc.) → Service (categoryService/ticketService/etc.) → localStorage → Update State → Re-render Component
```

### 3. **Ticket Creation Flow**
```
Student → create-ticket-page → ticketUtils.checkDuplicateTicket() → ticketService.create() → localStorage → useTickets hook → Update UI
```

### 4. **Ticket Assignment Flow**
```
Admin → TicketsTable → assignTicket() → ticketService.update() → localStorage → useTickets hook (auto-sync) → Staff page shows assigned tickets
```

### 5. **Session Persistence Flow**
```
User Login → saveCurrentUser() → localStorage → Page Reload → loadCurrentUser() → Verify user exists → Restore session
```

---

## 🎯 Best Practices

1. **Separation of Concerns**:
   - Components chỉ lo UI
   - Hooks quản lý state và logic
   - Services xử lý business logic
   - Utils chứa helper functions

2. **Type Safety**:
   - Tất cả types được định nghĩa trong `types/index.ts`
   - Sử dụng TypeScript interfaces cho tất cả data structures

3. **State Management**:
   - Sử dụng React hooks (useState, useEffect, useMemo)
   - Custom hooks để tái sử dụng logic
   - localStorage để persist data

4. **Code Reusability**:
   - Shared components trong `components/shared/`
   - Utility functions trong `utils/`
   - Custom hooks trong `hooks/`

5. **Future API Integration**:
   - `api.ts` đã được chuẩn bị sẵn
   - Services có thể dễ dàng chuyển từ localStorage sang API calls
   - Environment variables trong `.env` để cấu hình API

---

## 📌 Lưu ý Quan trọng

1. **Mock Data**: Hiện tại ứng dụng sử dụng localStorage và mock data. Khi tích hợp API thật, cần:
   - Thay thế các service functions để gọi API thay vì localStorage
   - Sử dụng `api.ts` client
   - Cập nhật `.env` với API URL thật

2. **Session Management**: Session được lưu trong localStorage. Khi có backend, nên sử dụng JWT tokens và httpOnly cookies.

3. **Auto-sync**: `useTickets` hook có cơ chế auto-sync với localStorage. Khi chuyển sang API, cần implement polling hoặc WebSocket.

4. **Type Compatibility**: Một số fields được đánh dấu "Frontend only" hoặc "Deprecated" để tương thích với database schema thật.

---

**Tài liệu này được tạo tự động và cần được cập nhật khi có thay đổi trong codebase.**

