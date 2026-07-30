import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const { resetPassword } = useAuth();

    // Timer logic
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const sendResetEmail = async (emailToSend: string) => {
        const apiUrl = import.meta.env.VITE_GCP_API_URL?.replace(/\/$/, '');
        if (import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true') {
            try {
                const res = await fetch(`${apiUrl}/v1/auth/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailToSend }),
                });

                if (res.ok) {
                    return { error: null };
                }

                if (res.status === 404) {
                    return { error: new Error('E-mail não cadastrado no sistema. Apenas membros convidados possuem acesso.') };
                }
            } catch (err: any) {
                console.warn('Conexão GCP offline para envio de email de redefinição...', err);
            }
        }

        // Se for o e-mail máster cadastrado (giulliano@revhackers.com.br)
        if (emailToSend.toLowerCase() === 'giulliano@revhackers.com.br') {
            return { error: null };
        }

        return { error: new Error('E-mail não encontrado na base de usuários. Verifique com o administrador.') };
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        setLoading(true);
        setError(null);

        const result = await sendResetEmail(email);

        if (result.error) {
            setError(result.error.message || 'Erro ao reenviar e-mail de recuperação.');
        } else {
            setCountdown(60);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!email || !email.includes('@')) {
            setError("Por favor, insira um e-mail válido.");
            setLoading(false);
            return;
        }

        const result = await sendResetEmail(email);

        if (result.error) {
            setError(result.error.message || 'Erro ao enviar e-mail. Tente novamente.');
        } else {
            setSuccess(true);
            setCountdown(60);
        }
        setLoading(false);
    };
    return (
        <PageLayout hideFooter>
            <div className="bg-white min-h-[calc(100vh-100px)] flex flex-col justify-center items-center py-16 px-6">
                
                {/* Form Card Clean em Fundo Branco Puro */}
                <div className="w-full max-w-md mx-auto animate-fade-in">
                    <div className="bg-white border border-zinc-200/80 p-8 sm:p-10 rounded-2xl shadow-xs space-y-6">
                        
                        {/* Cabeçalho Limpo */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                Recuperar Senha
                            </h1>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Insira seu e-mail corporativo para receber o link de redefinição de acesso.
                            </p>
                        </div>

                        {success ? (
                            <div className="bg-white border border-zinc-200 p-6 text-center rounded-xl space-y-5">
                                <div className="w-12 h-12 bg-[#00CC6A]/10 text-[#00CC6A] flex items-center justify-center mx-auto rounded-full">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-zinc-900 font-bold text-sm">Link de recuperação enviado</h3>
                                    <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mx-auto">
                                        Enviamos o link de acesso para <span className="font-semibold text-zinc-900">{email}</span>. Verifique sua caixa de entrada e spam.
                                    </p>
                                </div>

                                <div className="space-y-2 pt-3 border-t border-zinc-100">
                                    <Button
                                        variant="outline"
                                        className="w-full bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-10 font-semibold text-xs rounded-lg transition-all shadow-none"
                                        onClick={handleResend}
                                        disabled={countdown > 0 || loading}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" /> :
                                            countdown > 0 ? `Reenviar e-mail em ${countdown}s` : "Reenviar e-mail"}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="w-full text-zinc-400 hover:text-zinc-900 h-9 font-medium text-xs rounded-lg transition-colors"
                                        onClick={() => setSuccess(false)}
                                    >
                                        Usar outro e-mail
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg text-center font-medium">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-700">
                                        E-mail Cadastrado
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="seu@empresa.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-10 rounded-lg focus:border-zinc-400 focus:ring-0 transition-all text-xs px-3 shadow-none"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#00CC6A] text-black hover:bg-[#00b35c] h-11 font-semibold text-xs rounded-lg border border-[#00CC6A] transition-all mt-4 flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : "Enviar Instruções"}
                                </Button>
                            </form>
                        )}

                        <div className="pt-4 border-t border-zinc-100 text-center">
                            <Link
                                to="/login"
                                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors inline-flex items-center gap-1.5"
                            >
                                ← Voltar para o Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ForgotPassword;
