import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const MainLayout = () => {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <div className="flex flex-col min-h-screen" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            <header className="flex justify-between items-center container" style={{ paddingBlock: '1rem', borderBottom: '1px solid var(--surface-200)' }}>
                <Link to="/" className="font-bold text-lg" style={{ color: 'var(--primary-600)' }}>BookMe</Link>
                <nav className="flex gap-4 items-center">
                    {isAuthenticated ? (
                        <>
                            <span className="text-sm text-gray-600 hidden md:inline">Olá, {user?.ownerName?.split(' ')[0]}</span>
                            {user?.role === 'store_owner' ? (
                                <Link to="/app" className="text-sm font-bold text-primary-600">Dashboard</Link>
                            ) : user?.role === 'admin_master' ? (
                                <Link to="/admin/master" className="text-sm font-bold text-primary-600">Admin</Link>
                            ) : null}
                            <button onClick={logout} className="text-sm font-bold text-red-500 hover:text-red-700">Sair</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-bold text-muted">Login</Link>
                            <Link to="/register" className="text-sm font-bold text-muted">Register</Link>
                        </>
                    )}
                </nav>
            </header>
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="container text-center text-sm text-muted" style={{ paddingBlock: '2rem' }}>
                &copy; {new Date().getFullYear()} BookMe. All rights reserved.
            </footer>
        </div>
    );
};
