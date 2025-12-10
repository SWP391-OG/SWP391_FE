# Admin Assign Ticket Feature - Implementation Guide

## 🎯 Tổng quan
Đã triển khai chức năng assign staff tự động cho tickets từ Admin Dashboard sử dụng API `/api/Ticket/{ticketCode}/assign`.

## ✅ Các thay đổi đã thực hiện

### 1. **Ticket Service** (`src/services/ticketService.ts`)
Thêm function mới để gọi API assign:

```typescript
// Assign ticket tự động (cho Admin) - PATCH method
async assignTicketAuto(ticketCode: string): Promise<{ status: boolean; message: string; data: any; errors: string[] }> {
  try {
    const response = await apiClient.patch<{ status: boolean; message: string; data: any; errors: string[] }>(
      `/Ticket/${ticketCode}/assign`,
      {} // Empty body for auto-assign
    );
    return response;
  } catch (error) {
    console.error('Error assigning ticket:', error);
    throw error;
  }
}
```

**Lưu ý**: Sử dụng PATCH method như backend yêu cầu, không phải PUT.

### 2. **Ticket Review Modal** (`src/components/admin/TicketReviewModal.tsx`)

#### Thay đổi chính:
- ✅ Thêm support cho `TicketFromApi` type
- ✅ Thêm button "Assign Staff Tự Động" 
- ✅ Hiển thị thông tin người được assign (`assignedToName`)
- ✅ Chỉ hiển thị button assign nếu ticket chưa được assign
- ✅ Loading state khi đang assign
- ✅ Callback `onAssignSuccess` để refresh danh sách tickets sau khi assign
- ✅ Loại bỏ form chọn staff thủ công (không cần thiết vì auto-assign)
- ✅ Loại bỏ buttons Approve/Reject (không cần cho chức năng này)

#### UI Flow:
1. Admin click vào ticket từ bảng
2. Modal hiển thị chi tiết ticket
3. Nếu ticket chưa được assign → Hiển thị button "🎯 Assign Staff Tự Động"
4. Click button → Call API → Backend tự động chọn staff phù hợp
5. Sau khi assign thành công → Refresh danh sách tickets
6. Modal tự động đóng

### 3. **Tickets Table** (`src/components/admin/TicketsTable.tsx`)

#### Thêm cột mới:
- **Assigned To**: Hiển thị tên người được assign (`assignedToName` từ backend)
- Nếu chưa assign: hiển thị "Chưa assign" (màu xám, italic)
- Nếu đã assign: hiển thị tên staff (màu đen, bold)

#### Cấu trúc bảng (8 cột):
1. Mã Ticket
2. Tiêu đề
3. Mô tả
4. Vị trí
5. Trạng thái
6. **Assigned To** ← 🆕 CỘT MỚI
7. Hạn giải quyết
8. Thao tác (button "Xem")

#### Thêm tính năng:
- Click vào row → Mở modal xem chi tiết
- Button "Xem" cũng mở modal

### 4. **Admin Page** (`src/pages/admin/admin-page.tsx`)

#### Cập nhật:
- ✅ Move `fetchTickets` ra ngoài `useEffect` để có thể gọi lại
- ✅ Truyền `onAssignSuccess={fetchTickets}` vào TicketReviewModal
- ✅ Cập nhật type của `selectedTicketForReview` để support cả `Ticket` và `TicketFromApi`

## 🚀 Cách sử dụng

### Bước 1: Xem danh sách tickets
1. Truy cập Admin Dashboard
2. Click tab "Tickets Management"
3. Xem danh sách tickets với cột "Assigned To"

### Bước 2: Assign staff
1. Click vào ticket chưa được assign (cột "Assigned To" hiện "Chưa assign")
2. Modal hiển thị chi tiết ticket
3. Click button "🎯 Assign Staff Tự Động"
4. Đợi hệ thống xử lý (có loading spinner)
5. Thông báo thành công → Danh sách tự động refresh

### Bước 3: Xem ticket đã assign
- Tickets đã assign sẽ hiển thị tên staff trong cột "Assigned To"
- Click vào ticket để xem chi tiết
- Modal sẽ hiển thị thông báo "✅ Ticket này đã được assign cho: [Tên Staff]"

## 🔍 API Details

### Endpoint
```
PATCH /api/Ticket/{ticketCode}/assign
```

### Request
- **Method**: PATCH (không phải PUT!)
- **URL**: `/api/Ticket/TKT3357338816/assign`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {token} (nếu có)
  ```
- **Body**: `{}` (empty object - backend tự xử lý logic)

### Response
```json
{
  "status": true,
  "message": "Ticket assigned successfully",
  "data": {
    // Updated ticket data
  },
  "errors": []
}
```

### Response khi thành công:
- Backend sẽ tự động chọn staff phù hợp dựa trên:
  - Department của ticket (category → department)
  - Workload của staff (số ticket đang xử lý)
  - Availability của staff
- Status của ticket sẽ được update thành "ASSIGNED"
- Field `assignedToName` sẽ có giá trị tên staff

## 📊 Data Flow

```
User Action → Frontend → Backend → Database → Response → Frontend Update
     ↓           ↓          ↓          ↓          ↓            ↓
Click Assign → Call API → Auto  → Update  → Success → Refresh Table
  Button              Select   Ticket               & Close Modal
                      Staff
```

## ⚠️ Lưu ý quan trọng

### 1. Chỉ tickets từ API mới có thể assign
```typescript
if (!isFromApi) {
  alert('Chỉ có thể assign ticket từ API');
  return;
}
```

### 2. Button chỉ hiển thị khi chưa assign
```typescript
{isFromApi && !assignedToName && (
  <button>🎯 Assign Staff Tự Động</button>
)}
```

### 3. Disable button khi đang assign
```typescript
disabled={isAssigning}
```

### 4. Auto-refresh sau khi assign
```typescript
if (onAssignSuccess) {
  onAssignSuccess(); // Gọi fetchTickets() từ admin page
}
```

## 🐛 Debug & Troubleshooting

### Nếu assign không thành công:

#### 1. Check Console Logs
```javascript
console.log('✅ Assign ticket response:', response);
// hoặc
console.error('❌ Error assigning ticket:', error);
```

#### 2. Check Network Tab
- F12 > Network > filter "assign"
- Xem request URL có đúng format không: `/Ticket/{ticketCode}/assign`
- Xem method có phải PATCH không
- Xem response status code

#### 3. Backend Issues
- **404**: Endpoint không tồn tại hoặc route chưa đúng
- **400**: Request format sai
- **401**: Chưa authentication
- **403**: Không có quyền
- **500**: Lỗi server, check backend logs

#### 4. Ticket không refresh
- Check callback `onAssignSuccess` có được truyền vào modal không
- Check function `fetchTickets` có được gọi không
- Check console có lỗi khi fetch không

### Nếu cột "Assigned To" không hiển thị đúng:

#### 1. Check response từ API
```javascript
console.log('API Response:', response.data.items);
// Xem có field assignedToName không
```

#### 2. Check mapping trong component
```typescript
const assignedToName = isFromApi ? ticket.assignedToName : ticket.assignedToName || '';
```

#### 3. Check backend có trả về field đúng không
- Field name: `assignedToName` (camelCase)
- Type: string
- Value: Tên đầy đủ của staff

## 📈 Future Improvements

### 1. Reassign Ticket
Cho phép admin reassign ticket đã được assign cho staff khác:
```typescript
// Thêm button "Reassign" nếu đã có assignedToName
{assignedToName && (
  <button onClick={handleReassign}>
    🔄 Reassign Staff Khác
  </button>
)}
```

### 2. Unassign Ticket
Cho phép admin bỏ assign ticket:
```typescript
async unassignTicket(ticketCode: string) {
  await apiClient.patch(`/Ticket/${ticketCode}/unassign`, {});
}
```

### 3. Manual Assign
Cho phép admin chọn staff cụ thể thay vì auto:
```typescript
async assignTicketManual(ticketCode: string, staffCode: string) {
  await apiClient.patch(`/Ticket/${ticketCode}/assign`, {
    staffCode: staffCode
  });
}
```

### 4. Assign History
Hiển thị lịch sử assign/reassign của ticket:
```typescript
interface AssignHistory {
  assignedAt: string;
  assignedBy: string;
  staffCode: string;
  staffName: string;
}
```

### 5. Bulk Assign
Assign nhiều tickets cùng lúc:
```typescript
async bulkAssign(ticketCodes: string[]) {
  await apiClient.post('/Ticket/bulk-assign', {
    ticketCodes: ticketCodes
  });
}
```

## ✅ Testing Checklist

- [ ] Xem danh sách tickets với cột "Assigned To"
- [ ] Click vào ticket chưa assign
- [ ] Modal hiển thị button "Assign Staff Tự Động"
- [ ] Click assign button
- [ ] Loading spinner hiển thị
- [ ] Thông báo thành công
- [ ] Danh sách tickets refresh
- [ ] Cột "Assigned To" hiển thị tên staff
- [ ] Click vào ticket đã assign
- [ ] Modal hiển thị thông tin staff đã assign
- [ ] Button assign không hiển thị nữa

## 📞 Support

Nếu có vấn đề:
1. Check console logs
2. Check Network tab
3. Verify backend API hoạt động
4. Check authentication token
5. Verify data format từ backend

---

**Created**: December 10, 2025
**Last Updated**: December 10, 2025
**Version**: 1.0.0
