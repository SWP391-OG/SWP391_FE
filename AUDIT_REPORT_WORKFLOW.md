# 📋 BÁO CÁO KIỂM TRA LUỒNG NGHIỆP VỤ HỆ THỐNG QUẢN LÝ TICKET

**Chủ đề Hệ Thống**: Quản lý ticket phản ánh về CSVC, WiFi, thiết bị theo SLA (Cam kết về thời gian phản hồi)

**Ngày Kiểm Tra**: 14/12/2025

**Mục Tiêu**: Đánh giá tính chuẩn mực của luồng từ Đăng Nhập → Tạo Ticket → Assign Ticket → Resolve Ticket → Feedback, xác định thiếu sót

---

## 🔵 PHẦN 1: LUỒNG ĐĂNG NHẬP (Login Flow)

### ✅ Điểm Tốt
1. **Xác thực hợp lệ**: 
   - Endpoint: `POST /auth/login` 
   - Nhận email + password
   - Trả về token lưu vào localStorage
   - Ánh xạ role từ backend sang frontend (Admin → admin, Staff → it-staff, Student → student)

2. **Lưu trữ thông tin**:
   - Token lưu localStorage (`auth_token`)
   - User object được tạo với đủ thông tin cơ bản

3. **Role-based Access**:
   - Phân biệt 3 loại user: Admin, Staff, Student
   - Routing khác nhau theo role (app.tsx)

### 🔴 THIẾU SÓT NGHIÊM TRỌNG

#### 1. **Không Phân Biệt Loại Staff**
**Vấn đề**: Backend trả về role = "Staff", nhưng frontend không biết đó là IT Staff hay Facility Staff
```typescript
// authService.ts - dòng 28
'Staff': 'it-staff', // Mặc định là IT Staff, sẽ phân biệt bằng departmentId sau
```

**Hậu Quả**: 
- Cảnh báo "sẽ phân biệt bằng departmentId sau" nhưng không có implementation
- IT Staff sẽ không phân tách được khỏi Facility Staff
- Giao diện Staff page có IT-specific (InProgress) nhưng dùng chung cho cả 2 loại

**Khuyến Nghị**:
- Thêm API endpoint `/auth/profile` để lấy đầy đủ thông tin (incluindo departmentId, departmentName)
- Hoặc backend trả về role = "IT-Staff" hoặc "Facility-Staff" thay vì chung chung "Staff"

#### 2. **Không Lưu User Code (Mã Số)**
**Vấn đề**: User không có `userCode` thực từ backend
```typescript
userCode: email.split('@')[0].toUpperCase(), // VD: ADMIN1
```
Đây chỉ là giả lập, không phải mã số thực tế từ DB

**Hậu Quả**: Khi gửi ticket, trường `requesterCode` không chính xác, không match với DB

#### 3. **Department ID Không Lấy Được**
```typescript
departmentId: undefined, // Sẽ cần API riêng để lấy departmentId cho Staff
```
Comment chỉ nói "sẽ cần" nhưng không implemented

---

## 🟠 PHẦN 2: LUỒNG TẠO TICKET (Create Ticket Flow)

### ✅ Điểm Tốt
1. **Form Chi Tiết**:
   - Có Campus selector (bắt buộc)
   - Có Location selector (bắt buộc)
   - Hỗ trợ upload nhiều ảnh lên Cloudinary
   - Validation form cơ bản

2. **SLA Tracking**:
   - Tính toán SLA deadline dựa trên category `slaResolveHours`
   - Tạo timeline event khi ticket mới tạo
   - Hiển thị deadline trong UI

3. **API Integration**:
   - Gọi API `/Ticket` POST để tạo ticket
   - Cloudinary upload hình ảnh
   - Xử lý response và mapping dữ liệu

### 🔴 THIẾU SÓT NGHIÊM TRỌNG

#### 1. **Thông Tin Liên Lạc Không Rõ Ràng**
**Vấn đề**: Form có `phoneNumber` nhưng không rõ là của ai
```tsx
// create-ticket-page.tsx - dòng 41
phoneNumber: string;
```

