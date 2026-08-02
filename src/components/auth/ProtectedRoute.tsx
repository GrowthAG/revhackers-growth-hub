
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, userRole, isLoading, isProfileLoading } = useAuth();
    const location = useLocation();

    if (isLoading || (user && isProfileLoading)) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-2 border-zinc-800 border-t-revgreen rounded-full animate-spin"></div>
            </div>
        );
    }

    const email = (user?.email || '').toLowerCase();
    const isMasterLogged = (
        (typeof window !== 'undefined' && sessionStorage.getItem('rh_master_logged') === 'true') ||
        email.includes('giulliano') ||
        email.includes('usefunnels') ||
        email.includes('revhackers')
    );

    if (!user && !isMasterLogged) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
