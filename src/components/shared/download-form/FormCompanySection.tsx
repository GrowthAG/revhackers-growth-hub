
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DownloadFormData } from './types';

interface FormCompanySectionProps {
  formData: DownloadFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

const FormCompanySection = ({
  formData,
  handleInputChange,
  handleSelectChange
}: FormCompanySectionProps) => {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="company" className="text-xs font-semibold text-zinc-800">Empresa *</Label>
        <Input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleInputChange}
          placeholder="Nome da sua empresa"
          className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="industry" className="text-xs font-semibold text-zinc-800">Setor *</Label>
        <Select
          value={formData.industry}
          onValueChange={(value) => handleSelectChange('industry', value)}
        >
          <SelectTrigger id="industry" className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 transition-all">
            <SelectValue placeholder="Selecione o setor" />
          </SelectTrigger>
          <SelectContent className="bg-white border-zinc-200 text-zinc-900 shadow-sm rounded-lg">
            <SelectItem value="saas">SaaS / Software</SelectItem>
            <SelectItem value="tech">Tecnologia</SelectItem>
            <SelectItem value="startup">Startup</SelectItem>
            <SelectItem value="b2b">Serviços B2B</SelectItem>
            <SelectItem value="ecommerce">E-commerce</SelectItem>
            <SelectItem value="fintech">Fintech</SelectItem>
            <SelectItem value="marketing">Agência / Growth</SelectItem>
            <SelectItem value="other">Outro Segmento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1 md:col-span-2 space-y-1">
        <Label htmlFor="role" className="text-xs font-semibold text-zinc-800">Cargo *</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => handleSelectChange('role', value)}
        >
          <SelectTrigger id="role" className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 transition-all">
            <SelectValue placeholder="Selecione seu cargo" />
          </SelectTrigger>
          <SelectContent className="bg-white border-zinc-200 text-zinc-900 shadow-sm rounded-lg">
            <SelectItem value="executivo-senior">Founder / CEO</SelectItem>
            <SelectItem value="socio-vp">Sócio / C-Level / VP</SelectItem>
            <SelectItem value="chefe-diretor">Diretor de RevOps / Vendas</SelectItem>
            <SelectItem value="gerente-lider">Gerente / Head de Growth</SelectItem>
            <SelectItem value="especialista-consultor">Especialista / Consultor</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default FormCompanySection;
