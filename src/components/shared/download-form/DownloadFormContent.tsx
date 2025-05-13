
import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadFormData } from './types';
import FormPersonalSection from './FormPersonalSection';
import FormCompanySection from './FormCompanySection';
import FormRoleSection from './FormRoleSection';
import FormPrivacySection from './FormPrivacySection';

interface DownloadFormContentProps {
  formData: DownloadFormData;
  isSubmitting: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleRadioChange: (value: string) => void;
  handleCheckboxChange: (checked: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const DownloadFormContent: React.FC<DownloadFormContentProps> = ({
  formData,
  isSubmitting,
  handleInputChange,
  handleSelectChange,
  handleRadioChange,
  handleCheckboxChange,
  handleSubmit
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormPersonalSection 
          formData={formData} 
          handleInputChange={handleInputChange} 
        />
        
        <FormCompanySection 
          formData={formData} 
          handleInputChange={handleInputChange} 
          handleSelectChange={handleSelectChange} 
        />
        
        <FormRoleSection 
          formData={formData} 
          handleRadioChange={handleRadioChange} 
        />
      </div>
      
      <FormPrivacySection 
        formData={formData} 
        onCheckedChange={handleCheckboxChange} 
      />
      
      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processando...' : 'Baixar Material'}
        </Button>
        
        <p className="text-xs text-gray-500 mt-4">
          * Campos obrigatórios. Ao enviar este formulário, você concorda com nossa 
          política de privacidade e termos de uso.
        </p>
      </div>
    </form>
  );
};

export default DownloadFormContent;
