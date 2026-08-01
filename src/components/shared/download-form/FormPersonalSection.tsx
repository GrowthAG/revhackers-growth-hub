
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DownloadFormData } from './types';

interface FormPersonalSectionProps {
  formData: DownloadFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormPersonalSection = ({ formData, handleInputChange }: FormPersonalSectionProps) => {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="firstName" className="text-xs font-semibold text-zinc-800">Nome *</Label>
        <Input
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          placeholder="Seu nome"
          className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="lastName" className="text-xs font-semibold text-zinc-800">Sobrenome</Label>
        <Input
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          placeholder="Seu sobrenome"
          className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email" className="text-xs font-semibold text-zinc-800">E-mail Corporativo *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="seuemail@seudominio.com.br"
          className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone" className="text-xs font-semibold text-zinc-800">WhatsApp / Telefone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="(11) 99999-9999"
          className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
        />
      </div>
    </>
  );
};

export default FormPersonalSection;
