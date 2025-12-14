# Checklist kiểm tra API với Swagger

**Ngày tạo:** 2024-12-15  
**Mục đích:** Checklist để so sánh các endpoint trong frontend với Swagger API

**Swagger URL:** [Cần điền link Swagger vào đây]

---

## 📋 Hướng dẫn sử dụng

1. Mở Swagger UI
2. Điền link Swagger vào trên
3. Kiểm tra từng endpoint và đánh dấu ✅ hoặc ❌
4. Ghi chú các điểm khác biệt

---

## 1. Quản lý User (Staff & Student)

### 1.1. GET - Lấy danh sách users

**Frontend endpoint:** `GET /api/User`

**Swagger endpoint:** `GET /api/User` hoặc `GET /api/Users`

- [ ] Endpoint path khớp
- [ ] Response format khớp:
  - [ ] `status: boolean`
  - [ ] `message: string`
  - [ ] `data: UserDto[]`
  - [ ] `errors?: string[]`
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

### 1.2. POST - Tạo user mới

**Frontend endpoint:** `POST /api/User`

**Swagger endpoint:** `POST /api/User` hoặc `POST /api/Users`

**Request body (Frontend):**
```json
{
  "userCode": "string",
  "fullName": "string",
  "passwordHash": "string",
  "email": "string",
  "phoneNumber": "string (optional)",
  "roleId": 1-5,
  "departmentId": "number (optional)",
  "status": "ACTIVE"
}
```

- [ ] Endpoint path khớp
- [ ] Request body fields khớp:
  - [ ] `userCode` (required)
  - [ ] `fullName` (required)
  - [ ] `passwordHash` hoặc `password` (required)
  - [ ] `email` (required)
  - [ ] `phoneNumber` (optional)
  - [ ] `roleId` (required, number)
  - [ ] `departmentId` (optional, number)
  - [ ] `status` (required, ACTIVE/INACTIVE/BANNED)
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

### 1.3. PUT - Cập nhật user

**Frontend endpoint:** `PUT /api/User/{userCode}`

**Swagger endpoint:** `PUT /api/User/{userCode}` hoặc `PUT /api/Users/{userCode}` hoặc `PUT /api/User?code={userCode}`

**Request body (Frontend):**
```json
{
  "fullName": "string (optional)",
  "phoneNumber": "string (optional)",
  "roleId": "number (optional)",
  "departmentId": "number (optional)",
  "status": "ACTIVE/INACTIVE/BANNED (optional)"
}
```

- [ ] Endpoint path khớp
- [ ] Path parameter khớp: `{userCode}` vs `?code={userCode}`
- [ ] Request body fields khớp (tất cả optional)
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

### 1.4. DELETE - Xóa user

**Frontend endpoint:** `DELETE /api/User?code={userCode}`

**Swagger endpoint:** `DELETE /api/User?code={userCode}` hoặc `DELETE /api/User/{userCode}` hoặc `DELETE /api/Users/{userCode}`

- [ ] Endpoint path khớp
- [ ] Query parameter vs Path parameter: `?code=` vs `/{userCode}`
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

## 2. Quản lý Category

### 2.1. GET - Lấy danh sách categories

**Frontend endpoint:** `GET /api/Category`

**Swagger endpoint:** `GET /api/Category` hoặc `GET /api/Categories`

- [ ] Endpoint path khớp
- [ ] Response format khớp
- [ ] Category fields khớp:
  - [ ] `categoryCode: string`
  - [ ] `categoryName: string`
  - [ ] `departmentId: number`
  - [ ] `slaResolveHours: number`
  - [ ] `status: ACTIVE/INACTIVE`

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

### 2.2. POST - Tạo category mới

**Frontend endpoint:** `POST /api/Category`

**Swagger endpoint:** `POST /api/Category` hoặc `POST /api/Categories`

