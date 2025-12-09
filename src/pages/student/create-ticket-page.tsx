import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { IssueType, Ticket } from '../../types';
import { checkDuplicateTicket } from '../../utils/ticketUtils';
import { useLocations } from '../../hooks/useLocations';

interface CreateTicketPageProps {
  issueType: IssueType;
  onBack: () => void;
  onSubmit: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'slaDeadline'>) => void;
  existingTickets?: Ticket[]; // Tickets hiện có để kiểm tra duplicate
}

interface FormData {
  title: string;
  description: string;
  location: string;
  phoneNumber: string;
  images: string[];
}

const CreateTicketPage = ({ issueType, onBack, onSubmit, existingTickets = [] }: CreateTicketPageProps) => {
  // Load locations
  const { locations } = useLocations();

  // Get issue examples for dropdown
  const issueExamples = issueType.examples || [];

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    phoneNumber: '',
    images: [],
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateTicket, setDuplicateTicket] = useState<Ticket | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          newImages.push(result);
          newPreviews.push(result);
          
          if (newImages.length === files.length) {
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, ...newImages],
            }));
            setImagePreview((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra duplicate ticket
    const duplicate = checkDuplicateTicket(
      {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        roomNumber: '', // TODO: Add roomNumber field if needed
        issueType: issueType,
      },
      existingTickets
    );

    if (duplicate) {
      setDuplicateTicket(duplicate);
      setShowDuplicateModal(true);
      return;
    }

    // Nếu không có duplicate, tiếp tục submit
    proceedWithSubmit();
  };

  const proceedWithSubmit = () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const now = new Date();
      const finalTitle = formData.title === 'custom' ? customTitle : formData.title;
      const ticket: Omit<Ticket, 'id' | 'createdAt' | 'slaDeadline'> = {
        title: finalTitle,
        description: formData.description,
        issueType: issueType,
        category: issueType.category,
        status: 'open',
        location: formData.location,
        phoneNumber: formData.phoneNumber,
        images: formData.images.length > 0 ? formData.images : undefined,
        createdBy: 'current-user-id', // This should come from auth context
        updatedAt: now.toISOString(),
        slaTracking: {
          createdAt: now.toISOString(),
          deadline: '', // Will be set by service
          isOverdue: false,
          timeline: [{
            id: `event-${Date.now()}`,
            timestamp: now.toISOString(),
            status: 'open',
            actor: 'current-user-id',
            actorRole: 'student',
            action: 'Ticket created',
          }],
        },
      };

      onSubmit(ticket);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleCreateAnyway = () => {
    setShowDuplicateModal(false);
    setDuplicateTicket(null);
    proceedWithSubmit();
  };



  const isFormValid = 
    (formData.title.trim() !== '' && formData.title !== 'custom') ||
    (formData.title === 'custom' && customTitle.trim() !== '') &&
    formData.description.trim() !== '';

  return (
    <div className="max-w-[900px] mx-auto p-8">
      <button 
        className="py-3 px-6 bg-gray-200 text-gray-700 border-none rounded-lg cursor-pointer text-[0.95rem] font-medium mb-6 transition-all duration-200 hover:bg-gray-300"
        onClick={onBack}
      >
        ← Quay lại chọn loại vấn đề
      </button>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="text-5xl">{issueType.icon}</div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold my-0 mb-2">{issueType.name}</h2>
          <p className="text-[0.95rem] opacity-90 m-0">{issueType.description}</p>
        </div>
      </div>

      <form className="bg-white rounded-xl p-8 shadow-sm border border-gray-200" onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <select
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full py-3 px-4 text-base border-2 border-gray-200 rounded-lg bg-white cursor-pointer transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
            required
          >
            <option value="">-- Chọn loại lỗi --</option>
            {issueExamples.map((example, index) => (
              <option key={index} value={example}>
                {example}
              </option>
            ))}
            <option value="custom">Khác (nhập tùy chỉnh)</option>
          </select>
          
          {formData.title === 'custom' && (
            <input
              type="text"
              name="customTitle"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Nhập tiêu đề tùy chỉnh"
              className="w-full py-3 px-3 text-base border-2 border-gray-200 rounded-lg transition-all duration-200 box-border mt-2 focus:outline-none focus:border-blue-500"
              required
            />
          )}
        </div>

        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">
            Mô tả chi tiết <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
            className="w-full py-3 px-3 text-base border-2 border-gray-200 rounded-lg transition-all duration-200 min-h-[120px] resize-y font-[inherit] box-border focus:outline-none focus:border-blue-500"
            required
          />
          <div className="text-[0.85rem] text-gray-500 mt-2">
            Vui lòng mô tả chi tiết để chúng tôi có thể hỗ trợ bạn tốt hơn
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">Địa điểm</label>
          <select
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full py-3 px-4 text-base border-2 border-gray-200 rounded-lg bg-white cursor-pointer transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Chọn địa điểm --</option>
            {locations.map((location) => (
              <option key={location.id} value={location.name}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">Số điện thoại</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="Ví dụ: 0912345678"
            className="w-full py-3 px-3 text-base border-2 border-gray-200 rounded-lg transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">Hình ảnh (Tùy chọn)</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all duration-200 bg-gray-50 hover:border-blue-500 hover:bg-blue-50"
            onClick={() => document.getElementById('imageUpload')?.click()}
          >
            <div className="text-5xl mb-4">📸</div>
            <div className="text-gray-500 text-[0.95rem] mb-2">Nhấp để tải lên hình ảnh</div>
            <div className="text-gray-400 text-[0.85rem]">PNG, JPG, GIF tối đa 5MB mỗi ảnh</div>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {imagePreview.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 mt-4">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden border-2 border-gray-200 aspect-square">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500/90 text-white border-none rounded-full w-7 h-7 cursor-pointer text-base flex items-center justify-center font-bold transition-all duration-200 hover:bg-red-600 hover:scale-110"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            className="py-4 px-8 bg-gray-100 text-gray-700 border-none rounded-lg cursor-pointer text-base font-semibold transition-all duration-200 hover:bg-gray-200"
            onClick={onBack}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={`flex-1 py-4 px-8 text-white border-none rounded-lg cursor-pointer text-base font-semibold transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,0.3)] ${
              !isFormValid || isSubmitting
                ? 'opacity-60 cursor-not-allowed bg-blue-400'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:translate-y-[-2px] hover:shadow-[0_4px_8px_rgba(59,130,246,0.4)]'
            }`}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi Ticket'}
          </button>
        </div>
      </form>

      {/* Duplicate Ticket Warning Modal */}
      {showDuplicateModal && duplicateTicket && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowDuplicateModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937', fontWeight: 600 }}>
                ⚠️ Phát hiện Ticket tương tự
              </h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
                Chúng tôi phát hiện một ticket tương tự đã được tạo trước đó. Bạn có muốn xem ticket đó không?
              </p>
              <div style={{
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>
                  {duplicateTicket.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Trạng thái: <span style={{ fontWeight: 600 }}>
                    {duplicateTicket.status === 'open' ? 'Mở' :
                     duplicateTicket.status === 'acknowledged' ? 'Đã xác nhận' :
                     duplicateTicket.status === 'in-progress' ? 'Đang xử lý' :
                     duplicateTicket.status === 'resolved' ? 'Đã giải quyết' :
                     duplicateTicket.status === 'closed' ? 'Đã đóng' : duplicateTicket.status}
                  </span>
                </div>
                {duplicateTicket.location && (
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Địa điểm: {duplicateTicket.location}
                  </div>
                )}
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
              }}>
                <button
                  type="button"
                  onClick={() => setShowDuplicateModal(false)}
                  style={{
                    background: '#f3f4f6',
                    color: '#4b5563',
                    border: '1px solid #d1d5db',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDuplicateModal(false);
                    // TODO: Navigate to ticket detail or open modal
                  }}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Xem Ticket
                </button>
                <button
                  type="button"
                  onClick={handleCreateAnyway}
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Vẫn tạo mới
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTicketPage;