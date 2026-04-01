"use client";

import React, { useState } from 'react';
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
    CheckCircle2
} from 'lucide-react';

const VillaCard = ({ villa }) => {
    // Calcul du net (85% du prix brut comme dans le PHP original)
    const priceValue = parseInt(villa.price.replace(/[^0-9]/g, ''));
    const netPrice = Math.floor(priceValue * 0.85);

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-4 flex flex-col gap-4 hover:shadow-xl transition-all group shadow-sm">
            <div className="relative h-48 sm:h-56 rounded-[1.5rem] overflow-hidden bg-slate-100">
                <img src={villa.image} alt={villa.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl text-[10px] font-black uppercase tracking-[0.1em] text-slate-800 shadow-sm border border-white/50">
                    {villa.type}
                </div>
            </div>

            <div className="px-1">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 truncate tracking-tight">{villa.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {villa.rating}
                    </div>
                </div>
                <p className="text-slate-500 text-[11px] font-medium flex items-center gap-1 mb-4 italic">
                    <MapPin className="w-3 h-3 text-indigo-500" /> {villa.location}
                </p>

                <div className="grid grid-cols-2 gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest py-3 border-t border-slate-50/80">
                    <span className="flex items-center gap-2"><Bed className="w-3.5 h-3.5 text-slate-400" /> {villa.rooms} Ch.</span>
                    <span className="flex items-center gap-2 font-black"><Users className="w-3.5 h-3.5 text-slate-400" /> {villa.guests} Pers.</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50/80">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Revenu Net (-15%)</p>
                        <p className="font-black text-indigo-600 text-lg">{netPrice.toLocaleString()} <span className="text-[10px] font-bold">FCFA</span></p>
                        <p className="text-[9px] font-medium text-slate-400 mt-1 opacity-70 italic">Brut : {villa.price}</p>
                    </div>
                    <button className="p-2.5 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all border border-slate-50">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddVillaModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={onClose} className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-100 z-10 border border-slate-50">
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight pr-10">Nouvelle Annonce</h2>
                    <p className="text-slate-400 font-medium text-sm mt-1">Configurez votre bien pour la plateforme HOLA</p>
                </div>

                <div className="space-y-6">
                    {/* Compact Image Uploader */}
                    <div className="group relative border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center hover:border-indigo-600/40 transition-all cursor-pointer bg-slate-50/30 hover:bg-white overflow-hidden">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500 shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform">
                            <Upload className="w-7 h-7" />
                        </div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Photos de la villa</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Glissez-déposez vos fichiers ici</p>
                    </div>

                    <div className="space-y-6">
                        {/* Section Identification */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1">Nom du logement</label>
                                <input type="text" placeholder="ex: Villa Paradise Saly" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600/30 focus:bg-white transition-all text-xs font-black text-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1">Type de bien</label>
                                <select className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600/30 focus:bg-white transition-all text-xs font-black text-slate-900 appearance-none cursor-pointer">
                                    <option>Villa Prestige</option>
                                    <option>Appartement Luxe</option>
                                    <option>Résidence Privée</option>
                                </select>
                            </div>
                        </div>

                        {/* Section Localisation (Synchronisée PHP) */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1">Ville</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input type="text" placeholder="Saly" className="w-full pl-10 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600/30 transition-all text-xs font-black text-slate-900" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1">Pays</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input type="text" placeholder="Sénégal" className="w-full pl-10 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600/30 transition-all text-xs font-black text-slate-900" />
                                </div>
                            </div>
                        </div>

                        {/* Section Caractéristiques */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1 text-center block">Chambres</label>
                                <input type="number" placeholder="4" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600/30 transition-all text-xs font-black text-center" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1 text-center block">Capacité</label>
                                <input type="number" placeholder="8" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600/30 transition-all text-xs font-black text-center" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1 text-center block text-indigo-600">Prix/Nuit</label>
                                <input type="number" placeholder="85000" className="w-full px-5 py-4 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-xs font-black text-center text-indigo-600" />
                            </div>
                        </div>

                        {/* Section Méthodes de paiement (Synchronisée PHP) */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1 block">Méthodes de paiement acceptées</label>
                            <div className="flex flex-wrap gap-3">
                                {['Wave', 'Orange Money', 'Virement', 'Carte Bancaire'].map((method) => (
                                    <label key={method} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/50 hover:bg-indigo-50 rounded-xl border border-slate-100 cursor-pointer transition-all group">
                                        <input type="checkbox" className="hidden" />
                                        <div className="w-4 h-4 rounded-md border-2 border-slate-200 group-hover:border-indigo-400 flex items-center justify-center bg-white">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">{method}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1">Description vendeur</label>
                            <textarea rows="3" placeholder="Quels sont les atouts majeurs (Piscine, Bord de mer...) ?" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600/30 transition-all text-xs font-medium resize-none"></textarea>
                        </div>

                        <button className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 active:scale-95 mt-4 group">
                            Publier mon annonce <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ProprietaireVillasPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const villas = [
        {
            name: "Villa Saly Exception",
            location: "Saly, Sénégal",
            price: "85,000 FCFA",
            rooms: 4,
            guests: 4,
            rating: "4.8",
            type: "Villa",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400"
        },
        {
            name: "L'Escale de Somone",
            location: "Somone, Sénégal",
            price: "50,000 FCFA",
            rooms: 2,
            guests: 2,
            rating: "4.9",
            type: "Appartement",
            image: "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&q=80&w=400"
        },
        {
            name: "Villas Palmes d'Or",
            location: "Saly, Sénégal",
            price: "120,000 FCFA",
            rooms: 6,
            guests: 8,
            rating: "4.7",
            type: "Villa",
            image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=400"
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Mes Villas</h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base italic">Gérez votre parc immobilier et suivez la rentabilité de vos annonces.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                    <Plus className="w-5 h-5" strokeWidth={4} /> Ajouter une villa
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {villas.map((villa, idx) => (
                    <VillaCard key={idx} villa={villa} />
                ))}
            </div>

            <div className="mt-20 mb-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-indigo-200/50">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight">Optimisez vos rendements</h3>
                        <p className="text-indigo-100 text-sm md:text-base max-w-xl font-medium leading-relaxed opacity-90">
                            HOLA prélève une commission de 15% pour assurer la gestion, le marketing et la sécurité de vos locations. Le montant affiché "Net" est ce qui sera versé sur votre compte.
                        </p>
                    </div>
                    <button className="px-10 py-4 bg-white text-indigo-600 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-50 transition-all shadow-xl active:scale-95 shrink-0 whitespace-nowrap">
                        Guide du propriétaire
                    </button>
                </div>
            </div>

            <AddVillaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
