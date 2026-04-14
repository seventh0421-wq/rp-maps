import React from 'react';
import { Shop } from '../types';
import { MapPin, Coffee, Clock, Sparkles, X, ChevronRight } from 'lucide-react';
import { checkIsOpen } from '../utils';

interface ShopListProps {
  shops: Shop[];
  onShopClick: (shop: Shop) => void;
  onClose: () => void;
  activeTag: string;
}

export const ShopList = ({ shops, onShopClick, onClose, activeTag }: ShopListProps) => {
  return (
    <div className="absolute left-0 top-0 sm:top-[140px] bottom-0 w-full sm:w-[350px] z-[900] bg-white/95 backdrop-blur-xl border-r border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
        <div>
          <h3 className="font-black text-emerald-900 flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-500" />
            {activeTag === '全部' ? '所有店面' : activeTag}
          </h3>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">找到 {shops.length} 間店鋪</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
          <X size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-3">
        {shops.length > 0 ? (
          shops.map(shop => {
            const isOpen = checkIsOpen(shop);
            return (
              <div 
                key={shop.id}
                onClick={() => onShopClick(shop)}
                className="group bg-white border border-slate-100 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex gap-3"
              >
                <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                  <img 
                    src={shop.images?.[0] || 'https://images.unsplash.com/photo-1579781354186-012d7e9fa46c?q=80&w=200&auto=format&fit=crop'} 
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-black text-slate-800 truncate text-base">{shop.name}</h4>
                      <div className={`shrink-0 w-2.5 h-2.5 rounded-full mt-2 ${isOpen ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mt-1.5">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{shop.server}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {shop.location}{shop.isApartment ? '公寓' : ''}{shop.ward}-{shop.isApartment ? shop.plot.toString().padStart(3, '0') : shop.plot}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {shop.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-black px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md border border-amber-100">
                        {tag}
                      </span>
                    ))}
                    {shop.tags.length > 2 && <span className="text-[10px] font-black text-slate-400">+{shop.tags.length - 2}</span>}
                  </div>
                </div>
                <div className="flex items-center text-slate-300 group-hover:text-emerald-500 transition-colors">
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <MapPin size={40} className="opacity-20" />
            <p className="font-bold text-sm">此區域暫無店鋪</p>
          </div>
        )}
      </div>
    </div>
  );
};
