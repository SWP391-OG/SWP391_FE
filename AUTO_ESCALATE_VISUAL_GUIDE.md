# 🔄 AUTO ESCALATE - VISUAL FLOW & TIMELINE

---

## 📊 TICKET LIFECYCLE WITH AUTO ESCALATE

```
┌─────────────────────────────────────────────────────────────────────┐
│ TICKET LIFECYCLE                                                    │
└─────────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━┓
┃ STEP 1: CREATE  ┃
┗━━━━━━━━━━━━━━━━━┛
   Student tạo ticket lúc 10:00
   ├─ Category: WiFi (SLA = 1 hour)
   ├─ Title: "WiFi P101 không kết nối"
   ├─ Priority: (không có)
   ├─ Status: OPEN ← 🔵
   └─ Deadline: 11:00 (60 phút)

          ↓ [Admin assign sau 2 phút]

┏━━━━━━━━━━━━━━━━━┓
┃ STEP 2: ASSIGN  ┃
┗━━━━━━━━━━━━━━━━━┛
   10:02 - Admin giao cho IT Staff
   ├─ Status: ASSIGNED ← 🟣
   ├─ AssignedTo: staff@example.com
   ├─ Deadline: Vẫn 11:00 (58 phút còn)
   └─ Notification: "Bạn có ticket mới"

          ↓ [Staff start ngay]

┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 3: IN_PROGRESS    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━┛
   10:03 - Staff start làm việc
   ├─ Status: IN_PROGRESS ← 🟡
   ├─ TimeLeft: 57 phút
   └─ Staff đang troubleshoot...

          ↓ [Thời gian trôi qua...]

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ⚠️ WARNING THRESHOLD (10:45)  ┃
┃ 15 phút còn lại              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   Background service check #7 (mỗi 5 phút)
   ├─ Ticket ID: TKT-0001
   ├─ Status: IN_PROGRESS
   ├─ TimeLeft: 15 phút
   ├─ Trigger: YES (< 15 minutes)
   └─ Action: Send WARNING to Staff
      
      📧 Notification: "⚠️ SLA Warning"
      Message: "Ticket TKT-0001 còn ~15 phút"
      UI: Show yellow badge "Còn 15 phút"
      
      Staff react: "Oh! Cần nhanh hơn"

          ↓ [Staff still working... đến 10:50]

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔴 CRITICAL WARNING (10:50)  ┃
┃ 10 phút còn lại             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   Background service check #8
   ├─ Ticket ID: TKT-0001
   ├─ TimeLeft: 10 phút
   ├─ Trigger: YES (< 15 minutes, more urgent)
   └─ Action: Send URGENT to Staff
      
      📧 Notification: "🔴 CRITICAL"
      Message: "Ticket TKT-0001 còn 10 phút!"
      UI: Show red badge "⏰ 10 phút"
      
      Staff: "Phải xong trong 10 phút!"

          ↓ [Staff trying hard... đến 11:05]

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🚨 AUTO ESCALATE! (11:05)       ┃
┃ ĐÃ QUÁ HẠN 5 PHÚT               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   Background service check #9 (11:05 AM)
   
   Condition check:
   ├─ Status: IN_PROGRESS ✓
   ├─ Deadline: 11:00 ✓
   ├─ Now: 11:05 ✓
   ├─ Already escalated? NO ✓
   └─ PASS → Escalate!
   
   Action: AUTO ESCALATE
   ├─ Status: IN_PROGRESS → ESCALATED ← 🔴
   ├─ ManagedBy: staff@example.com → admin@example.com
   ├─ EscalatedAt: 2025-12-14 11:05:00 UTC
   ├─ EscalationReason: "Auto-escalated: SLA deadline missed"
   ├─ EscalationCount: 1
   └─ DB Update: ✅ Saved
   
   Notification:
   ├─ To: admin@example.com
   ├─ Title: "🚨 ESCALATED - SLA MISS"
   ├─ Message: "Ticket TKT-0001 - WiFi P101 không kết nối"
   ├─ TimeOverdue: "5 phút"
   ├─ Priority: URGENT
   └─ Action: "Xem chi tiết"
   
   Admin UI:
   ├─ Dashboard stats: Escalated: 1 (highlight 🔴)
   ├─ Ticket badge: "🔴 ESCALATED"
   ├─ Assigned to: Admin now
   └─ Note: "Auto-escalated at 11:05 by system"

          ↓ [Admin jump on it]

┏━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 4: RESOLVED (11:15)  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛
   Admin found the issue & fixed it
   ├─ Status: ESCALATED → RESOLVED ← 🟢
   ├─ ResolvedAt: 2025-12-14 11:15:00 UTC
   ├─ TimeOverdue: 15 phút (nhưng IT resolved it)
   ├─ ResolutionNotes: "Fixed WiFi AP P101 restart"
   └─ Notification: Student được notify
   
   Audit log:
   ├─ [10:00] OPEN - Created by student
   ├─ [10:02] ASSIGNED - Assigned to staff
   ├─ [10:03] IN_PROGRESS - Staff started
   ├─ [11:05] ESCALATED - Auto-escalated by system
   └─ [11:15] RESOLVED - Fixed by admin

          ↓ [Student review & feedback]

┏━━━━━━━━━━━━━━━━━┓
┃ STEP 5: FEEDBACK ┃
┗━━━━━━━━━━━━━━━━━┛
   Student see ticket resolved
   ├─ Status: RESOLVED
   ├─ Feedback Form: Available
   ├─ Student rate: ⭐⭐⭐ (3/5)
   ├─ Comment: "Took a bit long but fixed it"
   └─ Submit → API save
   
   Staff Analytics:
   ├─ Rating: 3/5 ⬇️
   ├─ Note: "Escalated due to SLA miss"
   └─ This feedback counts in quarterly review

          ↓ [Auto close after 7 days]

┏━━━━━━━━━━━━━━┓
┃ STEP 6: CLOSED ┃
┗━━━━━━━━━━━━━━┛
   Status: CLOSED ← ⚫
   ├─ ClosedAt: 2025-12-21 11:15:00 UTC
   ├─ TotalTimeToResolve: 75 phút (SLA miss by 15 phút)
   ├─ FinalRating: 3/5
   └─ SLA Compliance: MISS ❌
```

