
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DownloadFormData } from './types';

interface FormRoleSectionProps {
  formData: DownloadFormData;
  handleRadioChange: (value: string) => void;
}

const FormRoleSection = ({ formData, handleRadioChange }: FormRoleSectionProps) => {
  return (
    <div className="space-y-2">
      <Label>Você é *</Label>
      <RadioGroup 
        value={formData.roleType} 
        onValueChange={handleRadioChange} 
        className="flex flex-col space-y-2 mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="decision-maker" id="decision-maker" />
          <Label htmlFor="decision-maker" className="cursor-pointer">
            Decisor (aprova projetos e orçamentos)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="influencer" id="influencer" />
          <Label htmlFor="influencer" className="cursor-pointer">
            Influenciador (recomenda soluções)
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default FormRoleSection;
