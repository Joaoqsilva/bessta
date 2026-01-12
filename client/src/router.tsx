import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// import { LandingPageBeautySalon } from './pages/public/LandingPageBeautySalon';
// import { LandingPagePsychology } from './pages/public/LandingPagePsychology';
import { LandingPage } from './pages/public/LandingPage';
import { LandingPageSophisticated } from './pages/public/LandingPageSophisticated';
import { LandingPageModern } from './pages/public/LandingPageModern';
import { LandingPageTherapy } from './pages/public/LandingPageTherapy';
import { LandingPageClinic } from './pages/public/LandingPageClinic';
import { LandingPageHarmony } from './pages/public/LandingPageHarmony';
import { LandingPageVibrant } from './pages/public/LandingPageVibrant';
import { LandingPageSunny } from './pages/public/LandingPageSunny';
import { LandingPageVitality } from './pages/public/LandingPageVitality';
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
            { index: true, element: <LandingPage /> }, // Main conversion landing page
            { path: 'login', element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
        ],
    },
    { path: ':slug', element: <StoreBookingPage /> },
    // Removed legacy individual routes if not needed, keeping others for now
    { path: 'sophisticated', element: <LandingPageSophisticated /> },
    { path: 'modern-landing', element: <LandingPageModern /> },
    { path: 'therapy-new', element: <LandingPageTherapy /> },
    { path: 'clinic-new', element: <LandingPageClinic /> },
    { path: 'harmony-new', element: <LandingPageHarmony /> },
    { path: 'vibrant-new', element: <LandingPageVibrant /> },
    { path: 'sunny-new', element: <LandingPageSunny /> },
    { path: 'vitality-new', element: <LandingPageVitality /> },
    {
        path: '/app/editor',
        element: (
            <ProtectedRoute allowedRoles={['store_owner', 'admin_master']}>
                <StoreVisualEditor />
            </ProtectedRoute>
        ),
    },
    {
        path: '/app',
        element: (
            <ProtectedRoute allowedRoles={['store_owner', 'admin_master']}>
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
            <ProtectedRoute allowedRoles={['admin_master']}>
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
