import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Category, Ticket, UserProfileDto } from '../../types';
import { ticketService } from '../../services/ticketService';
import { imageUploadService } from '../../services/imageUploadService';
import { campusService, type Campus, type Location } from '../../services/campusService';
import { userService } from '../../services/userService';

interface CreateTicketPageProps {
  category?: Category; // Optional - will use default if not provided
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
  // Fallback if category is not provided
  const defaultCategory: Category = {
    categoryCode: 'default',
    categoryName: 'Vấn đề chung',
    departmentId: 0,
    slaResolveHours: 24,
    status: 'ACTIVE'
  };

  const currentCategory = category || defaultCategory;

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Campus and Location states
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: currentCategory?.categoryName || 'Vấn đề chung', // Auto-populate with category name
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

  // Load user profile and campuses on mount
  useEffect(() => {
    loadUserProfile();
    loadCampuses();
  }, []);

  // Auto-fill phone number when profile is loaded
  useEffect(() => {
    if (userProfile?.phoneNumber) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: userProfile.phoneNumber || '',
      }));
    }
  }, [userProfile]);

  // Load locations when campus changes
  useEffect(() => {
    if (formData.campusCode) {
      loadLocations(formData.campusCode);
    } else {
      setLocations([]);
      setFormData(prev => ({ ...prev, locationCode: '' }));
    }
  }, [formData.campusCode]);

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const profile = await userService.getProfile();
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

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
    
    // Kiểm tra duplicate ticket (optional - có thể comment nếu không dùng)
    // const duplicate = checkDuplicateTicket(
    //   {
    //     title: formData.title,
    //     description: formData.description,
    //     location: formData.locationCode,
    //     roomNumber: '',
    //     issueType: currentCategory,
    //   },
    //   existingTickets
    // );

    // if (duplicate) {
    //   setDuplicateTicket(duplicate);
    //   setShowDuplicateModal(true);
    //   return;
    // }

    // Nếu không có duplicate, tiếp tục submit
    proceedWithSubmit();
  };

  const proceedWithSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Upload images to Cloudinary if any
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

      // 2. Get location code from selected location
      const locationCode = formData.locationCode || '';

      // 3. Create ticket via API
      const response = await ticketService.createTicket({
        title: formData.title,
        description: formData.description,
        imageUrl: imageUrl,
        locationCode: locationCode,
        categoryCode: currentCategory.categoryCode, // Use category code
      });

      if (response.status) {
        setSubmitSuccess(true);
        
        // Extract campus name from selected campus
        const selectedCampus = campuses.find(c => c.campusCode === formData.campusCode);
        const campusName = selectedCampus?.campusName || '';
        
        // Create a ticket object for the onSubmit callback
        const ticket: Omit<Ticket, 'id' | 'createdAt' | 'slaDeadline'> = {
          title: response.data.title,
          description: response.data.description,
          status: 'open',
          locationName: response.data.locationName,
          location: response.data.locationName, // For backward compatibility
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
    <div className="max-w-[900px] mx-auto p-8">
      <button 
        className="py-3 px-6 bg-gray-200 text-gray-700 border-none rounded-lg cursor-pointer text-[0.95rem] font-medium mb-6 transition-all duration-200 hover:bg-gray-300"
        onClick={onBack}
      >
        ← Quay lại chọn loại vấn đề
      </button>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="text-5xl">📝</div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold my-0 mb-2">{currentCategory.categoryName}</h2>
        </div>
      </div>

      <form className="bg-white rounded-xl p-8 shadow-sm border border-gray-200" onSubmit={handleSubmit}>


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
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">
            Campus <span className="text-red-500">*</span>
          </label>
          <select
            name="campusCode"
            value={formData.campusCode}
            onChange={handleInputChange}
            className="w-full py-3 px-4 text-base border-2 border-gray-200 rounded-lg bg-white cursor-pointer transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
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
          <div className="text-[0.85rem] text-gray-500 mt-2">
            {isLoadingCampuses ? 'Đang tải...' : 'Chọn campus nơi xảy ra sự cố'}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">
            Địa điểm <span className="text-red-500">*</span>
          </label>
          <select
            name="locationCode"
            value={formData.locationCode}
            onChange={handleInputChange}
            className="w-full py-3 px-4 text-base border-2 border-gray-200 rounded-lg bg-white cursor-pointer transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
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
          <div className="text-[0.85rem] text-gray-500 mt-2">
            {!formData.campusCode 
              ? 'Vui lòng chọn campus trước' 
              : isLoadingLocations 
              ? 'Đang tải địa điểm...' 
              : 'Chọn địa điểm cụ thể xảy ra sự cố'}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[0.95rem] font-semibold text-gray-700 mb-2">Số điện thoại</label>
          {isLoadingProfile ? (
            <div className="w-full py-3 px-3 text-base border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500">
              Đang tải thông tin...
            </div>
          ) : userProfile?.phoneNumber ? (
            <>
              <div className="w-full py-3 px-3 text-base border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium">
                {userProfile.phoneNumber}
              </div>
              <div className="text-[0.85rem] text-gray-500 mt-2">
                📱 Số điện thoại từ hồ sơ của bạn. Cập nhật trong phần Profile nếu cần thay đổi.
              </div>
            </>
          ) : (
            <>
              <div className="w-full py-3 px-3 text-base border-2 border-yellow-300 rounded-lg bg-yellow-50 text-yellow-700">
                Chưa cập nhật số điện thoại
              </div>
              <div className="text-[0.85rem] text-yellow-600 mt-2 flex items-start gap-2">
                <span>⚠️</span>
                <span>Bạn chưa cập nhật số điện thoại trong hồ sơ. Vui lòng cập nhật trong phần <strong>Profile</strong> để chúng tôi có thể liên hệ với bạn khi cần thiết.</span>
              </div>
            </>
          )}
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

        {/* Error message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="text-red-700 font-semibold mb-1">❌ Lỗi</div>
            <div className="text-red-600 text-sm">{submitError}</div>
          </div>
        )}

        {/* Success message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="text-green-700 font-semibold mb-1">✅ Thành công</div>
            <div className="text-green-600 text-sm">Ticket đã được tạo thành công!</div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            className="py-4 px-8 bg-gray-100 text-gray-700 border-none rounded-lg cursor-pointer text-base font-semibold transition-all duration-200 hover:bg-gray-200"
            onClick={onBack}
            disabled={isSubmitting}
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
            {isSubmitting ? '⏳ Đang gửi...' : '📨 Gửi Ticket'}
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