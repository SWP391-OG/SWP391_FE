# 📋 IMPLEMENTATION PLAN - 3 VẤNĐỀ CHÍNH

## VẤN ĐỀ 1: DB KHÔNG CÓ PRIORITY FIELD

### Hiện Trạng
```typescript
// src/types/index.ts - dòng 171, 278
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface Ticket {
  priority?: 'low' | 'medium' | 'high' | 'urgent'; // Frontend only - không có trong DB
}
```

**Lỗi**: Comment nói "không có trong DB" nhưng form vẫn cố hiển thị priority column!

### Giải Pháp
1. ❌ **Xóa hoàn toàn priority** khỏi form + table
2. ❌ **Xóa priority column** từ IT Staff & Facility Staff page
3. ❌ **Xóa priority logic** từ ticketService
4. ✅ **Chỉ dùng SLA deadline để xác định urgency**

### Chi Tiết Thay Đổi

**File cần sửa**:
- `src/pages/staff/it-staff-page.tsx` - xóa priority column
- `src/pages/staff/facility-staff-page.tsx` - xóa priority column
- `src/pages/staff/staff-page.tsx` - xóa priority column
- `src/types/index.ts` - optional (giữ type cho reference nhưng không dùng)
- `src/services/ticketService.ts` - xóa priority logic

---

## VẤN ĐỀ 2: QỘNG NHẤT STAFF PAGE

### Hiện Trạng
```
/pages/staff/
  ├── staff-page.tsx (wrapper)
  ├── it-staff-page.tsx (IT-specific)
  └── facility-staff-page.tsx (Facility-specific)
```

**Vấn Đề**: 2 pages này **hoàn toàn giống nhau** - duplicate code 100%!

### Giải Pháp
**Xóa it-staff-page.tsx + facility-staff-page.tsx, dùng staff-page.tsx cho tất cả staff**

Chi tiết:
1. Rename staff-page.tsx → assigned-tickets-page.tsx
2. Loại bỏ phân biệt IT/Facility
3. Render các tickets được assign cho user (regardless loại)
4. Update app.tsx routing

### Kết Quả
```
/pages/staff/
  ├── staff-page.tsx (wrapper - điều hướng)
  └── assigned-tickets-page.tsx (chi tiết tickets)
```

---

## VẤN ĐỀ 3: STUDENT FEEDBACK PERSIST AFTER REFRESH

### Hiện Trạng
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

**Vấn Đề**: 
1. Callback không await API response
2. Nếu API fail, feedback vẫn hiển thị trong UI (cached)
3. Khi refresh, dữ liệu từ API không có feedback → mất dữ liệu

### Giải Pháp
1. ✅ **Thực sự call API** `/Ticket/{ticketCode}/feedback` PATCH
2. ✅ **Await response** trước khi update UI
3. ✅ **Hiển thị error** nếu API fail
4. ✅ **Persist vào localStorage** khi offline

### Flow Detailed
```
Student click "Lưu phản hồi"
  ↓
Frontend gọi API PATCH /Ticket/{ticketCode}/feedback
  ├─ Body: { ratingStars, ratingComment }
  └─ Header: Authorization: Bearer token
  ↓
Backend xử lý
  ├─ Validate ratingStars (1-5)
  ├─ Validate ratingComment (max 500 chars)
  ├─ Update DB: Ticket.ratingStars, Ticket.ratingComment
  └─ Return: { status: true, data: {...}, errors: [] }
  ↓
Frontend nhận response
  ├─ Nếu success: update local ticket object
  ├─ Nếu fail: show error message
  └─ Refresh ticket data từ API
  ↓
Khi student refresh page
  ├─ Fetch tickets từ API
  └─ Admin thấy feedback được lưu vào DB
```

### Code Change
```typescript
// ticket-detail-modal.tsx
const handleSaveFeedback = async () => {
  if (!onUpdateFeedback || ratingStars < 1) {
    alert('Vui lòng chọn từ 1-5 sao');
    return;
  }

  try {
    setIsSavingFeedback(true);
    
    // Call API to persist feedback
    const response = await ticketService.updateFeedback(
      ticket.id, // hoặc ticket.ticketCode nếu là API
      ratingStars,
      ratingComment
    );

    if (!response.status) {
      throw new Error(response.errors?.[0] || 'Failed to save feedback');
    }

    // Update local state
    setSubmittedRating({ stars: ratingStars, comment: ratingComment });
    setIsEditingFeedback(false);
    
    // Show success message
    alert('✅ Cảm ơn bạn đã đánh giá!');
    
  } catch (error) {
    alert('❌ Lưu feedback thất bại: ' + (error as Error).message);
  } finally {
    setIsSavingFeedback(false);
  }
};
```

---

## MỤC 8: AUTO ESCALATE (CHI TIẾT)

### Auto Escalate là gì?
**Tự động nâng cấp ticket lên level cao hơn khi SLA sắp miss**