**Hối không lại**: 
- Student nhập số điện thoại của họ hay của người báo cáo?
- Nếu là số điện thoại của người khác, cần xác thực?
- API trả về `contactPhone` nhưng không định nghĩa rõ tác dụng

**Khuyến Nghị**:
- Rõ ràng: "Số điện thoại để liên lạc của bạn" (Student tự điền)
- Hoặc: "Số điện thoại của người bị ảnh hưởng" (có thể khác)
- Nên lấy mặc định từ profile student, cho phép thay đổi

#### 2. **Priority (Mức Độ Ưu Tiên) Không Được Gửi**
**Vấn đề**:
```tsx
// create-ticket-page.tsx - không có priority field trong form!
```

Form có tiêu đề là "Mức độ ưu tiên" (dòng ~) nhưng khi tạo ticket (dòng 177), priority không được set!

```typescript
const ticket: Omit<Ticket, 'id' | 'createdAt' | 'slaDeadline'> = {
  title: currentCategory.categoryName,
  description: formData.description,
  // ❌ THIẾU priority!
  ...
};
```

**Hậu Quả**: 
- Ticket luôn có priority mặc định 'medium'
- SLA deadline tính không chính xác (phải dựa priority)
- Admin không thể phân loại Urgent tickets

**Khuyến Nghị**: Thêm priority vào form submission

#### 3. **Category Code Không Rõ Nguồn**
**Vấn đề**: 
```typescript
categoryCode: currentCategory?.categoryCode || 'default'
```

Nhưng `currentCategory` từ đâu? Trong Student page, không có mechanism chọn category thực sự!

**Chi tiết**: 
- Issue Selection Page hiển thị 8 loại nhưng không match với Categories từ API
- mockCategories vs issueTypes không sync

**Khuyến Nghị**: 
- Lấy categories từ API `/Category`
- Mapping issueTypes → categories

#### 4. **Campus/Location Validation Không Có**
**Vấn đề**:
```tsx
if (formData.campusCode) {
  loadLocations(formData.campusCode);
} else {
  setLocations([]);
  setFormData(prev => ({ ...prev, locationCode: '' }));
}
```

Nhưng không validate bắt buộc chọn! User có thể submit mà không chọn campus/location

**Khuyến Nghị**: Thêm validation bắt buộc trước khi submit

#### 5. **Duplicate Detection Không Hoàn Chỉnh**
**Vấn đề**:
```typescript
const [duplicateTicket, setDuplicateTicket] = useState<Ticket | null>(null);
const [showDuplicateModal, setShowDuplicateModal] = useState(false);
```

Code có state nhưng logic không implement! Người dùng có thể tạo ticket trùng lặp

---

## 🟣 PHẦN 3: LUỒNG ASSIGN TICKET (Admin Assign Flow)

### ✅ Điểm Tốt
1. **2 Loại Assignment**:
   - Auto-assign: `PATCH /Ticket/{ticketCode}/assign`
   - Manual assign: `PATCH /Ticket/{ticketCode}/assign/manual` với staffCode

2. **Status Change**:
   - Khi assign thành công, status → 'ASSIGNED'
   - API trả về response status = true/false

3. **Admin Panel**:
   - Hiển thị tickets table
   - Có button Assign/Reassign

### 🔴 THIẾU SÓT NGHIÊM TRỌNG

#### 1. **Không Kiểm Tra Workload/Capacity**
**Vấn đề**: Assign ticket mà không xem Staff hiện tại có bao nhiêu tickets, có quá tải không?

**Hối không lại**:
- Có thể assign tất cả tickets cho 1 staff
- Staff đó bị quá tải → SLA miss
- Không có policy cân bằng tải công việc

**Khuyến Nghị**:
```typescript
// Cần thêm check
const staffTicketCount = tickets.filter(t => t.assignedTo === staffId).length;
if (staffTicketCount > MAX_TICKETS_PER_STAFF) {
  alert('Staff này đã quá tải! Hãy chọn staff khác');
  return;
}
```

#### 2. **Không Kiểm Tra Priority**
**Vấn đề**: Auto-assign không quan tâm priority của ticket
- Ticket URGENT có thể assign cho cùng staff như ticket LOW
- Không có rule ưu tiên Urgent → được assign trước

