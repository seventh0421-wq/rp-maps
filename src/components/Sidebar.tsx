/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Heart, Edit3, Globe, MapPin, Clock, MessageSquare, Twitter, MessageCircle, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Shop } from '../types';
import { checkIsOpen } from '../utils';
import { DAYS_OF_WEEK } from '../constants';

export const ShopSidebar = ({ shop, isOpen, onClose, onEditClick, isBookmarked, onToggleBookmark }: { shop: Shop | null, isOpen: boolean, onClose: () => void, onEditClick: (shop: Shop) => void, isBookmarked: boolean, onToggleBookmark: (id: string) => void }) => {
  const [currentImgIndex, setCurrentImgIndex] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  if (!shop) return null;
  const imagesToDisplay = shop.images && shop.images.length > 0 ? shop.images : ['https://images.unsplash.com/photo-1579781354186-012d7e9fa46c?q=80&w=800&auto=format&fit=crop'];
  const isCurrentlyOpen = checkIsOpen(shop);
  const displayDays = shop.openDays?.map(d => DAYS_OF_WEEK[d]).join('、') || '';
  
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      setCurrentImgIndex(index);
    }
  };

  const scrollPrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.offsetWidth, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.offsetWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className={`absolute z-[1000] transform transition-transform duration-300 ease-in-out pointer-events-none flex flex-col top-0 left-0 h-full w-full sm:top-[96px] sm:left-6 sm:h-auto sm:max-h-[calc(100vh-120px)] sm:w-[400px] ${isOpen ? 'translate-x-0' : '-translate-x-full sm:-translate-x-[calc(100%+24px)]'}`}>
      <div className="w-full h-full sm:h-auto sm:max-h-[calc(100vh-120px)] bg-white/95 backdrop-blur-2xl sm:rounded-[2rem] sm:border border-slate-200 shadow-2xl flex flex-col text-slate-800 overflow-hidden pointer-events-auto relative">
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button onClick={() => onToggleBookmark(shop.id)} className={`p-2 backdrop-blur-md rounded-full shadow-lg transition-all ${isBookmarked ? 'bg-pink-500 text-white' : 'bg-white/90 text-pink-500'}`} title={isBookmarked ? "取消收藏" : "加入收藏"}><Heart size={18} fill={isBookmarked ? "currentColor" : "none"} /></button>
          <button onClick={() => onEditClick(shop)} className="p-2 bg-amber-500 rounded-full text-white shadow-lg" title="編輯店面資訊"><Edit3 size={18} /></button>
          <button onClick={onClose} className="p-2 bg-black/30 hover:bg-white/90 rounded-full text-white hover:text-slate-800 transition-all shadow-sm"><X size={20} /></button>
        </div>
        <div className="relative h-60 sm:h-64 shrink-0 bg-slate-100 overflow-hidden group/photos">
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full scroll-smooth"
          >
            {imagesToDisplay.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`${shop.name}-${idx}`} 
                className="w-full h-full object-cover shrink-0 snap-center" 
                draggable="false"
              />
            ))}
          </div>

          {imagesToDisplay.length > 1 && (
            <>
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold pointer-events-none">
                {currentImgIndex + 1} / {imagesToDisplay.length} 左右滑動
              </div>
              
              {/* Navigation Arrows */}
              <button 
                onClick={scrollPrev}
                className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/20 hover:bg-white/90 text-white hover:text-slate-800 backdrop-blur-sm transition-all opacity-0 group-hover/photos:opacity-100 ${currentImgIndex === 0 ? 'invisible' : ''}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={scrollNext}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/20 hover:bg-white/90 text-white hover:text-slate-800 backdrop-blur-sm transition-all opacity-0 group-hover/photos:opacity-100 ${currentImgIndex === imagesToDisplay.length - 1 ? 'invisible' : ''}`}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
<div className="absolute bottom-5 left-6 right-6 pointer-events-none">
            <div className="flex gap-2 mb-2">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isCurrentlyOpen ? 'bg-emerald-500 text-white' : 'bg-slate-500/80 text-white'}`}>{isCurrentlyOpen ? '營業中' : '休息中'}</div>
              {shop.rpLevels && shop.rpLevels.length > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white shadow-sm">RP: {shop.rpLevels.join('/')}</div>
              )}
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-wide">{shop.name}</h2>
            <div className="flex gap-2 flex-wrap">{shop.tags?.map(tag => <span key={tag} className="px-2.5 py-1 text-xs font-bold bg-amber-500/90 text-white rounded-lg">{tag}</span>)}</div>
          </div>
        </div>
        <div className="p-7 flex flex-col gap-6 bg-gradient-to-b from-white to-slate-50/50 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-5 text-sm shrink-0">
            <div className="flex items-start gap-4"><div className="p-2.5 bg-sky-100 rounded-xl text-sky-600 shadow-sm border border-sky-200/50"><Globe size={20} /></div><div><p className="text-slate-500 text-xs font-bold mb-0.5">所在伺服器</p><p className="font-extrabold text-slate-800 text-base">{shop.server}</p></div></div>
            <div className="flex items-start gap-4"><div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 shadow-sm border border-emerald-200/50"><MapPin size={20} /></div><div><p className="text-slate-500 text-xs font-bold mb-0.5">詳細地址</p><p className="font-extrabold text-slate-800 text-base">{shop.location} 第 {shop.ward} 區 {shop.isApartment ? `公寓 ${shop.plot}號房` : `${shop.plot}番地`}</p></div></div>
            <div className="flex items-start gap-4"><div className="p-2.5 bg-amber-100 rounded-xl text-amber-600 shadow-sm border border-amber-200/50"><Clock size={20} /></div><div><p className="text-slate-500 text-xs font-bold mb-0.5">營業時間</p><p className="font-extrabold text-slate-800 text-base">每週{displayDays} {shop.openTime} - {shop.closeTime}</p></div></div>
          </div>
          <div className="h-px bg-slate-200 w-full my-1 shrink-0"></div>
          <div className="shrink-0"><h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2"><MessageSquare size={18} className="text-emerald-500"/> 店鋪介紹</h3><p className="text-sm text-slate-700 leading-relaxed bg-white p-5 rounded-2xl border border-slate-200 shadow-sm whitespace-pre-wrap font-medium">{shop.description}</p></div>
          {shop.socialLinks && (shop.socialLinks.twitter || shop.socialLinks.discord || shop.socialLinks.website) && (<div className="shrink-0 flex gap-3 mt-2">{shop.socialLinks.twitter && (<a href={shop.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center gap-2 bg-[#1DA1F2]/10 text-[#1DA1F2] py-2.5 rounded-xl text-sm"><Twitter size={18} /> Twitter</a>)}{shop.socialLinks.discord && (<a href={shop.socialLinks.discord} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center gap-2 bg-[#5865F2]/10 text-[#5865F2] py-2.5 rounded-xl text-sm"><MessageCircle size={18} /> Discord</a>)}{shop.socialLinks.website && (<a href={shop.socialLinks.website} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center gap-2 bg-emerald-50 text-emerald-600 py-2.5 rounded-xl text-sm"><LinkIcon size={18} /> 網站</a>)}</div>)}
        </div>
      </div>
    </div>
  );
};