### Kịch Bản
```
1. Ticket tạo lúc 10:00
   - Deadline: 11:00 (60 phút, SLA = 1 hour)

2. Lúc 10:50 (còn 10 phút)
   - System check: Ticket sắp quá deadline
   - Auto escalate → gửi notification cho manager/admin
   - Status có thể change từ "IN_PROGRESS" → "ESCALATED"
   - Priority highlight 🔴

3. Lúc 11:05 (quá hạn rồi)
   - Ticket tự động chuyển sang admin
   - Trigger notification urgency cao
   - Log vào audit trail
```

### Implementation Steps
```
Step 1: Add escalation status
  - OPEN
  - ASSIGNED  
  - IN_PROGRESS
  - ESCALATED ← New (khi sắp/quá deadline)
  - RESOLVED
  - CLOSED

Step 2: Background job/cron
  - Mỗi 5 phút check tickets
  - Tìm tickets có:
    * Status = IN_PROGRESS
    * deadline - now < 15 minutes (cảnh báo)
    * deadline - now < 0 (quá hạn)
  - Gửi notification + escalate

Step 3: API Endpoint
  PATCH /Ticket/{ticketCode}/escalate
  Body: { reason: "SLA deadline sắp miss" }
  Response: { status: true, newStatus: "ESCALATED", ... }

Step 4: Frontend
  - Show red badge "🔴 Quá hạn" trên ticket cards
  - Update modal với escalation history
  - Auto-refresh dashboard mỗi 1 phút
```

### Ví Dụ Code (Backend - pseudocode)
```csharp
// Controllers/TicketController.cs
[HttpPatch("{ticketCode}/escalate")]
public IActionResult EscalateTicket(string ticketCode, [FromBody] EscalateRequest request)
{
    var ticket = _ticketService.GetByCode(ticketCode);
    
    if (ticket.Status != "IN_PROGRESS")
        return BadRequest("Chỉ có thể escalate ticket đang xử lý");
    
    // Update ticket
    ticket.Status = "ESCALATED";
    ticket.EscalatedAt = DateTime.UtcNow;
    ticket.EscalationReason = request.Reason;
    
    // Assign lên admin/manager
    ticket.ManagedBy = GetManagerByDepartment(ticket.DepartmentId);
    
    _ticketService.Update(ticket);
    
    // Send notification
    _notificationService.Notify(
        userId: ticket.ManagedBy.Id,
        message: $"Ticket {ticket.TicketCode} đã escalate - SLA sắp miss!",
        type: NotificationType.URGENT
    );
    
    return Ok(new { status = true, data = ticket });
}

// Background Service (runs every 5 minutes)
public class TicketEscalationService
{
    public void CheckAndEscalateOverdueTickets()
    {
        var tickets = _db.Tickets
            .Where(t => t.Status == "IN_PROGRESS" && t.ResolveDeadline < DateTime.UtcNow)
            .ToList();
        
        foreach (var ticket in tickets)
        {
            if (ticket.Status != "ESCALATED")
            {
                EscalateTicket(ticket, "Auto-escalated: SLA deadline missed");
            }
        }
    }
}
```

### Frontend Monitoring
```typescript
// Mỗi 1 phút check escalation
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await ticketService.getMyTickets(1, 100);
    const escalatedTickets = response.data.items
      .filter(t => t.status === 'ESCALATED' && !escalationNotified[t.ticketCode]);
    
    escalatedTickets.forEach(ticket => {
      showNotification({
        title: '⚠️ Ticket Escalated',
        message: `${ticket.title} đã được escalate!`,
        type: 'warning'
      });
    });
  }, 60000); // 1 minute
  
  return () => clearInterval(interval);
}, []);
```

---

## TÓNGKẾT CÁC HÀNH ĐỘNG

### Hành Động 1: Xóa Priority
- [ ] Xóa priority column từ IT Staff page
- [ ] Xóa priority column từ Facility Staff page  
- [ ] Xóa priority column từ Staff page
- [ ] Xóa priority logic từ services

### Hành Động 2: Nhất Staff Page
- [ ] Xóa file it-staff-page.tsx
- [ ] Xóa file facility-staff-page.tsx
- [ ] Rename staff-page.tsx → assigned-tickets-page.tsx
- [ ] Update app.tsx routing

### Hành Động 3: Fix Feedback Persist
- [ ] Thêm error handling trong updateFeedback
- [ ] Await API response
- [ ] Validate ratingStars, ratingComment
- [ ] Update ticket object sau khi save
- [ ] Test: Save feedback → Refresh → Admin thấy

### Hành Động 4: Auto Escalate (Optional - MEDIUM Priority)
- [ ] Add ESCALATED status
- [ ] Create escalation API endpoint
- [ ] Add background job
- [ ] Update frontend notification
- [ ] Add escalation history tracking
