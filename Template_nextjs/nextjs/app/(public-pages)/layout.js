import Footer from '@/components/footer';
import Navbar from '@/components/navbar';

export const metadata = {
    title: 'HOLA Agency - Luxe & Prestations',
    description: 'Réservez vos logements et vos prestations facilement avec HOLA.',
};

export default function Layout({ children }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
