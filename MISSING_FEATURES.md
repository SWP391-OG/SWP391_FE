# 📋 Danh Sách Chức Năng Còn Thiếu

## ✅ Đã Hoàn Thành

### Admin
- ✅ Filter categories/departments by adminId
- ✅ Admin quản lý staff và assign tickets
- ✅ CRUD Categories, Departments, Locations
- ✅ Xem danh sách tickets thuộc departments của mình
- ✅ Assign/reassign tickets cho staff

### Staff
- ✅ Staff xem và xử lý tickets (chỉ thấy tickets được assign cho mình)
- ✅ Staff update ticket status (open → acknowledged → in-progress → resolved → closed)
- ✅ Hiển thị SLA status trong danh sách tickets

### Student
- ✅ Chọn loại vấn đề (Issue Selection)
- ✅ Tạo ticket với form đầy đủ
- ✅ Upload images (UI có, xử lý base64)
- ✅ Xem danh sách tickets với filter và search
- ✅ Xem chi tiết ticket với SLA tracking và timeline

---

## ❌ Chức Năng Còn Thiếu

### 🔴 Quan Trọng (High Priority)

#### 1. Student: Tạo Ticket Thực Sự Lưu Vào State
**Vấn đề**: Hiện tại khi Student submit ticket, chỉ có `alert()` nhưng không thêm vào `tickets` state.

**Cần làm**:
- Tính toán `slaDeadline` dựa trên priority
- Tạo `slaTracking` object với timeline event đầu tiên
- Thêm ticket mới vào `tickets` state
- Tạo ticket ID tự động (TKT-XXX)

**File cần sửa**: `src/app.tsx` (dòng 298-304)

---

#### 2. Student: Xem Tickets Của Chính Mình
**Vấn đề**: `TicketListPage` đang dùng `mockTickets` trực tiếp, không filter theo `createdBy`.

**Cần làm**:
- Filter tickets theo `createdBy === currentStudentId`
- Pass `tickets` state từ App.tsx vào TicketListPage
- Mock `currentStudentId` (ví dụ: 'student-001')

**File cần sửa**: 
- `src/app.tsx` (thêm currentStudentId, filter studentTickets)
- `src/pages/ticket-list-page.tsx` (nhận tickets từ props thay vì dùng mockTickets)

---

#### 3. Student: Edit Ticket
**Vấn đề**: Student không thể chỉnh sửa ticket đã tạo.

**Cần làm**:
- Thêm nút "Chỉnh sửa" trong TicketDetailModal (chỉ hiện khi `status === 'open'`)
- Tạo EditTicketPage hoặc form inline
- Cho phép edit: title, description, location, roomNumber, priority, images
- Không cho edit: issueType, category (đã fix)

**File cần tạo/sửa**:
- `src/pages/edit-ticket-page.tsx` (mới)
- `src/components/ticket-detail-modal.tsx` (thêm nút Edit)
- `src/app.tsx` (thêm state và handler)

---

#### 4. Student: Cancel Ticket
**Vấn đề**: Student không thể hủy ticket.

**Cần làm**:
- Thêm nút "Hủy ticket" trong TicketDetailModal (chỉ hiện khi `status === 'open'` hoặc `status === 'acknowledged'`)
- Confirm dialog trước khi hủy
- Update status thành `'closed'` với lý do "Cancelled by student"
- Thêm SLA event "cancelled"

**File cần sửa**:
- `src/components/ticket-detail-modal.tsx` (thêm nút Cancel)
- `src/app.tsx` (thêm handler cancelTicket)

---

#### 5. Overdue Detection và Cảnh Báo
**Vấn đề**: Có hiển thị SLA status nhưng chưa có cảnh báo tự động.

**Cần làm**:
- **Admin Dashboard**: Hiển thị số lượng tickets quá hạn/sắp quá hạn
- **Staff Dashboard**: Highlight tickets quá hạn/sắp quá hạn
- **Student**: Hiển thị badge cảnh báo trên tickets quá hạn
- **Auto-refresh**: Tự động cập nhật SLA status mỗi phút (hoặc khi component mount)

