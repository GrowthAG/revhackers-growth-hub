import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { APP_CONFIG } from '@/config/constants';
import {
    observeGoogleAuth,
    signInWithGooglePopup,
    signOutGoogle,
} from '@/integrations/firebase/client';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userProfile: any | null;
    userRole: "super_admin" | "admin" | "user" | null;
    isLoading: boolean;
    isProfileLoading: boolean;
    isRecoveringPassword: boolean;
    setIsRecoveringPassword: (value: boolean) => void; // NOVO: Para resetar após sucesso
    signIn: (email: string) => Promise<void>; // OTP (Existing)
    signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
    signInWithGoogle: () => Promise<{ error: any }>;
    isGoogleAuthEnabled: boolean;
    signUp: (email: string, password: string) => Promise<{ error: any }>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    updatePassword: (password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [userRole, setUserRole] = useState<"super_admin" | "admin" | "user" | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isRecoveringPassword, setIsRecoveringPassword] = useState(() => {
        return window.location.hash.includes('type=recovery') ||
            window.location.hash.includes('access_token=') ||
            window.location.pathname === '/reset-password';
    });
    const { toast } = useToast();
    const navigate = useNavigate();
    const isGoogleAuthEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true';

    const fetchGoogleAuthority = async (idToken: string) => {
        const apiUrl = import.meta.env.VITE_GCP_API_URL?.replace(/\/$/, '');
        if (!apiUrl) throw new Error('VITE_GCP_API_URL não configurada.');
        const response = await fetch(`${apiUrl}/v1/me`, {
            headers: { authorization: `Bearer ${idToken}` },
        });
        if (!response.ok) throw new Error(response.status === 403
            ? 'Conta Google ainda não provisionada no RevHackers.'
            : `Falha ao carregar autorização (${response.status}).`);
        return response.json();
    };

    const fetchUserRole = async (userId: string, silent = false) => {
        try {
            // Regra canônica: Giulliano (usefunnels.io / revhackers.com.br) é SEMPRE super_admin com foto do chatbot
            const userEmail = (user?.email || '').toLowerCase();
            if (userEmail === 'giulliano@usefunnels.io' || userEmail === 'giulliano@revhackers.com.br' || userEmail.includes('giulliano')) {
                setUserRole('super_admin');
                setUserProfile({
                    id: userId,
                    email: user?.email || 'Giulliano@usefunnels.io',
                    full_name: 'Giulliano Alves',
                    role: 'super_admin',
                    avatar_url: '/uploads/giulliano-linkedin-profile.png',
                    status: 'active'
                });
                if (!silent) setIsProfileLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching user profile:', error);
                return;
            }

            if (data) {
                setUserProfile(data);
                setUserRole(data.role as any || 'user');
            } else {
                setUserRole('user');
                setUserProfile(null);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            if (!silent) {
                setIsProfileLoading(false);
            }
        }
    };

    useEffect(() => {
        try {
            if (sessionStorage.getItem('rh_master_logged') === 'true') {
                const storedEmail = localStorage.getItem('rh_master_user_email') || 'Giulliano@usefunnels.io';
                setUser({
                    id: 'master-super-admin-id',
                    email: storedEmail,
                    user_metadata: { 
                        full_name: 'Giulliano Alves',
                        avatar_url: '/uploads/giulliano-linkedin-profile.png'
                    }
                } as any);
                setUserRole('super_admin');
                setUserProfile({
                    id: 'master-super-admin-id',
                    email: storedEmail,
                    full_name: 'Giulliano Alves',
                    role: 'super_admin',
                    status: 'active',
                    avatar_url: '/uploads/giulliano-linkedin-profile.png'
                });
                setIsLoading(false);
            }
        } catch (e) {}

        const safetyTimeout = setTimeout(() => {
            setIsLoading(false);
        }, 5000);

        return () => clearTimeout(safetyTimeout);
    }, []); // [] = roda UMA VEZ ao montar, não reage a mudanças de estado

    useEffect(() => {
        if (window.location.hash.includes('type=recovery') ||
            window.location.hash.includes('access_token=') ||
            window.location.pathname === '/reset-password') {
            setIsRecoveringPassword(true);
        }

        if (isGoogleAuthEnabled) {
            let mounted = true;
            const unsubscribe = observeGoogleAuth(async (googleUser) => {
                if (!mounted) return;
                if (!googleUser) {
                    // Se o usuário estiver logado via login master ou Supabase, não deslogar
                    setUser(prev => {
                        if (prev?.email === 'giulliano@revhackers.com.br') {
                            return prev;
                        }
                        setSession(null);
                        setUserProfile(null);
                        setUserRole(null);
                        return null;
                    });
                    setIsProfileLoading(false);
                    setIsLoading(false);
                    return;
                }

                setIsProfileLoading(true);
                setUser({
                    id: googleUser.uid,
                    email: googleUser.email ?? undefined,
                    user_metadata: { full_name: googleUser.displayName, avatar_url: googleUser.photoURL },
                } as unknown as User);
                try {
                    const authority = await fetchGoogleAuthority(await googleUser.getIdToken());
                    if (!mounted) return;
                    setUserProfile(authority);
                    setUserRole(authority.globalRole);
                } catch (error) {
                    console.error('[Google Auth] Falha de provisionamento:', error);
                    setUserProfile(null);
                    setUserRole(null);
                } finally {
                    if (mounted) {
                        setIsProfileLoading(false);
                        setIsLoading(false);
                    }
                }
            });
            return () => {
                mounted = false;
                unsubscribe();
            };
        }

        // ── Single source of truth: onAuthStateChange ────────────────────────
        // O Supabase dispara INITIAL_SESSION imediatamente ao registrar o listener,
        // com a sessão atual (ou null). Não precisamos chamar getSession() manualmente.
        // Fazer as duas coisas gera race condition e múltiplos re-renders (flash).
        let mounted = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            // Se for login master, ignora eventos nulos do Supabase auth
            if (sessionStorage.getItem('rh_master_logged') === 'true') {
                setIsLoading(false);
                setIsProfileLoading(false);
                return;
            }

            // Sincronizar estados basicos imediatamente
            setSession(session);
            setUser(session?.user ?? null);

            // INITIAL_SESSION: primeira leitura da sessão, sempre desliga o loading
            if (_event === 'INITIAL_SESSION') {
                setIsLoading(false);
            }

            if (_event === 'SIGNED_OUT') {
                setUserProfile(null);
                setUserRole(null);
                setIsLoading(false);
                setIsProfileLoading(false);
                return;
            }

            // TOKEN_REFRESHED e USER_UPDATED (foco de aba) NÃO disparam loading!
            // Isso evita desmontar a árvore da DOM ao trocar de aba do navegador.
            if (session?.user && (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION')) {
                setIsProfileLoading(true);
                fetchUserRole(session.user.id);
            } else if (session?.user && (_event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED')) {
                // Refresh silencioso - atualiza perfil em background sem destruir a UI
                fetchUserRole(session.user.id, true);
            }

            if (_event === 'PASSWORD_RECOVERY') {
                setIsRecoveringPassword(true);

                if (window.location.pathname !== '/reset-password') {
                    navigate('/reset-password', { replace: true });
                }
            }

            // Invite Flow: redireciona para criação de senha no primeiro acesso
            if ((_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') && session?.user?.user_metadata?.invited === true) {
                if (window.location.pathname !== '/reset-password') {
                    setIsRecoveringPassword(true);
                    navigate('/reset-password', { replace: true, state: { fromInvite: true } });
                }
            }

            // Garantir que carregamento inicial termine em qualquer evento
            setIsLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Existing OTP Sign In
    const signIn = async (email: string) => {
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin + '/admin',
                },
            });

            if (error) throw error;

            toast({
                title: "Link de acesso enviado!",
                description: "Verifique seu e-mail para entrar no Hub.",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao entrar",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const signInWithPassword = async (emailInput: string, password: string) => {
        try {
            const cleanEmail = emailInput.trim().toLowerCase();
            const isMasterEmail = cleanEmail === 'giulliano@usefunnels.io' || cleanEmail === 'giulliano@revhackers.com.br';

            // Se for o e-mail máster giulliano@usefunnels.io ou giulliano@revhackers.com.br
            if (isMasterEmail) {
                const encoder = new TextEncoder();
                const data = encoder.encode(password);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                
                const isPasswordMatch = password === 'SenhaRevHackers@321#' || hashHex === 'dd776b8961926c2e8d4c912a9eff8affef7a6d42c03ec252be5f898dd23b5f6c';

                if (!isPasswordMatch) {
                    return { error: new Error('Senha incorreta.') };
                }

                const masterUser = {
                    id: 'master-super-admin-id',
                    email: emailInput.trim(),
                    user_metadata: { 
                        full_name: 'Giulliano Alves',
                        avatar_url: '/uploads/giulliano-linkedin-profile.png'
                    }
                };
                const masterProfile = {
                    id: 'master-super-admin-id',
                    email: emailInput.trim(),
                    full_name: 'Giulliano Alves',
                    role: 'super_admin',
                    status: 'active',
                    avatar_url: '/uploads/giulliano-linkedin-profile.png'
                };
                
                setUser(masterUser as any);
                setUserRole('super_admin');
                setUserProfile(masterProfile);
                try { 
                    sessionStorage.setItem('rh_master_logged', 'true'); 
                    localStorage.setItem('rh_master_user_email', emailInput.trim());
                } catch (e) {}
                setIsLoading(false);
                setIsProfileLoading(false);
                return { error: null };
            }

            const apiUrl = import.meta.env.VITE_GCP_API_URL?.replace(/\/$/, '');
            if (import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true') {
                try {
                    const res = await fetch(`${apiUrl}/v1/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setUser({
                            id: data.user?.id || 'user-id',
                            email: email,
                            user_metadata: { full_name: data.user?.full_name || data.user?.name || 'Membro' }
                        } as any);
                        setUserRole(data.user?.role || data.role || 'user');
                        setIsLoading(false);
                        setIsProfileLoading(false);
                        return { error: null };
                    }
                } catch (err) {
                    console.warn('Falha na API GCP de login...', err);
                }
            }



            // Fallback Supabase (legado)
            try {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                return { error: null };
            } catch (supaErr: any) {
                console.warn('Supabase login fallback failed:', supaErr.message);
                throw new Error('E-mail ou senha incorretos.');
            }
        } catch (error: any) {
            console.error("Login error:", error.message);
            return { error };
        }
    };

    const signInWithGoogle = async () => {
        try {
            // Tentativa 1: Firebase Auth Google Popup
            try {
                const googleUser = await signInWithGooglePopup();
                const email = (googleUser.email || '').toLowerCase();
                const isMasterEmail = email === 'giulliano@usefunnels.io' || email === 'giulliano@revhackers.com.br' || email.includes('giulliano');

                const userObj = {
                    id: googleUser.uid,
                    email: googleUser.email ?? 'giulliano@usefunnels.io',
                    user_metadata: { 
                        full_name: googleUser.displayName || 'Giulliano Alves', 
                        avatar_url: googleUser.photoURL || '/uploads/giulliano-linkedin-profile.png' 
                    }
                };

                const profileObj = {
                    id: googleUser.uid,
                    email: googleUser.email ?? 'giulliano@usefunnels.io',
                    full_name: googleUser.displayName || 'Giulliano Alves',
                    role: isMasterEmail ? 'super_admin' : 'user',
                    status: 'active',
                    avatar_url: googleUser.photoURL || '/uploads/giulliano-linkedin-profile.png'
                };

                setUser(userObj as any);
                setUserProfile(profileObj);
                setUserRole(isMasterEmail ? 'super_admin' : 'user');

                if (isMasterEmail) {
                    try { 
                        sessionStorage.setItem('rh_master_logged', 'true'); 
                        localStorage.setItem('rh_master_user_email', googleUser.email || 'giulliano@usefunnels.io');
                    } catch (e) {}
                }

                setIsLoading(false);
                setIsProfileLoading(false);
                return { error: null };
            } catch (firebaseErr: any) {
                console.warn('[Google Auth] Firebase auth falhou, tentando Supabase OAuth:', firebaseErr?.message);
                
                // Fallback 2: Supabase Google OAuth Redirect
                const { error: supaErr } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/admin`
                    }
                });

                if (supaErr) throw supaErr;
                return { error: null };
            }
        } catch (error: any) {
            console.error('[Google Auth] Autenticação Google não completada:', error.message);
            return { error };
        }
    };

    const signUp = async (_email: string, _password: string) => {
        // BLOQUEADO: Cadastro público desabilitado.
        // Toda criação de conta é feita exclusivamente via convite administrativo (invite-member).
        console.warn('[Auth] Tentativa de signUp bloqueada - cadastro publico desabilitado.');
        return { error: new Error('Cadastro desabilitado. Contas são criadas exclusivamente via convite do administrador.') };
    };

    const resetPassword = async (email: string) => {
        try {
            const { sendPasswordResetEmailFromFirebase } = await import('@/integrations/firebase/client');
            await sendPasswordResetEmailFromFirebase(email);
            return { error: null };
        } catch (error: any) {
            console.error("Reset password error:", error.message);
            return { error };
        }
    };

    const updatePassword = async (password: string) => {
        try {
            const apiUrl = import.meta.env.VITE_GCP_API_URL?.replace(/\/$/, '');

            // Tenta atualizar via API do GCP
            if (apiUrl) {
                try {
                    const currentEmail = user?.email || '';
                    const res = await fetch(`${apiUrl}/v1/auth/verify-reset`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: currentEmail,
                            newPassword: password,
                            token: 'session-update', // Token de sessão para update direto
                        }),
                    });

                    if (res.ok) {
                        return { error: null };
                    }
                    return { error: new Error('Falha ao atualizar senha na API') };
                } catch (err) {
                    console.warn('[updatePassword] API GCP indisponível.', err);
                    return { error: new Error('API indisponível.') };
                }
            }

            return { error: new Error('Serviço indisponível no momento.') };
        } catch (error: any) {
            console.error("Update password error:", error);
            return { error };
        }
    }

    const signOut = async () => {
        try {
            // Limpar estado local primeiro
            setSession(null);
            setUser(null);
            setUserProfile(null);
            setUserRole(null);

            if (isGoogleAuthEnabled) {
                await signOutGoogle();
            } else {
                const { error } = await supabase.auth.signOut();
                if (error) console.error('Erro ao fazer logout:', error);
            }

            // Limpar localStorage e sessionStorage
            try { sessionStorage.removeItem('rh_master_logged'); } catch (e) {}
            localStorage.removeItem('supabase.auth.token');

            // Mostrar toast
            toast({
                title: "Você saiu do sistema.",
                description: "Até logo!"
            });

            // Redirecionar para home com reload completo
            setTimeout(() => {
                window.location.href = '/';
            }, 500);

        } catch (error) {
            console.error('Erro no logout:', error);
            // Mesmo com erro, limpar tudo
            setSession(null);
            setUser(null);
            setUserProfile(null);
            setUserRole(null);

            // Forçar redirecionamento
            window.location.href = '/';
        }
    };

    const contextValue = useMemo(() => ({
        session,
        user,
        userProfile,
        userRole,
        isLoading,
        isProfileLoading,
        isRecoveringPassword,
        setIsRecoveringPassword,
        signIn,
        signInWithPassword,
        signInWithGoogle,
        isGoogleAuthEnabled,
        signUp,
        resetPassword,
        updatePassword,
        signOut
    }), [session, user, userProfile, userRole, isLoading, isProfileLoading, isRecoveringPassword, isGoogleAuthEnabled]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
