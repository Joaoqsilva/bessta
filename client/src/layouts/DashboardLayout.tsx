import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

interface DashboardLayoutProps {
    type: 'master' | 'store';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ type }) => {
    return (
        <div className="flex min-h-screen bg-[var(--surface-50)]" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            <Sidebar type={type} />
            <main className="flex-1" style={{ marginLeft: '250px', padding: '2rem', fontFamily: 'inherit' }}>
                <Outlet />
            </main>
        </div>
    );
};
