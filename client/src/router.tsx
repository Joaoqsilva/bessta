import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/public/LandingPage';
import { LandingPageNew } from './pages/public/LandingPageNew';
import { LandingPageModern } from './pages/public/LandingPageModern';
import { LandingPagePsychology } from './pages/public/LandingPagePsychology';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { StoreBookingPage } from './pages/public/StoreBookingPage';

import { DashboardLayout } from './layouts/DashboardLayout';
import { StoreDashboard } from './pages/admin-store/StoreDashboard';
import { CalendarPage } from './pages/admin-store/CalendarPage';
import { AppointmentsPage } from './pages/admin-store/AppointmentsPage';
import { ServicesPage } from './pages/admin-store/ServicesPage';
import { CustomersPage } from './pages/admin-store/CustomersPage';
import { SettingsPage } from './pages/admin-store/SettingsPage';
import { StoreVisualEditor } from './pages/admin-store/StoreVisualEditor';

import { MasterDashboard } from './pages/admin-master/MasterDashboard';
import { MasterStoresPage } from './pages/admin-master/MasterStoresPage';
import { MasterUsersPage } from './pages/admin-master/MasterUsersPage';
import { MasterComplaintsPage } from './pages/admin-master/MasterComplaintsPage';
import { MasterSupportPage } from './pages/admin-master/MasterSupportPage';
import { MasterAnalyticsPage } from './pages/admin-master/MasterAnalyticsPage';
import { MasterSettingsPage } from './pages/admin-master/MasterSettingsPage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true, element: <LandingPage /> },
            { path: 'login', element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
        ],
    },
    { path: 'store/:slug', element: <StoreBookingPage /> },
    { path: ':slug', element: <StoreBookingPage /> },
    { path: 'new-landing', element: <LandingPageNew /> },
    { path: 'modern-landing', element: <LandingPageModern /> },
    { path: 'landing-psychology', element: <LandingPagePsychology /> },
    {
        path: '/app/editor',
        element: (
            <ProtectedRoute>
                <StoreVisualEditor />
            </ProtectedRoute>
        ),
    },
    {
        path: '/app',
        element: (
            <ProtectedRoute>
                <DashboardLayout type="store" />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <StoreDashboard /> },
            { path: 'calendar', element: <CalendarPage /> },
            { path: 'appointments', element: <AppointmentsPage /> },
            { path: 'services', element: <ServicesPage /> },
            { path: 'customers', element: <CustomersPage /> },
            { path: 'settings', element: <SettingsPage /> },
        ]
    },
    {
        path: '/admin/master',
        element: (
            <ProtectedRoute>
                <DashboardLayout type="master" />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <MasterDashboard /> },
            { path: 'stores', element: <MasterStoresPage /> },
            { path: 'users', element: <MasterUsersPage /> },
            { path: 'complaints', element: <MasterComplaintsPage /> },
            { path: 'support', element: <MasterSupportPage /> },
            { path: 'analytics', element: <MasterAnalyticsPage /> },
            { path: 'settings', element: <MasterSettingsPage /> },
        ]
    }
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}
