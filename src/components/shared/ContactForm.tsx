
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { saveFormData } from '@/utils/formStorage';
import { useNavigate } from 'react-router-dom';
import { sendToGHL } from '@/lib/ghlRelay';

interface ContactFormProps {
  formType?: 'diagnosis' | 'contact' | 'material';
  variant?: 'light' | 'dark';
  onSuccess?: () => void;
}

const ContactForm = ({ formType = 'contact', variant = 'light', onSuccess }: ContactFormProps) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        formType,
        source: window.location.href,
        timestamp: new Date().toISOString(),
      };

      // Save to localStorage
      saveFormData(submissionData);
      // Send to GHL relay
      await sendToGHL('contact_form', submissionData as Record<string, unknown>);

      toast({
        title: "Sucesso!",
        description: "Suas informações foram enviadas com sucesso.",
      });

      onSuccess?.();

      // Redirect based on form type
      if (formType === 'diagnosis') {
        navigate('/agenda-diagnostico');
      } else if (formType === 'material') {
        navigate('/booking');
      } else {
        // Reset form for contact type
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          industry: '',
          message: '',
          role: '',
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o formulário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inputStyles = "w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all";

  const labelStyles = "text-xs font-semibold text-zinc-800 block mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="name" className={labelStyles}>Nome Completo *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Ex: João Silva"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            className={inputStyles}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className={labelStyles}>E-mail Corporativo *</Label>
          <Input
            id="email"
            type="email"
            placeholder="Ex: nome@empresa.com.br"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className={inputStyles}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="company" className={labelStyles}>Nome da Empresa *</Label>
          <Input
            id="company"
            type="text"
            placeholder="Nome da sua empresa"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            required
            className={inputStyles}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone" className={labelStyles}>Telefone / WhatsApp *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
            className={inputStyles}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className={labelStyles}>Segmento *</Label>
          <Select onValueChange={(value) => handleInputChange('industry', value)}>
            <SelectTrigger className={inputStyles}>
              <SelectValue placeholder="Selecione seu segmento" />
            </SelectTrigger>
            <SelectContent className="bg-white border-zinc-200 text-zinc-900">
              <SelectItem value="technology">SaaS / Software</SelectItem>
              <SelectItem value="finance">Financeiro / Fintech</SelectItem>
              <SelectItem value="health">Saúde / Healthtech</SelectItem>
              <SelectItem value="education">Educação / Edtech</SelectItem>
              <SelectItem value="retail">Varejo / E-commerce</SelectItem>
              <SelectItem value="manufacturing">Indústria B2B</SelectItem>
              <SelectItem value="services">Serviços B2B</SelectItem>
              <SelectItem value="consulting">Consultoria</SelectItem>
              <SelectItem value="other">Outro Segmento B2B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className={labelStyles}>Seu Cargo *</Label>
          <Select onValueChange={(value) => handleInputChange('role', value)}>
            <SelectTrigger className={inputStyles}>
              <SelectValue placeholder="Selecione seu cargo" />
            </SelectTrigger>
            <SelectContent className="bg-white border-zinc-200 text-zinc-900">
              <SelectItem value="executivo-senior">Founder / CEO</SelectItem>
              <SelectItem value="socio-vp">Sócio / C-Level / VP</SelectItem>
              <SelectItem value="chefe-diretor">Diretor de RevOps / Vendas</SelectItem>
              <SelectItem value="gerente-lider">Gerente / Head de Growth</SelectItem>
              <SelectItem value="especialista-consultor">Especialista / Consultor</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="message" className={labelStyles}>Como podemos ajudar?</Label>
        <Textarea
          id="message"
          placeholder="Descreva brevemente seus desafios atuais de receita..."
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          className="w-full min-h-[90px] p-3 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-zinc-900 transition-all"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm tracking-wide rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 mt-4"
      >
        {isSubmitting ? 'Validando e enviando...' : formType === 'diagnosis' ? 'Agendar Análise →' : 'Solicitar Aprovação →'}
      </Button>
    </form>
  );
};

export default ContactForm;

