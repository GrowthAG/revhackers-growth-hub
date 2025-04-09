
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { DownloadFormProps, DownloadFormData } from './types';
import FormPersonalSection from './FormPersonalSection';
import FormCompanySection from './FormCompanySection';
import FormRoleSection from './FormRoleSection';
import FormPrivacySection from './FormPrivacySection';
import { validateForm, WEBHOOK_URL } from './utils';

const DownloadForm = ({ materialId, materialType, onSubmit }: DownloadFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DownloadFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    role: '',
    roleType: 'decision-maker',
    agree: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      roleType: value
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      agree: checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const { isValid, errorMessage } = validateForm(formData);
    
    if (!isValid) {
      toast({
        title: "Campos obrigatórios",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Prepare data for webhook
    const webhookData = {
      ...formData,
      formType: 'download',
      materialId,
      materialType,
      source: window.location.href,
      timestamp: new Date().toISOString()
    };

    console.log('Form submitted:', webhookData);
    
    try {
      // Send data to webhook
      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
        mode: 'no-cors' // Using no-cors mode to handle CORS issues
      });
      
      // Since we're using no-cors, we'll assume success
      setIsSubmitting(false);
      onSubmit();
      
      // Redirect to booking page after successful download
      setTimeout(() => {
        navigate('/booking');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro ao enviar formulário",
        description: "Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

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

export default DownloadForm;
