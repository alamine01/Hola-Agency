"use client";

import React from 'react';
import {
    Search,
    Send,
    MoreHorizontal,
    Circle,
    User,
    Image as ImageIcon,
    Paperclip
} from 'lucide-react';

const ContactItem = ({ name, lastMessage, time, active, online }) => (
    <div className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${active ? 'bg-indigo-50/50 border-indigo-600' : 'border-transparent'}`}>
        <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                {name.charAt(0)}
            </div>
            {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-0.5">
                <h4 className="font-bold text-slate-900 truncate">{name}</h4>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">{time}</span>
            </div>
            <p className="text-xs text-slate-500 truncate">{lastMessage}</p>
        </div>
    </div>
);

const Message = ({ text, time, sent }) => (
    <div className={`flex flex-col ${sent ? 'items-end' : 'items-start'} mb-6`}>
        <div className={`max-w-[75%] p-4 rounded-2xl text-sm ${sent
                ? 'bg-slate-900 text-white rounded-tr-none shadow-md'
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
            }`}>
            {text}
        </div>
        <span className="text-[10px] text-slate-400 mt-1 px-1">{time}</span>
    </div>
);

export default function MessagesPage() {
    return (
        <div className="h-[calc(100vh-160px)] flex bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            {/* Sidebar Contacts */}
            <div className="w-80 border-r border-slate-100 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600/20"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ContactItem name="Fatou Diop" lastMessage="Est-ce que la villa est disponible le 12 ?" time="10:45" active online />
                    <ContactItem name="Moussa Sarr" lastMessage="Le paiement a été envoyé hier." time="Hier" />
                    <ContactItem name="Abdou Khadre" lastMessage="Merci pour votre accueil !" time="Lun" />
                    <ContactItem name="Awa Ndiaye" lastMessage="Je confirme pour le dîner privé." time="23 Mars" />
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
                {/* Chat Header */}
                <div className="h-20 px-6 border-b border-slate-100 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">F</div>
                        <div>
                            <h3 className="font-bold text-slate-900 leading-tight text-sm">Fatou Diop</h3>
                            <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                                <Circle className="w-1.5 h-1.5 fill-emerald-500" /> En ligne
                            </p>
                        </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-900 rounded-lg">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col">
                    <div className="text-center py-4 mb-6">
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aujourd'hui</span>
                    </div>

                    <Message text="Bonjour ! J'ai vu votre annonce pour la Villa Saly Exception. Est-elle toujours disponible pour les dates du 12 au 15 Avril ?" time="10:30" />
                    <Message text="Bonjour Madame Diop, enchanté. Oui, la villa est parfaitement disponible à ces dates. Vous seriez combien de personnes ?" time="10:35" sent />
                    <Message text="Nous serions 4 adultes et 2 enfants. Est-il possible d'avoir un berceau supplémentaire ?" time="10:45" />
                    <Message text="Bien sûr, nous avons tout l'équipement nécessaire pour les enfants. Je vous active la réservation ?" time="10:50" sent />
                </div>

                {/* Chat Input */}
                <div className="p-6 bg-white border-t border-slate-100">
                    <form className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 pr-4 shadow-inner">
                        <div className="flex items-center gap-1">
                            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><Paperclip className="w-5 h-5" /></button>
                            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><ImageIcon className="w-5 h-5" /></button>
                        </div>
                        <input
                            type="text"
                            placeholder="Tapez votre message ici..."
                            className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                        />
                        <button className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-90">
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