**Khuyến Nghị**: 
- Auto-assign nên sắp xếp tickets theo priority
- URGENT/HIGH assign trước

#### 3. **Không Có Notification Khi Assign**
**Vấn đề**: Staff được assign ticket mà không được thông báo!

**Hối không lại**:
- Staff không biết có ticket mới
- Có thể miss SLA deadline vì không cập nhật UI

**Khuyến Nghị**: 
- Emit notification khi ticket assign
- Update UI real-time (WebSocket hoặc polling)

#### 4. **Category → Department Mapping Không Rõ**
**Vấn đề**:
```typescript
// ticketService.ts
categoryCode: string;
// Nhưng assign là cho Staff, không phải Department
```

Khi tạo ticket có categoryCode (vd: "facility-broken"), nhưng:
- Facility-broken → Department nào? CSCV?
- Assign cho ai? Toàn bộ department hay 1 staff?

Không có logic rõ ràng!

**Khuyến Nghị**:
```typescript
interface Category {
  categoryCode: string;
  categoryName: string;
  departmentId: number; // ✅ Đã có
  slaResolveHours: number;
  // Thêm:
  // assignStrategy: 'round-robin' | 'load-balance' | 'manual';
}
```

---

## 🟤 PHẦN 4: LUỒNG RESOLVE/COMPLETE TICKET (Staff Resolve Flow)

### ✅ Điểm Tốt
1. **Status Transition**:
   - ASSIGNED → IN_PROGRESS → RESOLVED
   - API endpoint: `PATCH /Ticket/{ticketCode}/status?newStatus={status}`

2. **Staff Page**:
   - Hiển thị assigned tickets
   - Button để update status
   - Confirm dialog trước khi resolve

3. **Response Tracking**:
   - Lưu `resolvedAt` timestamp
   - Tính toán thời gian xử lý

### 🔴 THIẾU SÓT NGHIÊM TRỌNG

#### 1. **Không Verify Ticket Đã Fix**
**Vấn đề**: Staff click "Resolve" mà không cần chứng minh ticket đã thực sự fix!

**Hối không lại**:
- Staff có thể close ticket mà chưa fix
- Student không thể yêu cầu reopen

**Khuyến Nghị**:
```typescript
// Khi resolve, phải:
1. Upload evidence images (ảnh sau khi fix)
2. Nhập mô tả giải pháp
3. Chọn root cause
// Sau đó mới submit
```

#### 2. **Không Có Resolution Notes**
**Vấn đề**: `notes` field hiện có nhưng không được update khi resolve

**Khuyến Nghị**: 
- Thêm resolution notes
- Staff mô tả những gì đã làm để fix

#### 3. **Escalation không hoàn chỉnh**
**Vấn đề**:
- Có button "Escalate lên Admin" trong modal
- Nhưng không có logic xử lý escalation

**Hối không lại**:
- Escalate cho admin nhưng admin không thấy
- Không có escalation history

**Khuyến Nghị**:
```typescript
// Thêm API
PATCH /Ticket/{ticketCode}/escalate

// Ticket được reassign cho admin/manager
// Lưu escalation reason & timestamp
```

#### 4. **SLA Overdue không cảnh báo**
**Vấn đề**: Ticket đã quá deadline nhưng:
- Staff không được cảnh báo
- Không có "red flag" trong UI
- System không tự động escalate

**Khuyến Nghị**:
- Hiển thị status SLA: "✅ Đúng hạn" / "⚠️ Sắp quá" / "🔴 Quá hạn"
- Nếu quá hạn, tự động escalate lên admin
- Thêm audit log

---

## 💬 PHẦN 5: LUỒNG FEEDBACK/RATING (Student Feedback Flow)

### ✅ Điểm Tốt
1. **UI Feedback Form**:
   - Star rating (1-5 sao)
   - Comment box
   - Submit button

2. **Thời Điểm Hiển Thị**:
   - Chỉ hiện khi status = 'resolved' hoặc 'closed'
   - Student-only view

3. **Persist Rating**:
   - Feedback được lưu trong ticket object
   - `ratingStars` và `ratingComment`

