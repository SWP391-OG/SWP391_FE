# Frontend Implementation - Location Management

## Tình trạng hiện tại

Frontend đã sẵn sàng xử lý `campusId` từ API response. Code đã được implement đầy đủ.

## Các file liên quan

### 1. `src/services/campusService.ts`
- Interface `Campus` đã có `campusId?: number`
- Method `getAllCampuses()` đã sẵn sàng nhận `campusId` từ API
- Method `getCampusByCode()` có fallback để lấy `campusId` nếu không có trong list

### 2. `src/pages/admin/admin-page.tsx`
- Load campuses từ API khi component mount
- Validate `campusId` trước khi tạo location
- Hiển thị error message rõ ràng nếu `campusId` không có

### 3. `src/components/admin/LocationForm.tsx`
- Dropdown để chọn campus
- Form data đã có `campusCode` và `campusId`

### 4. `src/services/locationService.ts`
- Method `create()` đã sẵn sàng nhận `campusId: number`
- Request body đã đúng format

### 5. `src/types/index.ts`
- `LocationRequestDto` đã có `campusId: number`
- `Campus` interface đã có `campusId?: number`

## Flow hoạt động

### Khi tạo Location mới:

1. **User chọn campus từ dropdown**
   - Dropdown hiển thị `campusName` (từ API `/Campus`)
   - Value lưu là `campusCode`

2. **Khi submit form:**
   ```typescript
   // Tìm campus đã chọn
   const selectedCampus = campuses.find(c => c.campusCode === locationFormData.campusCode);
   
   // Validate campusId
   if (!selectedCampus.campusId) {
     // Try fallback: get from detail API
     // If still no campusId → Show error
   }
   
   // Create location với campusId
   await locationService.create({
     locationCode: locationFormData.locationCode,
     locationName: locationFormData.locationName,
     campusId: selectedCampus.campusId  // ← Số nguyên
   });
   ```

3. **API Request:**
   ```json
   POST /api/Locations
   {
     "locationCode": "LOC001",
     "locationName": "Phòng 301",
     "campusId": 1
   }
   ```

## Error Handling

### Case 1: API `/Campus` không trả về `campusId`
- Frontend sẽ hiển thị alert với message rõ ràng
- Hướng dẫn user liên hệ backend team
- Log error vào console để debug

### Case 2: API `/Campus` đã trả về `campusId`
- Frontend tự động sử dụng `campusId` từ response
- Tạo location thành công

## Sau khi Backend cập nhật API

**Không cần thay đổi gì ở Frontend!**

Code đã sẵn sàng:
- ✅ Interface đã có `campusId?: number`
- ✅ Logic validation đã có
- ✅ Error handling đã có
- ✅ Request format đã đúng

Chỉ cần Backend trả về `campusId` trong API `/Campus`, frontend sẽ tự động hoạt động.

## Testing

### Test Case 1: API trả về `campusId`
1. Backend cập nhật API `/Campus` để trả về `campusId`
2. Frontend load campuses → `campusId` có trong response
3. User chọn campus và tạo location → Thành công

### Test Case 2: API chưa trả về `campusId`
1. API `/Campus` không có `campusId`
2. Frontend load campuses → `campusId` là `undefined`
3. User chọn campus và tạo location → Hiển thị error message

---

**Status:** ✅ Frontend đã sẵn sàng
**Blocking:** ⏳ Đang chờ Backend cập nhật API `/Campus`

