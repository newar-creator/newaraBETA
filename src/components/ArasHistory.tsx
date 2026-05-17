import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Coins, ArrowDownRight, ArrowUpRight, Clock, Star, Gift, PlusCircle, History } from 'lucide-react';
import { motion } from 'motion/react';
import { AeroCard, GlossyButton } from './AeroUI';

interface ArasHistoryProps {
  theme: 'white' | 'black' | 'aero';
  userName: string;
  userAras: number;
}

export function ArasHistory({ theme, userName, userAras }: ArasHistoryProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userName || userName === 'Estudiante') {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', userName.trim(), 'ara_transactions'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(arr);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userName]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'activity_created': return <PlusCircle size={20} className="text-rose-500" />;
      case 'donacion_enviada': return <ArrowUpRight size={20} className="text-orange-500" />;
      case 'donacion_recibida': return <Gift size={20} className="text-emerald-500" />;
      case 'minigame_reward': return <Star size={20} className="text-amber-500" />;
      case 'leaderboard_reward': return <Star size={20} className="text-yellow-500" />;
      default: return <Coins size={20} className="text-blue-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <AeroCard theme={theme} className="w-full md:w-1/3 flex flex-col items-center justify-center p-8 text-center min-h-[250px]">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 border-4 border-amber-500/20">
            <Coins size={40} className="text-amber-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Mi Saldo</p>
          <p className="text-5xl font-black text-amber-500 tracking-tighter">{userAras}</p>
          <span className="text-xs font-black uppercase tracking-widest mt-1 opacity-80">Aras</span>
        </AeroCard>

        <AeroCard title="Historial de Transacciones" theme={theme} className="w-full md:w-2/3">
          {loading ? (
            <div className="flex items-center justify-center py-10 opacity-50">
              <Clock className="animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
              <History size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-black uppercase tracking-widest">No hay transacciones aún</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {transactions.map(tx => (
                <div 
                  key={tx.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border ${
                    theme === 'black' ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-2 sm:mb-0">
                    <div className={`p-3 rounded-full ${
                      tx.amount > 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                    }`}>
                      {getIcon(tx.type)}
                    </div>
                    <div>
                      <p className={`font-bold ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{tx.details}</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-50 font-black mt-1">
                        {tx.timestamp ? formatDate(tx.timestamp.toDate()) : '...'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-xl font-black flex items-center gap-1 ${
                    tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} <Coins size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </AeroCard>
      </div>
    </div>
  );
}
