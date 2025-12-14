# Tổng hợp các vấn đề cần sửa - Backend & Frontend

**Ngày tạo:** 2024  
**Phạm vi:** Quản lý thành viên, danh mục, bộ phận, địa điểm

---

## 📋 Mục lục

1. [Quản lý địa điểm (Location)](#1-quản-lý-địa-điểm-location)
2. [Quản lý bộ phận (Department)](#2-quản-lý-bộ-phận-department)
3. [Quản lý danh mục (Category)](#3-quản-lý-danh-mục-category)
4. [Quản lý thành viên - Staff](#4-quản-lý-thành-viên---staff)
5. [Quản lý thành viên - Student](#5-quản-lý-thành-viên---student)

---

## 1. Quản lý địa điểm (Location)

### ✅ Frontend đã làm:
- GET `/api/Locations` - Hiển thị danh sách ✅
- POST `/api/Location` - Tạo mới ✅ (đã implement)
- PUT `/api/Location` - Cập nhật ✅ (đã implement)
- DELETE `/api/Location?locationCode=xxx` - Xóa ✅ (đã implement)
- Form có đầy đủ fields: `locationCode`, `locationName`, `status`, `campusCode`
- Logic xử lý `campusId` (number) ✅

### ❌ Backend cần sửa:

#### 1.1. API GET `/api/Campus` - Thiếu field `campusId`

**Vấn đề:**
- API hiện tại chỉ trả về `campusCode` và `campusName`
- Backend yêu cầu `campusId` (number) khi tạo location, nhưng API không cung cấp

**Response hiện tại:**
```json
{
  "status": true,
  "data": [
    {
      "campusCode": "NVH",
      "campusName": "Nhà văn hóa sinh viên"
    }
  ]
}
```

**Yêu cầu:**
```json
{
  "status": true,
  "data": [
    {
      "campusId": 1,              // ← THÊM FIELD NÀY (integer, required)
      "campusCode": "NVH",
      "campusName": "Nhà văn hóa sinh viên"
    }
  ]
}
```

**Priority:** 🔴 High (Blocking feature)

---

## 2. Quản lý bộ phận (Department)

### ✅ Frontend đã làm:
- GET `/api/Departments` - Hiển thị danh sách ✅
- Form đã cập nhật với đúng fields: `deptCode`, `deptName`, `status`
- Code đã sẵn sàng cho POST/PUT/DELETE

### ❌ Backend cần sửa:

#### 2.1. API POST `/api/Departments` - Chưa hỗ trợ

**Vấn đề:**
- Backend trả về 405 Method Not Allowed
- Frontend đã implement nhưng backend chưa hỗ trợ

**Request format (Frontend sẽ gửi):**
```json
{
  "deptCode": "IT",
  "deptName": "IT Department",
  "status": "ACTIVE"
}
```

**Response mong đợi:**
```json
{
  "status": true,
  "message": "Department created successfully",
  "data": {
    "deptCode": "IT",
    "deptName": "IT Department",
    "status": "ACTIVE",
    "createdAt": "2024-12-15T10:00:00Z"
  },
  "errors": []
}
```

**Priority:** 🔴 High

---

#### 2.2. API PUT `/api/Departments/{deptCode}` - Chưa hỗ trợ

**Vấn đề:**
- Backend trả về 404 Not Found hoặc 405 Method Not Allowed
- Frontend đã implement nhưng backend chưa hỗ trợ

**Request format (Frontend sẽ gửi):**
```json
{
  "deptName": "IT Department Updated",
  "status": "INACTIVE"
}
```

**Response mong đợi:**
```json
{
  "status": true,
  "message": "Department updated successfully",
  "data": {
    "deptCode": "IT",
    "deptName": "IT Department Updated",
    "status": "INACTIVE",
    "createdAt": "2024-12-15T10:00:00Z"
  },
  "errors": []
}
```

**Priority:** 🔴 High

---

#### 2.3. API DELETE `/api/Departments/{deptCode}` - Chưa hỗ trợ

**Vấn đề:**
- Backend trả về 404 Not Found hoặc 405 Method Not Allowed
- Frontend đã implement nhưng backend chưa hỗ trợ

**Response mong đợi:**
```json
{
  "status": true,
  "message": "Department deleted successfully",
  "data": null,
  "errors": []
}
```

**Priority:** 🔴 High

---

## 3. Quản lý danh mục (Category)

### ✅ Frontend đã làm:
- GET `/api/Category` - Hiển thị danh sách ✅
- Form đã cập nhật với đúng fields: `categoryCode`, `categoryName`, `departmentId`, `slaResolveHours`, `status`
- Code đã sẵn sàng cho POST/PUT/DELETE

### ❌ Backend cần sửa:

#### 3.1. API POST `/api/Category` - Chưa hỗ trợ (Cần kiểm tra)

**Request format (Frontend sẽ gửi):**
```json
{
  "categoryCode": "CAT001",
  "categoryName": "Cơ sở vật chất",
  "departmentId": 1,
  "slaResolveHours": 24,
  "status": "ACTIVE"
}
```

**Response mong đợi:**
```json
{
  "status": true,
  "message": "Category created successfully",
  "data": {
    "categoryCode": "CAT001",
    "categoryName": "Cơ sở vật chất",
    "departmentId": 1,
    "slaResolveHours": 24,
    "status": "ACTIVE"
  },
  "errors": []
}
```

**Priority:** 🔴 High (Cần kiểm tra backend có hỗ trợ chưa)

---

#### 3.2. API PUT `/api/Category/{categoryCode}` - Chưa hỗ trợ (Cần kiểm tra)

**Request format (Frontend sẽ gửi):**
```json
{
  "categoryName": "Cơ sở vật chất Updated",
  "departmentId": 2,
  "slaResolveHours": 48,
  "status": "INACTIVE"
}
```

**Priority:** 🔴 High (Cần kiểm tra backend có hỗ trợ chưa)

---

#### 3.3. API DELETE `/api/Category/{categoryCode}` - Chưa hỗ trợ (Cần kiểm tra)

**Priority:** 🔴 High (Cần kiểm tra backend có hỗ trợ chưa)

---

### ⚠️ Frontend cần kiểm tra:

#### 3.4. Mapping `departmentId` trong CategoryForm

**Vấn đề:**
- Category.departmentId từ API là `number`
- Department.id từ API là `string`
- Cần đảm bảo mapping đúng khi chọn department

**Giải pháp tạm thời:**
- Frontend đã implement logic parse, nhưng cần backend trả về `departmentId` trong Department response để mapping chính xác

**Priority:** 🟡 Medium

---

## 4. Quản lý thành viên - Staff

### ✅ Frontend đã làm:
- GET `/api/User` - Hiển thị danh sách ✅
- POST `/api/User` - Tạo mới ✅ (đã implement)
- PUT `/api/User/{userCode}` - Cập nhật ✅ (đã implement)
- DELETE `/api/User?code={userCode}` - Xóa ✅ (đã implement)
- Form có đầy đủ fields: `username`, `password`, `fullName`, `email`, `phoneNumber`, `role`, `departmentId`

### ⚠️ Backend cần kiểm tra:

#### 4.1. API PUT `/api/User/{userCode}` - Update password

**Vấn đề:**
- Frontend không thể update password qua PUT (không có field password trong UserUpdateDto)
- Cần endpoint riêng để reset password

**Yêu cầu:**
- Thêm endpoint: `PUT /api/User/{userCode}/reset-password` hoặc `POST /api/User/{userCode}/reset-password`
- Request body: `{ "newPassword": "string" }`

**Priority:** 🟡 Medium (Không blocking, nhưng cần có)

---

### ⚠️ Frontend đã sửa:
- ✅ Đã thêm field `phoneNumber` vào form
- ✅ Đã sửa logic update không dùng email làm phoneNumber
- ✅ Đã xử lý `onResetPassword` với thông báo API chưa hỗ trợ

---

## 5. Quản lý thành viên - Student

### ✅ Frontend đã làm:
- GET `/api/User` - Hiển thị danh sách ✅
- POST `/api/User` - Tạo mới ✅ (đã implement)
- PUT `/api/User/{userCode}` - Cập nhật ✅ (đã implement, nhưng chỉ update fullName)
- DELETE `/api/User?code={userCode}` - Xóa ✅ (đã implement)
- Form có đầy đủ fields: `username`, `password`, `fullName`, `email`

### ✅ Frontend đã đúng:
- UserForm chỉ có view mode khi edit - Đúng (student chỉ xem, không cần edit nhiều field)

---

## 📊 Tóm tắt theo mức độ ưu tiên

### 🔴 High Priority (Blocking):

1. **Location:**
   - GET `/api/Campus` cần trả về `campusId` (integer)

2. **Department:**
   - POST `/api/Departments` - Tạo mới
   - PUT `/api/Departments/{deptCode}` - Cập nhật
   - DELETE `/api/Departments/{deptCode}` - Xóa

3. **Category:**
   - POST `/api/Category` - Tạo mới (cần kiểm tra)
   - PUT `/api/Category/{categoryCode}` - Cập nhật (cần kiểm tra)
   - DELETE `/api/Category/{categoryCode}` - Xóa (cần kiểm tra)

### 🟡 Medium Priority:

1. **User/Staff:**
   - Endpoint reset password (không blocking, nhưng cần có)

2. **Category:**
   - Mapping `departmentId` - Cần backend trả về `departmentId` trong Department response

---

## ✅ Frontend đã sẵn sàng

Tất cả các chức năng frontend đã được implement và sẵn sàng. Khi backend cập nhật, frontend sẽ tự động hoạt động (không cần thay đổi code).

### Các file đã implement:

**Location:**
- ✅ `src/components/admin/LocationForm.tsx`
- ✅ `src/components/admin/LocationList.tsx`
- ✅ `src/services/locationService.ts`
- ✅ `src/pages/admin/admin-page.tsx`

**Department:**
- ✅ `src/components/admin/DepartmentForm.tsx`
- ✅ `src/components/admin/DepartmentList.tsx`
- ✅ `src/services/departmentService.ts`
- ✅ `src/pages/admin/admin-page.tsx`

**Category:**
- ✅ `src/components/admin/CategoryForm.tsx`
- ✅ `src/components/admin/CategoryList.tsx`
- ✅ `src/services/categoryService.ts`
- ✅ `src/pages/admin/admin-page.tsx`

**Staff & Student:**
- ✅ `src/components/admin/StaffForm.tsx`
- ✅ `src/components/admin/StaffList.tsx`
- ✅ `src/components/admin/UserForm.tsx`
- ✅ `src/components/admin/UserList.tsx`
- ✅ `src/services/userService.ts`
- ✅ `src/pages/admin/admin-page.tsx`

---

## 🔍 Cách kiểm tra

### 1. Test API endpoints:

```bash
# Test GET /api/Campus - Kiểm tra có campusId không
curl -X GET "https://fptechnical-1071992103404.asia-southeast1.run.app/api/Campus"

# Test POST /api/Departments
curl -X POST "https://fptechnical-1071992103404.asia-southeast1.run.app/api/Departments" \
  -H "Content-Type: application/json" \
  -d '{"deptCode":"TEST","deptName":"Test Dept","status":"ACTIVE"}'

# Test POST /api/Category
curl -X POST "https://fptechnical-1071992103404.asia-southeast1.run.app/api/Category" \
  -H "Content-Type: application/json" \
  -d '{"categoryCode":"TEST","categoryName":"Test Category","departmentId":1,"slaResolveHours":24,"status":"ACTIVE"}'
```

### 2. Check Console (F12):

Khi test các chức năng, kiểm tra console để xem:
- Request URL
- Request data
- Response từ backend
- Error messages

---

## 📝 Notes

- Tất cả các API endpoints cần trả về format chuẩn:
  ```json
  {
    "status": boolean,
    "message": string,
    "data": any,
    "errors": string[]
  }
  ```

- Error handling: Frontend đã có error handling đầy đủ, sẽ hiển thị thông báo rõ ràng khi backend có lỗi

- Authentication: Tất cả các API calls đều gửi kèm Authorization token từ localStorage

---

**Status:** ⏳ Đang chờ Backend cập nhật  
**Frontend:** ✅ Đã sẵn sàng  
**Backend:** ⏳ Cần implement các endpoints còn thiếu

