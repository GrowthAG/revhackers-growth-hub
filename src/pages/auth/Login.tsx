import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between p-6 relative overflow-hidden selection:bg-[#00CC6A] selection:text-black">
            
            {/* Minimalist Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b15_1px,transparent_1px),linear-gradient(to_bottom,#18181b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00CC6A]/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Header Brand */}
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 pt-4">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-2 h-2 bg-[#00CC6A] group-hover:scale-125 transition-transform" />
                    <span className="font-mono text-xs font-black tracking-[0.3em] uppercase text-zinc-400 group-hover:text-white transition-colors">
                        REVHACKERS // PLATFORM
                    </span>
                </Link>
                <div className="flex items-center gap-2 border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00CC6A] animate-pulse" />
                    <span className="font-mono text-3xs font-semibold text-zinc-400 uppercase tracking-widest">GCP Cloud SQL Active</span>
                </div>
            </div>

            {/* Login Card Component */}
            <div className="w-full max-w-[440px] mx-auto z-10 my-auto py-12 animate-in fade-in zoom-in-95 duration-700">
                <div className="bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-xl p-8 lg:p-10 rounded-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] relative group">
                    
                    <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#00CC6A]/50 to-transparent" />

                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-[#00CC6A]/10 border border-[#00CC6A]/20 px-3 py-1 rounded-full mb-6">
                            <Lock className="w-3 h-3 text-[#00CC6A]" />
                            <span className="text-3xs font-black uppercase tracking-[0.2em] text-[#00CC6A]">Acesso Restrito</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase mb-2">
                            Autenticação OS
                        </h1>
                        <p className="text-zinc-400 text-xs font-light tracking-wide leading-relaxed">
                            Entre com suas credenciais corporativas da suite.
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-6">
                        {showGoogleLogin && error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono p-3.5 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        {showGoogleLogin && (
                            <Button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full bg-white text-zinc-950 hover:bg-[#00CC6A] hover:text-black h-12 font-black text-xs tracking-[0.2em] uppercase rounded-lg border-none transition-all duration-300 shadow-lg shadow-white/5 hover:shadow-[#00CC6A]/20 flex items-center justify-center gap-2 group/btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                                ) : (
                                    <>
                                        <span>Entrar com Google</span>
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        )}

                        <form onSubmit={handleSubmit} className={showGoogleLogin ? 'hidden' : 'space-y-5'}>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono p-3 rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-3xs uppercase tracking-[0.25em] text-zinc-400 font-mono font-bold flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-[#00CC6A]" />
                                    Email Corporativo
                                </label>
                                <Input
                                    type="email"
                                    placeholder="seu@empresa.com.br"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-zinc-900/60 border-zinc-800 text-white placeholder:text-zinc-600 h-12 rounded-lg focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all text-sm px-4 font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-3xs uppercase tracking-[0.25em] text-zinc-400 font-mono font-bold flex items-center gap-2">
                                        <Lock className="w-3.5 h-3.5 text-[#00CC6A]" />
                                        Senha
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-3xs uppercase tracking-widest text-zinc-500 hover:text-[#00CC6A] transition-colors font-mono"
                                    >
                                        Esqueceu?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-zinc-900/60 border-zinc-800 text-white placeholder:text-zinc-600 h-12 rounded-lg focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all text-sm px-4 pr-12 font-mono"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#00CC6A] text-black hover:bg-[#00E577] h-12 font-black text-xs tracking-[0.25em] uppercase rounded-lg border-none transition-all shadow-lg shadow-[#00CC6A]/10 mt-6 flex items-center justify-center gap-2 group/submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                                ) : (
                                    <>
                                        <span>Acessar Dashboard</span>
                                        <ArrowRight className="w-4 h-4 group-hover/submit:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Footer Lock Badge */}
                    <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
                        <span className="text-4xs font-mono uppercase tracking-[0.25em] text-zinc-600">
                            Criptografia HMAC SHA-256 & TLS 1.3
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 z-10 pb-2 text-zinc-500 font-mono text-3xs uppercase tracking-widest border-t border-zinc-900/60 pt-4">
                <span>&copy; {new Date().getFullYear()} RevHackers. Todos os direitos reservados.</span>
                <div className="flex items-center gap-6">
                    <Link to="/privacidade" className="hover:text-zinc-300 transition-colors">Privacidade</Link>
                    <Link to="/termos" className="hover:text-zinc-300 transition-colors">Termos de Uso</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
