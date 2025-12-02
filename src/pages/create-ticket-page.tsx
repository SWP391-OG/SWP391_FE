import { useState, ChangeEvent, FormEvent } from 'react';
import type { IssueType, Ticket } from '../types';

interface CreateTicketPageProps {
  issueType: IssueType;
  onBack: () => void;
  onSubmit: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'slaDeadline'>) => void;
}

interface FormData {
  title: string;
  description: string;
  location: string;
  roomNumber: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  images: string[];
}

const CreateTicketPage = ({ issueType, onBack, onSubmit }: CreateTicketPageProps) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    roomNumber: '',
    priority: 'medium',
    images: [],
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const ticket: Omit<Ticket, 'id' | 'createdAt' | 'slaDeadline'> = {
        title: formData.title,
        description: formData.description,
        issueType: issueType,
        category: issueType.category,
        priority: formData.priority,
        status: 'open',
        location: formData.location,
        roomNumber: formData.roomNumber,
        images: formData.images.length > 0 ? formData.images : undefined,
        createdBy: 'current-user-id', // This should come from auth context
        updatedAt: new Date().toISOString(),
      };

      onSubmit(ticket);
      setIsSubmitting(false);
    }, 1000);
  };

  const styles = {
    page: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem',
    },
    header: {
      marginBottom: '2rem',
      textAlign: 'center' as const,
    },
    backButton: {
      padding: '0.75rem 1.5rem',
      background: '#e5e7eb',
      color: '#374151',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: 500,
      marginBottom: '1.5rem',
      transition: 'all 0.2s',
    },
    issueTypeBox: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    issueIcon: {
      fontSize: '3rem',
    },
    issueInfo: {
      flex: 1,
    },
    issueTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      margin: '0 0 0.5rem 0',
    },
    issueDescription: {
      fontSize: '0.95rem',
      opacity: 0.9,
      margin: 0,
    },
    form: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      fontSize: '0.95rem',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '0.5rem',
    },
    required: {
      color: '#ef4444',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      transition: 'all 0.2s',
      boxSizing: 'border-box' as const,
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      transition: 'all 0.2s',
      minHeight: '120px',
      resize: 'vertical' as const,
      fontFamily: 'inherit',
      boxSizing: 'border-box' as const,
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      transition: 'all 0.2s',
      background: 'white',
      cursor: 'pointer',
      boxSizing: 'border-box' as const,
    },
    imageUploadContainer: {
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      padding: '2rem',
      textAlign: 'center' as const,
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: '#f9fafb',
    },
    imageUploadContainerHover: {
      borderColor: '#3b82f6',
      background: '#eff6ff',
    },
    fileInput: {
      display: 'none',
    },
    uploadIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
    },
    uploadText: {
      color: '#6b7280',
      fontSize: '0.95rem',
      marginBottom: '0.5rem',
    },
    uploadHint: {
      color: '#9ca3af',
      fontSize: '0.85rem',
    },
    imagePreviewContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '1rem',
      marginTop: '1rem',
    },
    imagePreviewWrapper: {
      position: 'relative' as const,
      borderRadius: '8px',
      overflow: 'hidden',
      border: '2px solid #e5e7eb',
      aspectRatio: '1',
    },
    imagePreview: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    removeImageButton: {
      position: 'absolute' as const,
      top: '0.5rem',
      right: '0.5rem',
      background: 'rgba(239, 68, 68, 0.9)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      cursor: 'pointer',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      transition: 'all 0.2s',
    },
    gridRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    helpText: {
      fontSize: '0.85rem',
      color: '#6b7280',
      marginTop: '0.5rem',
    },
    priorityGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.75rem',
    },
    priorityOption: (selected: boolean) => ({
      padding: '0.75rem',
      border: selected ? '2px solid #3b82f6' : '2px solid #e5e7eb',
      borderRadius: '8px',
      background: selected ? '#eff6ff' : 'white',
      cursor: 'pointer',
      textAlign: 'center' as const,
      transition: 'all 0.2s',
      fontWeight: selected ? 600 : 400,
      color: selected ? '#3b82f6' : '#374151',
    }),
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem',
    },
    submitButton: {
      flex: 1,
      padding: '1rem 2rem',
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 600,
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
    },
    submitButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    cancelButton: {
      padding: '1rem 2rem',
      background: '#f3f4f6',
      color: '#374151',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 600,
      transition: 'all 0.2s',
    },
  };

  const priorityLabels = {
    low: { label: 'Thấp', emoji: '🟢' },
    medium: { label: 'Trung bình', emoji: '🟡' },
    high: { label: 'Cao', emoji: '🟠' },
    urgent: { label: 'Khẩn cấp', emoji: '🔴' },
  };

  const isFormValid = formData.title.trim() !== '' && formData.description.trim() !== '';

  return (
    <div style={styles.page}>
      <button 
        style={styles.backButton}
        onClick={onBack}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#d1d5db';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#e5e7eb';
        }}
      >
        ← Quay lại chọn loại vấn đề
      </button>

      <div style={styles.issueTypeBox}>
        <div style={styles.issueIcon}>{issueType.icon}</div>
        <div style={styles.issueInfo}>
          <h2 style={styles.issueTitle}>{issueType.name}</h2>
          <p style={styles.issueDescription}>{issueType.description}</p>
        </div>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Tiêu đề <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ví dụ: Máy chiếu phòng 501 không hoạt động"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Mô tả chi tiết <span style={styles.required}>*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
            style={styles.textarea}
            required
          />
          <div style={styles.helpText}>
            Vui lòng mô tả chi tiết để chúng tôi có thể hỗ trợ bạn tốt hơn
          </div>
        </div>

        <div style={styles.gridRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Địa điểm</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Ví dụ: Tòa nhà Alpha"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Số phòng</label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleInputChange}
              placeholder="Ví dụ: 501"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Mức độ ưu tiên</label>
          <div style={styles.priorityGrid}>
            {(Object.keys(priorityLabels) as Array<keyof typeof priorityLabels>).map((key) => (
              <div
                key={key}
                style={styles.priorityOption(formData.priority === key)}
                onClick={() => setFormData((prev) => ({ ...prev, priority: key }))}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                  {priorityLabels[key].emoji}
                </div>
                <div style={{ fontSize: '0.85rem' }}>{priorityLabels[key].label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Hình ảnh (Tùy chọn)</label>
          <div
            style={styles.imageUploadContainer}
            onClick={() => document.getElementById('imageUpload')?.click()}
            onMouseOver={(e) => {
              Object.assign(e.currentTarget.style, styles.imageUploadContainerHover);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.background = '#f9fafb';
            }}
          >
            <div style={styles.uploadIcon}>📸</div>
            <div style={styles.uploadText}>Nhấp để tải lên hình ảnh</div>
            <div style={styles.uploadHint}>PNG, JPG, GIF tối đa 5MB mỗi ảnh</div>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={styles.fileInput}
            />
          </div>

          {imagePreview.length > 0 && (
            <div style={styles.imagePreviewContainer}>
              {imagePreview.map((preview, index) => (
                <div key={index} style={styles.imagePreviewWrapper}>
                  <img src={preview} alt={`Preview ${index + 1}`} style={styles.imagePreview} />
                  <button
                    type="button"
                    style={styles.removeImageButton}
                    onClick={() => removeImage(index)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            style={styles.cancelButton}
            onClick={onBack}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...((!isFormValid || isSubmitting) && styles.submitButtonDisabled),
            }}
            disabled={!isFormValid || isSubmitting}
            onMouseOver={(e) => {
              if (isFormValid && !isSubmitting) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (isFormValid && !isSubmitting) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicketPage;



