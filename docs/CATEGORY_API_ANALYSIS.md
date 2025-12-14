# Phân tích Quản lý Danh mục (Category) - So sánh Frontend với API

## 📋 Tình trạng hiện tại

### ✅ Đã hoạt động
- **GET `/api/Category`** - Lấy danh sách category ✅
- **CategoryList** - Hiển thị danh sách ✅

### ❌ Chưa hoạt động
- **POST `/api/Category`** - Tạo category mới ❌
- **PUT `/api/Category/{categoryCode}`** - Cập nhật category ❌
- **DELETE `/api/Category/{categoryCode}`** - Xóa category ❌

---

## 🔍 Phân tích chi tiết

### 1. API Response Format (GET)

**Backend trả về:**
```typescript
interface Category {
  categoryCode: string;
  categoryName: string;
  departmentId: number;        // Số nguyên
  slaResolveHours: number;
  status: 'ACTIVE' | 'INACTIVE';
}
```

**Frontend đang nhận:** ✅ Đúng format

---

### 2. Form Data Structure

**CategoryForm hiện tại có:**
```typescript
{
  code: string;                // ← Mã category
  name: string;                // ← Tên category
  icon: string;                // ← Icon (KHÔNG có trong API)
  color: string;               // ← Màu (KHÔNG có trong API)
  slaResolveHours: number;     // ← SLA (giờ)
  defaultPriority: Priority;   // ← Priority mặc định (KHÔNG có trong API)
  departmentId: string;        // ← Bộ phận (string trong form, nhưng API cần number)
  status: 'active' | 'inactive'; // ← Trạng thái (lowercase trong form, API cần uppercase)
}
```

**API yêu cầu (POST/PUT):**
```typescript
{
  categoryCode: string;        // ← Mã category (REQUIRED)
  categoryName: string;        // ← Tên category (REQUIRED)
  departmentId: number;        // ← Bộ phận ID (REQUIRED) - SỐ NGUYÊN
  slaResolveHours: number;     // ← SLA (REQUIRED)
  status: 'ACTIVE' | 'INACTIVE'; // ← Trạng thái (REQUIRED) - UPPERCASE
}
```

**❌ Vấn đề:**
1. Form có các field không cần thiết: `icon`, `color`, `defaultPriority` (không có trong API)
2. `departmentId` trong form là `string`, nhưng API cần `number`
3. `status` trong form là `'active' | 'inactive'` (lowercase), nhưng API cần `'ACTIVE' | 'INACTIVE'` (uppercase)
4. Field names không khớp: `code` vs `categoryCode`, `name` vs `categoryName`

---

### 3. CategoryList Component

**Hiển thị:**
- ✅ Mã category (`categoryCode`)
- ✅ Tên category (`categoryName`)
- ✅ SLA (`slaResolveHours`)
- ✅ Bộ phận (tìm từ `departmentId`)
- ✅ Trạng thái (`status`)

**✅ Đúng format từ API**

---

### 4. Service Implementation

**`categoryService.ts`:**

```typescript
// ✅ GET - Đã implement
async getAll(): Promise<Category[]> {
  const response = await apiClient.get<CategoryApiResponse>('/Category');
  // ...
}

// ❌ CREATE - Chưa implement (TODO)
// ❌ UPDATE - Chưa implement (TODO)
// ❌ DELETE - Chưa implement (TODO)
```

**`useCategories.ts`:**

```typescript
// ❌ CREATE - Mock data only
const createCategory = async (category: Omit<Category, 'categoryCode' | 'categoryName'>) => {
  console.warn('⚠️ Create category API not implemented yet');
  // Temporary: just add to local state
}

// ❌ UPDATE - Mock data only
const updateCategory = async (code: string, updates: Partial<Category>) => {
  console.warn('⚠️ Update category API not implemented yet');
  // Temporary: just update local state
}

// ❌ DELETE - Mock data only
const deleteCategory = async (code: string) => {
  console.warn('⚠️ Delete category API not implemented yet');
  // Temporary: just remove from local state
}
```

