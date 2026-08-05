import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export const SetupPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const email = searchParams.get('email') || '';
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || password.length < 6) {
            toast({
                title: 'Senha muito curta',
                description: 'A senha deve conter no mínimo 6 caracteres.',
                variant: 'destructive'
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: 'Senhas não coincidem',
                description: 'Por favor, digite a mesma senha nos dois campos.',
                variant: 'destructive'
            });
            return;
        }

        setLoading(true);

        try {
            // Simulate / Call password setup token validation
            await new Promise(resolve => setTimeout(resolve, 1200));

            setCompleted(true);
            toast({
                title: 'Senha Criada com Sucesso!',
                description: 'Sua conta no EulerApp foi ativada. Redirecionando...'
            });

            setTimeout(() => {
                navigate(`/login?email=${encodeURIComponent(email)}&welcome=true`);
            }, 1800);
        } catch (err: any) {
            toast({
                title: 'Erro ao ativar conta',
                description: err?.message || 'Token expirado ou inválido.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
            {/* Ambient Background Lights */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00CC6A]/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
                
                {/* Header Logo & Badges */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 mb-2 shadow-inner">
                        <ShieldCheck className="w-7 h-7 text-[#00CC6A]" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#00CC6A]/10 text-[#00CC6A] border border-[#00CC6A]/20">
                        <Sparkles className="w-3 h-3" /> PRIMEIRO ACESSO EULERAPP
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Crie Sua Senha de Acesso
                    </h1>
                    <p className="text-xs text-zinc-400">
                        Defina a sua senha para ativar o seu perfil corporativo no <span className="text-zinc-200 font-semibold">{email || 'EulerApp Platform'}</span>.
                    </p>
                </div>

                {completed ? (
                    <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-12 h-12 rounded-full bg-[#00CC6A]/20 border border-[#00CC6A]/30 text-[#00CC6A] flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white">Conta Ativada com Sucesso!</h3>
                            <p className="text-xs text-zinc-400">
                                Redirecionando para a sua área de trabalho no EulerApp...
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email-display" className="text-xs font-semibold text-zinc-300">
                                E-mail Corporativo
                            </Label>
                            <Input
                                id="email-display"
                                type="email"
                                value={email}
                                disabled
                                className="bg-zinc-950/80 border-zinc-800 text-zinc-400 text-xs h-10 rounded-xl cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold text-zinc-300">
                                Nova Senha (mínimo 6 caracteres)
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-zinc-950 border-zinc-800 text-white text-xs h-10 pl-10 rounded-xl focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-zinc-300">
                                Confirmar Nova Senha
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-zinc-950 border-zinc-800 text-white text-xs h-10 pl-10 rounded-xl focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-[#00CC6A] hover:bg-[#00B35D] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#00CC6A]/20 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    ATIVANDO SUA CONTA...
                                </>
                            ) : (
                                <>
                                    CRIAR SENHA & ACESSAR EULERAPP <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>
                )}

                <div className="pt-4 border-t border-zinc-800/80 text-center">
                    <p className="text-[11px] text-zinc-500">
                        Protegido por criptografia GCP Identity & RevHackers Security.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SetupPasswordPage;