**Request body (Frontend):**
```json
{
  "categoryCode": "string",
  "categoryName": "string",
  "departmentId": "number",
  "slaResolveHours": "number",
  "status": "ACTIVE/INACTIVE"
}
```

- [ ] Endpoint path khớp
- [ ] Request body fields khớp (tất cả required)
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

### 2.3. PUT - Cập nhật category

**Frontend endpoint:** `PUT /api/Category/{categoryCode}`

**Swagger endpoint:** `PUT /api/Category/{categoryCode}` hoặc `PUT /api/Categories/{categoryCode}` hoặc `PUT /api/Category/{id}`

**Request body (Frontend):**
```json
{
  "categoryName": "string (optional)",
  "departmentId": "number (optional)",
  "slaResolveHours": "number (optional)",
  "status": "ACTIVE/INACTIVE (optional)"
}
```

- [ ] Endpoint path khớp
- [ ] Path parameter: `{categoryCode}` vs `{id}`
- [ ] Request body fields khớp (tất cả optional)
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

### 2.4. DELETE - Xóa category

**Frontend endpoint:** `DELETE /api/Category/{categoryCode}`

**Swagger endpoint:** `DELETE /api/Category/{categoryCode}` hoặc `DELETE /api/Categories/{categoryCode}` hoặc `DELETE /api/Category/{id}`

- [ ] Endpoint path khớp
- [ ] Path parameter: `{categoryCode}` vs `{id}`
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

## 3. Quản lý Department

### 3.1. GET - Lấy danh sách departments

**Frontend endpoint:** `GET /api/Departments`

**Swagger endpoint:** `GET /api/Departments` hoặc `GET /api/Department`

- [ ] Endpoint path khớp
- [ ] Response format khớp
- [ ] Department fields khớp:
  - [ ] `deptCode: string`
  - [ ] `deptName: string`
  - [ ] `status: ACTIVE/INACTIVE`

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

### 3.2. POST - Tạo department mới

**Frontend endpoint:** `POST /api/Departments`

**Swagger endpoint:** `POST /api/Departments` hoặc `POST /api/Department`

**Request body (Frontend):**
```json
{
  "deptCode": "string",
  "deptName": "string",
  "status": "ACTIVE/INACTIVE"
}
```

- [ ] Endpoint path khớp
- [ ] Request body fields khớp (tất cả required)
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

### 3.3. PUT - Cập nhật department

**Frontend endpoint:** `PUT /api/Departments/{deptCode}`

**Swagger endpoint:** `PUT /api/Departments/{deptCode}` hoặc `PUT /api/Department/{deptCode}` hoặc `PUT /api/Departments/{id}`

**Request body (Frontend):**
```json
{
  "deptName": "string (optional)",
  "status": "ACTIVE/INACTIVE (optional)"
}
```

- [ ] Endpoint path khớp
- [ ] Path parameter: `{deptCode}` vs `{id}`
- [ ] Request body fields khớp (tất cả optional)
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

### 3.4. DELETE - Xóa department

**Frontend endpoint:** `DELETE /api/Departments/{deptCode}`

**Swagger endpoint:** `DELETE /api/Departments/{deptCode}` hoặc `DELETE /api/Department/{deptCode}` hoặc `DELETE /api/Departments/{id}`

- [ ] Endpoint path khớp
- [ ] Path parameter: `{deptCode}` vs `{id}`
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

## 4. Quản lý Location

### 4.1. GET - Lấy danh sách locations

**Frontend endpoint:** `GET /api/Locations?PageNumber=1&PageSize=100`

**Swagger endpoint:** `GET /api/Locations` hoặc `GET /api/Location`

- [ ] Endpoint path khớp
- [ ] Query parameters:
  - [ ] `PageNumber` (optional?)
  - [ ] `PageSize` (optional?)
- [ ] Response format khớp
- [ ] Location fields khớp:
  - [ ] `locationCode: string`
  - [ ] `locationName: string`
  - [ ] `status: ACTIVE/INACTIVE`
  - [ ] `campusId: number` (nếu có)

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