---

## 🛠️ Những gì cần sửa

### 1. **CategoryForm.tsx** - Cập nhật form fields

**Cần sửa:**
- ✅ Giữ `code` → map sang `categoryCode` khi submit
- ✅ Giữ `name` → map sang `categoryName` khi submit
- ✅ `departmentId` → convert từ string sang number khi submit
- ✅ `status` → convert từ lowercase sang uppercase khi submit
- ❓ `icon`, `color`, `defaultPriority` → Có thể xóa hoặc giữ làm frontend-only (không gửi lên API)

**Form mới nên có:**
```typescript
{
  categoryCode: string;        // Mã category (REQUIRED)
  categoryName: string;        // Tên category (REQUIRED)
  departmentId: number;        // Bộ phận ID (REQUIRED) - SỐ NGUYÊN
  slaResolveHours: number;     // SLA (REQUIRED)
  status: 'ACTIVE' | 'INACTIVE'; // Trạng thái (REQUIRED)
}
```

### 2. **categoryService.ts** - Implement API calls

**Cần implement:**
- ✅ `create()` - POST `/api/Category`
- ✅ `update()` - PUT `/api/Category/{categoryCode}`
- ✅ `delete()` - DELETE `/api/Category/{categoryCode}`

### 3. **useCategories.ts** - Cập nhật logic

**Cần sửa:**
- `createCategory()` - Gửi đúng format, gọi API thực tế
- `updateCategory()` - Dùng `categoryCode` thay vì `id`, gọi API thực tế
- `deleteCategory()` - Dùng `categoryCode`, gọi API thực tế

### 4. **admin-page.tsx** - Cập nhật form data structure

**Cần thay đổi:**
```typescript
// Từ:
const [categoryFormData, setCategoryFormData] = useState({
  code: '',
  name: '',
  icon: '📋',
  color: '#3b82f6',
  slaResolveHours: 24,
  defaultPriority: 'medium',
  departmentId: '',  // string
  status: 'active',   // lowercase
});

// Thành:
const [categoryFormData, setCategoryFormData] = useState({
  categoryCode: '',
  categoryName: '',
  departmentId: 0,    // number
  slaResolveHours: 24,
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',  // uppercase
  // icon, color, defaultPriority có thể giữ làm frontend-only
});
```

---

## 📝 API Endpoints cần kiểm tra

### GET `/api/Category`
- ✅ Đã hoạt động
- Response format: `{ status, message, data: Category[], errors }`

### POST `/api/Category`
- ❓ Cần kiểm tra backend có hỗ trợ không
- Request body: `{ categoryCode, categoryName, departmentId, slaResolveHours, status }`
- Response: `{ status, message, data: Category, errors }`

### PUT `/api/Category/{categoryCode}`
- ❓ Cần kiểm tra backend có hỗ trợ không
- Request body: `{ categoryName?, departmentId?, slaResolveHours?, status? }` (partial update)
- Response: `{ status, message, data: Category, errors }`

### DELETE `/api/Category/{categoryCode}`
- ❓ Cần kiểm tra backend có hỗ trợ không
- Response: `{ status, message, data: null, errors }`

---

## ✅ Checklist

- [ ] Kiểm tra backend có hỗ trợ POST/PUT/DELETE `/api/Category` không
- [ ] Cập nhật `CategoryForm.tsx` - Sửa field names và types
- [ ] Cập nhật `admin-page.tsx` - Thay đổi `categoryFormData` structure
- [ ] Implement `categoryService.create()` - POST API
- [ ] Implement `categoryService.update()` - PUT API
- [ ] Implement `categoryService.delete()` - DELETE API
- [ ] Cập nhật `useCategories.ts` - Sử dụng API thực tế thay vì mock
- [ ] Test tạo category mới
- [ ] Test cập nhật category
- [ ] Test xóa category

---

**Ngày tạo:** 2024
**Status:** ⏳ Đang chờ kiểm tra backend API

