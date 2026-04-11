import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';

export default function ClientLayout({ children }) {
    return <DashboardLayoutShell forcedRole="client">{children}</DashboardLayoutShell>;
}
