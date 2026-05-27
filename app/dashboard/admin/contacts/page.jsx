"use client";
 
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, MailOpen, Trash2, Calendar, User, Info, Check, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
 
export default function AdminContactsPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    const [activeMessage, setActiveMessage] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
 
    useEffect(() => {
        fetchMessages();
    }, []);
 
    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });
 
            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Erreur fetch messages contact:', error);
        } finally {
            setLoading(false);
        }
    };
 
    const toggleReadStatus = async (id, currentStatus) => {
        setUpdatingId(id);
        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ is_read: !currentStatus })
                .eq('id', id);
 
            if (error) throw error;
 
            setMessages(messages.map(m => m.id === id ? { ...m, is_read: !m.is_read } : m));
            if (activeMessage && activeMessage.id === id) {
                setActiveMessage({ ...activeMessage, is_read: !activeMessage.is_read });
            }
        } catch (error) {
            console.error('Erreur update read status:', error);
        } finally {
            setUpdatingId(null);
        }
    };
 
    const deleteMessage = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce message ?")) return;
        setUpdatingId(id);
        try {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .eq('id', id);
 
            if (error) throw error;
 
            setMessages(messages.filter(m => m.id !== id));
            if (activeMessage && activeMessage.id === id) {
                setActiveMessage(null);
            }
        } catch (error) {
            console.error('Erreur suppression message:', error);
            alert("Une erreur est survenue lors de la suppression.");
        } finally {
            setUpdatingId(null);
        }
    };
 
    const filteredMessages = messages.filter(m => {
        if (filter === 'unread') return !m.is_read;
        if (filter === 'read') return m.is_read;
        return true;
    });
 
    const unreadCount = messages.filter(m => !m.is_read).length;
 
    if (loading) {
        return <div className="h-full flex items-center justify-center p-20"><Loader2 className="animate-spin text-slate-900 w-8 h-8" /></div>;
    }
 
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Messages de Contact</h1>
                    <p className="text-slate-500 mt-2 font-medium italic">Gérez les demandes de réservation sur-mesure, les candidatures de prestataires et les questions des clients.</p>
                </div>
                
                {/* Stats badge */}
                {unreadCount > 0 && (
                    <div className="px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 self-start md:self-center shrink-0">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}
                    </div>
                )}
            </div>
 
            {/* Quick Filters */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit gap-1 shrink-0">
                {[
                    { id: 'all', label: 'Tous' },
                    { id: 'unread', label: 'Non lus' },
                    { id: 'read', label: 'Lus' }
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === f.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
 
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Message List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[65vh] overflow-y-auto">
                        <div className="divide-y divide-slate-100">
                            {filteredMessages.map((msg) => (
                                <div 
                                    key={msg.id}
                                    onClick={() => {
                                        setActiveMessage(msg);
                                        if (!msg.is_read) toggleReadStatus(msg.id, false);
                                    }}
                                    className={`p-6 cursor-pointer hover:bg-slate-50/50 transition-all border-l-4 flex gap-4 items-start ${activeMessage?.id === msg.id ? 'bg-slate-50 border-amber-600' : 'border-transparent'} ${!msg.is_read ? 'bg-amber-50/20' : ''}`}
                                >
                                    <div className={`p-2.5 rounded-xl shrink-0 ${!msg.is_read ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {!msg.is_read ? <Mail className="w-5 h-5" /> : <MailOpen className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <h3 className={`text-sm truncate uppercase tracking-tight ${!msg.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>{msg.name}</h3>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <h4 className={`text-xs truncate ${!msg.is_read ? 'font-black text-slate-800' : 'font-medium text-slate-500'}`}>{msg.subject || 'Pas de sujet'}</h4>
                                        <p className="text-slate-400 text-xs italic truncate mt-1">{msg.message}</p>
                                    </div>
                                </div>
                            ))}
 
                            {filteredMessages.length === 0 && (
                                <div className="py-20 text-center text-slate-400 font-bold italic flex flex-col items-center justify-center gap-2">
                                    <MailOpen className="w-10 h-10 text-slate-200" />
                                    <span>Aucun message de contact reçu dans cette catégorie.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
 
                {/* Right Side: Message Details */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {activeMessage ? (
                            <motion.div
                                key={activeMessage.id}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-[0_20px_50px_rgb(0,0,0,0.04)] space-y-6 sticky top-28"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 italic">Expéditeur</p>
                                        <h2 className="text-lg font-black text-slate-900 truncate uppercase leading-tight">{activeMessage.name}</h2>
                                        <a href={`mailto:${activeMessage.email}`} className="text-xs font-semibold text-amber-600 hover:underline truncate block mt-0.5">{activeMessage.email}</a>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            onClick={() => toggleReadStatus(activeMessage.id, activeMessage.is_read)}
                                            disabled={updatingId === activeMessage.id}
                                            className={`p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors`}
                                            title={activeMessage.is_read ? "Marquer comme non lu" : "Marquer comme lu"}
                                        >
                                            {activeMessage.is_read ? <Mail className="w-4.5 h-4.5" /> : <MailOpen className="w-4.5 h-4.5" />}
                                        </button>
                                        <button
                                            onClick={() => deleteMessage(activeMessage.id)}
                                            disabled={updatingId === activeMessage.id}
                                            className="p-2 rounded-xl border border-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-50/50 transition-colors"
                                            title="Supprimer définitivement"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>
 
                                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1 italic">Sujet de la demande</p>
                                    <p className="text-xs font-bold text-slate-900 leading-snug">{activeMessage.subject || 'Pas de sujet'}</p>
                                </div>
 
                                <div className="space-y-2">
                                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest italic">Contenu du message</p>
                                    <div className="text-xs text-slate-600 leading-relaxed font-medium bg-white p-5 rounded-2xl border border-slate-100/75 shadow-inner min-h-[160px] whitespace-pre-line">
                                        {activeMessage.message}
                                    </div>
                                </div>
 
                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 italic">
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-300" /> {new Date(activeMessage.created_at).toLocaleString('fr-FR')}</span>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-10 text-center text-slate-400 italic font-bold flex flex-col items-center justify-center gap-3 min-h-[300px]">
                                <Info className="w-10 h-10 text-slate-200" />
                                <span>Sélectionnez un message à gauche pour lire les détails.</span>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
