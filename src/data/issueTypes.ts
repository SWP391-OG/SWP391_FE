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
  }
];







