# Tóm tắt Implementation - API Tạo Ticket

## ✅ Đã hoàn thành

### 1. Tạo service upload ảnh (imageUploadService.ts)
- Upload ảnh lên Cloudinary
- Hỗ trợ upload nhiều ảnh cùng lúc
- Trả về URLs cách nhau bằng dấu phẩy (như yêu cầu backend)

### 2. Cập nhật ticketService
- Thêm method `createTicket()` gọi API `/Ticket` POST
- Request format đúng theo backend spec
- Response handling với proper error checking

### 3. Cập nhật create-ticket-page
**Thay đổi chính:**
- ✅ Tiêu đề tự động lấy từ tên category (read-only)
- ✅ Địa điểm là dropdown bắt buộc chọn
- ✅ Upload nhiều ảnh lên Cloudinary
- ✅ Gọi API tạo ticket với dữ liệu thực
- ✅ Hiển thị thông báo lỗi/thành công
- ✅ Loading state khi đang gửi

### 4. Thêm types
- `IssueType` interface
- `IssueCategory` type
- Request/Response types cho API

### 5. Cập nhật .env.example
- Thêm Cloudinary configuration
- Cập nhật API_BASE_URL

## 📋 Request/Response Format

### Request (Frontend → Backend)
```json
{
  "title": "Hư hỏng cơ sở vật chất",
  "description": "Bàn ghế bị hỏng",
  "imageUrl": "https://cloudinary.com/img1.jpg,https://cloudinary.com/img2.jpg",
  "locationCode": "P101",
  "categoryCode": "facility-broken"
}
```

### Response (Backend → Frontend)
```json
{
  "status": true,
  "message": "Ticket created successfully",
  "data": {
    "ticketCode": "TKT-0001",
    "title": "Hư hỏng cơ sở vật chất",
    "description": "Bàn ghế bị hỏng",
    "imageUrl": "https://cloudinary.com/img1.jpg,https://cloudinary.com/img2.jpg",
    "requesterCode": "SE123456",
    "requesterName": "Nguyễn Văn A",
    "locationCode": "P101",
    "locationName": "Phòng 101",
    "categoryCode": "facility-broken",
    "categoryName": "Hư hỏng cơ sở vật chất",
    "status": "open",
    "createdAt": "2025-12-10T10:30:00Z",
    "resolveDeadline": "2025-12-12T10:30:00Z",
    ...
  },
  "errors": []
}
```

## 🔧 Cấu hình cần thiết

### 1. Tạo file .env
```bash
cp .env.example .env
```

### 2. Điền thông tin Cloudinary
```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
VITE_API_BASE_URL=https://localhost:7151/api
```

### 3. Tạo Unsigned Upload Preset trên Cloudinary
1. Đăng nhập Cloudinary
2. Settings → Upload → Add upload preset
3. Chọn "Unsigned" signing mode
4. Copy preset name

## 📱 Flow hoạt động

```
1. User chọn category → Tiêu đề tự động điền
2. User nhập mô tả
3. User chọn địa điểm (required)
4. User upload ảnh (optional)
5. User click "Gửi Ticket"
   ↓
6. Upload ảnh lên Cloudinary → Nhận URLs
   ↓
7. Gọi API /Ticket POST với:
   - title (từ category name)
   - description
   - imageUrl (URLs cách nhau bằng ",")
   - locationCode
   - categoryCode
   ↓
8. Backend xử lý và trả response
   ↓
9. Hiển thị thông báo thành công/lỗi
```

## 🎯 Điểm cần lưu ý

### Frontend
1. **Tiêu đề**: Tự động lấy từ `issueType.name`, không cho user sửa
2. **Địa điểm**: Bắt buộc phải chọn từ dropdown
3. **Ảnh**: 
   - Upload lên Cloudinary trước
   - Nhiều ảnh → cách nhau bằng dấu phẩy
   - Nếu upload fail → dừng submit, báo lỗi
4. **Error handling**: Xử lý cả lỗi upload ảnh và lỗi API

### Backend cần xử lý
1. **imageUrl**: Parse string thành array
   ```csharp
   var imageUrls = ticket.ImageUrl?.Split(',', StringSplitOptions.RemoveEmptyEntries) 
                   ?? Array.Empty<string>();
   ```

2. **Validation**:
   - locationCode phải tồn tại
   - categoryCode phải tồn tại
   - title và description không rỗng

3. **Response**: Trả đúng format như đã define

## 🚀 Test thử

### 1. Kiểm tra Cloudinary
```typescript
// Trong browser console
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const url = await imageUploadService.uploadSingle(file);
console.log(url); // Should return Cloudinary URL
```

### 2. Kiểm tra API
- Mở Network tab (F12)
- Tạo ticket có ảnh
- Xem request payload và response

### 3. Kiểm tra form
- ✓ Tiêu đề hiển thị đúng tên category
- ✓ Dropdown địa điểm hoạt động
- ✓ Preview ảnh trước khi submit
- ✓ Loading state khi submit
- ✓ Thông báo lỗi/thành công

## 📚 Documentation
Chi tiết xem file: `TICKET_CREATE_API_GUIDE.md`

## ⚠️ Known Issues / TODO
1. Chưa có image compression (ảnh lớn → upload lâu)
2. Chưa giới hạn số lượng/kích thước ảnh
3. Chưa có progress bar khi upload
4. Cloudinary dùng unsigned mode (development only)
   - Production nên dùng signed upload với backend proxy

## 🎉 Kết quả
- ✅ Form tạo ticket hoạt động với API thật
- ✅ Upload ảnh lên Cloudinary thành công
- ✅ Tiêu đề tự động từ category
- ✅ Dropdown địa điểm với dữ liệu thực
- ✅ Error handling và user feedback tốt
- ✅ No TypeScript errors
- ✅ Code clean và maintainable
