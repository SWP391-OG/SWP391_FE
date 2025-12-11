# Hướng dẫn sử dụng API Get All Tickets cho Admin

## 🎯 Tổng quan
Đã triển khai chức năng lấy tất cả tickets từ backend API cho Admin Dashboard.

## 📝 Các file đã được cập nhật

### 1. **Types (`src/types/index.ts`)**
```typescript
// Thêm interface cho ticket từ API
export interface TicketFromApi {
  ticketCode: string;
  title: string;
  description: string;
  imageUrl: string;
  requesterCode: string;
  requesterName: string;
  assignedToCode: string;
  assignedToName: string;
  managedByCode: string;
  managedByName: string;
  locationCode: string;
  locationName: string;
  categoryCode: string;
  categoryName: string;
  status: string;
  contactPhone: string | null;
  note: string | null;
  createdAt: string;
  resolveDeadline: string;
  resolvedAt: string | null;
  closedAt: string | null;
  ratingStars: number | null;
  ratingComment: string | null;
}

// Interface cho response với pagination
export interface GetAllTicketsResponse {
  status: boolean;
  message: string;
  data: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: TicketFromApi[];
  };
  errors: string[];
}
```

### 2. **Ticket Service (`src/services/ticketService.ts`)**
```typescript
// Thêm function mới
async getAllTicketsFromApi(pageNumber: number = 1, pageSize: number = 10): Promise<GetAllTicketsResponse> {
  try {
    const response = await apiClient.get<GetAllTicketsResponse>(
      `/Ticket?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    throw error;
  }
}
```

### 3. **Admin Page (`src/pages/admin/admin-page.tsx`)**
- Thêm state để lưu tickets từ API
- Thêm useEffect để fetch tickets khi component mount
- Hiển thị loading state và error handling
- Truyền `apiTickets` vào TicketsTable component

### 4. **Tickets Table (`src/components/admin/TicketsTable.tsx`)**
- Cập nhật để nhận cả `Ticket` và `TicketFromApi` types
- Thêm helper function để detect ticket từ API
- Cập nhật render logic để hiển thị đúng fields theo yêu cầu:
  - Mã Ticket (ticketCode)
  - Tiêu đề (title)
  - Mô tả (description)
  - Vị trí (locationName)
  - Trạng thái (status)
  - Hạn giải quyết (resolveDeadline)

## 🚀 Cách sử dụng

### 1. Cấu hình API URL
Tạo file `.env` trong root folder (nếu chưa có):
```env
VITE_API_BASE_URL=https://localhost:7151/api
VITE_API_TIMEOUT=10000
VITE_USE_MOCK_DATA=false
VITE_DEV_MODE=true
```

### 2. Restart Dev Server
Sau khi tạo/sửa file `.env`, restart lại dev server:
```powershell
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại:
npm run dev
```

### 3. Truy cập Admin Dashboard
1. Mở browser: http://localhost:5173
2. Đăng nhập với tài khoản Admin
3. Vào tab "Tickets Management"
4. Bảng tickets sẽ tự động load từ API

## 🔍 Debug

### Kiểm tra Console Logs
Mở Developer Tools > Console để xem:
```
🎫 Admin Page - Tickets: {
  apiTicketsCount: 1,
  localTicketsCount: 0,
  loadingTickets: false,
  ticketsError: null
}

✅ Fetched tickets from API: {
  status: true,
  message: "Retrieved 1 tickets (Page 1 of 1)",
  data: { ... }
}
```

### Nếu không load được tickets:

#### 1. Kiểm tra Network Tab
- Mở Developer Tools > Network
- Filter: `Ticket`
- Xem request có được gửi không
- Status code là gì (200 OK, 401 Unauthorized, 500 Error, etc.)

#### 2. Kiểm tra CORS
Nếu thấy lỗi CORS, backend cần thêm headers:
```csharp
// Backend - Program.cs hoặc Startup.cs
app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader()
);
```

#### 3. Kiểm tra HTTPS Certificate
Nếu backend dùng `https://localhost:7151`:
- Chrome có thể block self-signed certificate
- Giải pháp: Truy cập https://localhost:7151/api/Ticket trực tiếp trong browser
- Click "Advanced" > "Proceed to localhost (unsafe)"
- Sau đó refresh lại trang React app

#### 4. Thay đổi sang HTTP (Temporary)
Nếu vẫn lỗi, tạm thời đổi sang HTTP:
```env
# .env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📊 Cấu trúc dữ liệu

### Request
```
GET /api/Ticket?pageNumber=1&pageSize=10
```

### Response
```json
{
  "status": true,
  "message": "Retrieved 1 tickets (Page 1 of 1)",
  "data": {
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 1,
    "totalPages": 1,
    "hasPrevious": false,
    "hasNext": false,
    "items": [
      {
        "ticketCode": "TKT3357338816",
        "title": "Mất kết nối Wifi",
        "description": "Wifi chập chờn như bài hát của Dương Domic",
        "imageUrl": "",
        "requesterCode": "FPT01",
        "requesterName": "Nguyễn Minh Quang",
        "locationCode": "HCM-P301",
        "locationName": "Phòng 301 (HCM)",
        "categoryCode": "WIFI",
        "categoryName": "Mất kết nối Wifi",
        "status": "NEW",
        "createdAt": "2025-12-10T01:35:35.737",
        "resolveDeadline": "2025-12-10T05:35:35.74"
      }
    ]
  },
  "errors": []
}
```

## ⚠️ Lưu ý quan trọng

1. **Status Mapping**: Backend trả về status dạng `NEW`, `ASSIGNED`, etc. Code đã xử lý mapping sang UI labels tiếng Việt.

2. **Pagination**: Hiện tại fetch 100 tickets đầu tiên. Nếu cần pagination UI, có thể thêm sau.

3. **Authentication**: Nếu API yêu cầu authentication, cần thêm token vào headers. Check file `src/services/api.ts` - đã có logic lấy token từ localStorage.

4. **Error Handling**: Component có hiển thị error message nếu API call fail.

## 🎨 Hiển thị trên UI

Bảng tickets hiển thị các cột:
1. **Mã Ticket**: TKT3357338816
2. **Tiêu đề**: Mất kết nối Wifi  
3. **Mô tả**: Wifi chập chờn như bài hát của Dương Domic
4. **Vị trí**: Phòng 301 (HCM)
5. **Trạng thái**: Badge màu (Mới tạo, Đang xử lý, etc.)
6. **Hạn giải quyết**: 10/12/2025, 05:35

## 🔄 Next Steps

1. **Thêm Pagination UI**: Buttons để chuyển trang
2. **Thêm Search/Filter**: Tìm kiếm theo mã ticket, title, status
3. **Real-time Updates**: WebSocket hoặc polling để update tickets
4. **Assign Ticket**: Implement API call khi admin assign ticket
5. **View Details**: Modal để xem chi tiết ticket

---

## 📞 Cần hỗ trợ?

Nếu có vấn đề, kiểm tra:
1. Console logs (F12 > Console)
2. Network tab (F12 > Network)
3. Backend logs
4. File `.env` có đúng API URL không

Happy coding! 🚀
