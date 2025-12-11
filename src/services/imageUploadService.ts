/**
 * Image Upload Service
 * 
 * Service để upload ảnh lên Cloudinary
 */

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'swp391_preset';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dg0danzmc';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  url: string;
}

export const imageUploadService = {
  /**
   * Upload một ảnh lên Cloudinary
   * @param file File object từ input
   * @returns URL của ảnh đã upload
   */
  async uploadSingle(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data: CloudinaryResponse = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  },

  /**
   * Upload nhiều ảnh lên Cloudinary
   * @param files Array of File objects
   * @returns Array of image URLs, separated by comma
   */
  async uploadMultiple(files: File[]): Promise<string> {
    try {
      const uploadPromises = files.map(file => this.uploadSingle(file));
      const urls = await Promise.all(uploadPromises);
      return urls.join(','); // Join URLs with comma as required by backend
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload one or more images. Please try again.');
    }
  },

  /**
   * Upload từ base64 data URLs (dành cho ảnh đã preview)
   * @param dataUrls Array of base64 data URLs
   * @returns Array of image URLs, separated by comma
   */
  async uploadFromDataUrls(dataUrls: string[]): Promise<string> {
    try {
      const uploadPromises = dataUrls.map(async (dataUrl) => {
        // Convert data URL to blob
        const blob = await fetch(dataUrl).then(r => r.blob());
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        return this.uploadSingle(file);
      });
      
      const urls = await Promise.all(uploadPromises);
      return urls.join(','); // Join URLs with comma as required by backend
    } catch (error) {
      console.error('Error uploading from data URLs:', error);
      throw new Error('Failed to upload images. Please try again.');
    }
  },
};
