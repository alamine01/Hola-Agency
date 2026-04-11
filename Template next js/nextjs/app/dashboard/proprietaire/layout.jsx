import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';

export default function ProprietaireLayout({ children }) {
    return <DashboardLayoutShell forcedRole="proprietaire">{children}</DashboardLayoutShell>;
}
