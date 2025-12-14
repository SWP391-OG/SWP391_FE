# 🎨 Auto-Escalate Feature - Visual Guide

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Admin Dashboard                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Sidebar Menu                  Main Content Area                     │
│  ┌──────────────────┐         ┌─────────────────────────────────┐   │
│  │ Quản lý Tickets  │         │ 🔴 Tickets Quá Hạn (5)      🔄  │   │
│  │                  │         └─────────────────────────────────┘   │
│  │ 🔴 Tickets Quá   │          ┌─────────────────────────────────┐   │
│  │   Hạn (5)        │◄────────►│ TKT-0001 🔴 IN_PROGRESS     ▼  │   │
│  │ ◄ Active         │          │ Quạt không hoạt động              │   │
│  │                  │          ├─────────────────────────────────┤   │
│  │ Quản lý Thành    │          │ Mô tả: Chi tiết lỗi...          │   │
│  │ Viên             │          │ Người báo cáo: Nguyễn Văn A     │   │
│  │                  │          │ Giao cho: Bảo trì TT            │   │
│  │ Quản lý Danh     │          │ Loại: Cơ sở vật chất            │   │
│  │ Mục              │          │ Địa điểm: Phòng A201            │   │
│  │                  │          │ Tạo: 14/12/2025 08:00            │   │
│  │ Quản lý Bộ phận  │          │ Hạn: 14/12/2025 12:00 (QUÁ HẠN) │   │
│  │                  │          ├─────────────────────────────────┤   │
│  │ Quản lý Địa      │          │ [⬆️ Escalate Ngay] [✕ Đóng]     │   │
│  │ Điểm             │          └─────────────────────────────────┘   │
│  │                  │                                                 │
│  │ Báo cáo          │          ┌─────────────────────────────────┐   │
│  └──────────────────┘          │ TKT-0002 🔴 IN_PROGRESS     ▼  │   │
│                                 │ Tủ lạnh phòng lạnh bị hỏng       │   │
│                                 │ (Click to expand...)              │   │
│                                 └─────────────────────────────────┘   │
│                                 (More tickets below...)               │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌──────────────────┐
│ Admin User Opens │
│  Overdue Tab     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ useOverdueTickets Hook Runs  │
│ - useEffect with [] dep      │
│ - Auto-refresh every 5 min   │
└────────┬─────────────────────┘
         │
         ▼ (Auto-call on mount + periodic)
┌──────────────────────────────┐
│ API: GET /Ticket/overdue     │
│ (Admin role verified)        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend Query:               │
│ WHERE status='IN_PROGRESS'   │
│   AND resolve_deadline < NOW │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Response: Array of Tickets   │
│ {                            │
│   items: [TKT-001, TKT-002]  │
│   totalCount: 5              │
│ }                            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ React State Updated          │
│ overdueTickets = [...]       │
│ loading = false              │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ UI Component Renders List    │
│ Shows all overdue tickets    │
│ with 🔴 red indicator        │
└──────────────────────────────┘
```

---

## ⬆️ Escalation Flow

```
┌────────────────────────────────────────────────────────────────────┐
│ Admin Views Ticket Details                                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  TKT-0001 Details                                                 │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Title: Quạt không hoạt động                                 │ │
│  │ Description: Chi tiết quạt bị hư hỏng                       │ │
│  │ Reporter: Nguyễn Văn A                                      │ │
│  │ Assigned: Bảo trì TT                                        │ │
│  │ Category: Cơ sở vật chất                                    │ │
│  │ Location: Phòng A201                                        │ │
│  │ Created: 14/12/2025 08:00                                   │ │
│  │ Deadline: 14/12/2025 12:00 🔴 OVERDUE                       │ │
│  │                                                              │ │
│  │ [⬆️ Escalate Ngay]      [✕ Close]                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Admin clicks "⬆️ Escalate Ngay"                                    │
│  │                                                                 │
│  ▼                                                                 │
│  Button shows: "⏳ Đang escalate..." (disabled)                    │
│  │                                                                 │
│  ▼                                                                 │
│  Frontend calls API:                                              │
│  PATCH /Ticket/TKT-0001/escalate                                  │
│  {}  (empty body)                                                 │
│  │                                                                 │
│  ▼                                                                 │
│  Backend processes:                                               │
│  ├─ Verify admin role ✓                                           │
│  ├─ Update is_escalated = true                                    │
│  ├─ Set escalated_at = NOW()                                      │
│  ├─ escalation_count += 1                                         │
│  ├─ Set escalation_reason = "SLA missed"                          │
│  └─ Send notification to manager                                  │
│  │                                                                 │
│  ▼                                                                 │
│  Response:                                                        │
│  {                                                                 │
│    "status": true,                                                │
│    "message": "Ticket escalated successfully",                    │
│    "data": {...}                                                  │
│  }                                                                 │
│  │                                                                 │
│  ▼                                                                 │
│  Frontend:                                                        │
│  ├─ Remove ticket from list                                       │
│  ├─ Show success message                                          │
│  ├─ Button state normal again                                     │
│  └─ User sees: "Ticket removed - escalated successfully"         │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📱 UI Component Hierarchy