### 4.2. POST - Tạo location mới

**Frontend endpoint:** `POST /api/Location`

**Swagger endpoint:** `POST /api/Location` hoặc `POST /api/Locations`

**Request body (Frontend):**
```json
{
  "locationCode": "string",
  "locationName": "string",
  "campusId": "number (required)"
}
```

- [ ] Endpoint path khớp
- [ ] Request body fields khớp:
  - [ ] `locationCode` (required)
  - [ ] `locationName` (required)
  - [ ] `campusId` (required, number/integer)
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

### 4.3. PUT - Cập nhật location

**Frontend endpoint:** `PUT /api/Location`

**Swagger endpoint:** `PUT /api/Location` hoặc `PUT /api/Locations` hoặc `PUT /api/Location/{locationCode}`

**Request body (Frontend):**
```json
{
  "locationCode": "string",
  "locationName": "string"
}
```

- [ ] Endpoint path khớp
- [ ] Request body vs Path parameter: body có `locationCode` vs path `/{locationCode}`
- [ ] Request body fields khớp
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

### 4.4. PATCH - Cập nhật status

**Frontend endpoint:** `PATCH /api/Location/status`

**Swagger endpoint:** `PATCH /api/Location/status` hoặc `PATCH /api/Location/{locationCode}/status`

**Request body (Frontend):**
```json
{
  "locationCode": "string",
  "status": "ACTIVE/INACTIVE"
}
```

- [ ] Endpoint path khớp
- [ ] Request body vs Path parameter: body có `locationCode` vs path `/{locationCode}`
- [ ] Request body fields khớp
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

### 4.5. DELETE - Xóa location

**Frontend endpoint:** `DELETE /api/Location?locationCode={code}`

**Swagger endpoint:** `DELETE /api/Location?locationCode={code}` hoặc `DELETE /api/Location/{locationCode}`

- [ ] Endpoint path khớp
- [ ] Query parameter vs Path parameter: `?locationCode=` vs `/{locationCode}`
- [ ] Response format khớp

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

## 5. Campus API (Quan trọng cho Location)

### 5.1. GET - Lấy danh sách campuses

**Frontend endpoint:** `GET /api/Campus`

**Swagger endpoint:** `GET /api/Campus` hoặc `GET /api/Campuses`

**Response hiện tại (Frontend nhận được):**
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

**Response mong đợi (cần cho Location):**
```json
{
  "status": true,
  "data": [
    {
      "campusId": 1,              // ← THIẾU FIELD NÀY
      "campusCode": "NVH",
      "campusName": "Nhà văn hóa sinh viên"
    }
  ]
}
```

- [ ] Endpoint path khớp
- [ ] Response có field `campusId: number` (integer) ✅/❌
- [ ] Response có field `campusCode: string` ✅/❌
- [ ] Response có field `campusName: string` ✅/❌

**Ghi chú khác biệt:**
```
[Điền vào đây nếu có khác biệt]
```

---

## 📊 Tổng kết

### Số lượng endpoints cần kiểm tra: 17

- User: 4 endpoints
- Category: 4 endpoints
- Department: 4 endpoints
- Location: 5 endpoints

### Tổng số checklist items: ~80+

---

## 🚨 Vấn đề cần chú ý

1. **Endpoint naming:** Một số có thể dùng số ít (`/User`) hoặc số nhiều (`/Users`)
2. **Path vs Query parameters:** Một số dùng path (`/{id}`) hoặc query (`?code=`)
3. **Request body format:** Một số có thể yêu cầu fields khác nhau
4. **Response format:** Cần đảm bảo format nhất quán

---

## ✅ Sau khi hoàn thành checklist

1. Tạo file `SWAGGER_COMPARISON_RESULTS.md` với kết quả
2. Cập nhật các service files nếu có thay đổi
3. Test lại tất cả CRUD operations

