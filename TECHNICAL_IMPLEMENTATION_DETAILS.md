# Technical Implementation Details

## 📋 Danh Sách Tệp Được Sửa Đổi

1. **src/types/index.ts** - Thêm type definitions
2. **src/pages/student/student-home-page.tsx** - Cập nhật UI ticket card
3. **src/components/shared/ticket-detail-modal.tsx** - Cập nhật modal chi tiết

---

## 🔧 Chi Tiết Thay Đổi Code

### 1️⃣ src/types/index.ts

#### Interface: `TicketFromApi`
```typescript
// Thêm 2 trường mới cho phone fields
export interface TicketFromApi {
  // ... existing fields ...
  assignedToName: string;
  assignedToPhone?: string;              // ✅ NEW
  // ... more fields ...
  managedByCode: string;
  managedByName: string;
  managedByPhone?: string;               // ✅ NEW
  // ... remaining fields ...
}
```

#### Interface: `Ticket`
```typescript
export interface Ticket {
  // ... existing fields ...
  assignedToId?: string;
  assignedToName?: string;
  assignedToPhone?: string;              // ✅ NEW
  // ... more fields ...
  managedByCode?: string;
  managedByName?: string;
  managedByPhone?: string;               // ✅ NEW
  // ... remaining fields ...
}
```

**Giải thích:**
- `assignedToPhone`: Số điện thoại của nhân viên được giao ticket
- `managedByPhone`: Số điện thoại của người quản lý (nếu có)
- Cả hai đều optional (`?`) vì backend có thể không luôn cung cấp

---

### 2️⃣ src/pages/student/student-home-page.tsx

#### Cập nhật Status Labels
```typescript
// ❌ TRƯỚC
const statusLabels: Record<string, string> = {
  open: 'Mới tạo',
  assigned: 'Đã được giao việc',
  'in-progress': 'Đang xử lý',
  resolved: 'Đã giải quyết',
  closed: 'Đã đóng',
};

// ✅ SAU
const statusLabels: Record<string, string> = {
  open: 'Mới tạo',
  assigned: 'Đã được giao việc',
  'in-progress': 'Đang xử lý',
  resolved: 'Đã giải quyết',
  closed: 'Đã đóng',
  cancelled: 'Đã hủy',  // 🆕 Thêm
};
```

#### Cập nhật API Mapping (fetchMyTickets)
```typescript
const mappedTickets: Ticket[] = response.data.items.map((apiTicket: TicketFromApi) => ({
  // ... existing fields ...
  assignedToPhone: apiTicket.assignedToPhone || undefined,  // ✅ NEW
  managedByPhone: apiTicket.managedByPhone || undefined,    // ✅ NEW
  note: apiTicket.note || undefined,                        // ✅ NEW
  // ... remaining fields ...
}));
```

#### Cập nhật Ticket Card Rendering
```typescript
{displayedTickets.map((ticket) => {
  // ✅ NEW: Kiểm tra trạng thái
  const isCompleted = ticket.status === 'resolved' || ticket.status === 'closed';
  const isCancelled = ticket.status === 'cancelled';

  return (
    <div key={ticket.id} className="...">
      {/* ... existing content ... */}
      
      {/* ✅ NEW: Hiển thị info cho completed tickets */}
      {isCompleted && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 flex flex-col gap-3">
          {ticket.assignedToName && (
            <div className="flex items-center gap-3">
              <span className="text-lg">👤</span>
              <div className="flex-1">
                <div className="text-[0.8rem] font-semibold text-gray-500">Người xử lý</div>
                <div className="text-sm font-medium text-gray-800">{ticket.assignedToName}</div>
              </div>
              {ticket.assignedToPhone && (
                <div className="text-right">
                  <div className="text-[0.8rem] font-semibold text-gray-500">Điện thoại</div>
                  <div className="text-sm font-medium text-gray-800">{ticket.assignedToPhone}</div>
                </div>
              )}
            </div>
          )}
          {ticket.resolvedAt && (
            <div className="flex items-center gap-3">
              <span className="text-lg">✅</span>
              <div>
                <div className="text-[0.8rem] font-semibold text-gray-500">Ngày giải quyết</div>
                <div className="text-sm font-medium text-gray-800">{formatDate(ticket.resolvedAt)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ NEW: Hiển thị lý do hủy cho cancelled tickets */}
      {isCancelled && ticket.note && (
        <div className="bg-red-50 rounded-lg p-4 flex gap-3">
          <span className="text-lg">📝</span>
          <div className="flex-1">
            <div className="text-[0.8rem] font-semibold text-red-600 mb-1">Lý do hủy</div>
            <div className="text-sm text-red-800">{ticket.note}</div>
          </div>
        </div>
      )}
      
      {/* ... remaining content ... */}
    </div>
  );
})}
```

**Giải thích:**
- Kiểm tra `isCompleted` để xác định ticket đã hoàn thành
- Kiểm tra `isCancelled` để xác định ticket bị hủy
- Hiển thị thông tin xử lý trong box xanh lá
- Hiển thị lý do hủy trong box đỏ
- Sử dụng emoji để dễ nhận diện

---

### 3️⃣ src/components/shared/ticket-detail-modal.tsx