---

## 🎯 KEY METRICS FOR AUTO ESCALATE

```
DASHBOARD - SLA COMPLIANCE
┌──────────────────────────────────────────────┐
│ Total Tickets: 150                          │
│                                              │
│ ✅ On-time (SLA met): 125 (83%)             │
│ ⚠️  Warning (< 15 min): 18 (12%)            │
│ 🔴 Escalated (SLA miss): 7 (5%)             │
│                                              │
│ Escalation Details:                         │
│ ├─ WiFi tickets: 3 escalations             │
│ ├─ Equipment: 2 escalations                │
│ ├─ Facility: 2 escalations                 │
│                                              │
│ By Staff:                                   │
│ ├─ Staff A: 2 escalations (avg rating 2.5) │
│ ├─ Staff B: 3 escalations (avg rating 3.2) │
│ ├─ Staff C: 2 escalations (avg rating 4.8) │
│                                              │
│ Avg time to fix escalated: 45 min (vs 30 min target)
└──────────────────────────────────────────────┘
```

---

## 📱 UI INDICATORS

```
BEFORE ESCALATE
┌────────────────────────────────┐
│ 🎫 TKT-0001                    │
│ WiFi P101 không kết nối         │
│ Status: 🟡 Đang xử lý          │
│ SLA: ⏰ 15 phút (⚠️ cảnh báo)  │
│ Assigned: IT Staff             │
└────────────────────────────────┘

AFTER ESCALATE
┌────────────────────────────────┐
│ 🎫 TKT-0001                    │
│ WiFi P101 không kết nối         │
│ Status: 🔴 ESCALATED           │◄─ New status!
│ SLA: ❌ Quá hạn 5 phút         │
│ Assigned: Admin                │◄─ Reassigned!
│ EscalatedAt: 11:05 AM          │
│ EscalationReason: SLA miss     │
└────────────────────────────────┘
```

