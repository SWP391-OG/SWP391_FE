# Pagination Implementation - Ticket List Admin

## Tổng quan
Đã triển khai giao diện phân trang (pagination) cho danh sách tickets trên trang admin. Backend trả về dữ liệu với phân trang mỗi trang 10 items, giờ giao diện đã hỗ trợ hiển thị và điều khiển phân trang.

## Các thay đổi

### 1. Tạo Pagination Component
**File:** `src/components/shared/Pagination.tsx`

Component này hiển thị giao diện phân trang với các tính năng:
- **Lựa chọn số items/trang:** Dropdown để chọn 10, 20, 50 hoặc 100 items
- **Thông tin phân trang:** Hiển thị "Hiển thị X đến Y trong tổng cộng Z kết quả"
- **Điều khiển trang:** 
  - Nút Previous/Next (tự động disable khi ở trang đầu/cuối)
  - Nút số trang có thông minh (hiển thị trang hiện tại, +/- 1 trang xung quanh, và trang đầu/cuối)
  - Dấu "..." để bỏ qua các trang ở giữa

### 2. Cập nhật TicketsTable Component
**File:** `src/components/admin/TicketsTable.tsx`

Thêm props để quản lý phân trang:
```typescript
// Pagination props
pageNumber?: number;
pageSize?: number;
totalPages?: number;
totalCount?: number;
hasPrevious?: boolean;
hasNext?: boolean;
onPageChange?: (page: number) => void;
onPageSizeChange?: (size: number) => void;
```

Component tích hợp Pagination component ở dưới bảng tickets.

### 3. Cập nhật Admin Page
**File:** `src/pages/admin/admin-page.tsx`

#### Thêm Pagination State:
```typescript
const [paginationState, setPaginationState] = useState({
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPrevious: false,
  hasNext: false,
});
```

#### Cập nhật Fetch Function:
- Thay đổi từ fetch cố định (1, 100) thành fetch động (pageNumber, pageSize)
- Cập nhật paginationState khi nhận response từ API

#### Thêm Handler Functions:
```typescript
const handlePageChange = (page: number) => {
  fetchTickets(page, paginationState.pageSize);
};

const handlePageSizeChange = (size: number) => {
  fetchTickets(1, size); // Reset to page 1 when changing page size
};
```

#### Cập nhật TicketsTable Props:
Truyền tất cả pagination props từ state tới component

## Luồng hoạt động

1. **Load ban đầu:** Khi admin mở trang, sẽ fetch trang 1 với 10 items
2. **Đổi trang:** Click nút trang → gọi `handlePageChange` → fetch API với trang mới
3. **Đổi số items/trang:** Chọn option → gọi `handlePageSizeChange` → fetch API từ trang 1 với page size mới
4. **Backend Response:** API trả về:
   - `pageNumber`: Trang hiện tại
   - `pageSize`: Số items mỗi trang
   - `totalCount`: Tổng số items
   - `totalPages`: Tổng số trang
   - `hasPrevious`: Có trang trước?
   - `hasNext`: Có trang tiếp theo?
   - `items`: Mảng tickets

## Giao diện

### Phần trên bảng: Thông tin & Điều khiển
```
Số dòng/trang: [10 ▼]     Hiển thị 1 đến 10 trong tổng cộng 150 kết quả     [<] [1] [2] [3] ... [15] [>]
```

### Đặc tính:
- **Responsive:** Flex layout tự động xếp lại trên mobile
- **Accessible:** Các nút có title tooltips, disabled states rõ ràng
- **User-friendly:** Màu sắc khác biệt cho nút trang hiện tại (xanh) vs các trang khác (trắng)
- **Smart pagination:** Chỉ hiển thị trang liên quan, dùng "..." để bỏ qua

## Kiểu dáng (Tailwind CSS)

- Nút pagination: `rounded-md px-3 py-2 text-sm font-medium`
- Nút hiện tại: `bg-blue-500 text-white`
- Nút khác: `border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`
- Disabled state: `disabled:bg-gray-50 disabled:text-gray-400 disabled:opacity-50`

## API Endpoints

Backend endpoint được sử dụng:
```
GET /Ticket?pageNumber={pageNumber}&pageSize={pageSize}
```

Response format:
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
    "items": [...]
  },
  "errors": []
}
```

## Testing

Để test phân trang:
1. Vào Admin → Tickets tab
2. Bảng sẽ hiển thị trang 1 với 10 tickets
3. Nhấn nút trang khác hoặc ">" để di chuyển trang
4. Chọn "20" trong dropdown số items/trang → sẽ reload từ trang 1 với 20 items
5. Xác nhận URL query parameters được cập nhật (nếu cần)

## Tương lai (Cải tiến có thể)

- Thêm URL query params (?page=2&pageSize=20) để share link
- Lưu pagination preference trong localStorage
- Thêm loading skeleton khi fetch data
- Thêm sort columns
- Thêm filter chips hiển thị active filters
