# So sánh API Endpoints - Frontend vs Swagger

**Ngày tạo:** 2024-12-15  
**Mục đích:** Kiểm tra xem các endpoint API trong frontend đã phù hợp với Swagger API mới chưa

---

## 📋 Tổng quan

File này so sánh các endpoint API hiện tại trong frontend code với Swagger API để đảm bảo tính nhất quán.

**API Base URL:** `https://fptechnical-1071992103404.asia-southeast1.run.app/api`

---

## 1. Quản lý User (Staff & Student)

### Endpoints hiện tại trong Frontend:

| Method | Endpoint | Mô tả | File |
|--------|----------|-------|------|
| GET | `/User` | Lấy tất cả users | `userService.ts` |
| GET | `/User/profile` | Lấy profile của current user | `userService.ts` |
| PUT | `/User/profile` | Cập nhật profile | `userService.ts` |
| POST | `/User` | Tạo user mới | `userService.ts` |
| PUT | `/User/{userCode}` | Cập nhật user | `userService.ts` |
| DELETE | `/User?code={userCode}` | Xóa user | `userService.ts` |

### Request/Response Format:

#### POST `/User` (Create)
```typescript
Request: {
  userCode: string;
  fullName: string;
  passwordHash: string;
  email: string;
  phoneNumber?: string;
  roleId: number;  // 1=admin, 2=it-staff, 3=student, 4=teacher, 5=facility-staff
  departmentId?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
}
```

#### PUT `/User/{userCode}` (Update)
```typescript
Request: {
  fullName?: string;
  phoneNumber?: string;
  roleId?: number;
  departmentId?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';
}
```

#### DELETE `/User?code={userCode}`
- Query parameter: `code`

---

## 2. Quản lý Category

### Endpoints hiện tại trong Frontend:

| Method | Endpoint | Mô tả | File |
|--------|----------|-------|------|
| GET | `/Category` | Lấy tất cả categories | `categoryService.ts` |
| POST | `/Category` | Tạo category mới | `categoryService.ts` |
| PUT | `/Category/{categoryCode}` | Cập nhật category | `categoryService.ts` |
| DELETE | `/Category/{categoryCode}` | Xóa category | `categoryService.ts` |

### Request/Response Format:

#### POST `/Category` (Create)
```typescript
Request: {
  categoryCode: string;
  categoryName: string;
  departmentId: number;
  slaResolveHours: number;
  status: 'ACTIVE' | 'INACTIVE';
}
```

#### PUT `/Category/{categoryCode}` (Update)
```typescript
Request: {
  categoryName?: string;
  departmentId?: number;
  slaResolveHours?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
```

#### DELETE `/Category/{categoryCode}`
- Path parameter: `categoryCode`

---

## 3. Quản lý Department

### Endpoints hiện tại trong Frontend:

| Method | Endpoint | Mô tả | File |
|--------|----------|-------|------|
| GET | `/Departments` | Lấy tất cả departments | `departmentService.ts` |
| POST | `/Departments` | Tạo department mới | `departmentService.ts` |
| PUT | `/Departments/{deptCode}` | Cập nhật department | `departmentService.ts` |
| DELETE | `/Departments/{deptCode}` | Xóa department | `departmentService.ts` |

### Request/Response Format:

#### POST `/Departments` (Create)
```typescript
Request: {
  deptCode: string;
  deptName: string;
  status: 'ACTIVE' | 'INACTIVE';
}
```

#### PUT `/Departments/{deptCode}` (Update)
```typescript
Request: {
  deptName?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
```

#### DELETE `/Departments/{deptCode}`
- Path parameter: `deptCode`

---

## 4. Quản lý Location

### Endpoints hiện tại trong Frontend:

| Method | Endpoint | Mô tả | File |
|--------|----------|-------|------|
| GET | `/Locations?PageNumber=1&PageSize=100` | Lấy tất cả locations | `locationService.ts` |
| POST | `/Location` | Tạo location mới | `locationService.ts` |
| PUT | `/Location` | Cập nhật location | `locationService.ts` |
| PATCH | `/Location/status` | Cập nhật status | `locationService.ts` |
| DELETE | `/Location?locationCode={code}` | Xóa location | `locationService.ts` |

### Request/Response Format:

#### POST `/Location` (Create)
```typescript
Request: {
  locationCode: string;
  locationName: string;
  campusId: number;  // Required, integer
}
```

#### PUT `/Location` (Update)
```typescript
Request: {
  locationCode: string;
  locationName: string;
}
```

#### PATCH `/Location/status` (Update Status)
```typescript
Request: {
  locationCode: string;
  status: 'ACTIVE' | 'INACTIVE';
}
```

#### DELETE `/Location?locationCode={code}`
- Query parameter: `locationCode`

---

## 🔍 Checklist kiểm tra với Swagger

### Cần kiểm tra:

- [ ] **User Management:**
  - [ ] Endpoint paths có đúng không? (`/User` vs `/Users` vs `/api/User`)
  - [ ] Request body format có khớp không?
  - [ ] Response format có khớp không?
  - [ ] Query parameters có đúng không? (`code` vs `userCode`)

- [ ] **Category Management:**
  - [ ] Endpoint paths có đúng không? (`/Category` vs `/Categories`)
  - [ ] Path parameters có đúng không? (`{categoryCode}` vs `{id}`)
  - [ ] Request body fields có đầy đủ không?

- [ ] **Department Management:**
  - [ ] Endpoint paths có đúng không? (`/Departments` vs `/Department`)
  - [ ] Path parameters có đúng không? (`{deptCode}` vs `{id}`)
  - [ ] Request body fields có đầy đủ không?

- [ ] **Location Management:**
  - [ ] Endpoint paths có đúng không? (`/Location` vs `/Locations`)
  - [ ] Query parameters có đúng không? (`locationCode` vs `code`)
  - [ ] `campusId` có được yêu cầu và đúng type không?

---

## 📝 Ghi chú

1. **Campus API:** Hiện tại API `/Campus` không trả về `campusId` (integer), chỉ có `campusCode` và `campusName`. Điều này gây khó khăn khi tạo location vì backend yêu cầu `campusId` là integer.

2. **Error Handling:** Tất cả các service đều có error handling chi tiết, bao gồm:
   - Network errors
   - 404 Not Found
   - 405 Method Not Allowed
   - 400 Bad Request
   - 401/403 Authentication errors
   - 500 Server errors

3. **Response Format:** Tất cả API responses đều mong đợi format:
```typescript
{
  status: boolean;
  message: string;
  data: T | T[];
  errors?: string[];
}
```

---

## 🚨 Vấn đề đã biết

1. **Department POST/PUT/DELETE:** Backend có thể chưa hỗ trợ (405 Method Not Allowed)
2. **Category POST/PUT/DELETE:** Backend có thể chưa hỗ trợ (405 Method Not Allowed)
3. **Campus API:** Thiếu `campusId` trong response

---

## 📌 Next Steps

1. **Kiểm tra Swagger:** So sánh các endpoint trên với Swagger API documentation
2. **Cập nhật code:** Nếu có thay đổi trong Swagger, cập nhật các service files tương ứng
3. **Test:** Test lại tất cả CRUD operations sau khi cập nhật

---

**Lưu ý:** File này cần được cập nhật sau khi kiểm tra Swagger API thực tế.

