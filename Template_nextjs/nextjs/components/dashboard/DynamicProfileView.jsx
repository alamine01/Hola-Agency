"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    User,
    Mail,
    Phone,
    ShieldCheck,
    Camera,
    Lock,
    MapPin,
    LogOut,
    Trash2,
    Briefcase,
    Crown,
    Loader2,
    Check,
    X,
    AlertTriangle,
    Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-hola bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className="p-8">
                    {children}
                </div>
                {footer && (
                    <div className="p-8 bg-slate-50/50 flex flex-col gap-3">
                        {footer}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default function DynamicProfileView({ role = 'client' }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
    const [isDelModalOpen, setIsDelModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');

    const [editMode, setEditMode] = useState(false);
    const [tempProfile, setTempProfile] = useState({});

    const roleConfigs = {
        client: {
            title: "Dakar, Sénégal",
            badgeLabel: "Vérifié",
            badgeIcon: ShieldCheck,
            badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
            subtitle: "Client Membre depuis Janvier 2024"
        },
        proprietaire: {
            title: "Saly, Sénégal",
            badgeLabel: "Propriétaire Premium",
            badgeIcon: Crown,
            badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
            subtitle: "Hôte Partenaire HOLA depuis 2023"
        },
        prestataire: {
            title: "Dakar & Thiès",
            badgeLabel: "Prestataire Certifié",
            badgeIcon: Briefcase,
            badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
            subtitle: "Expert Multi-services HOLA"
        },
        admin: {
            title: "Siège HOLA",
            badgeLabel: "Administrateur",
            badgeIcon: ShieldCheck,
            badgeColor: "bg-slate-900 text-white border-slate-900",
            subtitle: "Contrôle Total de la Plateforme"
        }
    };

    const config = roleConfigs[role] || roleConfigs.client;

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) {
                setProfile(data);
                setTempProfile(data);
            }
        }
        setLoading(false);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'hola_chat');
            const resp = await fetch(`https://api.cloudinary.com/v1_1/deyrurfrw/image/upload`, { method: 'POST', body: formData });
            if (!resp.ok) throw new Error("Upload failed");
            const data = await resp.json();
            const { error } = await supabase.from('profiles').update({ avatar_url: data.secure_url }).eq('id', user.id);
            if (!error) {
                setProfile(prev => ({ ...prev, avatar_url: data.secure_url }));
                setTempProfile(prev => ({ ...prev, avatar_url: data.secure_url }));
                triggerSuccess();
            }
        } catch (err) { alert("Erreur upload photo."); } finally { setIsUploading(false); }
    };

    const triggerSuccess = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({
                display_name: tempProfile.display_name,
                phone: tempProfile.phone,
                location: tempProfile.location
            })
            .eq('id', user.id);

        if (!error) {
            setProfile(tempProfile);
            setEditMode(false);
            triggerSuccess();
        }
        setIsSaving(false);
    };

    const handlePasswordChange = async () => {
        if (!currentPassword) {
            alert("Veuillez saisir votre mot de passe actuel.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }
        setIsSaving(true);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (authError) {
            alert("Mot de passe actuel incorrect.");
            setIsSaving(false);
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (!updateError) {
            alert("Mot de passe mis à jour avec succès !");
            setIsPassModalOpen(false);
            setNewPassword('');
            setConfirmPassword('');
            setCurrentPassword('');
        } else {
            alert(updateError.message);
        }
        setIsSaving(false);
    };

    const handleForgotPassword = async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: window.location.origin + '/reset-password',
        });
        if (!error) {
            alert("Un email de réinitialisation a été envoyé à " + user.email);
        } else {
            alert(error.message);
        }
    };

    const handleDeleteAccount = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('profiles').update({ bio: 'DELETED_ACCOUNT' }).eq('id', user.id);
        if (!error) {
            await supabase.auth.signOut();
            router.push('/login');
        }
        setIsSaving(false);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) return <div className="h-full flex items-center justify-center p-20 text-slate-400"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-10 px-4 md:px-8 pt-6 overflow-x-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">Mon Profil {role}</h1>
                    <p className="text-slate-500 font-medium text-sm">Gérez vos informations et la sécurité de votre compte HOLA.</p>
                </div>
                {!editMode ? (
                    <button onClick={() => setEditMode(true)} className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                        Modifier mes infos
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setEditMode(false); setTempProfile(profile); }} className="px-6 py-3 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                            Annuler
                        </button>
                        <button onClick={handleSaveProfile} disabled={isSaving} className="px-6 py-3 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-100 flex items-center gap-2">
                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Enregistrer
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-center font-bold text-sm flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Changements enregistrés avec succès !
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 p-6 md:p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl transition-all relative">
                            {tempProfile.avatar_url ? (
                                <img src={tempProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 md:w-20 md:h-20" />
                            )}
                            {isUploading && (
                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-amber-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform border-4 border-white active:scale-95 disabled:grayscale">
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="text-center md:text-left flex-1 space-y-6">
                        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 overflow-hidden">
                            {editMode ? (
                                <input
                                    type="text"
                                    value={tempProfile.display_name || ''}
                                    onChange={e => setTempProfile({ ...tempProfile, display_name: e.target.value })}
                                    className="text-2xl md:text-3xl font-black text-slate-900 bg-slate-50 border-b-2 border-amber-600 outline-none px-2 w-full md:max-w-xs focus:bg-white transition-all rounded-t-xl text-center md:text-left"
                                    placeholder="Votre nom"
                                />
                            ) : (
                                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate">{profile?.display_name || user?.email?.split('@')[0]}</h3>
                            )}
                            <div className="shrink-0">
                                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-2 ${config.badgeColor}`}>
                                    <config.badgeIcon className="w-3.5 h-3.5" /> {config.badgeLabel}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-2 text-slate-500 font-medium text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={tempProfile.location || ''}
                                        onChange={e => setTempProfile({ ...tempProfile, location: e.target.value })}
                                        className="text-sm border-b border-slate-200 outline-none focus:border-amber-600 bg-transparent"
                                        placeholder="Votre ville, Pays"
                                    />
                                ) : (
                                    <span className="truncate">{profile?.location || config.title}</span>
                                )}
                            </div>
                            <span className="hidden md:inline text-slate-300 mx-1">•</span>
                            <span className="text-amber-600 font-bold px-3 py-1 bg-amber-50 md:bg-transparent rounded-lg text-xs md:text-sm">{config.subtitle}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] block pl-1">Email (Non modifiable)</label>
                                <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-50 opacity-60">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-900 truncate">{user?.email}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] block pl-1">Téléphone</label>
                                <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${editMode ? 'bg-white border-amber-100 shadow-sm' : 'bg-slate-50 border-slate-50'}`}>
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={tempProfile.phone || ''}
                                            onChange={e => setTempProfile({ ...tempProfile, phone: e.target.value })}
                                            className="text-sm font-bold text-slate-900 bg-transparent outline-none w-full"
                                            placeholder="+221 ..."
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-slate-900">{profile?.phone || "Non renseigné"}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm group hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Mot de passe</h3>
                    </div>
                    <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">Changez votre mot de passe pour plus de sécurité.</p>
                    <button onClick={() => setIsPassModalOpen(true)} className="w-full py-4.5 bg-slate-50 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition-all">
                        Modifier la clé
                    </button>
                    <div className="mt-8 text-center">
                        <button onClick={handleSignOut} className="inline-flex items-center gap-3 text-slate-400 hover:text-amber-600 font-black tracking-widest text-[10px] uppercase transition-all hover:scale-105">
                            <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm group hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">Désactivation</h3>
                    </div>
                    <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">Supprimer définitivement votre compte et vos données.</p>
                    <button onClick={() => setIsDelModalOpen(true)} className="w-full py-4.5 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all">
                        Quitter la plateforme
                    </button>
                </div>
            </div>

            <Modal isOpen={isPassModalOpen} onClose={() => setIsPassModalOpen(false)} title="Sécurité du compte" footer={
                <button onClick={handlePasswordChange} disabled={isSaving} className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Confirmer le changement
                </button>
            }>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mot de passe actuel</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:border-amber-600 outline-none transition-all font-bold" placeholder="Requis pour vérifier votre identité" />
                        <button onClick={handleForgotPassword} className="text-[10px] font-black text-amber-600 hover:text-slate-900 transition-colors uppercase tracking-widest block mt-2 ml-1">
                            Mot de passe oublié ?
                        </button>
                    </div>

                    <div className="h-[1px] bg-slate-100 w-full my-4"></div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nouveau mot de passe</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:border-amber-600 outline-none transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmer le mot de passe</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:border-amber-600 outline-none transition-all font-bold" />
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isDelModalOpen} onClose={() => setIsDelModalOpen(false)} title="Supprimer le compte" footer={
                <>
                    <button onClick={handleDeleteAccount} disabled={isSaving} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Oui, supprimer définitivement
                    </button>
                    <button onClick={() => setIsDelModalOpen(false)} className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-all">
                        Annuler
                    </button>
                </>
            }>
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <p className="text-slate-900 font-bold">Cette action est irréversible.</p>
                    <p className="text-slate-500 text-sm leading-relaxed">Toutes vos réservations, messages et informations personnelles seront supprimés de nos serveurs.</p>
                </div>
            </Modal>
        </div>
    );
}