#### Cập nhật Hiển Thị Người Xử Lý
```typescript
// ❌ TRƯỚC
{(ticket.assignedTo || ticket.assignedToName) && (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">👤 Người xử lý</div>
    <div className="text-base text-gray-800 font-medium">{ticket.assignedToName || ticket.assignedTo}</div>
  </div>
)}

// ✅ SAU
{(ticket.assignedTo || ticket.assignedToName) && (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">👤 Người xử lý</div>
    <div className="text-base text-gray-800 font-medium">{ticket.assignedToName || ticket.assignedTo}</div>
    {ticket.assignedToPhone && (
      <div className="text-sm text-gray-600 mt-2">📱 {ticket.assignedToPhone}</div>
    )}
  </div>
)}
```

#### Cập Nhật Hiển Thị Ghi Chú
```typescript
// ❌ TRƯỚC (chỉ có ticket.notes)
{ticket.notes && (
  <div className="bg-gray-50 p-4 rounded-lg col-span-2">
    <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">📝 Ghi chú</div>
    <div className="text-base text-gray-800 font-medium">{ticket.notes}</div>
  </div>
)}

// ✅ SAU (thêm ticket.note với xử lý đặc biệt cho cancelled)
{ticket.note && (
  <div className={`p-4 rounded-lg col-span-2 ${ticket.status === 'cancelled' ? 'bg-red-50' : 'bg-gray-50'}`}>
    <div className={`text-[0.85rem] font-semibold mb-1 ${ticket.status === 'cancelled' ? 'text-red-600' : 'text-gray-500'}`}>
      {ticket.status === 'cancelled' ? '🔴 Lý do hủy' : '📝 Ghi chú'}
    </div>
    <div className={`text-base font-medium ${ticket.status === 'cancelled' ? 'text-red-800' : 'text-gray-800'}`}>
      {ticket.note}
    </div>
  </div>
)}

{/* Giữ lại cũ để backward compatibility */}
{ticket.notes && (
  <div className="bg-gray-50 p-4 rounded-lg col-span-2">
    <div className="text-[0.85rem] font-semibold text-gray-500 mb-1">📝 Ghi chú</div>
    <div className="text-base text-gray-800 font-medium">{ticket.notes}</div>
  </div>
)}
```

**Giải thích:**
- Thêm số điện thoại ngay dưới tên nhân viên
- Xử lý `ticket.note` từ API (khác với `ticket.notes`)
- Phân biệt màu sắc: xanh cho ghi chú bình thường, đỏ cho lý do hủy
- Giữ lại `ticket.notes` để backward compatibility

---

## 🎨 CSS Classes Sử Dụng

### Xanh Lá (Completed)
```css
/* Box wrapper */
bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4

/* Text */
text-gray-500 (label), text-gray-800 (content)
text-lg (emoji size)
text-[0.8rem], text-sm (font sizes)
```

### Đỏ Nhạt (Cancelled)
```css
/* Box wrapper */
bg-red-50 rounded-lg p-4

/* Text */
text-red-600 (label), text-red-800 (content)
text-lg (emoji size)
text-[0.8rem], text-sm (font sizes)
```

### Responsive
```css
flex items-center gap-3 (responsive layout)
flex-1 (take available space)
text-right (align right for phone)
```

---

## 🧪 Test Cases

### Test Case 1: Ticket Completed
```
Given: Student có ticket với status = 'resolved'
When: Vào home page
Then: 
  ✅ Hiển thị staff name
  ✅ Hiển thị staff phone (nếu có)
  ✅ Hiển thị resolved date
  ✅ Box màu xanh
```

### Test Case 2: Ticket Cancelled
```
Given: Student có ticket với status = 'cancelled' và note
When: Vào home page
Then:
  ✅ Status badge hiển thị "Đã hủy"
  ✅ Hiển thị box đỏ với lý do hủy
  ✅ Note được hiện rõ
```

### Test Case 3: Ticket Other Status
```
Given: Student có ticket với status = 'pending' hoặc 'processing'
When: Vào home page
Then:
  ✅ Không hiển thị staff info box
  ✅ Không hiển thị lý do hủy box
  ✅ Hiển thị bình thường như cũ
```

### Test Case 4: Modal Detail
```
Given: Ticket completed hoặc cancelled
When: Click "Xem chi tiết"
Then:
  ✅ Modal hiển thị đầy đủ info
  ✅ Staff phone hiển thị trong modal
  ✅ Note/Lý do hủy hiển thị với màu sắc phù hợp
```

---

## 🚀 Deployment Checklist

- [x] Type definitions updated
- [x] API mapping updated
- [x] UI components updated
- [x] No TypeScript errors
- [x] No console errors
- [x] Status labels updated (Vietnamese)
- [x] Responsive design maintained
- [ ] Test on mobile devices
- [ ] Test with real API data
- [ ] User acceptance testing
- [ ] Deploy to staging
- [ ] Deploy to production

---

## 📚 References

### API Fields
- `assignedToName`: Tên nhân viên xử lý từ API
- `assignedToPhone`: Số điện thoại nhân viên (NEW field from backend)
- `resolvedAt`: Timestamp khi ticket được resolve
- `note`: Ghi chú/lý do từ backend
- `status`: Trạng thái ticket (RESOLVED, CLOSED, CANCELLED, etc.)

### Frontend Constants
- **Completed Status**: `'resolved'`, `'closed'`
- **Cancelled Status**: `'cancelled'`
- **Color Scheme**: Green (completed), Red (cancelled)

### Date Formatting
- Sử dụng `formatDate()` function để convert timestamp
- Hiển thị relative time (e.g., "1 giờ trước")

