import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

// Subdominios que sao exclusivos do painel admin - sempre mostram Google login
const APP_SUBDOMAINS = ['app', 'admin'];
const isAppSubdomain = APP_SUBDOMAINS.includes(window.location.hostname.split('.')[0]);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { signInWithPassword, signInWithGoogle, isGoogleAuthEnabled, user, userRole, isProfileLoading, isRecoveringPassword } = useAuth();
    // No subdominio app. sempre exibe Google login (independente da flag de env)
    const showGoogleLogin = isGoogleAuthEnabled || isAppSubdomain;
    const navigate = useNavigate();

    // Redirecionar se já estiver logado (exceto se estiver em fluxo de recuperação)
    useEffect(() => {
        if (user && !isRecoveringPassword && !isProfileLoading) {
            if (userRole === 'super_admin' || userRole === 'admin') {
                navigate('/admin');
            } else if (userRole === 'user') {
                // Previne Loop Infinito. Se tentar entrar no admin sem permissão, quebra o redirect
                setError('Sua conta não possui privilégios de acesso ao painel de administração.');
                setLoading(false); // PARA O SPINNER!
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
            // A responsabilidade de check de role agora cai no useAuth state update via useEffect acima.
            // Para não piscar erro se der sucesso, deixamos o AuthContext e o useEffect guiarem.
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        const result = await signInWithGoogle();
        if (result.error) {
            setError(result.error.message || 'Não foi possível entrar com Google.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between p-6 relative selection:bg-[#00CC6A] selection:text-white">
            
            {/* Header Brand */}
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 pt-4">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-6 h-6 bg-[#00CC6A] rounded-sm group-hover:scale-105 transition-transform flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-sm" />
                    </div>
                    <span className="font-semibold text-lg text-zinc-900 tracking-tight">
                        RevHackers
                    </span>
                </Link>
            </div>

            {/* Login Card Component */}
            <div className="w-full max-w-[400px] mx-auto z-10 my-auto py-12 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm relative group">
                    
                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-8 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-2">
                            Acesse sua conta
                        </h1>
                        <p className="text-zinc-500 text-sm">
                            Bem-vindo de volta! Por favor, insira seus dados.
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-6">
                        {showGoogleLogin && error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        {showGoogleLogin && (
                            <Button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200 h-11 font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                                ) : (
                                    <>
                                        {/* Simple Google SVG icon */}
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            <path d="M1 1h22v22H1z" fill="none" />
                                        </svg>
                                        <span>Entrar com Google</span>
                                    </>
                                )}
                            </Button>
                        )}

                        <form onSubmit={handleSubmit} className={showGoogleLogin ? 'hidden' : 'space-y-4'}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-11 rounded-lg focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all text-sm px-3 shadow-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-zinc-700">
                                        Senha
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
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
                                        className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-11 rounded-lg focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all text-sm px-3 pr-10 shadow-sm"
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
                                className="w-full bg-[#00CC6A] text-white hover:bg-[#00CC6A]/90 h-11 font-medium text-sm rounded-lg border-none transition-all mt-6 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                ) : (
                                    <>
                                        <span>Entrar</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 z-10 pt-4 pb-2 text-zinc-500 text-sm border-t border-zinc-100">
                <span>&copy; {new Date().getFullYear()} RevHackers. Todos os direitos reservados.</span>
                <div className="flex items-center gap-6">
                    <Link to="/privacidade" className="hover:text-zinc-900 transition-colors">Privacidade</Link>
                    <Link to="/termos" className="hover:text-zinc-900 transition-colors">Termos de Uso</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
