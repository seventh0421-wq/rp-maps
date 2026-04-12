/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Search, Sparkles, Coffee, ChevronDown, Tag, HelpCircle, Shield, Heart, Calendar, User, FileText, MapPin } from 'lucide-react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

import { auth, db, APP_ID } from './firebase';
import { Shop, Marker } from './types';
import { HOUSING_AREAS, SERVER_LIST, TAG_LIST, AREA_MAPS } from './constants';
import { checkIsOpen, getPlotCoordinates } from './utils';
import { AdminLoginModal, AdminDashboard, HelpModal, DisclaimerModal, PasswordPromptModal, RegistrationModal } from './components/Modals';
import { InteractiveMap } from './components/Map';
import { ShopSidebar } from './components/Sidebar';

export default function App() {
  const [user, setUser] = useState<any>(null); 
  const [shops, setShops] = useState<Shop[]>([]); 
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]); 

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null); 
  const [isHelpOpen, setIsHelpOpen] = useState(false); 
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isPwdPromptOpen, setIsPwdPromptOpen] = useState(false);
  const [pwdErrorMsg, setPwdErrorMsg] = useState('');
  const [shopToEdit, setShopToEdit] = useState<Shop | null>(null); 
  const [activeArea, setActiveArea] = useState('穹頂皓天'); 
  const [isSubdivision, setIsSubdivision] = useState(true);
  const [activeServer, setActiveServer] = useState('所有伺服器');
  const [activeTag, setActiveTag] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recommendation, setRecommendation] = useState<Shop | null>(null);
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) { console.error("Auth error:", error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const shopsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'shops');
    const unsubscribe = onSnapshot(shopsRef, (snapshot) => {
      const shopsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
      setShops(shopsData);
    }, (error) => console.error("讀取店鋪失敗:", error));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const bookmarksRef = collection(db, 'artifacts', APP_ID, 'users', user.uid, 'bookmarks');
    const unsubscribe = onSnapshot(bookmarksRef, (snapshot) => {
      const bks = snapshot.docs.map(doc => doc.id);
      setBookmarks(bks);
    }, (error) => console.error("讀取收藏失敗:", error));
    return () => unsubscribe();
  }, [user]);

  const toggleBookmark = async (shopId: string) => {
    if (!user) return;
    const isBookmarked = bookmarks.includes(shopId);
    const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'bookmarks', shopId);
    try { if (isBookmarked) { await deleteDoc(docRef); } else { await setDoc(docRef, { savedAt: Date.now() }); } } 
    catch (error) { console.error("更新收藏失敗:", error); }
  };

  useEffect(() => {
    const updateStatus = () => {
      const openNowShops = shops.filter(shop => {
        const shopIsSub = shop.isApartment ? shop.isSubdivision : shop.plot > 30;
        return checkIsOpen(shop) && shop.location === activeArea && (isSubdivision ? shopIsSub : !shopIsSub);
      });
      if (openNowShops.length > 0) {
        setRecommendation(prev => {
          if (prev && openNowShops.find(s => s.id === prev.id)) return prev;
          return openNowShops[Math.floor(Math.random() * openNowShops.length)];
        });
      } else { setRecommendation(null); }
    };
    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, [shops, activeArea, isSubdivision]);

  const filteredShops = shops.filter(shop => {
    const matchArea = shop.location === activeArea;
    const shopIsSub = shop.isApartment ? shop.isSubdivision : shop.plot > 30;
    const matchSubdivision = isSubdivision ? shopIsSub : !shopIsSub; 
    const matchServer = activeServer === '所有伺服器' || shop.server === activeServer;
    if (activeTag === '💖 收藏') { return bookmarks.includes(shop.id) && matchArea && matchSubdivision && matchServer; }
    const matchTag = activeTag === '全部' || shop.type === activeTag || (shop.tags && shop.tags.includes(activeTag));
    const matchSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || (shop.ownerId && shop.ownerId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchArea && matchSubdivision && matchServer && matchTag && matchSearch;
  });

  const mapMarkers: Marker[] = filteredShops.map(shop => {
    const coords = getPlotCoordinates(shop.location, shop.plot, shop.isApartment, shop.isSubdivision);
    return { id: shop.id, x: coords.x, y: coords.y, data: shop, isBookmarked: bookmarks.includes(shop.id) };
  });

  const dynamicTags = Array.from(new Set([...TAG_LIST, ...shops.map(shop => shop.type)]));
  const searchSuggestions = searchQuery.trim() === '' ? [] : shops.filter(shop => shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || (shop.ownerId && shop.ownerId.toLowerCase().includes(searchQuery.toLowerCase())));

  const handleSelectSuggestion = (shop: Shop) => {
    setSearchQuery(''); setActiveServer(shop.server); setActiveArea(shop.location); setIsSubdivision(shop.isApartment ? shop.isSubdivision : shop.plot > 30); setActiveTag('全部'); setIsSearchFocused(false); handleMarkerClick(shop); 
  };
  const handleMarkerClick = (shopData: Shop) => { setSelectedShop(shopData); setIsSidebarOpen(true); };
  const handleShopSubmit = async (shopData: Shop, isEdit: boolean) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'shops', shopData.id);
    try { await setDoc(docRef, shopData); if (isEdit && !isAdminDashboardOpen) { setSelectedShop(shopData); } setEditingShop(null); if (!isAdminDashboardOpen && !isEdit) { setActiveServer(shopData.server); setActiveArea(shopData.location); setIsSubdivision(shopData.isApartment ? shopData.isSubdivision : shopData.plot > 30); setActiveTag('全部'); } } 
    catch (error) { console.error("儲存店面失敗:", error); }
  };
  const handleDeleteShop = async (shopId: string) => { if (!user) return; try { await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'shops', shopId)); if (selectedShop?.id === shopId) setIsSidebarOpen(false); } catch (error) { console.error("刪除店面失敗:", error); } };
  const handleAddNewClick = () => { setEditingShop(null); setIsFormOpen(true); };
  const handleEditClick = (shop: Shop) => { if (isAdmin) { setEditingShop(shop); setIsFormOpen(true); } else { setPwdErrorMsg(''); setShopToEdit(shop); setIsPwdPromptOpen(true); } };
  const handlePasswordSubmit = (pwd: string) => { if (shopToEdit && pwd === shopToEdit.editPassword) { setIsPwdPromptOpen(false); setEditingShop(shopToEdit); setIsFormOpen(true); } else { setPwdErrorMsg('密碼錯誤，請重新輸入！'); } };

  return (
    <div className="w-full h-screen relative bg-[#f8f6f0] overflow-hidden font-sans text-slate-800">
      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} onLogin={() => { setIsAdmin(true); setIsAdminLoginOpen(false); setIsAdminDashboardOpen(true); }} />
      <AdminDashboard isOpen={isAdminDashboardOpen} onClose={() => setIsAdminDashboardOpen(false)} shops={shops} onEditShop={(shop) => { setEditingShop(shop); setIsFormOpen(true); }} onDeleteShop={handleDeleteShop} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <DisclaimerModal isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
      <PasswordPromptModal isOpen={isPwdPromptOpen} onClose={() => setIsPwdPromptOpen(false)} onSubmit={handlePasswordSubmit} errorMsg={pwdErrorMsg} />
      <RegistrationModal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingShop(null); }} onSubmit={handleShopSubmit} currentArea={activeArea} editingShop={editingShop} />

      <div className="absolute top-0 left-0 w-full z-[500] p-4 flex flex-col items-center gap-3 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-lg p-3 flex flex-wrap items-center justify-between gap-4 pointer-events-auto max-w-6xl w-full">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 px-3 select-none bg-emerald-50 py-1.5 rounded-xl border border-emerald-100">
              <div className="bg-emerald-500 p-1.5 rounded-lg text-white shadow-sm"><Coffee size={20} /></div>
              <div className="flex flex-col"><span className="font-extrabold text-emerald-900 text-lg leading-tight tracking-wide">光之街角</span><span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase">Eorzea RP Map</span></div>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden lg:block"></div>
            <div className="flex items-center bg-amber-50 rounded-xl px-4 py-2.5 border border-amber-200/60 shadow-sm">
              <select className="bg-transparent text-amber-900 text-sm font-extrabold outline-none cursor-pointer appearance-none pr-3" value={activeArea} onChange={(e) => { setActiveArea(e.target.value); setIsSubdivision(false); setIsSidebarOpen(false); }}>
                {HOUSING_AREAS.map(area => <option key={area} value={area} className="bg-white text-slate-800">{area}</option>)}
              </select>
              <ChevronDown size={16} className="text-amber-500" />
            </div>
            <div className="flex items-center bg-white/50 rounded-xl p-1 border border-slate-200/60 shadow-sm">
              <button onClick={() => { setIsSubdivision(false); setIsSidebarOpen(false); }} className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${!isSubdivision ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>一般</button>
              <button onClick={() => { setIsSubdivision(true); setIsSidebarOpen(false); }} className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${isSubdivision ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>擴建</button>
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="搜尋店名或店主 ID..." className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 transition-all shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} />
              {isSearchFocused && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[2000] py-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  {searchSuggestions.length > 0 ? (searchSuggestions.map(shop => (
                    <div key={shop.id} onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(shop); }} className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0 flex flex-col gap-1">
                      <div className="flex justify-between items-center"><span className="font-bold text-slate-800">{shop.name}</span><span className="text-[10px] font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-md">{shop.server}</span></div>
                      <div className="text-xs text-slate-500 flex justify-between"><span className="flex items-center gap-1"><Coffee size={12}/> {shop.ownerId || '未知店主'}</span><span className="flex items-center gap-1"><MapPin size={12}/> {shop.location}</span></div>
                    </div>
                  ))) : (<div className="px-4 py-6 text-center text-sm text-slate-500 font-bold flex flex-col items-center gap-2"><Search size={24} className="text-slate-300" />找不到符合的店鋪</div>)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <select className="bg-white text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 border border-slate-200 hidden sm:block" value={activeServer} onChange={(e) => { setActiveServer(e.target.value); setIsSidebarOpen(false); }}>
              {SERVER_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => setIsTagsOpen(!isTagsOpen)} className={`relative flex items-center gap-1.5 p-2.5 sm:px-3 sm:py-2.5 rounded-xl border transition-all ${isTagsOpen || activeTag !== '全部' ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm' : 'bg-transparent border-transparent text-slate-400 hover:text-amber-500'}`} title="店鋪類型篩選">
              <Tag size={22} />
              {activeTag !== '全部' && <span className="text-xs font-extrabold hidden sm:inline-block">{activeTag}</span>}
              {activeTag !== '全部' && <span className="sm:hidden absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white"></span>}
            </button>
            <button onClick={() => setIsHelpOpen(true)} className="p-2.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl" title="使用教學"><HelpCircle size={22} /></button>
            <button onClick={() => isAdmin ? setIsAdminDashboardOpen(true) : setIsAdminLoginOpen(true)} className={`p-2.5 rounded-xl ${isAdmin ? 'text-emerald-600 bg-emerald-100' : 'text-slate-400'}`} title="後臺管理"><Shield size={22} /></button>
            <button onClick={handleAddNewClick} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-md font-bold"><Plus size={18} strokeWidth={3} /><span className="hidden sm:inline">登記</span></button>
          </div>
        </div>
        {isTagsOpen && (
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar max-w-full px-4 py-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
            <button onClick={() => { setActiveTag('💖 收藏'); setIsSidebarOpen(false); }} className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all border shadow-sm whitespace-nowrap flex items-center gap-1.5 ${activeTag === '💖 收藏' ? 'bg-pink-500 border-pink-500 text-white transform scale-105' : 'bg-white/90 text-slate-500 hover:text-pink-500'}`}>
              <Heart size={14} fill={activeTag === '💖 收藏' ? "currentColor" : "none"} className={activeTag === '💖 收藏' ? "" : "text-pink-400"} />
              我的收藏 ({bookmarks.length})
            </button>
            {dynamicTags.map(tag => (
              <button key={tag} onClick={() => { setActiveTag(tag); setIsSidebarOpen(false); }} className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all border shadow-sm whitespace-nowrap ${activeTag === tag ? 'bg-amber-500 border-amber-500 text-white transform scale-105' : 'bg-white/90 text-slate-500 hover:text-amber-600'}`}>{tag}</button>
            ))}
          </div>
        )}
      </div>

      {recommendation && !isSidebarOpen && (
        <div className="absolute bottom-6 left-6 z-[400] pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div onClick={() => handleMarkerClick(recommendation)} className="group cursor-pointer bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-amber-100 shadow-lg flex items-center gap-4 max-w-sm hover:-translate-y-1 transition-all">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3.5 rounded-2xl text-white"><Sparkles size={24} /></div>
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-extrabold mb-1">正在營業中</p>
              <h4 className="font-extrabold text-slate-800 text-lg leading-tight truncate">{recommendation.name}</h4>
              <p className="text-xs font-bold text-slate-500 truncate mt-1">{recommendation.tags.join(' · ')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 right-6 z-[400] animate-in fade-in duration-700">
        <div className="bg-white/80 backdrop-blur-xl px-5 py-2.5 rounded-full border border-slate-200/60 shadow-lg text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-3 sm:gap-5">
          <span className="flex items-center gap-1.5 whitespace-nowrap"><Calendar size={14} className="text-emerald-500" /> 更新日期：2026/04/12</span>
          <div className="w-px h-3 bg-slate-300 hidden sm:block"></div>
          <div className="flex items-center gap-3 sm:gap-5">
            <button onClick={() => setIsDisclaimerOpen(true)} className="flex items-center gap-1 text-rose-500 hover:text-rose-700 font-extrabold py-0.5 px-2 bg-rose-50 rounded-lg border border-rose-100/50 transition-colors"><FileText size={14} /> 免責聲明</button>
            <span className="flex items-center gap-1.5 whitespace-nowrap"><User size={14} className="text-sky-500" /> 作者：閻羅@奧汀</span>
          </div>
        </div>
      </div>

      <ShopSidebar shop={selectedShop} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onEditClick={handleEditClick} isBookmarked={selectedShop ? bookmarks.includes(selectedShop.id) : false} onToggleBookmark={toggleBookmark} />
      <InteractiveMap imageUrl={(AREA_MAPS as any)[activeArea][isSubdivision ? 'sub' : 'normal']} bounds={{ width: 1000, height: 1000 }} markers={mapMarkers} onMarkerClick={handleMarkerClick} />
    </div>
  );
}
