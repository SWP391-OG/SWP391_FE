import { useState } from 'react';
import ForgotPasswordStep1 from './forgot-password-step1';
import ForgotPasswordStep2 from './forgot-password-step2';

interface ForgotPasswordPageProps {
  onResetSuccess: () => void;
  onNavigateToLogin?: () => void;
}

const ForgotPasswordPage = ({ onResetSuccess, onNavigateToLogin }: ForgotPasswordPageProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');

  const handleStep1Next = (userEmail: string) => {
    setEmail(userEmail);
    setStep(2);
  };

  const handleStep2Back = () => {
    setStep(1);
  };

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

