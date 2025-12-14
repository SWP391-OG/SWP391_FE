# Phân tích lỗi API Department

## Lỗi từ Console

### 1. **405 Method Not Allowed** - `/api/Departments/:1` (4 lần)
```
Failed to load resource: the server responded with a status of 405 ()
URL: fptechnical-1071992103404.asia-southeast1.run.app/api/Departments/:1
```

**Nguyên nhân:**
- Backend không hỗ trợ POST/PUT/DELETE cho endpoint `/api/Departments`
- Hoặc endpoint path không đúng

### 2. **404 Not Found** - `/api/Departments/QC:1` (2 lần)
```
Failed to load resource: the server responded with a status of 404 ()
URL: fptechnical-1071992103404.asia-southeast1.run.app/api/Departments/QC:1
```

**Nguyên nhân:**
- Endpoint `/api/Departments/{deptCode}` không tồn tại
- Hoặc department với code "QC" không tồn tại

---

## Kết luận

**Backend hiện tại CHƯA HỖ TRỢ:**
- ❌ POST `/api/Departments` - Tạo bộ phận mới
- ❌ PUT `/api/Departments/{deptCode}` - Cập nhật bộ phận
- ❌ DELETE `/api/Departments/{deptCode}` - Xóa bộ phận

**Backend CHỈ HỖ TRỢ:**
- ✅ GET `/api/Departments` - Lấy danh sách bộ phận

---

## Giải pháp tạm thời

1. **Hiển thị thông báo rõ ràng** khi backend chưa hỗ trợ
2. **Disable các nút thêm/sửa/xóa** hoặc hiển thị warning
3. **Yêu cầu backend implement** các endpoints này

---

## Endpoints cần Backend implement

### POST `/api/Departments`
**Request:**
```json
{
  "deptCode": "IT",
  "deptName": "IT Department",
  "status": "ACTIVE"
}
```

**Response:**
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

### PUT `/api/Departments/{deptCode}`
**Request:**
```json
{
  "deptName": "IT Department Updated",
  "status": "INACTIVE"
}
```

**Response:**
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

### DELETE `/api/Departments/{deptCode}`
**Response:**
```json
{
  "status": true,
  "message": "Department deleted successfully",
  "data": null,
  "errors": []
}
```

---

**Status:** ⏳ Đang chờ Backend implement