---

## ⏱️ TIMELINE EXAMPLE

```
│ Minute │ Event                           │ Status        │ SLA       │
├────────┼─────────────────────────────────┼───────────────┼───────────┤
│ 0      │ Ticket created                  │ OPEN 🔵       │ 60 min    │
│ +2     │ Admin assigns                   │ ASSIGNED 🟣   │ 58 min    │
│ +3     │ Staff starts                    │ IN_PROGRESS 🟡│ 57 min    │
│ +30    │ Staff still working             │ IN_PROGRESS 🟡│ 30 min    │
│ +40    │ Staff still working             │ IN_PROGRESS 🟡│ 20 min    │
│ +45    │ ⚠️ WARNING notification         │ IN_PROGRESS 🟡│ 15 min    │
│ +50    │ 🔴 CRITICAL notification       │ IN_PROGRESS 🟡│ 10 min    │
│ +55    │ 🚨 CRITICAL notification       │ IN_PROGRESS 🟡│ 5 min     │
│ +60    │ ❌ DEADLINE MISSED!             │ IN_PROGRESS 🟡│ 0 min     │
│ +65    │ 🚨 AUTO ESCALATE!              │ ESCALATED 🔴  │ -5 min    │
│        │   - Status changed              │               │           │
│        │   - Reassigned to Admin         │               │           │
│        │   - Urgent notification sent    │               │           │
│ +75    │ Admin fix the issue             │ RESOLVED 🟢   │ -15 min   │
│ +80    │ Student rates feedback          │ RESOLVED 🟢   │ -15 min   │
│ +1440+ │ Auto close after 7 days         │ CLOSED ⚫      │ MISSED    │
└────────┴─────────────────────────────────┴───────────────┴───────────┘
```

---

## 🔔 NOTIFICATION EXAMPLES

### Warning Notification (15 min left)
```
┌─────────────────────────────────┐
│ ⚠️  SLA WARNING                  │
├─────────────────────────────────┤
│ Ticket: TKT-0001                │
│ Title: WiFi P101 không kết nối  │
│ Time Left: ~15 phút              │
│ Status: Đang xử lý              │
│                                 │
│ [View Details] [Escalate Now]   │
└─────────────────────────────────┘
```

### Escalation Notification (Auto escalated)
```
┌──────────────────────────────────┐
│ 🚨 TICKET ESCALATED              │
├──────────────────────────────────┤
│ Ticket: TKT-0001                 │
│ Title: WiFi P101 không kết nối   │
│ Reason: SLA deadline missed      │
│ Time Overdue: 5 phút              │
│ Previous Staff: staff@example.com │
│ New Owner: YOU (Admin)            │
│                                  │
│ [Take Action] [View Details]     │
└──────────────────────────────────┘
```

---

## 🎯 BUSINESS IMPACT

### Without Auto Escalate
```
Ticket missed SLA
  └─ No one notices
      └─ Customer satisfaction ⬇️
          └─ Complaint email
              └─ Manager review next week
```

### With Auto Escalate
```
Ticket approaching SLA
  └─ Staff get warning → Work faster
      └─ Still miss? → Auto escalate
          └─ Admin handle immediately
              └─ Usually get it done
                  └─ Customer happy ✅
```

---

## 📊 BENEFITS

1. **Real-time Alert**: Staff không miss deadline vì không chú ý
2. **Escalation Automation**: Không cần manual intervention
3. **Accountability**: Audit trail who handled & when
4. **Metrics**: Track SLA compliance per staff/category
5. **Improvement**: Data-driven decisions on capacity
