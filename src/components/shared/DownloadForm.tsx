import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/31b57e7f-20a7-41d0-aba6-21df635e9e76';

interface DownloadFormProps {
  materialId: string;
  materialType: string;
  onSubmit: () => void;
}

const DownloadForm = ({ materialId, materialType, onSubmit }: DownloadFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.email || !formData.company || !formData.industry || !formData.role || !formData.agree) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios e aceite os termos.",
        variant: "destructive",
      });
      return;
    }
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um endereço de email válido.",
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
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Sobrenome</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Corporativo *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company">Nome da Empresa *</Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="industry">Setor da Empresa *</Label>
          <Select 
            value={formData.industry} 
            onValueChange={(value) => handleSelectChange('industry', value)}
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saas">Software as a Service (SaaS)</SelectItem>
              <SelectItem value="tech">Tecnologia</SelectItem>
              <SelectItem value="startup">Startup</SelectItem>
              <SelectItem value="b2b">B2B</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="fintech">Fintech</SelectItem>
              <SelectItem value="edtech">EdTech</SelectItem>
              <SelectItem value="health">Healthtech</SelectItem>
              <SelectItem value="logistics">Logística</SelectItem>
              <SelectItem value="manufacturing">Indústria</SelectItem>
              <SelectItem value="retail">Varejo</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Seu Cargo *</Label>
          <Input
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
            placeholder="Ex: Diretor de Marketing, CEO, etc."
          />
        </div>
        
        <div className="space-y-2">
          <Label>Você é *</Label>
          <RadioGroup value={formData.roleType} onValueChange={handleRadioChange} className="flex flex-col space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="decision-maker" id="decision-maker" />
              <Label htmlFor="decision-maker" className="cursor-pointer">Decisor (aprova projetos e orçamentos)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="influencer" id="influencer" />
              <Label htmlFor="influencer" className="cursor-pointer">Influenciador (recomenda soluções)</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <div className="flex items-start space-x-3 pt-2">
        <Checkbox 
          id="agree" 
          name="agree"
          checked={formData.agree}
          onCheckedChange={(checked) => 
            handleInputChange({
              target: { 
                name: 'agree', 
                checked: checked === true, 
                type: 'checkbox',
                value: ''
              }
            } as React.ChangeEvent<HTMLInputElement>)
          }
        />
        <Label htmlFor="agree" className="text-sm">
          Concordo em receber materiais educativos e atualizações da RevHackers. Poderei cancelar a qualquer momento. *
        </Label>
      </div>
      
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
