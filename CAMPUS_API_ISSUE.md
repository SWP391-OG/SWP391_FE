# Vấn đề API Campus - Thiếu campusId

## Mô tả vấn đề

Backend API yêu cầu `campusId` (số nguyên - integer) khi tạo location mới, nhưng API `/Campus` không trả về field `campusId`.

## Chi tiết

### API hiện tại: `GET /api/Campus`

**Response hiện tại:**
```json
{
  "status": true,
  "message": "...",
  "data": [
    {
      "campusCode": "NVH",
      "campusName": "Nhà văn hóa sinh viên"
      // ❌ THIẾU: "campusId": 1
    },
    {
      "campusCode": "HCM",
      "campusName": "FPT University TP.HCM"
      // ❌ THIẾU: "campusId": 2
    }
  ]
}
```

### API yêu cầu khi tạo Location: `POST /api/Location`

**Request body cần:**
```json
{
  "locationCode": "NVH-P604",
  "locationName": "Phòng 604",
  "campusId": 1  // ✅ YÊU CẦU: phải là số (System.Int32)
}
```

## Lỗi hiện tại

```
Error: The JSON value could not be converted to System.Int32. Path: $.campusId
Error: Valid campus ID is required
```

## Giải pháp yêu cầu Backend

### Option 1: Cập nhật API `/Campus` (Khuyến nghị)

API `/Campus` cần trả về `campusId` trong response:

```json
{
  "status": true,
  "message": "...",
  "data": [
    {
      "campusId": 1,        // ✅ THÊM: Campus ID (integer)
      "campusCode": "NVH",
      "campusName": "Nhà văn hóa sinh viên"
    },
    {
      "campusId": 2,        // ✅ THÊM: Campus ID (integer)
      "campusCode": "HCM",
      "campusName": "FPT University TP.HCM"
    }
  ]
}
```

### Option 2: Tạo API mới để lấy Campus Detail

Nếu không thể cập nhật API `/Campus`, có thể tạo endpoint mới:

**Endpoint:** `GET /api/Campus/{campusCode}`

**Response:**
```json
{
  "status": true,
  "message": "...",
  "data": {
    "campusId": 1,
    "campusCode": "NVH",
    "campusName": "Nhà văn hóa sinh viên"
  }
}
```

### Option 3: Backend chấp nhận campusCode thay vì campusId

Nếu backend có thể xử lý, có thể cho phép gửi `campusCode` trong field `campusId` (nhưng cần backend parse).

**Không khuyến nghị** vì sẽ phá vỡ type safety.

## Frontend Code hiện tại

Frontend đã sẵn sàng xử lý `campusId`:
- ✅ Interface `Campus` đã có `campusId?: number`
- ✅ Form đã có logic để lấy và sử dụng `campusId`
- ✅ Service đã có logic fallback để lấy `campusId` từ API detail (nếu có)

## Hành động cần thiết

**Backend team cần:**
1. ✅ Cập nhật API `GET /api/Campus` để trả về `campusId` trong response
2. Hoặc tạo API `GET /api/Campus/{campusCode}` để lấy campus detail với `campusId`

**Frontend sẽ tự động hoạt động** sau khi backend cập nhật API.

