import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Ticket } from '../../types';
import { ticketService } from '../../services/ticketService';
import { campusService, type Campus, type Location } from '../../services/campusService';

interface EditTicketPageProps {
  ticket: Ticket;
  onBack: () => void;
  onSubmit: (ticket: Ticket) => void;
}

interface FormData {
  description: string;
}

const EditTicketPage = ({ ticket, onBack, onSubmit }: EditTicketPageProps) => {
  // Only description is editable
  const [formData, setFormData] = useState<FormData>(() => ({
    description: ticket?.description || '',
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

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
    setFormData({
      description: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Get ticketCode from ticket
      const ticketCode = ticket.id || '';
      
      // Call API to update ticket
      const response = await ticketService.updateTicket(ticketCode, formData.description);

      if (response.status) {
        const updatedTicket: Ticket = {
          ...ticket,
          description: formData.description,
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

        {/* Images - Read Only Display */}
        {ticket.images && ticket.images.length > 0 && (
          <div className="mb-6">
            <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">Hình ảnh</label>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
              {ticket.images.map((image, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden border-2 border-gray-200 aspect-square">
                  <img src={image} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-[0.85rem] text-gray-500 mt-2">
              Hình ảnh không thể chỉnh sửa
            </div>
          </div>
        )}

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
