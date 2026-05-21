import HeroSection from '@/sections/hero-section';
import PartnersSection from '@/sections/partners-section';
import FeaturedProperties from '@/sections/featured-properties';
import PremiumServices from '@/sections/premium-services';
import ContactSection from '@/sections/contact-section';

export default function Page() {
    return (
        <main className='min-h-screen bg-slate-50 font-sans selection:bg-[#D4AF37]/30 overflow-x-hidden'>
            <HeroSection />
            <PartnersSection />
            <FeaturedProperties />
            <PremiumServices />
            <ContactSection />
            {/* Newsletter will act as a trust/call to action for partners */}
        </main>
    );
}
