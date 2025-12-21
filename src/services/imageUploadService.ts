// ════════════════════════════════════════════════════════════════════════════════════
// [IMAGE UPLOAD SERVICE] - Quản lý upload ảnh lên Cloudinary
// ════════════════════════════════════════════════════════════════════════════════════
// Công dụng:
// - Upload ảnh từ file input
// - Upload multiple ảnh cùng lúc
// - Chuyển base64 image thành URL (từ preview)
// - Trả về Cloudinary URLs (secure_url)
// ════════════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────────────
// [CONFIG] - Cấu hình Cloudinary
// ─────────────────────────────────────────────────────────────────────────────────────

// Đọc từ .env: upload preset & cloud name
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'swp391_preset';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dg0danzmc';

// ─────────────────────────────────────────────────────────────────────────────────────
// 📝 [TYPES] - Định nghĩa Cloudinary response type
// ─────────────────────────────────────────────────────────────────────────────────────

// Response từ Cloudinary upload API
interface CloudinaryResponse {
  secure_url: string;  // URL bảo mật (https) - dùng cái này
  public_id: string;   // ID ảnh trên Cloudinary
  url: string;         // URL không bảo mật (http) - không dùng
}

// ─────────────────────────────────────────────────────────────────────────────────────
// 🚀 [IMAGE UPLOAD SERVICE] - Service object
// ─────────────────────────────────────────────────────────────────────────────────────

export const imageUploadService = {
  /**
   * 📤 Upload một ảnh lên Cloudinary
   * @param file - File object từ <input type="file">
   * @returns URL của ảnh đã upload (https://res.cloudinary.com/...)
   * @throws Error nếu upload thất bại
   * 
   * @example
   * const file = document.querySelector('input[type="file"]').files[0];
   * const imageUrl = await imageUploadService.uploadSingle(file);
   * console.log(imageUrl); // https://res.cloudinary.com/...
   */
  async uploadSingle(file: File): Promise<string> {
    // ─────────────────────────────────────────────────────────────────────────
    // 📋 PREPARE FORM DATA
    // ─────────────────────────────────────────────────────────────────────────
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      // ─────────────────────────────────────────────────────────────────────────
      // 📤 UPLOAD TO CLOUDINARY
      // ─────────────────────────────────────────────────────────────────────────
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      // ─────────────────────────────────────────────────────────────────────────
      // ✅ HANDLE RESPONSE
      // ─────────────────────────────────────────────────────────────────────────
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data: CloudinaryResponse = await response.json();
      return data.secure_url; // Trả về HTTPS URL
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  },

  /**
   * 📤📤 Upload nhiều ảnh lên Cloudinary (parallel)
   * Upload tất cả ảnh đồng thời bằng Promise.all()
   * 
   * @param files - Mảng File objects
   * @returns Chuỗi URLs cách nhau bằng dấu phẩy (ví dụ: "url1,url2,url3")
   * @throws Error nếu upload bất kỳ ảnh nào thất bại
   * 
   * @example
   * const files = document.querySelector('input[type="file"]').files;
   * const imageUrls = await imageUploadService.uploadMultiple(Array.from(files));
   * console.log(imageUrls); // "https://res.cloudinary.com/...,https://res.cloudinary.com/..."
   */
  async uploadMultiple(files: File[]): Promise<string> {
    try {
      // ─────────────────────────────────────────────────────────────────────────
      // ⚡ PARALLEL UPLOAD - Upload tất cả cùng lúc
      // ─────────────────────────────────────────────────────────────────────────
      
      const uploadPromises = files.map(file => this.uploadSingle(file));
      const urls = await Promise.all(uploadPromises); // Đợi tất cả upload xong
      
      // ─────────────────────────────────────────────────────────────────────────
      // 🔗 JOIN URLs
      // ─────────────────────────────────────────────────────────────────────────
      
      // Backend yêu cầu URLs cách nhau bằng dấu phẩy
      return urls.join(',');
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload one or more images. Please try again.');
    }
  },

  /**
   * 🎨 Upload ảnh từ base64 data URLs (từ preview/crop)
   * 
   * Thường dùng khi:
   * - User preview ảnh trước khi upload
   * - User crop/resize ảnh
   * - Convert canvas/preview thành URLs
   * 
   * @param dataUrls - Mảng base64 data URLs (ví dụ: "data:image/jpeg;base64,...")
   * @returns Chuỗi URLs cách nhau bằng dấu phẩy
   * @throws Error nếu upload thất bại
   * 
   * @example
   * const canvas = document.querySelector('canvas');
   * const dataUrl = canvas.toDataURL('image/jpeg');
   * const imageUrl = await imageUploadService.uploadFromDataUrls([dataUrl]);
   */
  async uploadFromDataUrls(dataUrls: string[]): Promise<string> {
    try {
      // ─────────────────────────────────────────────────────────────────────────
      // 🔄 CONVERT DATA URLS TO FILES
      // ─────────────────────────────────────────────────────────────────────────
      
      const uploadPromises = dataUrls.map(async (dataUrl) => {
        // Convert data URL (base64) → Blob → File object
        const blob = await fetch(dataUrl).then(r => r.blob());
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        return this.uploadSingle(file);
      });
      
      // ─────────────────────────────────────────────────────────────────────────
      // ⚡ PARALLEL UPLOAD
      // ─────────────────────────────────────────────────────────────────────────
      
      const urls = await Promise.all(uploadPromises);
      return urls.join(','); // Join URLs with comma as required by backend
    } catch (error) {
      console.error('Error uploading from data URLs:', error);
      throw new Error('Failed to upload images. Please try again.');
    }
  },
};
