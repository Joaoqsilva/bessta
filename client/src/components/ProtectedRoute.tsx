import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login page but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check for role access
    if (allowedRoles && user) {
        if (!allowedRoles.includes(user.role)) {
            // User authenticated but not authorized for this route
            // Redirect to appropriate dashboard based on their actual role
            let redirectPath = '/';
            if (user.role === 'admin_master') {
                redirectPath = '/admin/master';
            } else if (user.role === 'store_owner') {
                redirectPath = '/app';
            }
            // client_user and other roles go to home page
            return <Navigate to={redirectPath} replace />;
        }
    }

    return <>{children}</>;
};