```
AdminPage
│
├── useOverdueTickets Hook
│   ├── State: overdueTickets[]
│   ├── State: loading
│   ├── State: error
│   ├── Function: refetch()
│   ├── Function: escalateTicket()
│   └── Effect: Auto-refresh every 5 min
│
├── Sidebar Menu
│   ├── Button: "Quản lý Tickets"
│   ├── Button: "🔴 Tickets Quá Hạn (5)" ◄── Shows count
│   ├── Button: "Quản lý Thành viên"
│   └── ...
│
└── Main Content Area
    │
    ├── When activeTab === 'overdue'
    │   │
    │   └── OverdueTicketsPanel Component
    │       │
    │       ├── Header
    │       │   ├── Title: "🔴 Tickets Quá Hạn (5)"
    │       │   └── Button: "🔄 Làm mới"
    │       │
    │       ├── Loading State
    │       │   └── Spinner + "Đang tải..."
    │       │
    │       ├── Error State
    │       │   ├── "❌ Lỗi"
    │       │   └── Button: "🔄 Thử lại"
    │       │
    │       ├── Empty State
    │       │   └── "✅ Không có tickets quá hạn"
    │       │
    │       └── Success State
    │           └── List of TicketCards
    │               ├── TicketCard #1
    │               │   ├── Header (clickable)
    │               │   │   ├── Code: TKT-0001
    │               │   │   ├── Badge: 🔴 Quá hạn
    │               │   │   ├── Status: IN_PROGRESS
    │               │   │   └── Title: Quạt không hoạt động
    │               │   │
    │               │   └── Details (expanded)
    │               │       ├── Description
    │               │       ├── Reporter info
    │               │       ├── Assignee info
    │               │       ├── Category
    │               │       ├── Location
    │               │       ├── Created time
    │               │       ├── Deadline (red text)
    │               │       ├── Notes
    │               │       │
    │               │       └── Buttons
    │               │           ├── [⬆️ Escalate Ngay] ◄── Main Action
    │               │           └── [✕ Đóng]
    │               │
    │               ├── TicketCard #2
    │               │   (similar structure)
    │               │
    │               └── TicketCard #5
    │                   (similar structure)
    │
    └── When activeTab !== 'overdue'
        └── Other admin tabs (categories, departments, etc.)
```

---

## ⏱️ Timeline: Ticket Lifecycle with Escalation

```
Timeline:
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ 08:00  ─ Ticket created (TKT-0001)                                  │
│        └─ Status: OPEN                                             │
│        └─ Deadline: 12:00 (4 hours SLA)                            │
│                                                                     │
│ 09:00  ─ Ticket assigned to Staff                                   │
│        └─ Status: ASSIGNED                                         │
│                                                                     │
│ 10:00  ─ Staff starts working on ticket                             │
│        └─ Status: IN_PROGRESS                                      │
│                                                                     │
│ 11:45  ─ System background job checks                              │
│        └─ Deadline in 15 minutes!                                  │
│        └─ Send warning notification to staff                       │
│                                                                     │
│ 12:00  ─ ⚠️ DEADLINE PASSED                                        │
│        └─ Ticket is now OVERDUE                                    │
│        └─ Appears in "Tickets Quá Hạn" list (🔴)                  │
│        └─ Admin dashboard shows (1) overdue ticket                 │
│                                                                     │
│ 12:05  ─ Admin reviews overdue tickets                              │
│        └─ Clicks on TKT-0001                                       │
│        └─ Sees full details                                        │
│                                                                     │
│ 12:06  ─ Admin clicks "⬆️ Escalate Ngay"                           │
│        └─ PATCH /Ticket/TKT-0001/escalate                          │
│        └─ Button shows "⏳ Đang escalate..."                        │
│                                                                     │
│ 12:06  ─ Backend processes escalation                              │
│        └─ Updates: is_escalated = TRUE                             │
│        └─ Records: escalated_at = 12:06                            │
│        └─ Increments: escalation_count = 1                         │
│        └─ Sets: escalation_reason = "SLA missed"                   │
│        └─ Notifies: Manager/Senior staff                           │
│                                                                     │
│ 12:06  ─ Response received (status: true)                           │
│        └─ Ticket removed from list                                 │
│        └─ Admin sees success feedback                              │
│        └─ Count updates: 5 → 4                                     │
│                                                                     │
│ 12:07  ─ Manager receives notification                              │
│        └─ Can now take over handling                               │
│        └─ May reassign to senior staff                             │
│                                                                     │
│ 14:00  ─ Manager resolves the ticket                                │
│        └─ Status: RESOLVED                                         │
│        └─ Escalation complete ✓                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 State Management

```
useOverdueTickets Hook State:

