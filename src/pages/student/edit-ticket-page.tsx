import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Ticket } from '../../types';
import { ticketService } from '../../services/ticketService';
import { campusService, type Campus, type Location } from '../../services/campusService';
import { parseTicketImages } from '../../utils/ticketUtils';

interface EditTicketPageProps {
  ticket: Ticket;
  onBack: () => void;
  onSubmit: (ticket: Ticket) => void;
}

interface FormData {
  description: string;
  images: string[]; // Array of image URLs
}

const EditTicketPage = ({ ticket, onBack, onSubmit }: EditTicketPageProps) => {
  // Parse existing images
  const existingImages = parseTicketImages(ticket);
  
  // Description and images are editable
  const [formData, setFormData] = useState<FormData>(() => ({
    description: ticket?.description || '',
    images: existingImages,
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  // Load campus and location data for display
  useEffect(() => {
    loadCampusAndLocation();
  }, []);

  const loadCampusAndLocation = async () => {
    try {
      const campusData = await campusService.getAllCampuses();
      setCampuses(campusData);
      
      // Find the campus for this ticket to load locations
      if (ticket.location) {
        // Try to find campus from location
        for (const campus of campusData) {
          const locs = await campusService.getLocationsByCampus(campus.campusCode);
          const matchingLocation = locs.find(loc => loc.locationName === ticket.location);
          if (matchingLocation) {
            setLocations(locs);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error loading campus/location data:', error);
    }
  };

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

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      description: value,
    }));
  };

  // Handle new image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const previews: string[] = [];

    fileArray.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" không phải là hình ảnh!`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" quá lớn! Kích thước tối đa là 5MB.`);
        return;
      }

      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === validFiles.length) {
          setNewImageFiles(prev => [...prev, ...validFiles]);
          setNewImagePreviews(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  // Remove existing image
  const handleRemoveExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Remove new image preview
  const handleRemoveNewImage = (index: number) => {
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Get ticketCode from ticket
      const ticketCode = ticket.id || '';
      
      // Prepare imageUrl (combine existing images)
      let finalImageUrl = formData.images.join(',');
      
      // If there are new images, they need to be uploaded first
      if (newImageFiles.length > 0) {
        // TODO: Implement image upload via backend API
        // Backend cần có endpoint để upload images trước
        // const uploadedUrls = await uploadService.uploadMultiple(newImageFiles);
        // finalImageUrl = [...formData.images, ...uploadedUrls].join(',');
        alert('⚠️ Tính năng upload ảnh mới cần backend API hỗ trợ. Hiện tại chỉ có thể xóa ảnh cũ.');
        setIsSubmitting(false);
        return;
      }
      
      // Call API to update ticket (với imageUrl nếu có thay đổi)
      const response = await ticketService.updateTicket(
        ticketCode, 
        formData.description,
        finalImageUrl !== existingImages.join(',') ? finalImageUrl : undefined
      );

      if (response.status) {
        const updatedTicket: Ticket = {
          ...ticket,
          description: formData.description,
          images: formData.images, // Update with edited images
          updatedAt: new Date().toISOString(),
        };

        onSubmit(updatedTicket);
        alert('Ticket đã được cập nhật thành công! 🎉');
        onBack();
      } else {
        setSubmitError(response.message || 'Không thể cập nhật ticket. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Update error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.description.trim() !== '';

  return (
    <div className="max-w-[900px] mx-auto p-8">
      <button 
        className="py-3 px-6 bg-gray-200 text-gray-700 border-none rounded-lg cursor-pointer text-[0.95rem] font-medium mb-6 transition-all duration-200 hover:bg-gray-300"
        onClick={onBack}
      >
        ← Quay lại
      </button>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="text-5xl">📝</div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold my-0 mb-2">Chỉnh sửa Ticket</h2>
          <p className="text-[0.95rem] opacity-90 m-0">Cập nhật thông tin mô tả ticket của bạn</p>
        </div>
      </div>

      <form className="bg-white rounded-xl p-8 shadow-sm border border-gray-200" onSubmit={handleSubmit}>
        
        {/* Title - Read Only */}
        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">
            Tiêu đề
          </label>
          <input
            type="text"
            value={ticket.title}
            disabled
            className="w-full py-3 px-3 text-base border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed box-border"
          />
          <div className="text-[0.85rem] text-gray-500 mt-2">
            Tiêu đề không thể chỉnh sửa
          </div>
        </div>

        {/* Description - Editable */}
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

        {/* Campus - Read Only */}
        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">
            Campus
          </label>
          <input
            type="text"
            value={ticket.campusName || 'N/A'}
            disabled
            className="w-full py-3 px-3 text-base border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed box-border"
          />
          <div className="text-[0.85rem] text-gray-500 mt-2">
            Campus không thể chỉnh sửa
          </div>
        </div>

        {/* Location - Read Only */}
        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">
            Địa điểm
          </label>
          <input
            type="text"
            value={ticket.location || ticket.locationName || 'N/A'}
            disabled
            className="w-full py-3 px-3 text-base border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed box-border"
          />
          <div className="text-[0.85rem] text-gray-500 mt-2">
            Địa điểm không thể chỉnh sửa
          </div>
        </div>

        {/* Phone Number - Read Only */}
        {ticket.contactPhone && (
          <div className="mb-6">
            <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">Số điện thoại</label>
            <input
              type="text"
              value={ticket.contactPhone}
              disabled
              className="w-full py-3 px-3 text-base border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed box-border"
            />
          </div>
        )}

        {/* Images - Editable */}
        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">Hình ảnh</label>
          
          {/* Existing Images */}
          {formData.images.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Hình ảnh hiện tại:</div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
                {formData.images.map((image, index) => (
                  <div key={`existing-${index}`} className="relative rounded-lg overflow-hidden border-2 border-gray-200 aspect-square group">
                    <img 
                      src={image} 
                      alt={`Existing ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Image Previews */}
          {newImagePreviews.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Ảnh mới thêm:</div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
                {newImagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative rounded-lg overflow-hidden border-2 border-green-300 aspect-square group">
                    <img 
                      src={preview} 
                      alt={`New ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Mới
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-4">
            <label className="inline-flex items-center gap-2 py-2 px-4 bg-blue-50 text-blue-600 border-2 border-blue-200 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-blue-100 hover:border-blue-300">
              <span>📷</span>
              <span>Thêm hình ảnh</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <div className="text-[0.85rem] text-gray-500 mt-2">
              Bạn có thể xóa ảnh cũ bằng cách click vào nút ✕ trên ảnh. Thêm ảnh mới bằng nút "Thêm hình ảnh" (tối đa 5MB/ảnh).
            </div>
          </div>
        </div>

        {/* Error message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="text-red-700 font-semibold mb-1">❌ Lỗi</div>
            <div className="text-red-600 text-sm">{submitError}</div>
          </div>
        )}

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
