# Phân tích Quản lý Bộ phận - So sánh Frontend với API

## 📋 Tình trạng hiện tại

### ✅ Đã hoạt động
- **GET `/api/Departments`** - Lấy danh sách bộ phận ✅
- **DepartmentList** - Hiển thị danh sách ✅

### ❌ Chưa hoạt động
- **POST `/api/Departments`** - Tạo bộ phận mới ❌
- **PUT `/api/Departments/{deptCode}`** - Cập nhật bộ phận ❌
- **DELETE `/api/Departments/{deptCode}`** - Xóa bộ phận ❌

---

## 🔍 Phân tích chi tiết

### 1. API Response Format (GET)

**Backend trả về:**
```typescript
interface Department {
  deptCode: string;          // Mã bộ phận (IT, MAINTAIN...)
  deptName: string;          // Tên bộ phận
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;        // Thời gian tạo
}
```

**Frontend đang nhận:** ✅ Đúng format

---

### 2. Form Data Structure

**DepartmentForm hiện tại có:**
```typescript
{
  name: string;              // ← Tên bộ phận
  description: string;       // ← Mô tả (KHÔNG có trong API)
  location: string;          // ← Vị trí (KHÔNG có trong API)
  adminId: string;          // ← Admin ID (KHÔNG có trong API)
  staffIds: string[];       // ← Staff IDs (KHÔNG có trong API)
}
```

**API yêu cầu (POST/PUT):**
```typescript
{
  deptCode: string;          // ← Mã bộ phận (REQUIRED)
  deptName: string;          // ← Tên bộ phận (REQUIRED)
  status: 'ACTIVE' | 'INACTIVE'; // ← Trạng thái (REQUIRED)
}
```

**❌ Vấn đề:**
1. Form không có field `deptCode` (mã bộ phận)
2. Form không có field `status` (trạng thái)
3. Form có các field không cần thiết: `description`, `location`, `adminId`, `staffIds`

---

### 3. DepartmentList Component

**Hiển thị:**
- ✅ Mã bộ phận (`deptCode`)
- ✅ Tên bộ phận (`deptName`)
- ✅ Trạng thái (`status`)
- ✅ Ngày tạo (`createdAt`)

**✅ Đúng format từ API**

---

### 4. Service Implementation

**`departmentService.ts`:**

```typescript
// ✅ GET - Đã implement
async getAll(): Promise<Department[]> {
  const response = await apiClient.get<DepartmentApiResponse>('/Departments');
  // ...
}

// ❌ CREATE - Chưa implement (TODO)
async create(department: Omit<Department, 'id' | 'createdAt'>): Promise<Department> {
  console.warn('⚠️ Create department API not implemented yet');
  // Temporary: return mock data
}

// ❌ UPDATE - Chưa implement (TODO)
async update(id: string, updates: Partial<Department>): Promise<Department> {
  console.warn('⚠️ Update department API not implemented yet');
  // Temporary: return mock data
}

// ❌ DELETE - Chưa implement (TODO)
async delete(id: string): Promise<void> {
  console.warn('⚠️ Delete department API not implemented yet');
  // Temporary: do nothing
}
```

---

## 🛠️ Những gì cần sửa

### 1. **DepartmentForm.tsx** - Cập nhật form fields

**Cần thêm:**
- ✅ Field `deptCode` (mã bộ phận) - **REQUIRED**
- ✅ Field `status` (trạng thái) - Dropdown: ACTIVE/INACTIVE

**Có thể xóa (nếu không cần):**
- ❓ `description` - Nếu backend không hỗ trợ
- ❓ `location` - Nếu backend không hỗ trợ
- ❓ `adminId` - Nếu backend không hỗ trợ
- ❓ `staffIds` - Nếu backend không hỗ trợ

**Form mới nên có:**
```typescript
{
  deptCode: string;          // Mã bộ phận (REQUIRED)
  deptName: string;         // Tên bộ phận (REQUIRED)
  status: 'ACTIVE' | 'INACTIVE'; // Trạng thái (REQUIRED)
}
```

### 2. **departmentService.ts** - Implement API calls

**Cần implement:**
- ✅ `create()` - POST `/api/Departments`
- ✅ `update()` - PUT `/api/Departments/{deptCode}`
- ✅ `delete()` - DELETE `/api/Departments/{deptCode}`

### 3. **admin-page.tsx** - Cập nhật form data structure

**Cần thay đổi:**
```typescript
// Từ:
const [deptFormData, setDeptFormData] = useState({
  name: '',
  description: '',
  location: '',
  adminId: currentAdminId,
  staffIds: [],
});

// Thành:
const [deptFormData, setDeptFormData] = useState({
  deptCode: '',
  deptName: '',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
});
```

### 4. **useDepartments.ts** - Cập nhật logic

**Cần sửa:**
- `createDepartment()` - Gửi đúng format
- `updateDepartment()` - Dùng `deptCode` thay vì `id`
- `deleteDepartment()` - Dùng `deptCode` thay vì `id`

---

## 📝 API Endpoints cần kiểm tra

### GET `/api/Departments`
- ✅ Đã hoạt động
- Response format: `{ status, message, data: Department[], errors }`

### POST `/api/Departments`
- ❓ Cần kiểm tra backend có hỗ trợ không
- Request body: `{ deptCode, deptName, status }`
- Response: `{ status, message, data: Department, errors }`

### PUT `/api/Departments/{deptCode}`
- ❓ Cần kiểm tra backend có hỗ trợ không
- Request body: `{ deptName?, status? }` (partial update)
- Response: `{ status, message, data: Department, errors }`

### DELETE `/api/Departments/{deptCode}`
- ❓ Cần kiểm tra backend có hỗ trợ không
- Response: `{ status, message, data: null, errors }`

---

## ✅ Checklist

- [ ] Kiểm tra backend có hỗ trợ POST/PUT/DELETE `/api/Departments` không
- [ ] Cập nhật `DepartmentForm.tsx` - Thêm `deptCode` và `status` fields
- [ ] Cập nhật `admin-page.tsx` - Thay đổi `deptFormData` structure
- [ ] Implement `departmentService.create()` - POST API
- [ ] Implement `departmentService.update()` - PUT API
- [ ] Implement `departmentService.delete()` - DELETE API
- [ ] Cập nhật `useDepartments.ts` - Sử dụng `deptCode` thay vì `id`
- [ ] Test tạo bộ phận mới
- [ ] Test cập nhật bộ phận
- [ ] Test xóa bộ phận

---

**Ngày tạo:** 2024
**Status:** ⏳ Đang chờ kiểm tra backend API