**File cần sửa**:
- `src/app.tsx` (thêm overdue stats cho Admin)
- `src/pages/it-staff-page.tsx` (highlight overdue tickets)
- `src/pages/facility-staff-page.tsx` (highlight overdue tickets)
- `src/pages/ticket-list-page.tsx` (badge cảnh báo)

---

#### 6. Duplicate Ticket Detection
**Vấn đề**: Chưa có logic phát hiện ticket trùng lặp.

**Cần làm**:
- Khi Student tạo ticket mới, kiểm tra xem có ticket tương tự không
- So sánh: title, description, location, roomNumber, issueType
- Nếu tìm thấy ticket trùng (status = 'open' hoặc 'in-progress'), hiển thị cảnh báo
- Cho phép Student xem ticket trùng hoặc vẫn tạo ticket mới

**File cần tạo/sửa**:
- `src/utils/ticketUtils.ts` (helper function checkDuplicate)
- `src/pages/create-ticket-page.tsx` (gọi checkDuplicate trước khi submit)
- `src/app.tsx` (pass tickets vào CreateTicketPage)

---

### 🟡 Trung Bình (Medium Priority)

#### 7. Escalate Ticket
**Vấn đề**: Chưa có chức năng escalate ticket khi quá hạn.

**Cần làm**:
- **Staff**: Có thể escalate ticket lên Admin khi gặp khó khăn
- **System**: Tự động escalate khi ticket quá hạn SLA
- Thêm SLA event "escalated"
- Admin nhận thông báo về tickets được escalate

**File cần tạo/sửa**:
- `src/pages/it-staff-page.tsx` (thêm nút Escalate)
- `src/pages/facility-staff-page.tsx` (thêm nút Escalate)
- `src/app.tsx` (thêm handler escalateTicket)

---

#### 8. Reports và Analytics
**Vấn đề**: Chưa có trang Reports.

**Cần làm**:
- **Admin Dashboard**: Thêm tab "Reports"
- **SLA Report**: 
  - Tổng số tickets
  - Số tickets đúng hạn / quá hạn
  - Tỷ lệ đúng hạn (%)
  - Thời gian xử lý trung bình
- **Ticket Volume Report**:
  - Số tickets theo category
  - Số tickets theo priority
  - Số tickets theo status
  - Biểu đồ (chart.js hoặc recharts)
- **Staff Performance**:
  - Số tickets mỗi staff xử lý
  - Tỷ lệ đúng hạn của mỗi staff
  - Thời gian xử lý trung bình

**File cần tạo**:
- `src/pages/reports-page.tsx` (mới)
- `src/components/sla-report.tsx` (mới)
- `src/components/ticket-volume-chart.tsx` (mới)

---

#### 9. Comment/Update trong Ticket
**Vấn đề**: Chưa có chức năng comment hoặc cập nhật tiến độ.

**Cần làm**:
- **Staff**: Có thể thêm comment/update khi xử lý ticket
- **Student**: Có thể thêm comment để cung cấp thêm thông tin
- Hiển thị comments trong TicketDetailModal timeline
- Thêm SLA event "comment" vào timeline

**File cần tạo/sửa**:
- `src/components/ticket-comment-section.tsx` (mới)
- `src/components/ticket-detail-modal.tsx` (thêm comment section)
- `src/app.tsx` (thêm handler addComment)

---

#### 10. Filter Tickets Theo SLA Status
**Vấn đề**: Chưa có filter theo SLA status (đúng hạn, quá hạn, sắp quá hạn).

**Cần làm**:
- Thêm filter "SLA Status" vào TicketListPage
- Options: All, Đúng hạn, Cần chú ý, Sắp quá hạn, Quá hạn
- Áp dụng cho cả Student và Staff

