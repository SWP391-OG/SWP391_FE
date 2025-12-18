import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Category, Ticket } from '../../types';
import { ticketService } from '../../services/ticketService';
import { imageUploadService } from '../../services/imageUploadService';
import { campusService, type Campus, type Location } from '../../services/campusService';

interface CreateTicketPageProps {
  category?: Category;
  onBack: () => void;
  onSubmit: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'slaDeadline'>) => void;
}

interface FormData {
  title: string;
  description: string;
  campusCode: string;
  locationCode: string;
  phoneNumber: string;
  imageFiles: File[];
}

const CreateTicketPage = ({ category, onBack, onSubmit }: CreateTicketPageProps) => {
  const defaultCategory: Category = {
    id: 'default',
    categoryCode: 'default',
    categoryName: 'Vấn đề chung',
    departmentId: 0,
    slaResolveHours: 24,
    status: 'ACTIVE'
  };

  const currentCategory = category || defaultCategory;

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: currentCategory?.categoryName || 'Vấn đề chung',
    description: '',
    campusCode: '',
    locationCode: '',
    phoneNumber: '',
    imageFiles: [],
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateTicket, setDuplicateTicket] = useState<Ticket | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadCampuses();
  }, []);

  useEffect(() => {
    if (formData.campusCode) {
      loadLocations(formData.campusCode);
    } else {
      setLocations([]);
      setFormData(prev => ({ ...prev, locationCode: '' }));
    }
  }, [formData.campusCode]);

  const loadCampuses = async () => {
    try {
      setIsLoadingCampuses(true);
      const data = await campusService.getAllCampuses();
      setCampuses(data);
    } catch (error) {
      console.error('Error loading campuses:', error);
      setSubmitError('Không thể tải danh sách campus. Vui lòng thử lại.');
    } finally {
      setIsLoadingCampuses(false);
    }
  };

  const loadLocations = async (campusCode: string) => {
    try {
      setIsLoadingLocations(true);
      const data = await campusService.getLocationsByCampus(campusCode);
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
      setSubmitError('Không thể tải danh sách địa điểm. Vui lòng thử lại.');
    } finally {
      setIsLoadingLocations(false);
    }
  };

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

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          newPreviews.push(result);
          
          if (newPreviews.length === newFiles.length) {
            setFormData((prev) => ({
              ...prev,
              imageFiles: [...prev.imageFiles, ...newFiles],
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
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    proceedWithSubmit();
  };

  const proceedWithSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let imageUrl = '';
      if (formData.imageFiles.length > 0) {
        try {
          imageUrl = await imageUploadService.uploadMultiple(formData.imageFiles);
        } catch (error) {
          console.error('Image upload error:', error);
          setSubmitError('Không thể upload ảnh. Vui lòng thử lại.');
          setIsSubmitting(false);
          return;
        }
      }

      const locationCode = formData.locationCode || '';

      const response = await ticketService.createTicket({
        title: formData.title,
        description: formData.description,
        imageUrl: imageUrl,
        locationCode: locationCode,
        categoryCode: currentCategory.categoryCode,
      });

      if (response.status) {
        setSubmitSuccess(true);
        
        const selectedCampus = campuses.find(c => c.campusCode === formData.campusCode);
        const campusName = selectedCampus?.campusName || '';
        
        const ticket: Omit<Ticket, 'id' | 'createdAt' | 'slaDeadline'> = {
          title: response.data.title,
          description: response.data.description,
          status: 'open',
          locationName: response.data.locationName,
          location: response.data.locationName,
          campusName: campusName,
          resolveDeadline: response.data.resolveDeadline,
          images: response.data.imageUrl ? response.data.imageUrl.split(',') : undefined,
          createdBy: response.data.requesterCode,
          updatedAt: response.data.createdAt,
          slaTracking: {
            createdAt: response.data.createdAt,
            deadline: response.data.resolveDeadline,
            isOverdue: false,
            timeline: [{
              id: `event-${Date.now()}`,
              timestamp: response.data.createdAt,
              status: 'open',
              actor: response.data.requesterCode,
              actorRole: 'student',
              action: 'Ticket created',
            }],
          },
        };
        onSubmit(ticket);
      } else {
        setSubmitError(response.message || 'Không thể tạo ticket. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnyway = () => {
    setShowDuplicateModal(false);
    setDuplicateTicket(null);
    proceedWithSubmit();
  };

  const isFormValid = 
    (formData.title?.trim() ?? '') !== '' &&
    (formData.description?.trim() ?? '') !== '' &&
    (formData.campusCode?.trim() ?? '') !== '' &&
    (formData.locationCode?.trim() ?? '') !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8">
      <div className="max-w-[900px] mx-auto px-8">
        <button 
          className="py-3 px-6 bg-white text-blue-600 border-2 border-blue-200 rounded-lg cursor-pointer text-[0.95rem] font-semibold mb-6 transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md"
          onClick={onBack}
        >
          ← Quay lại chọn loại vấn đề
        </button>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-8 flex items-center gap-4 shadow-lg">
          <div className="text-5xl">📝</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold my-0 mb-1">{currentCategory.categoryName}</h2>
            <p className="text-blue-100 text-sm m-0">Thời gian xử lý: {currentCategory.slaResolveHours}h</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
          <div className="mb-6">
            <label className="block text-[0.95rem] font-bold text-gray-800 mb-3">
              Mô tả chi tiết <span className="text-blue-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
              className="w-full py-3 px-4 text-base border-2 border-blue-200 rounded-lg transition-all duration-200 min-h-[120px] resize-y font-[inherit] box-border focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />
            <div className="text-[0.85rem] text-blue-600 mt-2 flex items-center gap-1">
              <span>💡</span>
              <span>Vui lòng mô tả chi tiết để chúng tôi có thể hỗ trợ bạn tốt hơn</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[0.95rem] font-bold text-gray-800 mb-3">
              Campus <span className="text-blue-500">*</span>
            </label>
            <select
              name="campusCode"
              value={formData.campusCode}
              onChange={handleInputChange}
              className="w-full py-3 px-4 text-base border-2 border-blue-200 rounded-lg bg-white cursor-pointer transition-all duration-200 box-border focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
              disabled={isLoadingCampuses}
            >
              <option value="">-- Chọn campus --</option>
              {campuses.map((campus) => (
                <option key={campus.campusCode} value={campus.campusCode}>
                  {campus.campusName}
                </option>
              ))}
            </select>
            <div className="text-[0.85rem] text-blue-600 mt-2">
              {isLoadingCampuses ? '⏳ Đang tải...' : '📍 Chọn campus nơi xảy ra sự cố'}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[0.95rem] font-bold text-gray-800 mb-3">
              Địa điểm <span className="text-blue-500">*</span>
            </label>
            <select
              name="locationCode"
              value={formData.locationCode}
              onChange={handleInputChange}
              className="w-full py-3 px-4 text-base border-2 border-blue-200 rounded-lg bg-white cursor-pointer transition-all duration-200 box-border focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
              disabled={!formData.campusCode || isLoadingLocations}
            >
              <option value="">-- Chọn địa điểm --</option>
              {locations.map((location) => (
                <option key={location.locationCode} value={location.locationCode}>
                  {location.locationName}
                </option>
              ))}
            </select>
            <div className="text-[0.85rem] text-blue-600 mt-2">
              {!formData.campusCode 
                ? '⚠️ Vui lòng chọn campus trước' 
                : isLoadingLocations 
                ? '⏳ Đang tải địa điểm...' 
                : '🏢 Chọn địa điểm cụ thể xảy ra sự cố'}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[0.95rem] font-bold text-gray-800 mb-3">
              Hình ảnh <span className="text-gray-400 font-normal">(Tùy chọn)</span>
            </label>
            <div
              className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer transition-all duration-200 bg-blue-50/50 hover:border-blue-500 hover:bg-blue-100/50"
              onClick={() => document.getElementById('imageUpload')?.click()}
            >
              <div className="text-5xl mb-4">📸</div>
              <div className="text-blue-700 text-[0.95rem] mb-2 font-semibold">Nhấp để tải lên hình ảnh</div>
              <div className="text-blue-600 text-[0.85rem]">PNG, JPG, GIF tối đa 5MB mỗi ảnh</div>
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
                  <div key={index} className="relative rounded-lg overflow-hidden border-2 border-blue-200 aspect-square shadow-md hover:shadow-lg transition-shadow">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-blue-500 text-white border-none rounded-full w-8 h-8 cursor-pointer text-lg flex items-center justify-center font-bold transition-all duration-200 hover:bg-blue-600 hover:scale-110 shadow-lg"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg shadow-sm">
              <div className="text-red-700 font-bold mb-1">❌ Lỗi</div>
              <div className="text-red-600 text-sm">{submitError}</div>
            </div>
          )}

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg shadow-sm">
              <div className="text-green-700 font-bold mb-1">✅ Thành công</div>
              <div className="text-green-600 text-sm">Ticket đã được tạo thành công!</div>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              className="py-4 px-8 bg-gray-100 text-gray-700 border-2 border-gray-200 rounded-lg cursor-pointer text-base font-bold transition-all duration-200 hover:bg-gray-200 hover:border-gray-300"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`flex-1 py-4 px-8 text-white border-none rounded-lg cursor-pointer text-base font-bold transition-all duration-200 shadow-lg ${
                !isFormValid || isSubmitting
                  ? 'opacity-60 cursor-not-allowed bg-blue-300'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:-translate-y-1'
              }`}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? '⏳ Đang gửi...' : '📨 Gửi Ticket'}
            </button>
          </div>
        </div>

        {showDuplicateModal && duplicateTicket && (
          <div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
            onClick={() => setShowDuplicateModal(false)}
          >
            <div
              className="bg-white rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b-2 border-blue-100">
                <h3 className="m-0 text-xl text-gray-900 font-bold">⚠️ Phát hiện Ticket tương tự</h3>
              </div>
              <div className="p-6">
                <p className="mb-4 text-gray-700">
                  Chúng tôi phát hiện một ticket tương tự đã được tạo trước đó. Bạn có muốn xem ticket đó không?
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mb-4 border-2 border-blue-200">
                  <div className="font-bold text-gray-900 mb-2">{duplicateTicket.title}</div>
                  <div className="text-sm text-gray-700">
                    Trạng thái: <span className="font-bold text-blue-600">
                      {duplicateTicket.status === 'open' ? 'Mở' :
                       duplicateTicket.status === 'assigned' ? 'Đã giao việc' :
                       duplicateTicket.status === 'in-progress' ? 'Đang xử lý' :
                       duplicateTicket.status === 'resolved' ? 'chờ đánh giá' :
                       duplicateTicket.status === 'closed' ? 'Đã hoàn thành' : duplicateTicket.status}
                    </span>
                  </div>
                  {duplicateTicket.location && (
                    <div className="text-sm text-gray-700 mt-1">Địa điểm: {duplicateTicket.location}</div>
                  )}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDuplicateModal(false)}
                    className="bg-gray-100 text-gray-700 border-2 border-gray-200 py-3 px-6 rounded-lg font-bold cursor-pointer hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDuplicateModal(false)}
                    className="bg-blue-500 text-white border-none py-3 px-6 rounded-lg font-bold cursor-pointer hover:bg-blue-600"
                  >
                    Xem Ticket
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAnyway}
                    className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none py-3 px-6 rounded-lg font-bold cursor-pointer hover:from-blue-700 hover:to-blue-800"
                  >
                    Vẫn tạo mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTicketPage;