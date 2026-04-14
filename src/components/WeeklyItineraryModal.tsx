/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Calendar, MapPin, Clock, Sparkles, ChevronRight, Compass } from 'lucide-react';
import { Shop } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface WeeklyItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: Record<number, Shop[]>;
  onSelectShop: (shop: Shop) => void;
}

export const WeeklyItineraryModal = ({ isOpen, onClose, itinerary, onSelectShop }: WeeklyItineraryModalProps) => {
  if (!isOpen) return null;

  const today = new Date().getDay();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 translate-x-10 -translate-y-10">
              <Compass size={200} />
            </div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Weekly Adventure</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight">本週推薦行程</h2>
                <p className="text-indigo-100 mt-2 font-bold">根據營業時間為您精心挑選的探店指南</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const dayShops = itinerary[day] || [];
                const isToday = day === today;

                return (
                  <div 
                    key={day}
                    className={`flex flex-col rounded-3xl border transition-all duration-300 ${
                      isToday 
                        ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-100/50 ring-2 ring-indigo-500/20' 
                        : 'bg-white/60 border-slate-200 hover:border-indigo-200 hover:bg-white hover:shadow-lg'
                    }`}
                  >
                    <div className={`p-4 border-b flex items-center justify-between ${isToday ? 'bg-indigo-50/50 border-indigo-100' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                          isToday ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {DAYS_OF_WEEK[day]}
                        </div>
                        <span className={`font-black ${isToday ? 'text-indigo-900' : 'text-slate-700'}`}>
                          星期{DAYS_OF_WEEK[day]}
                        </span>
                      </div>
                      {isToday && (
                        <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-1 rounded-full uppercase tracking-widest animate-pulse">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex flex-col gap-3">
                      {dayShops.length > 0 ? (
                        dayShops.map((shop) => (
                          <button
                            key={shop.id}
                            onClick={() => {
                              onSelectShop(shop);
                              onClose();
                            }}
                            className="group flex flex-col gap-2 p-3 rounded-2xl hover:bg-indigo-50 transition-all text-left border border-transparent hover:border-indigo-100"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                {shop.name}
                              </h4>
                              <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                                <MapPin size={12} className="text-slate-400" />
                                <span>{shop.location}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-500">
                                <Clock size={12} className="text-indigo-400" />
                                <span>{shop.openTime} {shop.closeTime ? `- ${shop.closeTime}` : ''}</span>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                          <Sparkles size={24} className="opacity-20" />
                          <span className="text-xs font-bold">今日暫無推薦行程</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-white border-t border-slate-100 flex flex-col items-center gap-2 shrink-0">
            <p className="text-xs font-bold text-slate-400 flex items-center gap-2 italic">
              <Sparkles size={14} />
              每週一自動更新，讓每間優質店面都有機會與您相遇
            </p>
            <p className="text-[10px] font-black text-rose-400 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100/50">
              ⚠️ 提醒：若店家本週營業時間有臨時變動，請以店主之最新公告為準
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
