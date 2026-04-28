"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Home,
    Plus,
    Search,
    MapPin,
    Bed,
    Users,
    MoreHorizontal,
    Star,
    X,
    Upload,
    Camera,
    CreditCard,
    DollarSign,
    Globe,
    CheckCircle2,
    Loader2,
    Building2,
    Image as ImageIcon,
    Wifi,
    Palmtree,
    Waves,
    Car,
    Coffee
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const VillaCard = ({ villa, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    // Calcul du net (85% du prix brut comme dans le PHP original)
    const priceValue = villa.price || 0;
    const salePrice = villa.sale_price;
    const activePrice = salePrice && salePrice > 0 ? salePrice : priceValue;
    const netPrice = Math.floor(activePrice * 0.85);

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-4 flex flex-col gap-4 hover:shadow-xl transition-all group shadow-sm relative overflow-hidden">
            {salePrice && salePrice > 0 && (
                <div className="absolute top-6 -left-8 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-10 py-1.5 -rotate-45 z-10 shadow-lg">
                    PROMO
                </div>
            )}
            <div className="relative h-48 sm:h-56 rounded-[1.5rem] overflow-hidden bg-slate-50">
                {villa.image ? (
                    <img src={villa.image} alt={villa.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <Building2 className="w-12 h-12" />
                    </div>
                )}
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl text-[10px] font-black uppercase tracking-[0.1em] text-slate-800 shadow-sm border border-white/50 italic">
                    {villa.type || 'Hébergement'}
                </div>
            </div>

            <div className="px-1">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 truncate tracking-tight uppercase text-sm">{villa.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {villa.rating || '0.0'}
                    </div>
                </div>
                <p className="text-slate-500 text-[11px] font-medium flex items-center gap-1 mb-4 italic truncate">
                    <MapPin className="w-3 h-3 text-amber-500" /> {villa.location || 'Sénégal'}
                </p>

                <div className="grid grid-cols-2 gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest py-3 border-t border-slate-50/80">
                    <span className="flex items-center gap-2"><Bed className="w-3.5 h-3.5 text-slate-400" /> {villa.rooms || 0} Ch.</span>
                    <span className="flex items-center gap-2 font-black"><Users className="w-3.5 h-3.5 text-slate-400" /> {villa.guests || 0} Pers.</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50/80">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Revenu Net (-15%)</p>
                        <p className="font-black text-amber-600 text-lg">{netPrice.toLocaleString()} <span className="text-[10px] font-bold">FCFA</span></p>
                        <div className="flex items-center gap-2 mt-1">
                            {salePrice && salePrice > 0 ? (
                                <>
                                    <p className="text-[9px] font-black text-slate-900">{salePrice.toLocaleString()} <span className="text-[8px]">FCFA</span></p>
                                    <p className="text-[9px] font-medium text-slate-400 line-through italic opacity-70">{priceValue.toLocaleString()} FCFA</p>
                                </>
                            ) : (
                                <p className="text-[9px] font-medium text-slate-400 opacity-70 italic">Brut : {priceValue.toLocaleString()} FCFA</p>
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2.5 text-slate-400 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-all border border-slate-50"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {showMenu && (
                            <>
                                <div className="absolute bottom-full right-0 mb-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                                    <button onClick={() => { setShowMenu(false); onEdit(villa); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors uppercase tracking-widest">Modifier</button>
                                    <button onClick={() => { setShowMenu(false); onDelete(villa.id); }} className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors uppercase tracking-widest">Supprimer</button>
                                </div>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddVillaModal = ({ isOpen, onClose, onRefresh, initialData }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'Villa Prestige',
        city: '',
        country: 'Sénégal',
        rooms: '',
        guests: '',
        price: '',
        sale_price: '',
        description: '',
        payment_methods: [],
        amenities: []
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    type: initialData.type || 'Villa Prestige',
                    city: initialData.city || '',
                    country: initialData.country || 'Sénégal',
                    rooms: initialData.rooms || '',
                    guests: initialData.guests || '',
                    price: initialData.price || '',
                    sale_price: initialData.sale_price || '',
                    description: initialData.description || '',
                    payment_methods: initialData.payment_methods || [],
                    amenities: initialData.amenities || []
                });
                setPreview(initialData.image || null);
            } else {
                setFormData({ name: '', type: 'Villa Prestige', city: '', country: 'Sénégal', rooms: '', guests: '', price: '', sale_price: '', description: '', payment_methods: [], amenities: [] });
                setPreview(null);
            }
            setFile(null);
        }
    }, [initialData, isOpen]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const toggleAmenity = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const togglePaymentMethod = (method) => {
        setFormData(prev => ({
            ...prev,
            payment_methods: prev.payment_methods.includes(method)
                ? prev.payment_methods.filter(m => m !== method)
                : [...prev.payment_methods, method]
        }));
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

            let imageUrl = initialData?.image || '';
            if (file) {
                // Upload to Cloudinary
                const cloudData = new FormData();
                cloudData.append('file', file);
                cloudData.append('upload_preset', 'hola_chat'); // Use existing prefix
                const resp = await fetch(`https://api.cloudinary.com/v1_1/deyrurfrw/image/upload`, { method: 'POST', body: cloudData });
                const uploaded = await resp.json();
                imageUrl = uploaded.secure_url;
            }

            const payload = {
                owner_id: user.id,
                name: formData.name,
                type: formData.type,
                city: formData.city,
                country: formData.country,
                location: `${formData.city}, ${formData.country}`,
                rooms: parseInt(formData.rooms) || 0,
                guests: parseInt(formData.guests) || 0,
                price: parseInt(formData.price),
                sale_price: formData.sale_price ? parseInt(formData.sale_price) : null,
                description: formData.description,
                payment_methods: formData.payment_methods,
                amenities: formData.amenities,
                image: imageUrl,
                status: 'active'
            };

            let error;
            if (initialData && initialData.id) {
                const { error: updateError } = await supabase
                    .from('villas')
                    .update(payload)
                    .eq('id', initialData.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('villas')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            onRefresh();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'enregistrement : " + err.message);
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
                className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <button onClick={onClose} className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-100 z-10 border border-slate-50">
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight pr-10 uppercase">Nouvelle Annonce</h2>
                    <p className="text-slate-400 font-medium text-sm mt-1 italic">Configurez votre bien pour la plateforme HOLA</p>
                </div>

                <div className="space-y-6">
                    {/* Compact Image Uploader */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative border-2 border-dashed border-slate-200 rounded-[2rem] p-4 text-center hover:border-amber-600/40 transition-all cursor-pointer bg-slate-50/30 hover:bg-white overflow-hidden min-h-[160px] flex flex-col items-center justify-center"
                    >
                        {preview ? (
                            <div className="absolute inset-0">
                                <img src={preview} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white w-8 h-8" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 text-amber-500 shadow-xl shadow-amber-100 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Photo de la villa (Requis)</p>
                                <p className="text-[9px] text-slate-400 mt-1 font-medium italic">Format JPG, PNG supporté</p>
                            </>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1">Nom du logement</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="ex: Villa Paradise Saly"
                                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-amber-600/30 focus:bg-white transition-all text-xs font-black text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1">Type de bien</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-amber-600/30 focus:bg-white transition-all text-xs font-black text-slate-900 appearance-none cursor-pointer"
                                >
                                    <option>Villa Prestige</option>
                                    <option>Appartement Luxe</option>
                                    <option>Résidence Privée</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1">Ville</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Saly"
                                        className="w-full pl-10 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-amber-600/30 transition-all text-xs font-black text-slate-900"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1">Pays</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                                        placeholder="Sénégal"
                                        className="w-full pl-10 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-amber-600/30 transition-all text-xs font-black text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1 text-center block">Chambres</label>
                                <input
                                    type="number"
                                    value={formData.rooms}
                                    onChange={e => setFormData({ ...formData, rooms: e.target.value })}
                                    placeholder="4"
                                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-amber-600/30 transition-all text-xs font-black text-center"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1 text-center block">Capacité</label>
                                <input
                                    type="number"
                                    value={formData.guests}
                                    onChange={e => setFormData({ ...formData, guests: e.target.value })}
                                    placeholder="8"
                                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-amber-600/30 transition-all text-xs font-black text-center"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1 text-center block text-slate-400">Prix Normal</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="85000"
                                    className="w-full px-5 py-4 bg-slate-50/30 border border-slate-100/50 rounded-2xl outline-none focus:border-slate-400 transition-all text-xs font-black text-center text-slate-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-amber-600 uppercase tracking-[0.15em] pl-1 text-center block">Mise en vente</label>
                                <input
                                    type="number"
                                    value={formData.sale_price}
                                    onChange={e => setFormData({ ...formData, sale_price: e.target.value })}
                                    placeholder="Promo ?"
                                    className="w-full px-5 py-4 bg-amber-50/30 border border-amber-100/50 rounded-2xl outline-none focus:border-amber-600 focus:bg-white transition-all text-xs font-black text-center text-amber-600 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1 block">Méthodes acceptées</label>
                            <div className="flex flex-wrap gap-2">
                                {['Wave', 'Orange Money', 'PayPal', 'Carte Bancaire'].map((method) => (
                                    <label key={method} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${formData.payment_methods.includes(method) ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.payment_methods.includes(method)}
                                            onChange={() => togglePaymentMethod(method)}
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">{method}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1 block">Commodités (Optionnel)</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'WiFi', icon: Wifi },
                                    { id: 'Piscine', icon: Waves },
                                    { id: 'Parking', icon: Car },
                                    { id: 'Petit-déjeuner', icon: Coffee },
                                    { id: 'Climatisation', icon: Globe }
                                ].map((item) => (
                                    <label key={item.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${formData.amenities.includes(item.id) ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.amenities.includes(item.id)}
                                            onChange={() => toggleAmenity(item.id)}
                                        />
                                        <item.icon className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">{item.id}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1">Description vendeur</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                placeholder="Résidence privée avec vue sur mer..."
                                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-amber-600/30 transition-all text-xs font-medium resize-none shadow-inner"
                            />
                        </div>

                        <button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-amber-600 transition-all shadow-2xl shadow-slate-200 active:scale-95 mt-4 group flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {publishing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : "Publier mon annonce"}
                            {!publishing && <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default function ProprietaireVillasPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [villas, setVillas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingVilla, setEditingVilla] = useState(null);

    useEffect(() => {
        fetchVillas();
    }, []);

    const fetchVillas = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('villas')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) setVillas(data);
        }
        setLoading(false);
    };

    const handleEdit = (villa) => {
        setEditingVilla(villa);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;

        const { error } = await supabase
            .from('villas')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Erreur lors de la suppression : " + error.message);
        } else {
            fetchVillas();
        }
    };

    const openEmptyModal = () => {
        setEditingVilla(null);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-0 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">Mes Villas</h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base italic opacity-80">Gérez votre parc immobilier et suivez la rentabilité de vos annonces.</p>
                </div>
                <button
                    onClick={openEmptyModal}
                    className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-amber-100 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                    <Plus className="w-5 h-5" strokeWidth={4} /> Ajouter une villa
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-slate-50 animate-pulse rounded-[2rem]"></div>
                    ))
                ) : villas.length > 0 ? (
                    villas.map((villa) => (
                        <VillaCard
                            key={villa.id}
                            villa={villa}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="col-span-full bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center">
                        <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold italic">Vous n'avez pas encore publié d'annonce.</p>
                    </div>
                )}
            </div>



            <AddVillaModal
                isOpen={isModalOpen}
                onRefresh={fetchVillas}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingVilla(null);
                }}
                initialData={editingVilla}
            />
        </div>
    );
}
