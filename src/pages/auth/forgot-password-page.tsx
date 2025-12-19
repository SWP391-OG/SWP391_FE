// Trang Quên mật khẩu tổng: điều phối luồng giữa Bước 1 và Bước 2
import { useState } from 'react';
import ForgotPasswordStep1 from './forgot-password-step1';
import ForgotPasswordStep2 from './forgot-password-step2';

interface ForgotPasswordPageProps {
  onResetSuccess: () => void;
  onNavigateToLogin?: () => void;
}

const ForgotPasswordPage = ({ onResetSuccess, onNavigateToLogin }: ForgotPasswordPageProps) => {
  // step = 1: nhập email, step = 2: nhập mã reset + mật khẩu mới
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');

  // Sau khi bước 1 thành công, lưu email và chuyển sang bước 2
  const handleStep1Next = (userEmail: string) => {
    setEmail(userEmail);
    setStep(2);
  };

  // Cho phép quay lại bước 1 để sửa email
  const handleStep2Back = () => {
    setStep(1);
  };

  // Sau khi reset mật khẩu thành công: reset state và callback về màn login
  const handleResetSuccess = () => {
    // Reset state
    setStep(1);
    setEmail('');
    // Chuyển về login
    onResetSuccess();
  };

  return (
    <>
      {step === 1 ? (
        <ForgotPasswordStep1 
          onNext={handleStep1Next}
          onNavigateToLogin={onNavigateToLogin}
        />
      ) : (
        <ForgotPasswordStep2 
          email={email}
          onResetSuccess={handleResetSuccess}
          onBack={handleStep2Back}
          onNavigateToLogin={onNavigateToLogin}
        />
      )}
    </>
  );
};

export default ForgotPasswordPage;

