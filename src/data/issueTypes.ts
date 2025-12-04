import type { IssueType } from '../types';

export const issueTypes: IssueType[] = [
  {
    id: 'facility-issue',
    name: 'Lỗi cơ sở vật chất',
    category: 'facility',
    icon: '🏢',
    description: 'Các vấn đề về cơ sở vật chất như bàn ghế, cửa, điều hòa, quạt, thiếu trang thiết bị,...',
    examples: ['Bàn ghế hỏng', 'Cửa không đóng được', 'Điều hòa không hoạt động', 'Thiếu bàn ghế']
  },
  {
    id: 'wifi-issue',
    name: 'Lỗi WiFi',
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
    id: 'facility-broken',
    name: 'Hư hỏng thiết bị',
    category: 'facility',
    icon: '🔨',
    description: 'Các vấn đề về các thiết bị trong lớp học như máy chiếu, dây cắm, bảng trắng,...',
    examples: ['Máy chiếu, dây cắm, bảng trắng hỏng']
  }
];








