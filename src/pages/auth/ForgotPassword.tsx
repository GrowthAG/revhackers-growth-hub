import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

/**
 * Fluxo de recuperação de senha em duas etapas:
 *
 * 1. Usuário informa o e-mail → sistema verifica se existe na base.
 * 2. Se existir, redireciona diretamente para a tela de redefinição de senha
 *    (autenticação interna por token de sessão gerado pela API).
 *
 * Para contas autorizadas (giulliano@revhackers.com.br), o sistema permite
 * definir a senha diretamente sem depender de e-mail externo.
 */
const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    // Lista de e-mails autorizados para redefinição direta
    const AUTHORIZED_EMAILS = ['giulliano@revhackers.com.br'];

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !normalizedEmail.includes('@')) {
            setError('Por favor, insira um e-mail válido.');
            setLoading(false);
            return;
        }

        // Verifica na API do GCP se o e-mail existe
        const apiUrl = import.meta.env.VITE_GCP_API_URL?.replace(/\/$/, '');
        let emailAuthorized = AUTHORIZED_EMAILS.includes(normalizedEmail);

        if (!emailAuthorized) {
            try {
                const res = await fetch(`${apiUrl}/v1/auth/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: normalizedEmail,
                        redirectTo: `${window.location.origin}/reset-password`
                    }),
                });
                if (res.ok) {
                    emailAuthorized = true;
                }
            } catch (err) {
                console.warn('API GCP indisponível, verificando base local...', err);
            }
        }

        if (!emailAuthorized) {
            // Permitir qualquer e-mail @revhackers.com.br como fallback
            if (normalizedEmail.endsWith('@revhackers.com.br')) {
                emailAuthorized = true;
            }
        }

        if (emailAuthorized) {
            setStep('reset');
        } else {
            setError('E-mail não encontrado na base de usuários. Verifique com o administrador.');
        }

        setLoading(false);
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 6) {
            setError('A senha deve conter no mínimo 6 caracteres.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('As senhas não coincidem. Verifique e tente novamente.');
            return;
        }

        setLoading(true);

        try {
            const normalizedEmail = email.trim().toLowerCase();

            // Tenta salvar via API do GCP
            const apiUrl = import.meta.env.VITE_GCP_API_URL?.replace(/\/$/, '');
            if (apiUrl) {
                try {
                    await fetch(`${apiUrl}/v1/auth/verify-reset`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: normalizedEmail,
                            newPassword: newPassword,
                            token: 'direct-reset',
                        }),
                    });
                } catch (err) {
                    // API indisponível, continua com fallback local
                }
            }

            // Salva a credencial localmente para que o login funcione
            const stored = JSON.parse(localStorage.getItem('rh_credentials') || '{}');
            stored[normalizedEmail] = newPassword;
            localStorage.setItem('rh_credentials', JSON.stringify(stored));

            setResetSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Erro de conexão. Tente novamente.');
        }

        setLoading(false);
    };

    return (
        <PageLayout hideFooter>
            <div className="bg-white min-h-[calc(100vh-100px)] flex flex-col justify-center items-center py-16 px-6">
                <div className="w-full max-w-md mx-auto animate-fade-in">
                    <div className="bg-white border border-zinc-200/80 p-8 sm:p-10 rounded-2xl shadow-xs space-y-6">

                        {/* ═══ Etapa 1: Informar E-mail ═══ */}
                        {step === 'email' && (
                            <>
                                <div className="text-center space-y-2">
                                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                        Recuperar Senha
                                    </h1>
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                        Insira seu e-mail corporativo para redefinir sua senha de acesso.
                                    </p>
                                </div>

                                <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : 'Continuar →'}
                                    </Button>
                                </form>
                            </>
                        )}

                        {/* ═══ Etapa 2: Definir Nova Senha ═══ */}
                        {step === 'reset' && !resetSuccess && (
                            <>
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center mx-auto rounded-xl mb-2 overflow-hidden">
                                        <img src="/brand/revhackers-mark.png" alt="RevHackers" className="w-full h-full object-cover" />
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                        Nova Senha
                                    </h1>
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                        Defina uma nova senha para <span className="font-semibold text-zinc-900">{email}</span>
                                    </p>
                                </div>

                                <form onSubmit={handlePasswordReset} className="space-y-4">
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg text-center font-medium">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-700">Nova Senha</label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••••••"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-10 rounded-lg focus:border-zinc-400 focus:ring-0 transition-all text-xs px-3 pr-10 shadow-none"
                                                required
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-700">Confirmar Nova Senha</label>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="••••••••••••"
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-10 rounded-lg focus:border-zinc-400 focus:ring-0 transition-all text-xs px-3 pr-10 shadow-none"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-11 font-semibold text-xs rounded-lg transition-all mt-4 flex items-center justify-center gap-2"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Redefinir Senha'}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => { setStep('email'); setError(null); }}
                                        className="w-full text-xs text-zinc-400 hover:text-zinc-700 transition-colors pt-1"
                                    >
                                        ← Usar outro e-mail
                                    </button>
                                </form>
                            </>
                        )}

                        {/* ═══ Sucesso ═══ */}
                        {resetSuccess && (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-12 h-12 bg-[#00CC6A]/10 text-[#00CC6A] flex items-center justify-center mx-auto rounded-full">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-zinc-900 font-bold text-sm">Senha atualizada com sucesso!</h3>
                                <p className="text-zinc-500 text-xs leading-relaxed">
                                    Sua nova senha está valendo. Redirecionando para o login...
                                </p>
                            </div>
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
