
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const ContactForm = ({ formType = 'contact' }: { formType?: 'contact' | 'diagnosis' }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
          <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Cargo *" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ceo">CEO / Presidente</SelectItem>
              <SelectItem value="coo">COO / Diretor de Operações</SelectItem>
              <SelectItem value="cfo">CFO / Diretor Financeiro</SelectItem>
              <SelectItem value="cmo">CMO / Diretor de Marketing</SelectItem>
              <SelectItem value="cto">CTO / Diretor de Tecnologia</SelectItem>
              <SelectItem value="cro">CRO / Diretor de Receita</SelectItem>
              <SelectItem value="vp_sales">VP de Vendas</SelectItem>
              <SelectItem value="vp_marketing">VP de Marketing</SelectItem>
              <SelectItem value="director">Diretor</SelectItem>
              <SelectItem value="manager">Gerente</SelectItem>
              <SelectItem value="specialist">Especialista</SelectItem>
              <SelectItem value="analyst">Analista</SelectItem>
              <SelectItem value="consultant">Consultor</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
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
          <Select value={formData.industry} onValueChange={(value) => handleSelectChange('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Segmento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saas">SaaS</SelectItem>
              <SelectItem value="tech">Tecnologia</SelectItem>
              <SelectItem value="startup">Startup</SelectItem>
              <SelectItem value="b2b">B2B</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="finance">Finanças</SelectItem>
              <SelectItem value="education">Educação</SelectItem>
              <SelectItem value="health">Saúde</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="events">Eventos</SelectItem>
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
