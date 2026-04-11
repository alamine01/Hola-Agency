import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';

export default function AdminLayout({ children }) {
    return <DashboardLayoutShell forcedRole="admin">{children}</DashboardLayoutShell>;
}
