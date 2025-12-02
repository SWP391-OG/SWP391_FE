# Hướng Dẫn Trang Danh Sách Ticket và SLA Tracking

## 🎉 Tính Năng Mới

### 1. Trang Danh Sách Ticket (Ticket List Page)

Trang danh sách ticket cho phép sinh viên xem tất cả các ticket đã tạo với các tính năng:

#### Thống Kê Tổng Quan
- **Tổng số ticket**: Tổng cộng tất cả ticket
- **Đang mở**: Số ticket đang chờ xử lý
- **Đang xử lý**: Số ticket đang được nhân viên xử lý
- **Hoàn thành**: Số ticket đã được giải quyết/đóng

#### Bộ Lọc và Tìm Kiếm
- **Tìm kiếm**: Tìm theo tiêu đề hoặc mô tả
- **Lọc theo trạng thái**: Mở, Đang xử lý, Đã giải quyết, Đã đóng
- **Lọc theo ưu tiên**: Khẩn cấp, Cao, Trung bình, Thấp

#### Hiển Thị Ticket
Mỗi ticket card hiển thị:
- **ID ticket** (ví dụ: TKT-001)
- **Tiêu đề** và **mô tả ngắn**
- **Badges**: Trạng thái, Ưu tiên, Loại vấn đề
- **Vị trí**: Địa điểm và số phòng
- **SLA Status**:
  - 🟢 **Đúng hạn**: Còn nhiều thời gian
  - 🟡 **Cần chú ý**: Còn dưới 6 giờ
  - 🟠 **Sắp quá hạn**: Còn dưới 2 giờ
  - 🔴 **Quá hạn**: Đã vượt deadline
  - ✅ **Hoàn thành đúng hạn**: Giải quyết trước deadline
  - ⚠️ **Hoàn thành trễ**: Giải quyết sau deadline
- **Thời gian còn lại**: Hiển thị số giờ/ngày còn lại
- **Thời gian tạo**: Bao lâu trước ticket được tạo

### 2. Chi Tiết Ticket với SLA Tracking

Khi nhấn vào một ticket, modal chi tiết sẽ hiển thị:

#### A. SLA Tracking Section
**Progress Bar động**:
- Thanh tiến trình hiển thị % thời gian đã trôi qua
- Màu sắc thay đổi theo tình trạng:
  - 🟢 Xanh lá: Đúng hạn (< 70%)
  - 🟡 Vàng: Cần chú ý (70-90%)
  - 🟠 Cam: Sắp quá hạn (> 90%)
  - 🔴 Đỏ: Quá hạn

**Thống kê chi tiết**:
- **Tổng thời gian SLA**: Thời gian được phép xử lý (dựa theo priority)
  - Urgent: 4 giờ
  - High: 24 giờ
  - Medium: 48 giờ
  - Low: 72 giờ
- **Đã trôi qua**: Thời gian kể từ khi tạo ticket
- **Còn lại**: Thời gian còn lại đến deadline

#### B. Thông Tin Ticket
- Mô tả chi tiết
- Địa điểm và số phòng
- Ngày tạo và deadline SLA
- Người xử lý (nếu có)
- Cập nhật lần cuối

#### C. Hình Ảnh
- Hiển thị tất cả hình ảnh đính kèm (nếu có)
- Grid layout đẹp mắt

#### D. Lịch Sử Xử Lý (Timeline)
Timeline với các sự kiện:
- 🔵 **Ticket được tạo**: Sinh viên tạo ticket
- 🟣 **Ticket được phân công**: Hệ thống/Admin phân công
- 🟡 **Bắt đầu xử lý**: Nhân viên bắt đầu làm việc
- 💬 **Cập nhật tiến độ**: Comment/update từ nhân viên
- 🟢 **Đã giải quyết**: Vấn đề được giải quyết
- ⚫ **Đóng ticket**: Ticket được đóng

Mỗi event hiển thị:
- Tiêu đề và mô tả
- Người thực hiện
- Thời gian thực hiện

## 📊 Dữ Liệu Mẫu

Hệ thống đã có sẵn 8 ticket mẫu với các trạng thái khác nhau:

1. **TKT-001**: Máy chiếu hỏng - Đang xử lý
2. **TKT-002**: WiFi không kết nối - Mở (Urgent)
3. **TKT-003**: Điều hòa hỏng - Đã giải quyết
4. **TKT-004**: Phòng chưa dọn dẹp - Mở
5. **TKT-005**: Thiếu bàn ghế - Đang xử lý
6. **TKT-006**: Mất điện - Đã đóng (Hoàn thành đúng hạn)
7. **TKT-007**: Vòi nước hỏng - Đã đóng
8. **TKT-008**: Loa không có tiếng - Mở

## 🎨 Thiết Kế UI/UX

### Color Coding

