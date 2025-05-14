
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { DownloadFormData } from '../types';
import { validateForm, WEBHOOK_URL, EMAIL_WEBHOOK_URL } from '../utils';
import { saveFormData } from '@/utils/formStorage';

export const useDownloadForm = (
  materialId: string,
  materialType: string,
  onSubmit: () => void,
  linkMaterial?: string
) => {
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
      
      console.log('Sending email webhook with data:', emailData);
      
      await fetch(EMAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
    } catch (error) {
      console.error('Error sending email request:', error);
      // Continuamos mesmo se houver erro no envio de email
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
      materiallink: linkMaterial || '',
      source: window.location.href,
      timestamp: new Date().toISOString()
    };

    console.log('Form submitted with linkMaterial:', linkMaterial);
    console.log('Full webhook data:', webhookData);
    
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
      
      // Try to send data to webhook using standard fetch
      try {
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        });
        
        // Verificamos o status, mas não consideramos um erro de webhook como bloqueador
        if (!response.ok && response.status !== 0) {
          console.warn('Webhook response not OK, but will continue:', response.status);
        }
      } catch (webhookError) {
        console.warn('Webhook error, but will continue:', webhookError);
        // Continuamos mesmo se houver erro no webhook
      }
      
      // Sending material by email as backup
      await sendMaterialByEmail(webhookData);
      
      // Consideramos o formulário como enviado com sucesso
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

  return {
    formData,
    isSubmitting,
    handleInputChange,
    handleSelectChange,
    handleRadioChange,
    handleCheckboxChange,
    handleSubmit
  };
};
