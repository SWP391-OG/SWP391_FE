# Backend API Requirements - Campus & Location Integration

## Vấn đề hiện tại

Frontend cần `campusId` (số nguyên) để tạo location mới, nhưng API `/Campus` hiện tại không trả về field này.

## Yêu cầu Backend

### 1. API GET `/api/Campus` - Cập nhật Response

**Hiện tại:**
```json
{
  "status": true,
  "message": "Success",
  "data": [
    {
      "campusCode": "NVH",
      "campusName": "Nhà văn hóa sinh viên"
    },
    {
      "campusCode": "HCM",
      "campusName": "FPT University TP.HCM"
    }
  ],
  "errors": []
}
```

**Yêu cầu cập nhật:**
```json
{
  "status": true,
  "message": "Success",
  "data": [
    {
      "campusId": 1,                    // ← THÊM FIELD NÀY (số nguyên, required)
      "campusCode": "NVH",
      "campusName": "Nhà văn hóa sinh viên"
    },
    {
      "campusId": 2,                    // ← THÊM FIELD NÀY (số nguyên, required)
      "campusCode": "HCM",
      "campusName": "FPT University TP.HCM"
    }
  ],
  "errors": []
}
```

### 2. API POST `/api/Locations` - Yêu cầu hiện tại (đã đúng)

**Request Body:**
```json
{
  "locationCode": "LOC001",
  "locationName": "Phòng 301",
  "campusId": 1  // ← Số nguyên (integer), required
}
```

**Response:**
```json
{
  "status": true,
  "message": "Location created successfully",
  "data": {
    "locationCode": "LOC001",
    "locationName": "Phòng 301",
    "status": "ACTIVE"
  },
  "errors": []
}
```

## Tóm tắt thay đổi Backend cần làm

1. ✅ **API POST `/api/Locations`** - Đã đúng, không cần thay đổi
2. ❌ **API GET `/api/Campus`** - Cần thêm field `campusId` (integer) vào response

## Lý do

- Frontend cần `campusId` để gửi request tạo location
- Hiện tại frontend không thể lấy `campusId` từ API `/Campus`
- Giải pháp tạm thời (hardcode mapping) không tối ưu và khó maintain

## Sau khi Backend cập nhật

Frontend sẽ tự động hoạt động vì:
- Code đã sẵn sàng sử dụng `campusId` từ API response
- Không cần thay đổi gì ở frontend
- Logic validation đã có sẵn

## Test Cases

### Test 1: GET `/api/Campus`
**Expected:** Response phải có `campusId` (integer) trong mỗi object

### Test 2: POST `/api/Locations`
**Request:**
```json
{
  "locationCode": "TEST001",
  "locationName": "Test Location",
  "campusId": 1
}
```
**Expected:** Tạo location thành công với `campusId` hợp lệ

---

**Ngày tạo:** 2024
**Người yêu cầu:** Frontend Team
**Mức độ ưu tiên:** High (Blocking feature)

