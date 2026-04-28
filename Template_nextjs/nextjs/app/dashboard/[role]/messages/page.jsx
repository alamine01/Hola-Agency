"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
    Search,
    Send,
    MoreHorizontal,
    Circle,
    User,
    Image as ImageIcon,
    Paperclip,
    Loader2,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useParams, useSearchParams } from 'next/navigation';

const ContactItem = ({ contact, active, onClick }) => (
    <div
        onClick={onClick}
        className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${active ? 'bg-indigo-50/50 border-indigo-600' : 'border-transparent'}`}
    >
        <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                {contact.avatar_url ? <img src={contact.avatar_url} alt="" /> : contact.display_name.charAt(0)}
            </div>
            {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-0.5">
                <h4 className="font-bold text-slate-900 truncate text-sm">{contact.display_name}</h4>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {contact.last_message_at ? new Date(contact.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{contact.last_message || 'Nouvelle conversation'}</p>
        </div>
    </div>
);

const isImageUrl = (str) => {
    if (!str) return false;
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(str) || str.includes('cloudinary.com') || str.includes('res.cloudinary');
};

const Message = ({ text, time, sent }) => {
    const isImage = isImageUrl(text);
    return (
        <div className={`flex flex-col ${sent ? 'items-end' : 'items-start'} mb-6`}>
            <div className={`max-w-[75%] p-4 rounded-2xl text-sm ${sent
                ? 'bg-slate-900 text-white rounded-tr-none shadow-md'
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                }`}>
                {isImage ? (
                    <img src={text} alt="Image" className="rounded-lg max-w-full h-auto cursor-pointer" onClick={() => window.open(text, '_blank')} />
                ) : (
                    text && <p className="leading-relaxed">{text}</p>
                )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    );
};

function MessagesContent() {
    const { role } = useParams();
    const searchParams = useSearchParams();
    const targetId = searchParams.get('id');
    const [currentUser, setCurrentUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) fetchConversations(user.id);
        };
        init();
    }, []);

    useEffect(() => {
        if (activeConv) {
            fetchMessages(activeConv.id);
            const channel = supabase
                .channel(`room-${activeConv.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${activeConv.id}`
                }, (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [activeConv]);

    useEffect(scrollToBottom, [messages]);

    const fetchConversations = async (userId) => {
        // Step 1: Fetch raw conversations
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
            .order('last_message_at', { ascending: false });

        if (error) {
            console.error("Fetch conversations error:", error);
            setIsLoading(false);
            return;
        }

        if (data && data.length > 0) {
            // Step 2: Get unique other-participant IDs
            const otherIds = [...new Set(data.map(c => c.participant_1 === userId ? c.participant_2 : c.participant_1))];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, display_name, avatar_url')
                .in('id', otherIds);

            const profileMap = {};
            (profiles || []).forEach(p => { profileMap[p.id] = p; });

            const formatted = data.map(conv => {
                const otherId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
                const other = profileMap[otherId];
                return {
                    ...conv,
                    display_name: other?.display_name || "Utilisateur HOLA",
                    avatar_url: other?.avatar_url,
                    other_id: otherId
                };
            });
            setConversations(formatted);

            // Auto-select based on query param if present
            if (targetId) {
                const target = formatted.find(c => c.id === targetId);
                if (target) setActiveConv(target);
                else if (formatted.length > 0) setActiveConv(formatted[0]);
            } else if (formatted.length > 0 && !activeConv) {
                setActiveConv(formatted[0]);
            }
        }
        setIsLoading(false);
    };

    const fetchMessages = async (convId) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });
        if (!error) setMessages(data || []);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv || !currentUser) return;

        const msgContent = newMessage.trim();
        setNewMessage('');

        const { data: inserted, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: activeConv.id,
                sender_id: currentUser.id,
                content: msgContent
            })
            .select()
            .single();

        if (error) {
            console.error("Send message error:", error);
            setNewMessage(msgContent);
            alert("Erreur d'envoi : " + error.message);
        } else {
            setMessages(prev => [...prev, inserted]);
            updateLastMessageTime();

            // Notify recipient
            const recipientId = activeConv.participant_1 === currentUser.id ? activeConv.participant_2 : activeConv.participant_1;
            const senderName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "Un utilisateur";

            await supabase
                .from('notifications')
                .insert({
                    user_id: recipientId,
                    title: "Nouveau message",
                    text: `Vous avez reçu un nouveau message de ${senderName}`,
                    type: "message",
                    metadata: { conversation_id: activeConv.id, sender_id: currentUser.id }
                });
        }
    };

    const updateLastMessageTime = async () => {
        await supabase
            .from('conversations')
            .update({ last_message_at: new Date() })
            .eq('id', activeConv.id);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeConv || !currentUser) return;

        // Restriction: Only images
        if (!file.type.startsWith('image/')) {
            alert("Uniquement les images sont autorisées.");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'hola_chat'); // <-- REMPLACER PAR VOTRE NOM DE PRESET SI DIFFÉRENT

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/deyrurfrw/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) throw new Error("Erreur Cloudinary");

            const data = await response.json();
            const imageUrl = data.secure_url;

            const { data: insertedImg, error: msgError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: activeConv.id,
                    sender_id: currentUser.id,
                    content: imageUrl
                })
                .select()
                .single();

            if (!msgError && insertedImg) {
                setMessages(prev => [...prev, insertedImg]);
                updateLastMessageTime();
            } else if (msgError) {
                alert("Erreur d'envoi image : " + msgError.message);
            }
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'envoi de l'image sur Cloudinary.");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="h-[calc(100vh-160px)] flex bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            {/* Sidebar Contacts */}
            <div className={`w-80 border-r border-slate-100 flex-col ${activeConv ? 'hidden lg:flex' : 'flex'}`}>
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
                    {conversations.map(conv => (
                        <ContactItem
                            key={conv.id}
                            contact={conv}
                            active={activeConv?.id === conv.id}
                            onClick={() => setActiveConv(conv)}
                        />
                    ))}
                    {conversations.length === 0 && (
                        <p className="p-6 text-center text-slate-400 text-xs italic">Aucune conversation trouvée.</p>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex-col min-w-0 min-h-0 bg-slate-50/10 ${activeConv ? 'flex' : 'hidden lg:flex'}`}>
                {activeConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 px-6 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setActiveConv(null)}
                                    className="p-2 lg:hidden text-slate-400 hover:text-slate-900 -ml-2"
                                >
                                    <ChevronRight className="w-6 h-6 rotate-180" />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                    {activeConv.display_name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-tight text-sm">{activeConv.display_name}</h3>
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
                        <div className="flex-1 overflow-y-auto p-6 min-h-0 scroll-smooth touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                            <div className="flex flex-col">
                                {messages.map((msg, idx) => (
                                    <Message
                                        key={msg.id || idx}
                                        text={msg.content}
                                        time={msg.created_at}
                                        sent={msg.sender_id === currentUser.id}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Chat Input */}
                        <div className="p-6 bg-white border-t border-slate-100">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 pr-4 shadow-inner">
                                <div className="flex items-center gap-1">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                    >
                                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Tapez votre message ici..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-90 disabled:opacity-50 disabled:scale-100"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                            <p className="text-[9px] text-slate-400 text-center mt-2 font-medium italic">Photos uniquement • Sécurité HOLA</p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-10" />
                        <p className="text-sm font-medium">Sélectionnez une conversation pour commencer à discuter</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>}>
            <MessagesContent />
        </Suspense>
    );
}

function MessageSquare(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}
