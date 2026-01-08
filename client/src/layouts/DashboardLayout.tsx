import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

interface DashboardLayoutProps {
    type: 'master' | 'store';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ type }) => {
    return (
        <div className="flex min-h-screen bg-[var(--surface-50)]">
            <Sidebar type={type} />
            <main className="flex-1" style={{ marginLeft: '250px', padding: '2rem' }}>
                <Outlet />
            </main>
        </div>
    );
};
