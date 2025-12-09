import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Ticket } from '../../types';

interface EditTicketPageProps {
  ticket: Ticket;
  onBack: () => void;
  onSubmit: (ticket: Ticket) => void;
}

interface FormData {
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  images: string[];
}

const EditTicketPage = ({ ticket, onBack, onSubmit }: EditTicketPageProps) => {
  // Initialize form data from ticket
  const [formData, setFormData] = useState<FormData>(() => ({
    title: ticket?.title || '',
    description: ticket?.description || '',
    location: ticket?.location || '',
    priority: ticket?.priority || 'medium',
    images: ticket?.images || [],
  }));

  const [imagePreview, setImagePreview] = useState<string[]>(() => ticket?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate ticket exists
  if (!ticket) {
    return (
      <div className="max-w-[900px] mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">Lỗi: Không tìm thấy ticket để chỉnh sửa.</p>
        </div>
        <button 
          className="py-3 px-6 bg-gray-200 text-gray-700 border-none rounded-lg cursor-pointer text-[0.95rem] font-medium transition-all duration-200 hover:bg-gray-300"
          onClick={onBack}
        >
          ← Quay lại
        </button>
      </div>
    );
  }

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
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const updatedTicket: Ticket = {
        ...ticket,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        priority: formData.priority,
        images: formData.images.length > 0 ? formData.images : undefined,
        updatedAt: new Date().toISOString(),
      };

      onSubmit(updatedTicket);
      setIsSubmitting(false);
      alert('Ticket đã được cập nhật thành công! 🎉');
      onBack();
    }, 1000);
  };

  const isFormValid = formData.title.trim() !== '' && formData.description.trim() !== '';

  return (
    <div className="max-w-[900px] mx-auto p-8">
      <button 
        className="py-3 px-6 bg-gray-200 text-gray-700 border-none rounded-lg cursor-pointer text-[0.95rem] font-medium mb-6 transition-all duration-200 hover:bg-gray-300"
        onClick={onBack}
      >
        ← Quay lại
      </button>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="text-5xl">{ticket.issueType?.icon || '📝'}</div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold my-0 mb-2">{ticket.issueType?.name || 'Chỉnh sửa Ticket'}</h2>
          <p className="text-[0.95rem] opacity-90 m-0">{ticket.issueType?.description || 'Cập nhật thông tin ticket của bạn'}</p>
        </div>
      </div>

      <form className="bg-white rounded-xl p-8 shadow-sm border border-gray-200" onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ví dụ: Máy chiếu phòng 501 không hoạt động"
            className="w-full py-3 px-3 text-base border-2 border-gray-200 rounded-lg transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
            required
          />
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
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Ví dụ: Tòa nhà Alpha"
            className="w-full py-3 px-3 text-base border-2 border-gray-200 rounded-lg transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">Mức độ ưu tiên</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full py-3 px-4 text-base border-2 border-gray-200 rounded-lg bg-white cursor-pointer transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
            <option value="urgent">Khẩn cấp</option>
          </select>
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
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTicketPage;

