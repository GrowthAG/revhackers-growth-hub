
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const ContactForm = ({ formType = 'contact' }: { formType?: 'contact' | 'diagnosis' }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    industry: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, industry: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.email || !formData.company) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real application, we would submit the form data to a server here
    console.log('Form submitted:', formData);
    
    toast({
      title: formType === 'diagnosis' ? "Diagnóstico solicitado!" : "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      industry: '',
      message: '',
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <h3 className="text-xl font-display font-bold mb-6">
        {formType === 'diagnosis' ? 'Solicite seu diagnóstico gratuito' : 'Entre em contato'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <Input
            name="name"
            placeholder="Nome completo *"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <Input
            name="email"
            type="email"
            placeholder="E-mail corporativo *"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <Input
            name="company"
            placeholder="Empresa *"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <Input
            name="phone"
            placeholder="Telefone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Select value={formData.industry} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Segmento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saas">SaaS</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="finance">Finanças</SelectItem>
              <SelectItem value="education">Educação</SelectItem>
              <SelectItem value="health">Saúde</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Textarea
            name="message"
            placeholder={formType === 'diagnosis' ? "Compartilhe seus desafios de crescimento" : "Sua mensagem"}
            value={formData.message}
            onChange={handleChange}
            rows={4}
          />
        </div>
      </div>
      
      <Button type="submit" className="btn-primary w-full">
        {formType === 'diagnosis' ? 'Solicitar diagnóstico' : 'Enviar mensagem'}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Ao enviar, você concorda com nossa política de privacidade.
      </p>
    </form>
  );
};

export default ContactForm;