### 🔴 THIẾU SÓT NGHIÊM TRỌNG

#### 1. **Feedback API không tested**
**Vấn đề**:
```typescript
// ticketService.ts - dòng ~310
async updateFeedback(
  ticketCode: string,
  ratingStars: number,
  ratingComment: string
): Promise<...> {
  const response = await apiClient.patch<...>(
    `/Ticket/${ticketCode}/feedback`,
    { ratingStars, ratingComment }
  );
  return response;
}
```

Nhưng trong ticket-detail-modal, callback không gắn API response!

```typescript
// ticket-detail-modal.tsx - dòng ~295
onClick={() => {
  if (onUpdateFeedback && ratingStars > 0) {
    setSubmittedRating({ stars: ratingStars, comment: ratingComment });
    onUpdateFeedback(ticket.id, ratingStars, ratingComment); // ← gọi callback
    // ❌ Không await, không check response!
  }
}}
```

**Hậu Quả**: Feedback có thể không lưu vào DB

#### 2. **Feedback không thể edit**
**Vấn đề**: Khi student submit feedback, nó hiển thị lại nhưng:
- Không có button "Edit feedback"
- Student không thể thay đổi rating sau này

**Khuyến Nghị**: 
- Thêm button "Edit" để student có thể update rating
- Lưu lại history edit (optional)

#### 3. **Không có feedback deadline**
**Vấn đề**: Student có vô hạn thời gian để feedback?

**Khuyến Nghị**:
```typescript
interface Ticket {
  // ...
  feedbackDeadline?: string; // Deadline để feedback (vd: 7 ngày sau resolve)
  feedbackSubmittedAt?: string;
}
```

#### 4. **Không có incentive feedback**
**Vấn đề**: Student không motivation để feedback
- Không có reward
- Không có mandatory message

**Khuyến Nghị**:
- "Vui lòng đánh giá để giúp chúng tôi cải thiện"
- Show "Feedback rate" stats (80% feedback)
- Badge cho student feedback nhiều

#### 5. **Admin không thấy feedback stats**
**Vấn đề**: 
- Admin có thể xem từng feedback
- Nhưng không có dashboard tổng hợp

**Khuyến Nghị**:
```typescript
// Admin Dashboard cần:
- Average rating per category
- Average rating per staff
- Feedback trend (rating qua thời gian)
- Bottom X staff by rating
```

---

## 🔵 PHẦN 6: CÔNG VIỆC SAU MỖI BƯỚC

### Sau Login
- ❌ **Thiếu**: Redirect theo role
- ❌ **Thiếu**: Load initial data (categories, departments)
- ❌ **Thiếu**: Check user đã verify email chưa

### Sau Tạo Ticket
- ❌ **Thiếu**: Gửi confirmation email/SMS
- ❌ **Thiếu**: Show ticket code cho student lưu
- ❌ **Thiếu**: Notify admin có ticket mới
- ✅ **Có**: Hiển thị SLA deadline

### Sau Assign Ticket
- ❌ **Thiếu**: Notify staff được assign
- ❌ **Thiếu**: Update expected response time
- ❌ **Thiếu**: Log assignment action (audit trail)
- ✅ **Có**: Update ticket status → ASSIGNED

### Sau Resolve Ticket
- ❌ **Thiếu**: Notify student ticket resolved
- ❌ **Thiếu**: Auto-request feedback
- ❌ **Thiếu**: Create task để close ticket nếu không feedback
- ✅ **Có**: Update resolvedAt timestamp

### Sau Feedback
- ❌ **Thiếu**: Thank you message
- ❌ **Thiếu**: Auto-close ticket
- ❌ **Thiếu**: Update staff rating
- ❌ **Thiếu**: Send feedback summary to staff

---

## 📊 PHẦN 7: CÁC THIẾU SÓT VỀ SLA MANAGEMENT

### ✅ Có Implementation
1. `slaResolveHours` per category
2. `slaDeadline` calculation
3. Visual indicators (màu sắc deadline)

### 🔴 THIẾU SÓT
1. **Không có SLA report**
   - Admin không thấy SLA compliance %
   - Không biết category nào miss SLA nhiều

