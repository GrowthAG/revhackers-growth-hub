
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { DownloadFormProps, DownloadFormData } from './types';
import FormPersonalSection from './FormPersonalSection';
import FormCompanySection from './FormCompanySection';
import FormRoleSection from './FormRoleSection';
import FormPrivacySection from './FormPrivacySection';
import { validateForm, WEBHOOK_URL, EMAIL_WEBHOOK_URL } from './utils';
import { saveFormData } from '@/utils/formStorage';

const DownloadForm = ({ materialId, materialType, onSubmit, linkMaterial }: DownloadFormProps) => {
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

  const sendMaterialByEmail = async (webhookData: any) => {
    try {
      const emailData = {
        ...webhookData,
        materialTitle: materialType,
        materialLink: linkMaterial || '',
        actionType: 'send_material_email'
      };
      
      console.log('Sending email webhook with data:', emailData); // Debug log
      
      await fetch(EMAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      console.log('Email request sent:', emailData);
    } catch (error) {
      console.error('Error sending email request:', error);
    }
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
      materialLink: linkMaterial || '', // Include the material link in webhook data
      source: window.location.href,
      timestamp: new Date().toISOString()
    };

    console.log('Form submitted:', webhookData);
    
    try {
      // Save form data to localStorage for use on booking page
      saveFormData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        industry: formData.industry,
        role: formData.role,
        formType: 'download'
      });
      
      // Send data to webhook using standard fetch
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });
      
      if (!response.ok && response.status !== 0) {
        throw new Error('Failed to submit form data');
      }
      
      // Send material by email
      await sendMaterialByEmail(webhookData);
      
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
