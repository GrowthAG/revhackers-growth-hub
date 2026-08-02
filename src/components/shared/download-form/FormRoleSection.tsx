
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DownloadFormData } from './types';
import { UserCheck, Users } from 'lucide-react';

interface FormRoleSectionProps {
  formData: DownloadFormData;
  handleRadioChange: (value: string) => void;
}

const FormRoleSection = ({ formData, handleRadioChange }: FormRoleSectionProps) => {
  return (
    <div className="col-span-1 md:col-span-2 space-y-2 pt-1">
      <Label className="text-zinc-900 text-xs font-bold uppercase tracking-wider">Perfil de Tomada de Decisão *</Label>
      <RadioGroup
        value={formData.roleType}
        onValueChange={handleRadioChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1"
      >
        <label
          htmlFor="decision-maker"
          className={`flex items-start space-x-3 border p-3.5 rounded-xl cursor-pointer transition-all ${formData.roleType === 'decision-maker' ? 'border-[#00CC6A] bg-emerald-50/40 ring-1 ring-[#00CC6A]' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
        >
          <RadioGroupItem value="decision-maker" id="decision-maker" className="mt-0.5 border-zinc-300 text-[#00CC6A] data-[state=checked]:border-[#00CC6A] data-[state=checked]:bg-[#00CC6A]" />
          <div className="space-y-0.5">
            <span className="font-bold text-zinc-950 text-xs uppercase tracking-wider block">Decisor</span>
            <p className="text-xs text-zinc-500 leading-tight">Tenho autonomia de aprovação.</p>
          </div>
        </label>

        <label
          htmlFor="influencer"
          className={`flex items-start space-x-3 border p-3.5 rounded-xl cursor-pointer transition-all ${formData.roleType === 'influencer' ? 'border-[#00CC6A] bg-emerald-50/40 ring-1 ring-[#00CC6A]' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
        >
          <RadioGroupItem value="influencer" id="influencer" className="mt-0.5 border-zinc-300 text-[#00CC6A] data-[state=checked]:border-[#00CC6A] data-[state=checked]:bg-[#00CC6A]" />
          <div className="space-y-0.5">
            <span className="font-bold text-zinc-950 text-xs uppercase tracking-wider block">Influenciador</span>
            <p className="text-xs text-zinc-500 leading-tight">Influencio e recomendo soluções.</p>
          </div>
        </label>
      </RadioGroup>
    </div>
  );
};

export default FormRoleSection;
