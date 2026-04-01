"use client";

import React from 'react';
import {
    Calendar,
    MapPin,
    ChevronRight,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    XCircle
} from 'lucide-react';

const ReservationCard = ({ property, date, price, status }) => {
    const statusStyles = {
        confirmée: "bg-emerald-100 text-emerald-700",
        "en attente": "bg-amber-100 text-amber-700",
        annulée: "bg-red-100 text-red-700",
    };

    const StatusIcon = {
        confirmée: CheckCircle2,
        "en attente": Clock,
        annulée: XCircle,
    }[status];

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{property.name}</h3>
                    <p className="text-slate-500 text-sm flex items-center gap-1 mb-2">
                        <MapPin className="w-3.5 h-3.5" /> {property.location}
                    </p>
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md flex items-center gap-1 ${statusStyles[status]}`}>
                            <StatusIcon className="w-3 h-3" /> {status}
                        </span>
                        <span className="text-xs text-slate-400">{date}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-right">
                    <p className="text-xs text-slate-400 mb-0.5">Montant total</p>
                    <p className="text-xl font-black text-slate-900">{price}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                        Détails
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 rounded-lg">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ClientReservationsPage() {
    const reservations = [
        {
            property: { name: "Villa Saly Exception", location: "Saly, Sénégal", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400" },
            date: "12 Avr - 15 Avr 2025",
            price: "255,000 FCFA",
            status: "confirmée"
        },
        {
            property: { name: "Appartement Plateau", location: "Dakar, Sénégal", image: "https://images.unsplash.com/photo-1502672260266-1c1db2dba659?auto=format&fit=crop&q=80&w=400" },
            date: "20 Mai - 22 Mai 2025",
            price: "100,000 FCFA",
            status: "en attente"
        }
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Mes Réservations</h1>
                    <p className="text-slate-500">Gérez vos séjours passés et à venir.</p>
                </div>
                <div className="flex bg-white rounded-xl p-1 border border-slate-100 shadow-sm self-start">
                    <button className="px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg">Toutes</button>
                    <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-lg transition-colors">À venir</button>
                    <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-lg transition-colors">Passées</button>
                </div>
            </div>

            <div className="space-y-6">
                {reservations.map((res, idx) => (
                    <ReservationCard key={idx} {...res} />
                ))}
            </div>
        </div>
    );
}
