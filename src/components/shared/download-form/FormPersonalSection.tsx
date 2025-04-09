
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
    </>
  );
};

export default FormPersonalSection;
