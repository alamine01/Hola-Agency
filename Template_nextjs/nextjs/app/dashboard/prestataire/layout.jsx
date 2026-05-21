import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';

export default function PrestataireLayout({ children }) {
    return <DashboardLayoutShell forcedRole="prestataire">{children}</DashboardLayoutShell>;
}
