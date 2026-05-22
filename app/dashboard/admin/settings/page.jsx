"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { usePlatformCommission } from '@/app/context/PlatformCommissionContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const { commission, setCommission, refresh } = usePlatformCommission();
  const [inputValue, setInputValue] = useState(commission);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // keep input synced with context when it loads
    setInputValue(commission);
  }, [commission]);

  const handleSave = async () => {
    if (isNaN(inputValue) || inputValue < 0 || inputValue > 100) {
      setMsg('Valeur invalide : entre 0 et 100');
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ commission_percent: Number(inputValue) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      setCommission(data.commission_percent);
      setMsg('✅ Mise à jour enregistrée');
      // refresh context for any other consumers
      await refresh();
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="modal-hola bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-100"
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <h1 className="text-2xl font-black text-slate-900 mb-6 text-center">
          Paramètres de la plateforme
        </h1>
        <div className="space-y-4">
          <label className="block text-sm font-black text-slate-600 uppercase">
            Pourcentage de commission (0‑100 %)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
          />
          {msg && (
            <p className={`text-sm ${msg.startsWith('✅') ? 'text-emerald-600' : 'text-rose-600'}`}>
              {msg}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Enregistrer
          </button>
          <Link href="/dashboard/admin" className="block text-center text-[#D4AF37] hover:underline mt-4">
            Retour au tableau de bord admin
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
