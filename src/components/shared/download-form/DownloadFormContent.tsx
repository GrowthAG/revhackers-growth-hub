
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DownloadFormData } from './types';
import { Lock } from 'lucide-react';

interface DownloadFormContentProps {
  formData: DownloadFormData;
  isSubmitting: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleRadioChange?: (value: string) => void;
  handleCheckboxChange?: (checked: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const inputStyles = "w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all";
const labelStyles = "text-xs font-semibold text-zinc-800 block mb-1.5";

const DownloadFormContent: React.FC<DownloadFormContentProps> = ({
  formData,
  isSubmitting,
  handleInputChange,
  handleSelectChange,
  handleSubmit
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1 */}
        <div className="space-y-1">
          <Label htmlFor="firstName" className={labelStyles}>Nome Completo *</Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Ex: João Silva"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className={inputStyles}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className={labelStyles}>E-mail Corporativo *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Ex: nome@empresa.com.br"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={inputStyles}
          />
        </div>

        {/* Row 2 */}
        <div className="space-y-1">
          <Label htmlFor="company" className={labelStyles}>Nome da Empresa *</Label>
          <Input
            id="company"
            name="company"
            type="text"
            placeholder="Nome da sua empresa"
            value={formData.company}
            onChange={handleInputChange}
            required
            className={inputStyles}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone" className={labelStyles}>Telefone / WhatsApp *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className={inputStyles}
          />
        </div>

        {/* Row 3 */}
        <div className="space-y-1">
          <Label htmlFor="industry" className={labelStyles}>Segmento *</Label>
          <Select
            value={formData.industry}
            onValueChange={(val) => handleSelectChange('industry', val)}
          >
            <SelectTrigger id="industry" className={inputStyles}>
              <SelectValue placeholder="Selecione seu segmento..." />
            </SelectTrigger>
            <SelectContent className="bg-white border-zinc-200 text-zinc-900 shadow-md rounded-lg">
              <SelectItem value="saas">SaaS / Software</SelectItem>
              <SelectItem value="tech">Tecnologia</SelectItem>
              <SelectItem value="startup">Startup</SelectItem>
              <SelectItem value="b2b">Serviços B2B</SelectItem>
              <SelectItem value="fintech">Fintech</SelectItem>
              <SelectItem value="marketing">Agência / Growth</SelectItem>
              <SelectItem value="other">Outro Segmento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="role" className={labelStyles}>Seu Cargo *</Label>
          <Select
            value={formData.role}
            onValueChange={(val) => handleSelectChange('role', val)}
          >
            <SelectTrigger id="role" className={inputStyles}>
              <SelectValue placeholder="Selecione seu cargo" />
            </SelectTrigger>
            <SelectContent className="bg-white border-zinc-200 text-zinc-900 shadow-md rounded-lg">
              <SelectItem value="c-level">CEO / Founder / C-Level</SelectItem>
              <SelectItem value="director">Diretor / Head de Vendas/Mkt</SelectItem>
              <SelectItem value="manager">Gerente / Coordenador</SelectItem>
              <SelectItem value="analyst">Analista / Especialista</SelectItem>
              <SelectItem value="other">Outro Cargo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 4: Textarea */}
      <div className="space-y-1 pt-1">
        <Label htmlFor="message" className={labelStyles}>Como podemos ajudar?</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Descreva brevemente seus desafios atuais de receita..."
          rows={3}
          value={(formData as any).message || ''}
          onChange={handleInputChange}
          className="w-full p-3.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-[#18181b] hover:bg-black text-white font-bold text-sm tracking-wide rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Processando...
            </span>
          ) : (
            <span>Solicitar Aprovação →</span>
          )}
        </Button>

        <p className="text-[11px] text-zinc-400 mt-2 text-center flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-zinc-400" />
          Seus dados estão seguros conosco. Resposta em até 24h.
        </p>
      </div>
    </form>
  );
};

export default DownloadFormContent;
