
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FormField from './FormField';
import { roleOptions, industryOptions } from './form-options';
import { ContactFormProps, ContactFormData } from './types';

const ContactForm = ({ formType = 'contact' }: ContactFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    industry: '',
    message: '',
    role: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.email || !formData.company || !formData.role) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real application, we would submit the form data to a server here
    console.log('Form submitted:', {
      ...formData,
      formType, 
      timestamp: new Date().toISOString()
    });
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: formType === 'diagnosis' ? "Diagnóstico solicitado!" : "Mensagem enviada!",
        description: "Redirecionando para agendamento...",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        industry: '',
        message: '',
        role: '',
      });
      
      // Redirect to booking page
      setTimeout(() => {
        navigate('/booking');
      }, 1500);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <h3 className="text-xl font-display font-bold mb-6">
        {formType === 'diagnosis' ? 'Solicite seu diagnóstico gratuito' : 'Entre em contato'}
      </h3>
      
      <div className="space-y-4">
        <FormField
          type="input"
          name="name"
          placeholder="Nome completo *"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <FormField
          type="input"
          name="email"
          placeholder="E-mail corporativo *"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <FormField
          type="input"
          name="company"
          placeholder="Empresa *"
          value={formData.company}
          onChange={handleChange}
          required
        />
        
        <FormField
          type="select"
          name="role"
          placeholder="Cargo *"
          value={formData.role}
          onSelectChange={(value) => handleSelectChange('role', value)}
          options={roleOptions}
          required
        />
        
        <FormField
          type="input"
          name="phone"
          placeholder="Telefone"
          value={formData.phone}
          onChange={handleChange}
        />
        
        <FormField
          type="select"
          name="industry"
          placeholder="Segmento"
          value={formData.industry}
          onSelectChange={(value) => handleSelectChange('industry', value)}
          options={industryOptions}
        />
        
        <FormField
          type="textarea"
          name="message"
          placeholder={formType === 'diagnosis' ? "Compartilhe seus desafios de crescimento" : "Sua mensagem"}
          value={formData.message}
          onChange={handleChange}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-[#00cf00] text-black hover:bg-[#00cf00]/80"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processando...' : formType === 'diagnosis' ? 'Solicitar diagnóstico' : 'Enviar mensagem'}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Ao enviar, você concorda com nossa política de privacidade.
      </p>
    </form>
  );
};

export default ContactForm;
