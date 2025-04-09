
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DownloadFormData } from './types';

interface FormPrivacySectionProps {
  formData: DownloadFormData;
  onCheckedChange: (checked: boolean) => void;
}

const FormPrivacySection = ({ formData, onCheckedChange }: FormPrivacySectionProps) => {
  return (
    <div className="flex items-start space-x-3 pt-2">
      <Checkbox 
        id="agree" 
        name="agree"
        checked={formData.agree}
        onCheckedChange={(checked) => onCheckedChange(checked === true)}
      />
      <Label htmlFor="agree" className="text-sm">
        Concordo em receber materiais educativos e atualizações da RevHackers. 
        Poderei cancelar a qualquer momento. *
      </Label>
    </div>
  );
};

export default FormPrivacySection;
