import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex justify-between items-center container" style={{ paddingBlock: '1rem', borderBottom: '1px solid var(--surface-200)' }}>
                <div className="font-bold text-lg" style={{ color: 'var(--primary-600)' }}>BookMe</div>
                <nav className="flex gap-4">
                    <a href="/login" className="text-sm font-bold text-muted">Login</a>
                    <a href="/register" className="text-sm font-bold text-muted">Register</a>
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
