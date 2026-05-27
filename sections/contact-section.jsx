'use client';
 
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
 
export default function ContactSection() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Je souhaite réserver un bien',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            setErrorMsg("Veuillez remplir tous les champs requis.");
            return;
        }
 
        setSending(true);
        setErrorMsg('');
        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert([{
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    subject: formData.subject,
                    message: formData.message.trim()
                }]);
 
            if (error) throw error;
            setSuccess(true);
            setFormData({ name: '', email: '', subject: 'Je souhaite réserver un bien', message: '' });
            setTimeout(() => setSuccess(false), 6000);
        } catch (err) {
            console.error("Error sending contact message:", err);
            setErrorMsg("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
        } finally {
            setSending(false);
        }
    };
 
    return (
        <section id="contact" className="py-24 bg-white relative">
            <div className="container-hola">
 
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-slate-900 mb-4"
                    >
                        Contactez-nous
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-500 max-w-2xl mx-auto"
                    >
                        Une question sur nos biens, une demande de prestation sur-mesure ou une proposition de partenariat ? Notre équipe d'experts est à votre écoute.
                    </motion.p>
                </div>
 
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
 
                    {/* Left: Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 space-y-8"
                    >
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 h-full">
                            <h3 className="text-2xl font-bold text-slate-900 mb-8">Informations de contact</h3>
 
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#D4AF37] shadow-sm shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Notre Siège</p>
                                        <p className="text-slate-500">Almadies, Zone 12<br />Dakar, Sénégal</p>
                                    </div>
                                </div>
 
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#D4AF37] shadow-sm shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Téléphone</p>
                                        <p className="text-slate-500">+221 77 123 45 67<br />+221 33 820 00 00</p>
                                    </div>
                                </div>
 
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#D4AF37] shadow-sm shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Email</p>
                                        <p className="text-slate-500">contact@hola-agency.sn<br />partenaires@hola-agency.sn</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
 
                    {/* Right: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex-[1.5]"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                            <AnimatePresence>
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-8 text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                            className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-lg shadow-emerald-100"
                                        >
                                            <CheckCircle2 className="w-8 h-8" />
                                        </motion.div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Message envoyé avec succès !</h3>
                                        <p className="text-slate-500 text-sm max-w-sm italic">Merci pour votre confiance. Notre équipe d'experts HOLA traitera votre demande et vous répondra dans les plus brefs délais.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
 
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Nom complet *</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all text-sm font-semibold text-slate-800" 
                                        placeholder="Jean Dupont" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Adresse Email *</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all text-sm font-semibold text-slate-800" 
                                        placeholder="jean@exemple.com" 
                                    />
                                </div>
                            </div>
 
                            <div className="space-y-2">
                                <label htmlFor="subject" className="block text-sm font-semibold text-slate-700">Sujet *</label>
                                <select 
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all text-sm font-semibold text-slate-800 cursor-pointer"
                                >
                                    <option>Je souhaite réserver un bien</option>
                                    <option>Je souhaite mettre mon bien en location (Propriétaire)</option>
                                    <option>Je souhaite proposer mes services (Prestataire)</option>
                                    <option>Autre demande</option>
                                </select>
                            </div>
 
                            <div className="space-y-2">
                                <label htmlFor="message" className="block text-sm font-semibold text-slate-700">Message *</label>
                                <textarea 
                                    id="message" 
                                    rows={4} 
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium text-slate-800 resize-none" 
                                    placeholder="Décrivez votre besoin..."
                                />
                            </div>
 
                            {errorMsg && (
                                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {errorMsg}
                                </div>
                            )}
 
                            <button 
                                type="submit" 
                                disabled={sending}
                                className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-lg shadow-slate-200/50 flex items-center justify-center gap-2 active:scale-[0.99]"
                            >
                                {sending ? (
                                    <>
                                        Envoi en cours... <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    </>
                                ) : (
                                    <>
                                        Envoyer le message <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
 
                </div>
            </div>
        </section>
    );
}
