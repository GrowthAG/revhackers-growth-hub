
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
    </>
  );
};

export default FormCompanySection;
