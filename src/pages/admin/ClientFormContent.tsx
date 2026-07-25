import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
    createClient,
    updateClient,
    getClientById,
    type ClientInsert
} from '@/api/clients';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Building2, User, Mail, Globe, Search, Upload, ArrowRight, Lock, Activity, Cloud } from 'lucide-react';
import { uploadImageToSupabase } from '@/utils/uploadImageToSupabase';

interface FormData {
    name: string;
    trade_name?: string;
    email: string;
    company?: string;
    cnpj?: string;
    cep?: string;
    address?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    website?: string;
    logo_url?: string;
    segment?: string;
    company_size?: string;
    status: 'onboarding' | 'active' | 'churned';
}

const formSchema = zod.object({
    name: zod.string().min(1, 'Obrigatório'),
    trade_name: zod.string().optional(),
    email: zod.string().email('E-mail inválido'),
    company: zod.string().optional(),
    cnpj: zod.string().optional(),
    cep: zod.string().optional(),
    address: zod.string().optional(),
    number: zod.string().optional(),
    complement: zod.string().optional(),
    neighborhood: zod.string().optional(),
    city: zod.string().optional(),
    state: zod.string().optional(),
    website: zod.string().optional(),
    logo_url: zod.string().optional(),
    segment: zod.string().optional(),
    company_size: zod.string().optional(),
    status: zod.enum(['onboarding', 'active', 'churned'])
});

interface ClientFormContentProps {
    initialData?: FormData;
    isEditing?: boolean;
    mode?: 'admin' | 'public';
    clientId?: string;
    onSuccess?: (client: any) => void;
    onCancel?: () => void;
}

