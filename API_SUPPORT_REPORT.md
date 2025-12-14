# Báo Cáo Hỗ Trợ API Backend

**API Base URL:** `https://fptechnical-1071992103404.asia-southeast1.run.app/api`

## 1. Quản Lý Thành Viên (User Management)

### Quản Lý Staff và Student
**Service File:** `src/services/userService.ts`

| Chức năng | Method | Endpoint | Trạng thái | Ghi chú |
|-----------|--------|----------|------------|---------|
| **Hiển thị danh sách** | GET | `/User` | ✅ Đã hỗ trợ | Lấy tất cả users (staff + student) |
| **Xem chi tiết** | GET | `/User/{userCode}` | ❓ Cần kiểm tra | Hiện tại code dùng `getAll()` rồi filter |
| **Tạo mới** | POST | `/User` | ✅ Đã hỗ trợ | Tạo user mới (staff hoặc student) |
| **Cập nhật** | PUT | `/User/{userCode}` | ✅ Đã hỗ trợ | Cập nhật thông tin user |
| **Xóa** | DELETE | `/User?code={userCode}` | ✅ Đã hỗ trợ | Soft delete user |

**Request Body cho Create:**
```typescript
{
  userCode: string;
  fullName: string;
  passwordHash: string;
  email: string;
  phoneNumber?: string;
  roleId: number; // 1=admin, 2=it-staff, 3=student, 4=teacher, 5=facility-staff
  departmentId?: number;
  status: 'ACTIVE';
}
```

**Request Body cho Update:**
```typescript
{
  fullName?: string;
  phoneNumber?: string;
  roleId?: number;
  departmentId?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';
}
```

---

## 2. Quản Lý Danh Mục (Category Management)

**Service File:** `src/services/categoryService.ts`

| Chức năng | Method | Endpoint | Trạng thái | Ghi chú |
|-----------|--------|----------|------------|---------|
| **Hiển thị danh sách** | GET | `/Category` | ✅ Đã hỗ trợ | Lấy tất cả categories |
| **Xem chi tiết** | GET | N/A | ❌ Chưa hỗ trợ | Code filter từ `getAll()` |
| **Tạo mới** | POST | N/A | ❌ **CHƯA HỖ TRỢ** | Không có endpoint |
| **Cập nhật** | PUT/PATCH | N/A | ❌ **CHƯA HỖ TRỢ** | Không có endpoint |
| **Xóa** | DELETE | N/A | ❌ **CHƯA HỖ TRỢ** | Không có endpoint |

**⚠️ Kết luận:** Backend **CHỈ hỗ trợ READ**, không hỗ trợ CREATE, UPDATE, DELETE cho Category.

---

## 3. Quản Lý Bộ Phận (Department Management)

**Service File:** `src/services/departmentService.ts`

| Chức năng | Method | Endpoint | Trạng thái | Ghi chú |
|-----------|--------|----------|------------|---------|
| **Hiển thị danh sách** | GET | `/Departments` | ✅ Đã hỗ trợ | Lấy tất cả departments |
| **Xem chi tiết** | GET | N/A | ❌ Chưa hỗ trợ | Code filter từ `getAll()` |
| **Tạo mới** | POST | N/A | ❌ **CHƯA HỖ TRỢ** | Có TODO comment trong code |
| **Cập nhật** | PUT/PATCH | N/A | ❌ **CHƯA HỖ TRỢ** | Có TODO comment trong code |
| **Xóa** | DELETE | N/A | ❌ **CHƯA HỖ TRỢ** | Có TODO comment trong code |

**⚠️ Kết luận:** Backend **CHỈ hỗ trợ READ**, không hỗ trợ CREATE, UPDATE, DELETE cho Department.

**Code hiện tại:**
```typescript
// TODO: implement API when backend is ready
async create(...) {
  console.warn('⚠️ Create department API not implemented yet');
  // Temporary: return mock data
}
```

---

## 4. Quản Lý Địa Điểm (Location Management)

**Service File:** `src/services/locationService.ts`

| Chức năng | Method | Endpoint | Trạng thái | Ghi chú |
|-----------|--------|----------|------------|---------|
| **Hiển thị danh sách** | GET | `/Locations?PageNumber=1&PageSize=100` | ✅ Đã hỗ trợ | Có pagination |
| **Xem chi tiết** | GET | N/A | ❌ Chưa hỗ trợ | Code filter từ `getAll()` |
| **Tạo mới** | POST | `/Location` | ✅ Đã hỗ trợ | Tạo location mới |
| **Cập nhật** | PUT | `/Location` | ✅ Đã hỗ trợ | Cập nhật thông tin location |
| **Cập nhật status** | PATCH | `/Location/status` | ✅ Đã hỗ trợ | Chỉ cập nhật status |
| **Xóa** | DELETE | `/Location?locationCode={code}` | ✅ Đã hỗ trợ | Xóa location |

**Request Body cho Create:**
```typescript
{
  locationCode: string;
  locationName: string;
}
```

**Request Body cho Update:**
```typescript
{
  locationCode: string;
  locationName: string;
}
```

**Request Body cho Update Status:**
```typescript
{
  locationCode: string;
  status: 'ACTIVE' | 'INACTIVE';
}
```

**✅ Kết luận:** Backend **hỗ trợ đầy đủ CRUD** cho Location.

---

## Tổng Kết

| Module | Read | Create | Update | Delete | Tổng kết |
|--------|------|--------|--------|--------|----------|
| **Quản lý Thành viên** (User/Staff/Student) | ✅ | ✅ | ✅ | ✅ | **✅ Hoàn chỉnh** |
| **Quản lý Danh mục** (Category) | ✅ | ❌ | ❌ | ❌ | **⚠️ Chỉ đọc** |
| **Quản lý Bộ phận** (Department) | ✅ | ❌ | ❌ | ❌ | **⚠️ Chỉ đọc** |
| **Quản lý Địa điểm** (Location) | ✅ | ✅ | ✅ | ✅ | **✅ Hoàn chỉnh** |

---

## Khuyến Nghị

1. **Category Management:** Cần yêu cầu backend implement các endpoint:
   - `POST /Category` - Tạo category mới
   - `PUT /Category/{categoryCode}` - Cập nhật category
   - `DELETE /Category?code={categoryCode}` - Xóa category

2. **Department Management:** Cần yêu cầu backend implement các endpoint:
   - `POST /Departments` - Tạo department mới
   - `PUT /Departments/{deptCode}` - Cập nhật department
   - `DELETE /Departments?code={deptCode}` - Xóa department

3. **User Management:** ✅ Đã hoàn chỉnh, có thể sử dụng ngay.

4. **Location Management:** ✅ Đã hoàn chỉnh, có thể sử dụng ngay.

