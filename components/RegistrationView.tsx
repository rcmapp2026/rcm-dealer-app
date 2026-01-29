import React, { useState } from 'react';
import { RegistrationForm } from './RegistrationForm';
import RegistrationSuccess from './RegistrationSuccess';
import { UserProfile } from '../types';

interface Props {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

export const RegistrationView: React.FC<Props> = ({ onBack, onRegisterSuccess }) => {
  const [successDealer, setSuccessDealer] = useState<UserProfile | null>(null);

  if (successDealer) {
      return (
        <RegistrationSuccess 
            dealer={successDealer} 
            onLogin={onRegisterSuccess} 
        />
      );
  }

  return <RegistrationForm onSuccess={setSuccessDealer} onBack={onBack} />;
};