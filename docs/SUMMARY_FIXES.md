# Tóm tắt - Những gì cần sửa

## 🔴 Backend cần sửa (High Priority)

### 1. Location - GET `/api/Campus`
**Vấn đề:** Thiếu field `campusId` (integer) trong response  
**Sửa:** Thêm `campusId` vào response

```json
{
  "campusId": 1,  // ← THÊM
  "campusCode": "NVH",
  "campusName": "Nhà văn hóa sinh viên"
}
```

---

### 2. Department - POST `/api/Departments`
**Vấn đề:** Chưa hỗ trợ (405 Method Not Allowed)  
**Sửa:** Implement endpoint tạo department

**Request:**
```json
{
  "deptCode": "IT",
  "deptName": "IT Department",
  "status": "ACTIVE"
}
```

---

### 3. Department - PUT `/api/Departments/{deptCode}`
**Vấn đề:** Chưa hỗ trợ (404 Not Found)  
**Sửa:** Implement endpoint cập nhật department

**Request:**
```json
{
  "deptName": "IT Department Updated",
  "status": "INACTIVE"
}
```

---

### 4. Department - DELETE `/api/Departments/{deptCode}`
**Vấn đề:** Chưa hỗ trợ (404 Not Found)  
**Sửa:** Implement endpoint xóa department

---

### 5. Category - POST/PUT/DELETE `/api/Category`
**Vấn đề:** Cần kiểm tra backend có hỗ trợ chưa  
**Sửa:** Implement nếu chưa có

---

## 🟡 Backend cần kiểm tra (Medium Priority)

### 1. User - Reset Password
**Vấn đề:** Không thể reset password qua PUT `/api/User/{userCode}`  
**Sửa:** Tạo endpoint riêng: `PUT /api/User/{userCode}/reset-password`

---

## ✅ Frontend đã sẵn sàng

Tất cả các chức năng frontend đã được implement đầy đủ:
- ✅ Location: Create, Update, Delete, List
- ✅ Department: Create, Update, Delete, List (đang chờ backend)
- ✅ Category: Create, Update, Delete, List (đang chờ backend)
- ✅ Staff: Create, Update, Delete, List, Toggle Status
- ✅ Student: Create, Update, Delete, List, Toggle Status

---

## 📋 Checklist Backend

- [ ] GET `/api/Campus` - Thêm `campusId` vào response
- [ ] POST `/api/Departments` - Implement
- [ ] PUT `/api/Departments/{deptCode}` - Implement
- [ ] DELETE `/api/Departments/{deptCode}` - Implement
- [ ] POST `/api/Category` - Kiểm tra và implement nếu chưa có
- [ ] PUT `/api/Category/{categoryCode}` - Kiểm tra và implement nếu chưa có
- [ ] DELETE `/api/Category/{categoryCode}` - Kiểm tra và implement nếu chưa có
- [ ] PUT `/api/User/{userCode}/reset-password` - Implement (optional)

---

**Chi tiết đầy đủ:** Xem file `docs/BACKEND_FRONTEND_FIXES_REQUIRED.md`