2. **Không có automatic escalation**
   - Ticket sắp quá hạn mà không tự động escalate
   - Không có urgent notification

3. **SLA không linh hoạt**
   - Không thể override SLA cho special cases
   - Không có SLA pause (khi đang chờ student clarify)

4. **Không tracking response time vs resolution time**
   - Chỉ có deadline
   - Không statistics về actual vs expected

---

## 🎯 PHẦN 8: ARCHITECTURE & BEST PRACTICES

### ✅ Điểm Tốt
1. Service pattern (ticketService, authService)
2. Type safety (TypeScript interfaces)
3. Component composition
4. State management pattern

### 🔴 ISSUES

#### 1. **Local vs API Data Source Confusion**
**Vấn đề**: 
- Một số nơi dùng localStorage, một số dùng API
- `useTickets()` hook dùng localStorage nhưng admin/staff dùng API
- Dữ liệu không sync

**Khuyến Nghị**: Chọn 1 source of truth (recommend API)

#### 2. **No Real-time Updates**
**Vấn đề**: Admin tạo ticket, nhưng student không thấy ngay
- Phải refresh page
- Không có WebSocket

#### 3. **Paging/Pagination không rõ**
**Vấn đề**:
```typescript
const response = await ticketService.getMyTickets(1, 100);
```
Hardcoded `pageSize=100` → có thể OOM

#### 4. **Error Handling**
**Vấn đề**: 
```typescript
catch (error) {
  console.error('Error:', error);
  setError(error instanceof Error ? error.message : 'Failed');
}
```
Generic error message không giúp user hiểu là sao fail

---

## 📋 PHẦN 9: SECURITY & COMPLIANCE

### ✅ Có
1. Token-based auth
2. Role-based access
3. localStorage cho token

### 🔴 THIẾU
1. **CSRF protection** - Không thấy CSRF token
2. **XSS protection** - User input không sanitize
3. **Rate limiting** - Không có protection chống spam ticket
4. **Data encryption** - Phone number, email không encrypt
5. **Audit logging** - Không track ai tạo/assign/resolve ticket

---

## 🚀 PHẦN 10: TÓNGKẾT & KHUYẾN NGHỊ ƯUTIÊN (Priority)

### 🔴 CRITICAL (Phải fix ngay)
1. Add priority field vào form tạo ticket
2. Staff feedback API integration (thực sự lưu DB)
3. Validate category/campus/location bắt buộc
4. Phân biệt IT Staff vs Facility Staff
5. SLA deadline validation (không quá hạn trước khi resolve)

### 🟠 HIGH (Nên fix sớm)
1. Notification system (email/SMS/push)
2. Auto escalation khi ticket quá hạn
3. Staff workload balancing
4. Resolution notes + evidence images
5. SLA compliance dashboard

### 🟡 MEDIUM (Nên có)
1. Real-time updates (WebSocket)
2. Feedback deadline enforcement
3. Rating analytics per staff/category
4. Duplicate ticket detection
5. Escalation chain (Staff → Admin → Manager)

### 🟢 LOW (Nice to have)
1. Mobile app
2. Customer satisfaction survey
3. Integration với ticketing system khác
4. Batch operations (bulk assign)
5. Advanced filtering/reporting

---

## 📝 KẾT LUẬN

### Độ Chuẩn Mực Hiện Tại: **5.5/10** ⭐

**Lý do**:
✅ Core flow có đủ (Login → Create → Assign → Resolve → Feedback)
❌ Nhưng nhiều details chưa complete
❌ Thiếu notifications, validations, error handling
❌ UX chưa smooth (quá tải, SLA miss không cảnh báo)

### Để Đạt 8/10 Cần
1. Thêm 15+ cases validation
2. Implement notifications
3. Auto escalation logic
4. Better error messages
5. Performance optimization

### Để Đạt 9.5/10 Cần
1. Real-time updates
2. Advanced analytics
3. Mobile support
4. Security hardening
5. Load testing & optimization

---

**Người Kiểm Tra**: GitHub Copilot (AI Code Reviewer)

**Sáng Kiến**: Từ Topic Hệ Thống quản lý ticket CSVC/WiFi/Thiết bị theo SLA
