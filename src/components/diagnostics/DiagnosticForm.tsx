import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { Linkedin, RefreshCw } from 'lucide-react';

export interface DiagnosticFormData {
 name: string;
 email: string;
 company: string;
 role: string;
 linkedin: string;
 cnpj?: string;
}

interface DiagnosticFormProps {
 onSubmit: (data: DiagnosticFormData) => void;
 isSubmitting: boolean;
 title?: string;
 subtitle?: string;
 showLinkedin?: boolean;
 variant?: 'light' | 'dark';
 diagnosticType?: string;
}

export const DiagnosticForm = ({
 onSubmit,
 isSubmitting,
 title = "Relatório Autorizado",
 subtitle = "Identificação Obrigatória",
 showLinkedin = false,
 variant = 'dark',
 diagnosticType = 'General'
}: DiagnosticFormProps) => {
 const [form, setForm] = useState<DiagnosticFormData>({
 name: '',
 email: '',
 company: '',
 role: '',
 linkedin: '',
 cnpj: ''
 });
 const [isQueryingCnpj, setIsQueryingCnpj] = useState(false);
 const [cnpjChecked, setCnpjChecked] = useState(false);
 const [emailError, setEmailError] = useState('');

 const isDark = variant === 'dark';

 const isCorporateEmail = (email: string) => {
 const publicDomains = [
 'gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'live.com', 
 'aol.com', 'icloud.com', 'protonmail.com', 'zoho.com', 'bol.com.br', 
 'uol.com.br', 'terra.com.br', 'ig.com.br', 'yandex.com'
 ];
 const domain = email.split('@')[1]?.toLowerCase().trim();
 if (!domain) return false;
 return !publicDomains.includes(domain);
 };

 const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const val = e.target.value;
 setForm(prev => ({ ...prev, email: val }));
 
 if (val && !isCorporateEmail(val)) {
 setEmailError('Por favor, utilize o seu e-mail corporativo. Não aceitamos e-mails públicos (como Gmail, Outlook ou Yahoo) para diagnósticos oficiais da RevHackers.');
 } else {
 setEmailError('');
 }
 };

 const formatCNPJ = (value: string) => {
 const cleaned = value.replace(/\D/g, '');
 if (cleaned.length <= 2) return cleaned;
 if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
 if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
 if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
 return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
 };

 const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const rawValue = e.target.value;
 const formatted = formatCNPJ(rawValue);
 const cleanCnpj = formatted.replace(/\D/g, '');

 setForm(prev => ({ ...prev, cnpj: formatted }));

  if (cleanCnpj.length === 14) {
    setIsQueryingCnpj(true);
    let companyFound = false;

    // 1. Tenta API Interna RevHackers
    try {
      const baseUrl = import.meta.env.VITE_GCP_API_URL || 'https://api.revhackers.com';
      const response = await fetch(`${baseUrl}/v1/opportunities/lookup?cnpj=${cleanCnpj}`);
      if (response.ok) {
        const result = await response.json();
        if (result.data && (result.data.company_name || result.data.razao_social)) {
          setForm(prev => ({
            ...prev,
            company: result.data.company_name || result.data.razao_social,
          }));
          setCnpjChecked(true);
          companyFound = true;
        }
      }
    } catch (err) {
      console.warn('[DiagnosticForm] Falha na API interna, tentando BrasilAPI fallback:', err);
    }

    // 2. Fallback público (BrasilAPI)
    if (!companyFound) {
      try {
        const fallbackRes = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const name = fallbackData.nome_fantasia || fallbackData.razao_social;
          if (name) {
            setForm(prev => ({ ...prev, company: name }));
            setCnpjChecked(true);
            companyFound = true;
          }
        }
      } catch (err) {
        console.error('[DiagnosticForm] Falha na BrasilAPI:', err);
      }
    }

    setIsQueryingCnpj(false);
  } else {
    setCnpjChecked(false);
  }
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!isCorporateEmail(form.email)) {
 setEmailError('Por favor, utilize o seu e-mail corporativo. Não aceitamos e-mails públicos para diagnósticos oficiais.');
 return;
 }
 onSubmit({ ...form, role: form.role || diagnosticType });
 };

 const inputClasses = "h-11 w-full text-sm bg-white border border-zinc-200 rounded-lg px-3 focus:border-zinc-400 focus:ring-0 transition-all text-zinc-900 placeholder:text-zinc-400";

 const labelClasses = "text-sm font-medium text-zinc-700 block mb-2";

 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="w-full max-w-xl mx-auto"
 >
 <div className="p-0 animate-fade-in box-content">
 <form onSubmit={handleSubmit} className="space-y-3">
 <div className="flex flex-col gap-y-3">
 <div className="space-y-1.5">
 <Label className={labelClasses}>Nome Completo</Label>
 <Input required className={inputClasses} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: João Silva" />
 </div>
 <div className="space-y-1.5">
 <Label className={labelClasses}>E-mail Corporativo</Label>
 <Input 
 required 
 type="email" 
 className={`${inputClasses} ${emailError ? 'border-red-500 focus:border-red-500' : ''}`} 
 value={form.email} 
 onChange={handleEmailChange} 
 placeholder="nome@empresa.com" 
 />
 {emailError && (
 <p className="text-xs text-red-500 font-medium pl-0.5 mt-1 leading-normal">
 {emailError}
 </p>
 )}
 </div>
 <div className="space-y-1.5">
 <div className="flex items-center justify-between">
 <Label className={labelClasses}>CNPJ da Empresa (Preenchimento Automático)</Label>
 {isQueryingCnpj && (
 <span className="text-[10px] font-sans text-zinc-500 flex items-center gap-1">
 <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Buscando...
 </span>
 )}
 {cnpjChecked && (
 <p className="text-[#00CC6A] text-xs font-medium">Dados verificados</p>
 )}
 </div>
 <Input
 className={inputClasses}
 value={form.cnpj || ''}
 onChange={handleCnpjChange}
 maxLength={18}
 placeholder="00.000.000/0000-00"
 />
 </div>
 <div className="space-y-1.5">
 <Label className={labelClasses}>Nome da Empresa</Label>
 <Input required className={inputClasses} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Nome da sua Organização" />
 </div>
 <div className="space-y-1.5">
 <Label className={labelClasses}>Cargo Estratégico</Label>
 <Select onValueChange={val => setForm({ ...form, role: val })}>
 <SelectTrigger className={inputClasses}>
 <SelectValue placeholder="Selecione seu papel" />
 </SelectTrigger>
 <SelectContent className="bg-white border border-zinc-200 text-zinc-900 rounded-lg shadow-sm">
 <SelectItem value="executivo-senior" className="cursor-pointer focus:bg-zinc-100 focus:text-zinc-900">Executivo sênior</SelectItem>
 <SelectItem value="socio-vp" className="cursor-pointer focus:bg-zinc-100 focus:text-zinc-900">Sócio / VP</SelectItem>
 <SelectItem value="chefe-diretor" className="cursor-pointer focus:bg-zinc-100 focus:text-zinc-900">Chefe / Diretor</SelectItem>
 <SelectItem value="gerente-lider" className="cursor-pointer focus:bg-zinc-100 focus:text-zinc-900">Gerente / Líder de equipe</SelectItem>
 <SelectItem value="especialista-consultor" className="cursor-pointer focus:bg-zinc-100 focus:text-zinc-900">Especialista / Consultor</SelectItem>
 <SelectItem value="colaborador-individual" className="cursor-pointer focus:bg-zinc-100 focus:text-zinc-900">Colaborador individual</SelectItem>
 <SelectItem value="autonomo" className="cursor-pointer focus:bg-zinc-100 focus:text-zinc-900">Autônomo</SelectItem>
 <SelectItem value="estudante" className="cursor-pointer focus:bg-zinc-100 focus:text-zinc-900">Estudante</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {showLinkedin && (
 <div className="space-y-1.5">
 <Label className={labelClasses}>Perfil LinkedIn</Label>
 <div className="flex items-stretch transition-all overflow-hidden border border-zinc-200 rounded-lg bg-white h-11 focus-within:border-zinc-400">
 <div className="px-3 flex items-center gap-2 border-r border-zinc-200 select-none bg-zinc-50 text-zinc-500">
 <Linkedin className="w-3.5 h-3.5" />
 <span className="text-xs font-sans font-medium">linkedin.com/in/</span>
 </div>
 <Input
 required
 className="border-0 h-full bg-transparent text-sm px-3 focus:ring-0 w-full font-medium"
 value={form.linkedin}
 onChange={e => setForm({ ...form, linkedin: e.target.value })}
 placeholder="seu-perfil"
 />
 </div>
 </div>
 )}
 </div>

 <div className="pt-4 flex flex-col items-center gap-4">
 <Button
 type="submit"
 disabled={isSubmitting || !!emailError}
 className="w-full px-16 h-11 bg-[#00CC6A] text-black font-semibold rounded-lg transition-all border border-[#00CC6A] hover:bg-[#00b35c]"
 >
 {isSubmitting ? 'Processando dados...' : 'Liberar Relatório'}
 </Button>
 <div className="flex items-center gap-2 text-xs text-zinc-400">
 <div className="w-1.5 h-1.5 bg-revgreen rounded-full" />
 Ambiente Seguro & Criptografado
 </div>
 </div>
 </form>
 </div>
 </motion.div>
 );
};
