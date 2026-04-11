"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Briefcase,
    Star,
    Settings,
    Trash2,
    Edit3,
    CheckCircle2,
    X,
    Upload,
    Camera,
    DollarSign,
    Tag,
    Clock,
    Layers,
    Lightbulb,
    MapPin,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const ServiceCard = ({ service, onEdit, onDelete }) => {
    // Calcul du net (85% comme pour les villas)
    const priceValue = service.price || 0;
    const netPrice = Math.floor(priceValue * 0.85);

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 hover:shadow-xl transition-all group overflow-hidden relative shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors blur-2xl"></div>

            <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform overflow-hidden">
                    {service.image ? (
                        <img src={service.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Briefcase className="w-7 h-7" />
                    )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1 truncate tracking-tight uppercase">{service.name}</h3>
                <p className="text-slate-500 text-[11px] font-medium flex items-center gap-1 mb-4 italic">
                    <MapPin className="w-3 h-3 text-indigo-500" /> {service.location || 'Sénégal'}
                </p>
                <p className="text-slate-500 text-xs mb-6 line-clamp-2 leading-relaxed font-medium">{service.description}</p>

                <div className="flex items-center justify-between mb-6 pt-6 border-t border-slate-50">
                    <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] mb-0.5">Votre Gain Net</p>
                        <p className="text-lg font-black text-indigo-600">{netPrice.toLocaleString()} <span className="text-[10px] font-bold">FCFA</span></p>
                        <p className="text-[9px] font-medium text-slate-400 opacity-70 italic">Brut : {priceValue.toLocaleString()} FCFA</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] mb-1">Notation</p>
                        <div className="flex items-center gap-1 text-sm font-black text-amber-500">
                            <Star className="w-4 h-4 fill-amber-500" /> {service.rating || '0.0'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <button onClick={() => onEdit(service)} className="flex-1 py-3.5 bg-slate-900 text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-slate-100">
                        <Edit3 className="w-3.5 h-3.5" /> Modifier
                    </button>
                    <button onClick={() => onDelete(service.id)} className="p-3.5 bg-red-50 text-red-500 rounded-[1.2rem] hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-red-100/50">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddServiceModal = ({ isOpen, onClose, onRefresh, initialData }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [publishing, setPublishing] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'massage',
        location: '',
        price: '',
        description: ''
    });

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name || '',
                type: initialData.type || 'massage',
                location: initialData.location || '',
                price: initialData.price || '',
                description: initialData.description || ''
            });
            if (initialData.image) setPreview(initialData.image);
            else setPreview(null);
        } else if (isOpen) {
            setFormData({ name: '', type: 'massage', location: '', price: '', description: '' });
            setPreview(null);
        }
        setFile(null);
    }, [isOpen, initialData]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handlePublish = async () => {
        if (!formData.name || !formData.price || (!file && !preview)) {
            alert("Veuillez remplir les champs obligatoires (Nom, Prix, Image)");
            return;
        }

        setPublishing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non connecté");

            let imageUrl = '';
            if (file) {
                const cloudData = new FormData();
                cloudData.append('file', file);
                cloudData.append('upload_preset', 'hola_chat');
                const resp = await fetch(`https://api.cloudinary.com/v1_1/deyrurfrw/image/upload`, { method: 'POST', body: cloudData });
                const uploaded = await resp.json();
                imageUrl = uploaded.secure_url;
            }

            console.log("Tentative de publication service:", {
                ...formData,
                imageUrl,
                user_id: user.id
            });

            if (initialData?.id) {
                const { data, error } = await supabase.from('services').update({
                    name: formData.name,
                    type: formData.type,
                    location: formData.location,
                    price: parseInt(formData.price),
                    description: formData.description,
                    ...(imageUrl ? { image: imageUrl } : {})
                }).eq('id', initialData.id).select();

                if (error) {
                    console.error("Erreur UPDATE service:", error);
                    throw error;
                }
                console.log("UPDATE réussi:", data);
            } else {
                const { data, error } = await supabase.from('services').insert([{
                    provider_id: user.id,
                    name: formData.name,
                    type: formData.type,
                    location: formData.location,
                    price: parseInt(formData.price),
                    description: formData.description,
                    image: imageUrl,
                    status: 'active'
                }]).select();

                if (error) {
                    console.error("Erreur INSERT service:", error);
                    throw error;
                }
                console.log("INSERT réussi:", data);
            }

            onRefresh();
            onClose();
        } catch (err) {
            console.error("DEBUG - Erreur complète:", err);
            const msg = err.message || (typeof err === "string" ? err : "Erreur inconnue");
            alert("Erreur publication : " + msg);
        } finally {
            setPublishing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-lg shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
                <button onClick={onClose} className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-100 z-10 border border-slate-50">
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                        {initialData ? "Modifier le Service" : "Nouveau Service"}
                    </h2>
                    <p className="text-slate-400 font-medium text-sm mt-1 italic">
                        {initialData ? "Mettez à jour les informations de votre prestation" : "Proposez une nouvelle expérience HOLA"}
                    </p>
                </div>

                <div className="space-y-5">
                    {/* Compact Image Uploader */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center hover:border-indigo-600/30 transition-all cursor-pointer bg-slate-50/50 min-h-[140px] flex flex-col items-center justify-center overflow-hidden"
                    >
                        {preview ? (
                            <img src={preview} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 text-indigo-500 shadow-md group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Image illustrative</p>
                            </>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Titre de la prestation</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="ex: Massage à domicile"
                                    className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600/30 focus:bg-white transition-all text-xs font-black text-slate-900"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Type de service</label>
                                <div className="relative">
                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600/30 focus:bg-white transition-all text-xs font-black text-slate-900 appearance-none cursor-pointer"
                                    >
                                        <option value="diner_romantique">Dîner Gastronomique</option>
                                        <option value="massage">Massage & Bien-être</option>
                                        <option value="excursion">Excursion & Sortie</option>
                                        <option value="transport">Transfert & Chauffeur</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Ville d'exercice</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="ex: Saly"
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600/30 transition-all text-xs font-black text-slate-900"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Prix Brut (FCFA)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-600" />
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="ex: 25000"
                                        className="w-full pl-10 pr-4 py-3.5 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl outline-none focus:border-indigo-600 transition-all text-xs font-black text-indigo-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Description détaillée</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                placeholder="Quels sont les détails importants de votre service ?"
                                className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600/30 transition-all text-xs font-medium resize-none shadow-inner"
                            ></textarea>
                        </div>

                        <button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 active:scale-95 mt-4 flex items-center justify-center gap-3"
                        >
                            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publier mon service"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default function PrestataireServicesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('provider_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) setServices(data);
        }
        setLoading(false);
    };

    const handleEdit = (service) => {
        setServiceToEdit(service);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce service ?")) return;
        setLoading(true);
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) {
            alert("Erreur lors de la suppression.");
        }
        fetchServices();
    };

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-0 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">Mes Services</h1>
                    <p className="text-slate-500 font-medium italic">Gérez vos prestations et proposez des expériences inoubliables.</p>
                </div>
                <button
                    onClick={() => { setServiceToEdit(null); setIsModalOpen(true); }}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                    <Plus className="w-5 h-5" strokeWidth={4} /> Créer un service
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2rem]"></div>
                    ))
                ) : services.length > 0 ? (
                    services.map((service) => (
                        <ServiceCard key={service.id} service={service} onEdit={handleEdit} onDelete={handleDelete} />
                    ))
                ) : (
                    <div className="col-span-full bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center">
                        <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold italic">Aucun service publié pour le moment.</p>
                    </div>
                )}
            </div>

            {/* Harmonized Footer Card (Light Gradient) */}
            <div className="mt-20 bg-gradient-to-br from-white to-slate-50/50 rounded-[3rem] border border-slate-100 p-10 md:p-14 text-center group transition-all relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl translate-y-10 -translate-x-10"></div>

                <div className="w-20 h-20 bg-white shadow-2xl shadow-slate-200/50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-amber-500 group-hover:scale-110 transition-transform relative z-10 ring-4 ring-slate-50/50">
                    <Lightbulb className="w-10 h-10" />
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight relative z-10 transition-colors group-hover:text-amber-600 uppercase">Devenez un Expert HOLA</h3>
                <p className="text-slate-500 font-medium max-w-lg mx-auto mb-10 leading-relaxed relative z-10 italic">
                    "Comme pour les villas, une commission de 15% est appliquée sur chaque prestation pour garantir la mise en avant de votre expertise et la gestion sécurisée."
                </p>

                <button className="px-10 py-4 bg-slate-900 text-white rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-amber-500 hover:text-slate-900 hover:shadow-2xl hover:shadow-amber-200 transition-all active:scale-95 relative z-10">
                    Découvrir les astuces
                </button>
            </div>

            <AddServiceModal
                isOpen={isModalOpen}
                onRefresh={fetchServices}
                onClose={() => { setIsModalOpen(false); setServiceToEdit(null); }}
                initialData={serviceToEdit}
            />
        </div>
    );
}
