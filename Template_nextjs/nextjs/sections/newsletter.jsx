import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Newsletter() {
    return (
        <section className="py-24 px-4 bg-[#fafafa]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl"
            >
                {/* Decorative circles */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-4">Newsletter Exclusive</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight max-w-2xl">
                        Événements privés & <br /> <span className="text-indigo-400 italic">Offres confidentielles</span>
                    </h2>
                    <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto font-light">
                        Soyez le premier informé de nos nouvelles pépites immobilières et de nos soirées de lancement exclusives.
                    </p>

                    <div className="w-full max-w-md">
                        <form className="flex flex-col sm:flex-row gap-3 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                className="flex-1 px-6 py-4 bg-transparent text-white placeholder-slate-500 outline-none rounded-xl"
                                required
                            />
                            <button className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-95">
                                S'abonner <Send className="w-4 h-4" />
                            </button>
                        </form>
                        <p className="mt-4 text-slate-500 text-xs text-center">Inscrivez-vous pour recevoir notre catalogue privé une fois par mois.</p>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