**File cần sửa**:
- `src/pages/ticket-list-page.tsx` (thêm filter SLA status)
- `src/pages/it-staff-page.tsx` (thêm filter SLA status)
- `src/pages/facility-staff-page.tsx` (thêm filter SLA status)

---

### 🟢 Thấp (Low Priority - Nice to Have)

#### 11. Sort Options
**Vấn đề**: Chưa có sort tickets.

**Cần làm**:
- Sort theo: Ngày tạo (mới nhất/cũ nhất), Priority, SLA deadline, Status
- Thêm dropdown sort trong TicketListPage và Staff pages

**File cần sửa**:
- `src/pages/ticket-list-page.tsx`
- `src/pages/it-staff-page.tsx`
- `src/pages/facility-staff-page.tsx`

---

#### 12. Pagination
**Vấn đề**: Nếu có nhiều tickets, danh sách sẽ rất dài.

**Cần làm**:
- Thêm pagination (10-20 tickets mỗi trang)
- Hiển thị số trang và nút Previous/Next

**File cần sửa**:
- `src/pages/ticket-list-page.tsx`
- `src/pages/it-staff-page.tsx`
- `src/pages/facility-staff-page.tsx`

---

#### 13. Export Reports
**Vấn đề**: Chưa có export reports.

**Cần làm**:
- Export ticket list to PDF/Excel
- Export SLA report to PDF
- Sử dụng thư viện như `jsPDF` hoặc `xlsx`

**File cần tạo**:
- `src/utils/exportUtils.ts` (mới)

---

#### 14. Notification System
**Vấn đề**: Chưa có thông báo.

**Cần làm**:
- Toast notifications khi:
  - Ticket được assign
  - Ticket status thay đổi
  - Ticket quá hạn
  - Ticket được resolve
- Sử dụng thư viện như `react-toastify`

**File cần tạo/sửa**:
- `src/components/notification-provider.tsx` (mới)
- `src/app.tsx` (tích hợp notifications)

---

#### 15. Real-time Updates
**Vấn đề**: Chưa có real-time updates.

**Cần làm**:
- WebSocket connection để cập nhật real-time
- Tự động refresh khi có thay đổi từ user khác
- Hiển thị indicator "Live" khi có real-time connection

**File cần tạo**:
- `src/hooks/useWebSocket.ts` (mới)
- `src/services/websocketService.ts` (mới)

---

## 📊 Tổng Kết

### Đã Hoàn Thành: ~70%
- ✅ Admin: Filter, Assign tickets, CRUD
- ✅ Staff: Xem tickets, Update status
- ✅ Student: Tạo ticket (UI), Xem danh sách, Xem chi tiết

### Còn Thiếu: ~30%
- ❌ Student: Tạo ticket thực sự lưu vào state
- ❌ Student: Xem tickets của chính mình (filter)
- ❌ Student: Edit ticket
- ❌ Student: Cancel ticket
- ❌ Overdue detection và cảnh báo
- ❌ Duplicate ticket detection
- ❌ Escalate ticket
- ❌ Reports và Analytics
- ❌ Comment/Update trong ticket
- ❌ Filter theo SLA status
- ❌ Sort, Pagination, Export, Notifications, Real-time

---

## 🎯 Ưu Tiên Thực Hiện

### Phase 1 (Quan trọng nhất):
1. ✅ Student tạo ticket thực sự lưu vào state
2. ✅ Student xem tickets của chính mình
3. ✅ Overdue detection và cảnh báo

### Phase 2 (Quan trọng):
4. ✅ Student edit ticket
5. ✅ Student cancel ticket
6. ✅ Duplicate ticket detection

### Phase 3 (Cải thiện):
7. ✅ Escalate ticket
8. ✅ Reports và Analytics
9. ✅ Comment/Update trong ticket

### Phase 4 (Nice to have):
10. ✅ Sort, Pagination, Export, Notifications, Real-time

---

**Last Updated**: December 2024