const ClientFormContent = ({ initialData, isEditing = false, mode = 'admin', clientId, onSuccess, onCancel }: ClientFormContentProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingClient, setLoadingClient] = useState(!!clientId && !initialData);
    const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [isProvisioning, setIsProvisioning] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            status: 'onboarding'
        }
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingLogo(true);
        try {
            const publicUrl = await uploadImageToSupabase(file);
            if (publicUrl) {
                setValue('logo_url', publicUrl);
                toast({ title: 'Logo atualizado com sucesso!' });
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro ao fazer upload da logo', variant: 'destructive' });
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleProvisionSubaccount = async () => {
        if (!clientId) return;
        setIsProvisioning(true);
        toast({ title: 'Iniciando conectividade...', description: 'Acionando API de Provisionamento.' });

        try {
            const { data, error } = await supabase.functions.invoke('ghl-create-location', {
                body: { clientId }
            });

            if (error) throw new Error(error.message);
            if (data?.error) throw new Error(data.error);

            toast({ title: 'Subconta provisionada!', description: 'Infraestrutura configurada com sucesso.' });
        } catch (err: any) {
            console.error(err);
            toast({ title: 'Falha no Provisionamento', description: err.message, variant: 'destructive' });
        } finally {
            setIsProvisioning(false);
        }
    };

    const discoverLogo = async (domain: string, shouldFillWebsite = false) => {
        if (!domain) return;
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

        try {
            const logoUrl = `https://logo.clearbit.com/${cleanDomain}`;
            const imgCheck = new Image();
            imgCheck.src = logoUrl;
            imgCheck.onload = () => {
                setValue('logo_url', logoUrl);
                if (shouldFillWebsite) {
                    setValue('website', `www.${cleanDomain}`);
                }
                toast({
                    title: 'Asset Localizado',
                    description: 'Logo e domínio validados automaticamente.',
                });
            };
        } catch (e) {
            console.log('Logo auto-discovery failed', e);
        }
    };

    const handleCnpjLookup = async (cnpjValue: string) => {
        const cleanCnpj = cnpjValue.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return;

        setIsSearchingCnpj(true);
        try {
            let data;
            try {
                const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
                if (!response.ok) throw new Error('Direct fetch failed');
                data = await response.json();
            } catch (directError) {
                const { data: edgeData, error } = await supabase.functions.invoke('fetch-cnpj', {
                    body: { cnpj: cleanCnpj }
                });
                if (error || !edgeData) throw error || new Error('Edge function failed');
                data = edgeData;
            }

            if (!data) throw new Error('Dados não retornados');

            if (data.razao_social) setValue('company', data.razao_social);
            if (data.qsa && data.qsa.length > 0 && data.qsa[0].nome_socio) {
                setValue('name', data.qsa[0].nome_socio);
            }
            if (data.nome_fantasia) setValue('trade_name', data.nome_fantasia);
            if (data.cep) setValue('cep', data.cep);
            if (data.logradouro) setValue('address', data.logradouro);
            if (data.numero) setValue('number', data.numero);
            if (data.complemento) setValue('complement', data.complemento);
            if (data.bairro) setValue('neighborhood', data.bairro);
            if (data.municipio) setValue('city', data.municipio);
            if (data.uf) setValue('state', data.uf);

            if (data.email) {
                setValue('email', data.email.toLowerCase());
                if (data.email.includes('@')) {
                    const domain = data.email.split('@')[1];
                    const generalDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'uol.com.br', 'bol.com.br', 'terra.com.br'];
                    if (!generalDomains.includes(domain)) {
                        discoverLogo(domain, true);
                    }
                }
            }

            toast({
                title: 'Dados Localizados',
                description: 'Preenchimento corporativo automático realizado.',
            });
        } catch (error) {
            console.error('Erro ao buscar CNPJ:', error);
            toast({
                title: 'CNPJ Não Encontrado',
                description: 'Preencha os dados manualmente.',
                variant: 'destructive'
            });
        } finally {
            setIsSearchingCnpj(false);
        }
    };

    useEffect(() => {
        if (clientId && !initialData) {
            loadClient();
        } else if (initialData) {
            for (const key in initialData) {
                if (Object.prototype.hasOwnProperty.call(initialData, key)) {
                    setValue(key as keyof FormData, initialData[key as keyof FormData]);
                }
            }
        }
    }, [clientId, initialData]);

    const loadClient = async () => {
        try {
            setLoadingClient(true);
            const client = await getClientById(clientId!);
            if (client) {
                setValue('name', client.name);
                setValue('email', client.email);
                setValue('company', client.company || '');
                setValue('website', client.website || '');
                setValue('status', client.status);
                setValue('cnpj', client.cnpj || '');
                setValue('cep', client.cep || '');
                setValue('address', client.address || '');
                setValue('number', client.number || '');
                setValue('complement', client.complement || '');
                setValue('neighborhood', client.neighborhood || '');
                setValue('city', client.city || '');
                setValue('state', client.state || '');
                setValue('logo_url', client.logo_url || '');
                setValue('segment', client.segment || '');
                setValue('company_size', client.company_size || '');
            } else {
                toast({ title: 'Cliente não encontrado', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Erro ao carregar cliente', variant: 'destructive' });
        } finally {
            setLoadingClient(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const clientData: ClientInsert = {
                name: data.name,
                email: data.email,
                company: data.company || undefined,
                cnpj: data.cnpj || undefined,
                cep: data.cep || undefined,
                address: data.address || undefined,
                number: data.number || undefined,
                complement: data.complement || undefined,
                neighborhood: data.neighborhood || undefined,
                city: data.city || undefined,
                state: data.state || undefined,
                website: data.website || undefined,
                logo_url: data.logo_url || undefined,
                segment: data.segment || undefined,
                company_size: data.company_size || undefined,
                status: data.status
            };

            let result;
            if (isEditing && clientId) {
                result = await updateClient(clientId, clientData);
                toast({
                    title: 'Cliente atualizado!',
                    description: 'As alterações foram salvas na API GCP.'
                });
            } else {
                result = await createClient(clientData);
                toast({
                    title: 'Cliente cadastrado!',
                    description: 'Novo cliente criado na API GCP.'
                });
            }

            if (onSuccess && result) {
                onSuccess(result);
            }
        } catch (error: any) {
            console.error('Error saving client:', error);
            toast({
                title: 'Erro ao salvar cliente',
                description: error.message || 'Ocorreu um erro inesperado.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loadingClient) {
        return (
            <div className="flex h-64 items-center justify-center bg-white rounded-xl border border-zinc-200">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-[#00CC6A]" />
                    <span className="text-xs text-zinc-500 font-medium">Carregando dados do cliente...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl py-4 mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white border border-zinc-200 rounded-xl p-8 space-y-8 shadow-xs">
                    {/* Section 1: Consulta & Asset */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
                            <h3 className="text-xs font-mono font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                                <Search size={14} className="text-[#00CC6A]" /> Consulta Automática
                            </h3>
                            {isSearchingCnpj && (
                                <div className="text-xs font-medium text-zinc-500 flex items-center gap-2">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00CC6A]" /> Consultando CNPJ...
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-700">CNPJ Corporativo (Lookup)</Label>
                                <Input
                                    {...register('cnpj')}
                                    placeholder="00.000.000/0000-00"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.replace(/\D/g, '').length === 14) {
                                            handleCnpjLookup(val);
                                        }
                                    }}
                                    className="bg-white border-zinc-200 rounded-lg h-10 text-xs font-mono font-medium focus-visible:ring-1 focus-visible:ring-zinc-950 shadow-xs"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-700">Logo do Cliente (Asset)</Label>
                                <div
                                    className="h-24 border border-dashed border-zinc-300 rounded-lg bg-white shadow-sm/50 flex flex-col items-center justify-center relative cursor-pointer hover:bg-white shadow-sm transition-all group"
                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                >
                                    {watch('logo_url') ? (
                                        <div className="absolute inset-0 p-3 flex items-center justify-center">
                                            <img src={watch('logo_url')} className="h-full w-full object-contain" alt="Preview" />
                                            <div className="absolute inset-0 bg-zinc-950/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button type="button" variant="secondary" size="sm" className="h-7 text-xs font-medium rounded-md">Substituir</Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs font-medium rounded-md text-white hover:bg-zinc-800"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setValue('logo_url', '');
                                                    }}
                                                >
                                                    Remover
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-1.5">
                                            <Upload size={16} className="text-zinc-400 mx-auto" />
                                            <span className="text-xs font-medium text-zinc-500">Anexar ou Buscar Logo</span>
                                        </div>
                                    )}
                                    {uploadingLogo && (
                                        <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                                            <span className="text-xs font-medium text-zinc-900">Enviando logo...</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoUpload}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Identidade do Cliente */}
                    <div className="space-y-4 pt-4 border-t border-zinc-200/80">
                        <h3 className="text-xs font-mono font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                            <User size={14} className="text-zinc-600" /> Responsável & Contato
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-700">Nome Principal / Sócio *</Label>
                                <Input {...register('name')} placeholder="Nome completo do responsável" className="bg-white border-zinc-200 rounded-lg h-10 text-xs font-medium focus-visible:ring-1 focus-visible:ring-zinc-950 shadow-xs" />
                                {errors.name && <span className="text-xs text-zinc-500 font-medium">{errors.name.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-700">E-mail Corporativo *</Label>
                                <Input
                                    {...register('email')}
                                    placeholder="contato@empresa.com.br"
                                    className="bg-white border-zinc-200 rounded-lg h-10 text-xs font-medium focus-visible:ring-1 focus-visible:ring-zinc-950 shadow-xs"
                                    onBlur={(e) => {
                                        const email = e.target.value;
                                        if (email.includes('@')) {
                                            const domain = email.split('@')[1].toLowerCase();
                                            const generalDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'uol.com.br'];
                                            if (!generalDomains.includes(domain)) {
                                                if (!watch('website')) setValue('website', `www.${domain}`);
                                                discoverLogo(domain);
                                            }
                                        }
                                    }}
                                />
                                {errors.email && <span className="text-xs text-zinc-500 font-medium">{errors.email.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Dados da Empresa */}
                    <div className="space-y-4 pt-4 border-t border-zinc-200/80">
                        <h3 className="text-xs font-mono font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                            <Building2 size={14} className="text-zinc-600" /> Dados da Empresa
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-700">Razão Social</Label>
                                <Input {...register('company')} placeholder="Empresa Ltda" className="bg-white border-zinc-200 rounded-lg h-10 text-xs font-medium focus-visible:ring-1 focus-visible:ring-zinc-950 shadow-xs" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-700">Nome Fantasia</Label>
                                <Input {...register('trade_name')} placeholder="Nome de marca" className="bg-white border-zinc-200 rounded-lg h-10 text-xs font-medium focus-visible:ring-1 focus-visible:ring-zinc-950 shadow-xs" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-700">Website</Label>
                                <Input
                                    {...register('website')}
                                    placeholder="www.empresa.com.br"
                                    className="bg-white border-zinc-200 rounded-lg h-10 text-xs font-medium focus-visible:ring-1 focus-visible:ring-zinc-950 shadow-xs"
                                    onBlur={(e) => discoverLogo(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-700">Segmento de Mercado</Label>
                                <Input {...register('segment')} placeholder="Ex: SaaS / Tecnologia / B2B" className="bg-white border-zinc-200 rounded-lg h-10 text-xs font-medium focus-visible:ring-1 focus-visible:ring-zinc-950 shadow-xs" />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label className="text-xs font-medium text-zinc-700">Tamanho da Empresa</Label>
                                <Input {...register('company_size')} placeholder="Ex: 11-50 funcionários" className="bg-white border-zinc-200 rounded-lg h-10 text-xs font-medium focus-visible:ring-1 focus-visible:ring-zinc-950 shadow-xs" />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Localização */}
                    <div className="space-y-4 pt-4 border-t border-zinc-200/80">
                        <h3 className="text-xs font-mono font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                            Localização
                        </h3>

                        <div className="grid grid-cols-6 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-medium text-zinc-700">CEP</Label>
                                <Input {...register('cep')} className="bg-white shadow-sm border-zinc-200 rounded-lg h-9 text-xs font-mono font-medium" />
                            </div>
                            <div className="col-span-4 space-y-2">
                                <Label className="text-xs font-medium text-zinc-700">Logradouro</Label>
                                <Input {...register('address')} className="bg-white shadow-sm border-zinc-200 rounded-lg h-9 text-xs font-medium" />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-medium text-zinc-700">Cidade</Label>
                                <Input {...register('city')} className="bg-white shadow-sm border-zinc-200 rounded-lg h-9 text-xs font-medium" />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-medium text-zinc-700">Estado / UF</Label>
                                <Input {...register('state')} className="bg-white shadow-sm border-zinc-200 rounded-lg h-9 text-xs font-medium" />
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Status da Conta */}
                    {mode === 'admin' && (
                        <div className="space-y-4 pt-4 border-t border-zinc-200/80">
                            <h3 className="text-xs font-mono font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                                Status da Operação
                            </h3>
                            <div className="max-w-xs">
                                <Select
                                    onValueChange={(value: any) => setValue('status', value)}
                                    defaultValue={watch('status')}
                                >
                                    <SelectTrigger className="h-10 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-900 focus:ring-1 focus:ring-zinc-950">
                                        <SelectValue placeholder="Selecione o status..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-zinc-200 shadow-sm">
                                        <SelectItem value="active" className="text-xs py-2 font-medium">Ativo (Em operação)</SelectItem>
                                        <SelectItem value="onboarding" className="text-xs py-2 font-medium">Onboarding (Em andamento)</SelectItem>
                                        <SelectItem value="churned" className="text-xs py-2 font-medium">Inativo / Encerrado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Subconta Funnels / Cloud Auth */}
                {mode === 'admin' && isEditing && clientId && (
                    <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-xs">
                        <div>
                            <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                                <Cloud size={16} className="text-zinc-600" /> Infraestrutura & Conectividade
                            </h4>
                            <p className="text-xs text-zinc-500 mt-1 max-w-lg">
                                Dispare o provisionamento de ambiente exclusivo da conta na infraestrutura GCP.
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={handleProvisionSubaccount}
                            disabled={isProvisioning}
                            className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium h-9 px-4 rounded-lg text-xs tracking-wide"
                        >
                            {isProvisioning ? <Loader2 className="animate-spin mr-2" size={14}/> : <Cloud className="mr-2" size={14}/>}
                            Provisionar Subconta
                        </Button>
                    </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="h-10 rounded-lg border-zinc-200 text-xs font-medium px-5 hover:bg-white shadow-sm transition-all shadow-xs"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    )}
                    <Button
                        type="submit"
                        className="h-10 rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 transition-all font-medium text-xs px-6 shadow-xs gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-[#00CC6A]" />
                        ) : (
                            <Save size={14} className="text-[#00CC6A]" />
                        )}
                        {isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ClientFormContent;
