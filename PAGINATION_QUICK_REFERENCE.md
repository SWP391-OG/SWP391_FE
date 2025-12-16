# 🎯 Pagination UI - Quick Reference

## ✅ Các thành phần đã triển khai

### 1️⃣ Pagination Component (`src/components/shared/Pagination.tsx`)
```
┌─────────────────────────────────────────────────────────────────┐
│  Số dòng/trang: [10 ▼]   │  Hiển thị 1-10 trong 150   │  [< 1 2 3 > ]  │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Dropdown chọn page size (10, 20, 50, 100)
- ✅ Hiển thị range items: "Hiển thị X đến Y trong Z kết quả"
- ✅ Nút Previous/Next (auto-disable)
- ✅ Smart page numbers (... cho trang ở giữa)
- ✅ Responsive (stack trên mobile)
- ✅ Accessible (tooltips, disabled states)

### 2️⃣ TicketsTable Component (Updated)
```
┌───────────────────────────────────────────┐
│  BẢNG TICKETS                             │
│  (tickets rendering)                      │
│                                           │
│  [Pagination Component ở dưới]            │
└───────────────────────────────────────────┘
```

**Thêm props:**
```typescript
pageNumber?: number              // Trang hiện tại
pageSize?: number                // Items/trang
totalPages?: number              // Tổng số trang
totalCount?: number              // Tổng items
hasPrevious?: boolean             // Có trang trước?
hasNext?: boolean                 // Có trang sau?
onPageChange?: (page: number)    // Xử lý đổi trang
onPageSizeChange?: (size: number) // Xử lý đổi page size
```

### 3️⃣ Admin Page (Updated)
```
State:
┌─────────────────────────────────┐
│ paginationState = {             │
│   pageNumber: 1                 │
│   pageSize: 10                  │
│   totalCount: 150               │
│   totalPages: 15                │
│   hasPrevious: false            │
│   hasNext: true                 │
│ }                               │
└─────────────────────────────────┘

Handlers:
├─ handlePageChange(page)      → fetchTickets(page, current_size)
└─ handlePageSizeChange(size)  → fetchTickets(1, size)

Props flow:
paginationState ──→ TicketsTable ──→ Pagination ──→ User Clicks
    ↓                                                    ↓
  State              Renders UI                   handlePageChange
    ↑                                                    ↓
  Update            fetchTickets()      ←─────────────┘
```

## 🔄 Luồng hoạt động

### Step 1: Load ban đầu
```
Admin Page Mount
    ↓
useEffect()
    ↓
fetchTickets(1, 10)
    ↓
API: GET /Ticket?pageNumber=1&pageSize=10
    ↓
Response: { pageNumber, pageSize, totalCount, totalPages, hasPrevious, hasNext, items }
    ↓
setPaginationState(...)
setApiTickets(...)
    ↓
TicketsTable render với Pagination component
```

### Step 2: Người dùng nhấn trang khác
```
User clicks page 2
    ↓
Pagination button onClick
    ↓
onPageChange(2)
    ↓
handlePageChange(2)
    ↓
fetchTickets(2, 10)
    ↓
API: GET /Ticket?pageNumber=2&pageSize=10
    ↓
Update state & re-render
```

### Step 3: Người dùng đổi items/trang
```
User selects 20 in dropdown
    ↓
select onChange
    ↓
onPageSizeChange(20)
    ↓
handlePageSizeChange(20)
    ↓
fetchTickets(1, 20)  ← Reset to page 1
    ↓
API: GET /Ticket?pageNumber=1&pageSize=20
    ↓
Update state & re-render
```

## 📱 Responsive Layout

### Desktop (≥768px)
```
┌────────────────────────────────────────────────────────┐
│ [10 ▼]  │  Hiển thị 1-10 trong 150  │  [< 1 2 3 > ]  │
└────────────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────┐
│   [10 ▼]             │
├──────────────────────┤
│ Hiển thị 1-10 trong  │
│ 150                  │
├──────────────────────┤
│ [< 1 2 3 > ]         │
└──────────────────────┘
```

## 🎨 Kiểu dáng

| Element | Style |
|---------|-------|
| Page selector | `rounded-md border border-gray-300 bg-white px-3 py-2` |
| Current page | `bg-blue-500 text-white` |
| Other pages | `border border-gray-300 bg-white text-gray-700 hover:bg-gray-50` |
| Disabled button | `disabled:bg-gray-50 disabled:text-gray-400 disabled:opacity-50` |
| Prev/Next icons | `h-4 w-4` (ChevronLeft/ChevronRight) |

## 🧪 Kiểm tra

**Checklist:**
- ✅ Trang 1 load 10 tickets
- ✅ Click "2" jump tới trang 2
- ✅ Click ">" next page
- ✅ Click "<" previous page
- ✅ Disable "<" ở trang 1
- ✅ Disable ">" ở trang cuối
- ✅ Dropdown "20" reload trang 1 với 20 items
- ✅ Hiển thị đúng số items range
- ✅ Smart page numbers (1 ... 5 6 7 ... 15)
- ✅ Responsive trên mobile

## 📊 API Response Example

```json
{
  "status": true,
  "message": "Success",
  "data": {
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 150,
    "totalPages": 15,
    "hasPrevious": false,
    "hasNext": true,
    "items": [
      {
        "ticketCode": "TKT-001",
        "title": "WiFi không hoạt động",
        "status": "NEW",
        ...
      },
      ...
    ]
  },
  "errors": []
}
```

## 🚀 Files Modified

| File | Changes |
|------|---------|
| `src/components/shared/Pagination.tsx` | ✨ NEW - Pagination component |
| `src/components/admin/TicketsTable.tsx` | 📝 Added pagination props & Pagination component |
| `src/pages/admin/admin-page.tsx` | 📝 Added pagination state, handlers, fetchTickets update |

## 🔗 Props Flow Diagram

```
Admin Page
├─ paginationState
│  ├─ pageNumber
│  ├─ pageSize
│  ├─ totalCount
│  ├─ totalPages
│  ├─ hasPrevious
│  └─ hasNext
│
├─ handlers
│  ├─ handlePageChange
│  └─ handlePageSizeChange
│
└─ TicketsTable
   ├─ tickets (TicketFromApi[])
   ├─ locations
   ├─ onViewTicket
   ├─ pageNumber ← from paginationState
   ├─ pageSize ← from paginationState
   ├─ totalPages ← from paginationState
   ├─ totalCount ← from paginationState
   ├─ hasPrevious ← from paginationState
   ├─ hasNext ← from paginationState
   ├─ onPageChange ← handlePageChange
   ├─ onPageSizeChange ← handlePageSizeChange
   │
   └─ Pagination
      ├─ pageNumber
      ├─ pageSize
      ├─ totalPages
      ├─ totalCount
      ├─ hasPrevious
      ├─ hasNext
      ├─ onPageChange
      └─ onPageSizeChange
         └─ Emits events back to Admin Page
```

## 💡 Usage Example

```tsx
<TicketsTable
  tickets={apiTickets}
  locations={locations}
  onViewTicket={setSelectedTicketForReview}
  // Pagination props
  pageNumber={paginationState.pageNumber}
  pageSize={paginationState.pageSize}
  totalPages={paginationState.totalPages}
  totalCount={paginationState.totalCount}
  hasPrevious={paginationState.hasPrevious}
  hasNext={paginationState.hasNext}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
/>
```

---

**Status:** ✅ **COMPLETED**

Giao diện phân trang đã được triển khai đầy đủ! 🎉
