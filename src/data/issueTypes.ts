import type { IssueType } from '../types';

export const issueTypes: IssueType[] = [
  {
    id: 'facility-broken',
    name: 'Hư hỏng cơ sở vật chất',
    category: 'facility',
    icon: '🔨',
    description: 'Các vấn đề về hư hỏng cơ sở vật chất như bàn ghế, cửa, điều hòa, quạt,...',
    examples: ['Bàn ghế hỏng', 'Cửa không đóng được', 'Điều hòa không hoạt động', 'Quạt hỏng']
  },
  {
    id: 'wifi-issue',
    name: 'Vấn đề WiFi',
    category: 'wifi',
    icon: '📶',
    description: 'Các vấn đề liên quan đến kết nối WiFi',
    examples: ['WiFi không kết nối được', 'WiFi yếu', 'Không thể truy cập internet', 'Tốc độ chậm']
  },
  {
    id: 'equipment-broken',
    name: 'Thiết bị hư hỏng',
    category: 'equipment',
    icon: '💻',
    description: 'Các thiết bị điện tử như máy chiếu, máy tính, loa, micro bị hỏng',
    examples: ['Máy chiếu không hoạt động', 'Loa không có tiếng', 'Micro hỏng', 'Máy tính không khởi động']
  },
  {
    id: 'classroom-dirty',
    name: 'Vệ sinh phòng học',
    category: 'classroom',
    icon: '🧹',
    description: 'Vấn đề về vệ sinh, sạch sẽ trong phòng học',
    examples: ['Phòng không được dọn dẹp', 'Bàn ghế bẩn', 'Nhà vệ sinh không sạch', 'Rác không được dọn']
  },
  {
    id: 'facility-lack',
    name: 'Thiếu cơ sở vật chất',
    category: 'facility',
    icon: '❌',
    description: 'Thiếu các trang thiết bị cần thiết',
    examples: ['Thiếu bàn ghế', 'Không có bảng', 'Thiếu phấn/bút', 'Không có thùng rác']
  },
  {
    id: 'electricity-issue',
    name: 'Vấn đề điện',
    category: 'facility',
    icon: '⚡',
    description: 'Các vấn đề về điện, ổ cắm, đèn chiếu sáng',
    examples: ['Mất điện', 'Ổ cắm không hoạt động', 'Đèn không sáng', 'Đèn hỏng']
  },
  {
    id: 'water-issue',
    name: 'Vấn đề nước',
    category: 'facility',
    icon: '💧',
    description: 'Các vấn đề về nước, vòi nước, nhà vệ sinh',
    examples: ['Vòi nước hỏng', 'Không có nước', 'Nhà vệ sinh tắc', 'Rò rỉ nước']
  },
  {
    id: 'other',
    name: 'Vấn đề khác',
    category: 'other',
    icon: '📝',
    description: 'Các vấn đề khác không nằm trong danh mục trên',
    examples: ['Tiếng ồn', 'Mùi hôi', 'Vấn đề an ninh', 'Khác']
  }
];



