import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LeadCaptureModal = ({ isOpen, onClose }: LeadCaptureModalProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await submitPublicDiagnostic(
                { name, email, phone, company, role },
                { source: 'header_booking_request', type: 'lead_capture' },
                0,
                { level: "Lead", description: "Solicitação de Agendamento", action: "Agendar", color: "blue" },
                'lead_capture'
            );

            toast({
                title: "Solicitação enviada!",
                description: "Redirecionando para o calendário de agendamento...",
                className: "bg-zinc-950 text-white border-zinc-800"
            });

            setTimeout(() => {
                onClose();
                navigate('/booking');
            }, 600);

        } catch (error) {
            console.error("Lead submission error:", error);
            toast({
                variant: 'destructive',
                title: "Erro no envio",
                description: "Não foi possível enviar seus dados. Tente novamente."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-white border-zinc-200/80 p-0 overflow-hidden rounded-2xl shadow-xl">
                <DialogHeader className="p-6 pb-5 bg-black border-b border-zinc-900">
                    <DialogTitle className="text-lg font-extrabold text-white leading-tight">
                        Auditoria de Vazamento de Receita <span className="text-[#00CC6A]">& GTM Engineering</span>
                    </DialogTitle>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-normal">
                        Avaliamos os gargalos ocultos de CAC e LTV da sua operação B2B e desenhamos a rota de aceleração com IA e RevOps.
                    </p>
                </DialogHeader>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-800">Nome Completo *</label>
                            <Input
                                placeholder="Seu nome completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-white border-zinc-200 h-11 text-sm rounded-lg focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-800">E-mail Corporativo *</label>
                            <Input
                                type="email"
                                placeholder="voce@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white border-zinc-200 h-11 text-sm rounded-lg focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-800">Telefone / WhatsApp *</label>
                            <Input
                                placeholder="(11) 99999-9999"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="bg-white border-zinc-200 h-11 text-sm rounded-lg focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-800">Empresa *</label>
                                <Input
                                    placeholder="Nome da sua empresa"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    required
                                    className="bg-white border-zinc-200 h-11 text-sm rounded-lg focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-800">Cargo *</label>
                                <Input
                                    placeholder="Ex: CEO, Director"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                    className="bg-white border-zinc-200 h-11 text-sm rounded-lg focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-lg h-11 transition-all mt-2"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" /> : "Agendar Auditoria Técnica →"}
                        </Button>

                        <p className="text-[11px] text-center text-zinc-400 mt-4 leading-normal">
                            🔒 Análise técnica confidencial. Não enviamos spam.
                        </p>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LeadCaptureModal;