**Trạng thái**:
- Mở: Xanh dương (#dbeafe)
- Đang xử lý: Vàng (#fef3c7)
- Đã giải quyết: Xanh lá (#d1fae5)
- Đã đóng: Xám (#f3f4f6)

**Ưu tiên**:
- Thấp: Xanh lá (#d1fae5)
- Trung bình: Vàng (#fef3c7)
- Cao: Cam (#fed7aa)
- Khẩn cấp: Đỏ (#fecaca)

**SLA Status**:
- Đúng hạn: #10b981
- Cần chú ý: #f59e0b
- Sắp quá hạn: #f97316
- Quá hạn: #ef4444

### Animations & Interactions
- Hover effect trên ticket cards
- Smooth transitions cho modal
- Progress bar animation
- Button hover effects

## 🔧 Cấu Trúc Code

### Files Mới

1. **`src/data/mockTickets.ts`**
   - Mock data cho 8 tickets
   - Mock SLA events cho timeline
   - Helper function tính SLA deadline

2. **`src/pages/ticket-list-page.tsx`**
   - Component trang danh sách ticket
   - Filter và search functionality
   - Stats cards
   - Ticket cards với SLA info

3. **`src/components/ticket-detail-modal.tsx`**
   - Modal chi tiết ticket
   - SLA tracking với progress bar
   - Timeline visualization
   - Image gallery

### Files Đã Cập Nhật

4. **`src/app.tsx`**
   - Thêm TicketListPage vào navigation
   - Thêm state cho selectedTicket
   - Thêm nút "Xem Danh Sách Ticket"
   - Tích hợp TicketDetailModal

## 🚀 Luồng Sử Dụng

```
Trang Chủ Sinh Viên
    ├─→ [Tạo Ticket Mới] → Issue Selection → Create Ticket
    │
    └─→ [Xem Danh Sách Ticket] → Ticket List
                                      │
                                      └─→ [Click vào ticket] → Ticket Detail Modal
                                                                    ├─ Xem SLA Tracking
                                                                    ├─ Xem lịch sử xử lý
                                                                    └─ Xem hình ảnh
```

## 💡 Tính Năng Nổi Bật

### 1. Real-time SLA Calculation
- Tính toán thời gian còn lại động
- Cập nhật màu sắc theo tình trạng
- Hiển thị % progress

### 2. Smart Filtering
- Kết hợp nhiều điều kiện lọc
- Search realtime
- Stats tự động cập nhật

### 3. Visual Timeline
- Timeline trực quan
- Color-coded events
- Thông tin đầy đủ mỗi bước

### 4. Responsive Design
- Hoạt động tốt trên mọi kích thước màn hình
- Modal tự động scroll
- Grid layout linh hoạt

## 📱 Keyboard Shortcuts

- **ESC**: Đóng modal chi tiết ticket

## 🎯 Mục Đích

Hệ thống SLA tracking giúp:
- **Sinh viên**: Theo dõi tiến độ xử lý ticket
- **Nhân viên**: Biết ticket nào cần ưu tiên
- **Quản lý**: Đánh giá hiệu suất xử lý

## 🔮 Hướng Phát Triển

- [ ] Thêm filter theo SLA status
- [ ] Thêm sort options (theo ngày, priority, SLA)
- [ ] Pagination cho danh sách dài
- [ ] Export ticket list to PDF/Excel
- [ ] Notification khi ticket gần quá hạn
- [ ] Comment/chat trong ticket detail
- [ ] Real-time updates với WebSocket
- [ ] Mobile app optimization
- [ ] Email notification cho SLA alerts
- [ ] Dashboard analytics cho staff/admin

## 🐛 Testing

Để test đầy đủ tính năng:

1. **Test Filter**:
   - Thử filter theo từng trạng thái
   - Thử filter theo từng priority
   - Kết hợp cả hai

2. **Test Search**:
   - Tìm theo tiêu đề
   - Tìm theo mô tả
   - Tìm với từ khóa không tồn tại

3. **Test SLA Tracking**:
   - Xem ticket đúng hạn (TKT-008)
   - Xem ticket quá hạn
   - Xem ticket hoàn thành (TKT-003, TKT-006)

4. **Test Timeline**:
   - Xem ticket có nhiều events (TKT-003, TKT-006)
   - Xem ticket mới tạo (TKT-002, TKT-004)

5. **Test Interactions**:
   - Hover trên ticket cards
   - Click để mở modal
   - Nhấn ESC để đóng modal
   - Click overlay để đóng modal

## 📝 Lưu Ý Kỹ Thuật

- SLA deadline tự động tính dựa trên priority
- Timeline events được mock trong `mockSLAEvents`
- Progress bar tính toán realtime
- Modal sử dụng portal pattern (overlay)
- Tất cả dates được format theo locale Việt Nam
- Responsive breakpoints tự động điều chỉnh grid

## 🎓 Demo Data

Dữ liệu mẫu bao gồm:
- 8 tickets với nhiều trạng thái khác nhau
- 50+ SLA events trong timeline
- Ticket từ nhiều bộ phận khác nhau
- Đa dạng loại vấn đề

Bạn có thể mở trang Sinh viên và thử nghiệm tất cả tính năng ngay! 🚀

