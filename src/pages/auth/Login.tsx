import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

// Subdominios que sao exclusivos do painel admin - sempre mostram Google login
const APP_SUBDOMAINS = ['app', 'admin'];
const isAppSubdomain = APP_SUBDOMAINS.includes(window.location.hostname.split('.')[0]);

import PageLayout from '@/components/layout/PageLayout';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { signInWithPassword, signInWithGoogle, isGoogleAuthEnabled, user, userRole, isProfileLoading, isRecoveringPassword } = useAuth();
    const showGoogleLogin = isGoogleAuthEnabled || isAppSubdomain;
    const navigate = useNavigate();

    useEffect(() => {
        if (user && !isRecoveringPassword && !isProfileLoading) {
            if (userRole === 'super_admin' || userRole === 'admin') {
                navigate('/admin');
            } else if (userRole === 'user') {
                setError('Sua conta não possui privilégios de acesso ao painel de administração.');
                setLoading(false);
            }
        }
    }, [user, userRole, isProfileLoading, isRecoveringPassword, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = await signInWithPassword(email, password);

        if (result.error) {
            setError('Credenciais inválidas. Tente novamente.');
            setLoading(false);
        } else {
            navigate('/admin');
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        const result = await signInWithGoogle();
        if (result.error) {
            let msg = result.error.message || '';
            if (msg.includes('api-key-not-valid') || msg.includes('apiKey')) {
                msg = 'O login via Google em ambiente local requer a chave VITE_FIREBASE_API_KEY. Utilize o login por e-mail e senha abaixo.';
            } else if (msg.includes('popup-closed-by-user')) {
                msg = 'A janela de autenticação do Google foi fechada.';
            } else {
                msg = 'Não foi possível completar a autenticação com Google. Tente via e-mail e senha.';
            }
            setError(msg);
            setLoading(false);
        } else {
            navigate('/admin');
        }
    };

    return (
        <PageLayout hideFooter>
            <div className="bg-white min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-16 px-6">
                
                {/* Form Card Clean em Fundo Branco */}
                <div className="w-full max-w-md mx-auto animate-fade-in">
                    <div className="bg-white border border-zinc-200 p-8 sm:p-10 rounded-2xl shadow-sm space-y-6">
                        
                        {/* Cabeçalho Limpo */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                Acesse sua conta
                            </h1>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Insira suas credenciais para acessar o painel corporativo.
                            </p>
                        </div>

                        {/* Form Section Híbrida: Google + Email/Senha simultâneos */}
                        <div className="space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg text-center font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Botão Google Auth */}
                            <Button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200 h-10 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2.5 shadow-xs"
                                disabled={loading}
                            >
                                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Entrar com Google</span>
                            </Button>

                            {/* Divisor Visual Discreto */}
                            <div className="relative flex items-center justify-center">
                                <div className="w-full border-t border-zinc-100" />
                                <span className="absolute bg-white px-3 text-[11px] font-medium text-zinc-400">
                                    ou com e-mail e senha
                                </span>
                            </div>

                            {/* Formulário Tradicional E-mail + Senha */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-700">
                                        E-mail Corporativo
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="seu@empresa.com"
                                        value={email}
                                        onChange={(e) => {
                                            if (error) setError(null);
                                            setEmail(e.target.value);
                                        }}
                                        className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-10 rounded-lg focus:border-zinc-400 focus:ring-0 transition-all text-xs px-3 shadow-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-semibold text-zinc-700">
                                            Senha
                                        </label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                                        >
                                            Esqueceu a senha?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-10 rounded-lg focus:border-zinc-400 focus:ring-0 transition-all text-xs px-3 pr-10 shadow-none"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#00CC6A] text-black hover:bg-[#00b35c] h-11 font-semibold text-xs rounded-lg border border-[#00CC6A] transition-all mt-4 flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                                    ) : (
                                        <>
                                            <span>Entrar</span>
                                            <ArrowRight className="w-4 h-4 text-black" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Login;
