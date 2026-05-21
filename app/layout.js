import { Inter } from 'next/font/google';
import './globals.css';
import LenisScroll from '@/components/lenis-scroll';
import { PlatformCommissionProvider } from './context/PlatformCommissionContext';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
});

export const metadata = {
    title: "HOLA Agency",
    icons: {
        icon: "/icon.png"
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang='en' className="overflow-x-hidden">
            <LenisScroll />
            <body className={`${inter.variable} font-sans overflow-x-hidden`}>    <PlatformCommissionProvider>{children}</PlatformCommissionProvider></body>
        </html>
    );
}
