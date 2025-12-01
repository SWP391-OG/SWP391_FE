# Hướng Dẫn Sử Dụng Hệ Thống Ticket

## Tổng Quan

Hệ thống ticket cho phép sinh viên báo cáo các vấn đề gặp phải về cơ sở vật chất, WiFi, thiết bị và các vấn đề khác tại trường.

## Các Tính Năng Mới

### 1. Trang Chọn Loại Vấn Đề (Issue Selection Page)

Sinh viên có thể chọn từ 8 loại vấn đề phổ biến:

- 🔨 **Hư hỏng cơ sở vật chất**: Bàn ghế, cửa, điều hòa, quạt,...
- 📶 **Vấn đề WiFi**: Kết nối, tốc độ, không truy cập được internet
- 💻 **Thiết bị hư hỏng**: Máy chiếu, máy tính, loa, micro
- 🧹 **Vệ sinh phòng học**: Phòng không sạch, bàn ghế bẩn
- ❌ **Thiếu cơ sở vật chất**: Thiếu bàn ghế, bảng, phấn/bút
- ⚡ **Vấn đề điện**: Mất điện, ổ cắm, đèn chiếu sáng
- 💧 **Vấn đề nước**: Vòi nước, nhà vệ sinh, rò rỉ
- 📝 **Vấn đề khác**: Các vấn đề không thuộc danh mục trên

### 2. Trang Tạo Ticket (Create Ticket Page)

Form tạo ticket bao gồm:

#### Thông tin bắt buộc:
- **Tiêu đề**: Tóm tắt ngắn gọn về vấn đề
- **Mô tả chi tiết**: Mô tả chi tiết vấn đề gặp phải

#### Thông tin tùy chọn:
- **Địa điểm**: Tòa nhà, khu vực
- **Số phòng**: Phòng học cụ thể
- **Mức độ ưu tiên**:
  - 🟢 Thấp
  - 🟡 Trung bình (mặc định)
  - 🟠 Cao
  - 🔴 Khẩn cấp
- **Hình ảnh**: Tải lên hình ảnh minh họa (PNG, JPG, GIF - tối đa 5MB)

### 3. Luồng Sử Dụng

```
Trang Chủ Sinh Viên
    ↓ [Nhấn "Tạo Ticket Mới"]
Chọn Loại Vấn Đề
    ↓ [Chọn một loại vấn đề]
Tạo Ticket
    ↓ [Điền form và gửi]
Thành Công
    ↓
Quay về Trang Chủ
```

## Cấu Trúc Code

### Các Component Mới

1. **`src/pages/issue-selection-page.tsx`**
   - Hiển thị danh sách các loại vấn đề
   - Cho phép chọn một loại vấn đề

2. **`src/pages/create-ticket-page.tsx`**
   - Form tạo ticket với đầy đủ các trường thông tin
   - Upload và preview hình ảnh
   - Validation form

### Dữ Liệu

3. **`src/data/issueTypes.ts`**
   - Danh sách các loại vấn đề được định nghĩa trước
   - Mỗi loại có icon, tên, mô tả và ví dụ

### Types

4. **`src/types/index.ts`** (đã cập nhật)
   - `IssueType`: Interface cho loại vấn đề
   - `IssueCategory`: Type cho danh mục vấn đề
   - `Ticket`: Interface được mở rộng với thông tin hình ảnh, vị trí

## Cách Chạy Ứng Dụng

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Mở trình duyệt tại http://localhost:5173
```

## Hướng Phát Triển Tiếp Theo

- [ ] Tích hợp với API backend để lưu ticket
- [ ] Thêm trang xem danh sách ticket của sinh viên
- [ ] Thêm tính năng theo dõi trạng thái ticket
- [ ] Thêm notification khi ticket được cập nhật
- [ ] Thêm tính năng comment/chat trong ticket
- [ ] Upload hình ảnh lên cloud storage (Cloudinary, AWS S3)
- [ ] Validation kích thước file hình ảnh
- [ ] Thêm authentication và authorization

## Screenshots

### Trang Chọn Loại Vấn Đề
- Hiển thị grid các loại vấn đề với icon và mô tả
- Hover effect khi di chuột qua
- Responsive design

### Trang Tạo Ticket
- Form đầy đủ với validation
- Upload và preview nhiều hình ảnh
- Chọn mức độ ưu tiên trực quan
- Hiển thị loại vấn đề đã chọn

## Lưu Ý Kỹ Thuật

- Component sử dụng inline styles theo pattern hiện tại của project
- State management sử dụng React hooks (useState)
- File upload sử dụng FileReader API để convert thành base64
- Form validation đơn giản (có thể cải thiện với thư viện như react-hook-form, zod)
- Chưa tích hợp với backend (sử dụng console.log và alert để demo)

## Đóng Góp

Nếu có thắc mắc hoặc đề xuất cải thiện, vui lòng tạo issue hoặc pull request.