┌────────────────────────────────────┐
│ overdueTickets: TicketFromApi[]    │
│ ┌──────────────────────────────────┤
│ │ [                                │
│ │   {                              │
│ │     ticketCode: "TKT-0001",      │
│ │     title: "Quạt không...",      │
│ │     status: "IN_PROGRESS",       │
│ │     resolveDeadline: "...",      │
│ │     requesterName: "...",        │
│ │     ...                          │
│ │   },                             │
│ │   {                              │
│ │     ticketCode: "TKT-0002",      │
│ │     ...                          │
│ │   },                             │
│ │   ...                            │
│ │ ]                                │
│ └──────────────────────────────────┤
│                                    │
│ loading: boolean                   │
│ ├─ true: Fetching data             │
│ └─ false: Data loaded or idle      │
│                                    │
│ error: string | null               │
│ ├─ null: No error                  │
│ └─ "Error message": API error      │
│                                    │
│ isEscalating: boolean              │
│ ├─ true: Escalating a ticket       │
│ └─ false: Idle                     │
│                                    │
│ refetch: () => Promise<void>       │
│ └─ Manual refresh function         │
│                                    │
│ escalateTicket: (code) => Promise  │
│ └─ Escalate a specific ticket      │
│                                    │
└────────────────────────────────────┘
```

---

## 🎨 Color Scheme

```
Component         Background      Text            Border
─────────────────────────────────────────────────────────────
Header           bg-red-50        text-red-700    border-red-300
Badge            bg-red-200       text-red-800    ─
Button Normal    bg-red-600       text-white      ─
Button Hover     bg-red-700       text-white      ─
Button Disabled  bg-gray-300      text-gray-500   ─
Error Message    bg-red-100       text-red-700    border-red-300
Success (empty)  bg-green-50      text-green-700  border-green-200
Loading Spinner  ─                text-blue-700   ─
```

---

## 🔄 Auto-Refresh Mechanism

```
Component Mount
│
▼
useEffect(() => {
  // 1. Fetch immediately
  fetchOverdueTickets()
  
  // 2. Set up auto-refresh interval
  const interval = setInterval(
    fetchOverdueTickets,
    5 * 60 * 1000  // 5 minutes
  )
  
  // 3. Cleanup on unmount
  return () => clearInterval(interval)
}, [])  // Empty dependency array = run once on mount

Timeline:
┌─────────────────────────────────────────┐
│ T=0s    ─ Component mounts              │
│         └─ fetchOverdueTickets() call   │
│         └─ Interval timer starts        │
│                                         │
│ T=5m    ─ Auto-refresh triggered        │
│         └─ fetchOverdueTickets() call   │
│                                         │
│ T=10m   ─ Auto-refresh triggered        │
│         └─ fetchOverdueTickets() call   │
│                                         │
│ T=15m   ─ Auto-refresh triggered        │
│         └─ fetchOverdueTickets() call   │
│                                         │
│ ...     ─ Continues every 5 minutes    │
│                                         │
│ Unmount ─ Interval cleared              │
│         └─ Component removed            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📈 API Response Format

```
GET /Ticket/overdue Response:
┌────────────────────────────────────────────┐
│ {                                          │
│   "status": true,                          │
│   "message": "Success",                    │
│   "data": {                                │
│     "pageNumber": 1,                       │
│     "pageSize": 10,                        │
│     "totalCount": 5,                       │
│     "totalPages": 1,                       │
│     "hasPrevious": false,                  │
│     "hasNext": false,                      │
│     "items": [                             │
│       {                                    │
│         "ticketCode": "TKT-0001",          │
│         "title": "Quạt không hoạt động",  │
│         "description": "Chi tiết...",      │
│         "status": "IN_PROGRESS",           │
│         "resolveDeadline": "2025-12...",   │
│         "createdAt": "2025-12...",         │
│         "requesterName": "Nguyễn Văn A",   │
│         "assignedToName": "Bảo trì TT",    │
│         "locationName": "Phòng A201",      │
│         "categoryName": "Cơ sở vật chất"   │
│       },                                   │
│       { ... more tickets ... }             │
│     ]                                      │
│   },                                       │
│   "errors": []                             │
│ }                                          │
└────────────────────────────────────────────┘

PATCH /Ticket/{code}/escalate Response:
┌────────────────────────────────────────────┐
│ {                                          │
│   "status": true,                          │
│   "message": "Ticket escalated success",   │
│   "data": {                                │
│     "ticketCode": "TKT-0001",              │
│     "isEscalated": true,                   │
│     "escalatedAt": "2025-12-14T12:06...",  │
│     "escalationCount": 1,                  │
│     "escalationReason": "SLA missed"       │
│   },                                       │
│   "errors": []                             │
│ }                                          │
└────────────────────────────────────────────┘
```

---

## ✨ Summary

This auto-escalate feature provides a complete, integrated system for:
1. **Monitoring** overdue tickets in real-time
2. **Viewing** full ticket details on demand
3. **Escalating** tickets with one click
4. **Tracking** escalation history in database
5. **Notifying** managers of escalated issues

All with a clean, intuitive UI and robust error handling!

---

**Ready for production deployment!** 🚀
