/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Search, Sparkles, Coffee, ChevronDown, Tag, HelpCircle, Shield, Heart, Calendar, User, FileText, MapPin, Map } from 'lucide-react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

import { auth, db, APP_ID } from './firebase';
import { Shop, Marker } from './types';
import { HOUSING_AREAS, SERVER_LIST, TAG_LIST, AREA_MAPS, RP_LEVEL_LIST } from './constants';
import { checkIsOpen, getPlotCoordinates } from './utils';
import { AdminLoginModal, AdminDashboard, HelpModal, DisclaimerModal, PasswordPromptModal, RegistrationModal, RPTutorialModal, RegistrationSuccessModal } from './components/Modals';
import { InteractiveMap } from './components/Map';
import { ShopSidebar } from './components/Sidebar';
import { ShopList } from './components/ShopList';

export default function App() {
  const [user, setUser] = useState<any>(null); 
  const [shops, setShops] = useState<Shop[]>([]); 
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]); 

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null); 
  const [isHelpOpen, setIsHelpOpen] = useState(false); 
  const [isRPTutorialOpen, setIsRPTutorialOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isPwdPromptOpen, setIsPwdPromptOpen] = useState(false);
  const [pwdErrorMsg, setPwdErrorMsg] = useState('');
  const [shopToEdit, setShopToEdit] = useState<Shop | null>(null); 
  const [activeArea, setActiveArea] = useState('選擇住宅區'); 
  const [isSubdivision, setIsSubdivision] = useState(false);
  const [activeServer, setActiveServer] = useState('所有伺服器');
  const [activeTag, setActiveTag] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recommendation, setRecommendation] = useState<Shop | null>(null);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isListViewOpen, setIsListViewOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [registeredShop, setRegisteredShop] = useState<Shop | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

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
    
    let matchTag = activeTag === '全部' || shop.type === activeTag || (shop.tags && shop.tags.includes(activeTag));
    
    if (activeTag.startsWith('RP: ')) {
      const level = activeTag.replace('RP: ', '');
      matchTag = shop.rpLevels?.includes(level) || false;
    }

    const matchSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (shop.ownerName && shop.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (shop.ownerId && shop.ownerId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // 如果有輸入搜尋文字，則優先顯示全服全區符合搜尋的店
    if (searchQuery.trim() !== '') {
      // 在搜尋模式下，如果還有選標籤，則標籤也要符合
      if (activeTag !== '全部' && activeTag !== '💖 收藏') {
        return matchSearch && matchTag;
      }
      if (activeTag === '💖 收藏') {
        return matchSearch && bookmarks.includes(shop.id);
      }
      return matchSearch;
    }

    // 如果正在使用標籤篩選且列表開啟，則列表顯示「全服全區」符合標籤的店
    if (activeTag !== '全部' && isListViewOpen) {
      return matchTag && matchSearch;
    }

    return matchArea && matchSubdivision && matchServer && matchTag && matchSearch;
  });

  const mapMarkers: Marker[] = filteredShops
    .filter(shop => {
      const shopIsSub = shop.isApartment ? shop.isSubdivision : shop.plot > 30;
      return shop.location === activeArea && (isSubdivision ? shopIsSub : !shopIsSub);
    })
    .map(shop => {
      const coords = getPlotCoordinates(shop.location, shop.plot, shop.isApartment, shop.isSubdivision);
      return { id: shop.id, x: coords.x, y: coords.y, data: shop, isBookmarked: bookmarks.includes(shop.id) };
    });

  const dynamicTags = Array.from(new Set([...TAG_LIST, ...shops.map(shop => shop.type), ...RP_LEVEL_LIST.map(level => `RP: ${level}`)]));
  const searchSuggestions = searchQuery.trim() === '' ? [] : shops.filter(shop => 
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (shop.ownerName && shop.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (shop.ownerId && shop.ownerId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectSuggestion = (shop: Shop) => {
    setHasInteracted(true);
    setSearchQuery(''); setActiveServer(shop.server); setActiveArea(shop.location); setIsSubdivision(shop.isApartment ? shop.isSubdivision : shop.plot > 30); setActiveTag('全部'); setIsSearchFocused(false); handleMarkerClick(shop); 
  };

  const handleRandomRecommend = () => {
    if (shops.length === 0) return;
    const openShops = shops.filter(s => checkIsOpen(s));
    const pool = openShops.length > 0 ? openShops : shops;
    const randomShop = pool[Math.floor(Math.random() * pool.length)];
    handleSelectSuggestion(randomShop);
  };
  const handleMarkerClick = (shopData: Shop) => { 
    setHasInteracted(true);
    setSelectedShop(shopData); 
    setIsSidebarOpen(true); 
  };
  const handleShopSubmit = async (shopData: Shop, isEdit: boolean) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'shops', shopData.id);
    try { 
      await setDoc(docRef, shopData); 
      setEditingShop(null);
      
      if (isEdit) {
        if (!isAdminDashboardOpen) {
          setSelectedShop(shopData);
          setIsSidebarOpen(true);
        }
      } else {
        // New registration
        setRegisteredShop(shopData);
        setIsSuccessModalOpen(true);
        
        if (!isAdminDashboardOpen) {
          setActiveServer(shopData.server);
          setActiveArea(shopData.location);
          setIsSubdivision(shopData.isApartment ? shopData.isSubdivision : shopData.plot > 30);
          setActiveTag('全部');
          setSelectedShop(shopData);
          setIsSidebarOpen(true);
          setHasInteracted(true);
        }
      }
    } catch (error) { 
      console.error("儲存店面失敗:", error); 
    }
  };
  const handleDeleteShop = async (shopId: string) => { if (!user) return; try { await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'shops', shopId)); if (selectedShop?.id === shopId) setIsSidebarOpen(false); } catch (error) { console.error("刪除店面失敗:", error); } };
  const handleAddNewClick = () => { setEditingShop(null); setIsFormOpen(true); };
  const handleEditClick = (shop: Shop) => { if (isAdmin) { setEditingShop(shop); setIsFormOpen(true); } else { setPwdErrorMsg(''); setShopToEdit(shop); setIsPwdPromptOpen(true); } };
  const handlePasswordSubmit = (pwd: string) => { if (shopToEdit && pwd === shopToEdit.editPassword) { setIsPwdPromptOpen(false); setEditingShop(shopToEdit); setIsFormOpen(true); } else { setPwdErrorMsg('密碼錯誤，請重新輸入！'); } };

  return (
    <div className="w-full h-screen relative bg-[#f8f6f0] overflow-hidden font-sans text-slate-800">
      {/* Global Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.3] scale-105">
        <img 
          src="https://i.meee.com.tw/ToAUjvt.jpg" 
          alt="Background" 
          className="w-full h-full object-cover blur-[1px]"
          referrerPolicy="no-referrer"
        />
      </div>
      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} onLogin={() => { setIsAdmin(true); setIsAdminLoginOpen(false); setIsAdminDashboardOpen(true); }} />
      <AdminDashboard isOpen={isAdminDashboardOpen} onClose={() => setIsAdminDashboardOpen(false)} shops={shops} onEditShop={(shop) => { setEditingShop(shop); setIsFormOpen(true); }} onDeleteShop={handleDeleteShop} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} onOpenTutorial={() => { setIsHelpOpen(false); setIsRPTutorialOpen(true); }} />
      <RPTutorialModal isOpen={isRPTutorialOpen} onClose={() => setIsRPTutorialOpen(false)} />
      <RegistrationSuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} shopName={registeredShop?.name || ''} ownerName={registeredShop?.ownerName || ''} />
      <DisclaimerModal isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
      <PasswordPromptModal isOpen={isPwdPromptOpen} onClose={() => setIsPwdPromptOpen(false)} onSubmit={handlePasswordSubmit} errorMsg={pwdErrorMsg} />
      <RegistrationModal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingShop(null); }} onSubmit={handleShopSubmit} currentArea={activeArea} editingShop={editingShop} />

      <div className="absolute top-0 left-0 w-full z-[500] p-4 flex flex-col items-center gap-3 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-lg p-3 flex items-center justify-between gap-4 pointer-events-auto max-w-[1000px] w-full overflow-hidden">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 px-3 select-none bg-emerald-50 py-1.5 rounded-xl border border-emerald-100 shrink-0">
              <div className="bg-emerald-500 p-1.5 rounded-lg text-white shadow-sm">
                <Map size={20} />
              </div>
              <div className="flex flex-col hidden sm:flex"><span className="font-extrabold text-emerald-900 text-lg leading-tight tracking-wide">光之街角</span><span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase">Eorzea RP Map</span></div>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden lg:block"></div>
            <div className={`flex items-center rounded-xl px-3 py-2 border shadow-sm shrink-0 transition-all ${activeArea === '選擇住宅區' ? 'bg-slate-100 border-slate-200' : 'bg-amber-50 border-amber-200/60'}`}>
              <select className={`bg-transparent text-sm font-extrabold outline-none cursor-pointer appearance-none pr-3 ${activeArea === '選擇住宅區' ? 'text-slate-400' : 'text-amber-900'}`} value={activeArea} onChange={(e) => { setActiveArea(e.target.value); setIsSubdivision(false); setIsSidebarOpen(false); setHasInteracted(true); }}>
                <option value="選擇住宅區" disabled className="bg-white text-slate-400">選擇住宅區</option>
                {HOUSING_AREAS.map(area => <option key={area} value={area} className="bg-white text-slate-800">{area}</option>)}
              </select>
              <ChevronDown size={14} className={activeArea === '選擇住宅區' ? 'text-slate-400' : 'text-amber-500'} />
            </div>
            <div className={`flex items-center rounded-xl p-1 border shadow-sm shrink-0 transition-all ${activeArea === '選擇住宅區' ? 'bg-slate-50/50 border-slate-100 opacity-50 pointer-events-none' : 'bg-white/50 border-slate-200/60'}`}>
              <button onClick={() => { setIsSubdivision(false); setIsSidebarOpen(false); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeArea !== '選擇住宅區' && !isSubdivision ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>一般</button>
              <button onClick={() => { setIsSubdivision(true); setIsSidebarOpen(false); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeArea !== '選擇住宅區' && isSubdivision ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>擴建</button>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="relative flex-1 max-w-[600px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜尋店名、店主或標籤..." 
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 transition-all shadow-sm" 
                value={searchQuery} 
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() !== '') {
                    setIsListViewOpen(true);
                  }
                }} 
                onFocus={() => setIsSearchFocused(true)} 
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} 
              />
              {isSearchFocused && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[2000] py-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  {searchSuggestions.length > 0 ? (searchSuggestions.map(shop => (
                    <div key={shop.id} onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(shop); }} className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0 flex flex-col gap-1">
                      <div className="flex justify-between items-center"><span className="font-bold text-slate-800">{shop.name}</span><span className="text-[10px] font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-md">{shop.server}</span></div>
                      <div className="text-xs text-slate-500 flex justify-between"><span className="flex items-center gap-1"><Coffee size={12}/> {shop.ownerName || shop.ownerId || '未知店主'}</span><span className="flex items-center gap-1"><MapPin size={12}/> {shop.location}</span></div>
                    </div>
                  ))) : (<div className="px-4 py-6 text-center text-sm text-slate-500 font-bold flex flex-col items-center gap-2"><Search size={24} className="text-slate-300" />找不到符合的店鋪</div>)}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select className="bg-white text-slate-700 text-xs font-bold rounded-xl px-3 py-2 border border-slate-200 hidden xl:block" value={activeServer} onChange={(e) => { setActiveServer(e.target.value); setIsSidebarOpen(false); }}>
              {SERVER_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => setIsTagsOpen(!isTagsOpen)} className={`relative flex items-center gap-1.5 p-2 rounded-xl border transition-all shrink-0 ${isTagsOpen || activeTag !== '全部' ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm' : 'bg-transparent border-transparent text-slate-400 hover:text-amber-500'}`} title="店鋪類型篩選">
              <Tag size={20} />
              {activeTag !== '全部' && <span className="text-xs font-extrabold hidden sm:inline-block">{activeTag}</span>}
            </button>
            <button onClick={() => { setIsListViewOpen(!isListViewOpen); setIsSidebarOpen(false); }} className={`p-2 rounded-xl border transition-all shrink-0 ${isListViewOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm' : 'bg-transparent border-transparent text-slate-400 hover:text-emerald-500'}`} title="開啟店面列表"><FileText size={20} /></button>
            <button onClick={() => setIsHelpOpen(true)} className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl shrink-0" title="使用教學"><HelpCircle size={20} /></button>
            <button onClick={handleAddNewClick} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-md font-bold shrink-0 text-sm"><Plus size={16} strokeWidth={3} /><span className="hidden md:inline">店面登記</span></button>
          </div>
        </div>
        {isTagsOpen && (
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar max-w-full px-4 py-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
            <button onClick={() => { setActiveTag(activeTag === '💖 收藏' ? '全部' : '💖 收藏'); setIsSidebarOpen(false); }} className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all border shadow-sm whitespace-nowrap flex items-center gap-1.5 ${activeTag === '💖 收藏' ? 'bg-pink-500 border-pink-500 text-white transform scale-105' : 'bg-white/90 text-slate-500 hover:text-pink-500'}`}>
              <Heart size={14} fill={activeTag === '💖 收藏' ? "currentColor" : "none"} className={activeTag === '💖 收藏' ? "" : "text-pink-400"} />
              我的收藏 ({bookmarks.length})
            </button>
            {dynamicTags.map(tag => (
              <button key={tag} onClick={() => { setActiveTag(activeTag === tag ? '全部' : tag); setIsSidebarOpen(false); setIsListViewOpen(true); }} className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all border shadow-sm whitespace-nowrap ${activeTag === tag ? 'bg-amber-500 border-amber-500 text-white transform scale-105' : 'bg-white/90 text-slate-500 hover:text-amber-600'}`}>{tag}</button>
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
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 whitespace-nowrap"><User size={14} className="text-sky-500" /> 作者：閻羅@奧汀</span>
              <button onClick={() => isAdmin ? setIsAdminDashboardOpen(true) : setIsAdminLoginOpen(true)} className={`p-1.5 rounded-lg transition-colors ${isAdmin ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`} title="後臺管理"><Shield size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      {isListViewOpen && (
        <ShopList 
          shops={filteredShops} 
          activeTag={activeTag} 
          onClose={() => setIsListViewOpen(false)} 
          onShopClick={(shop) => {
            setActiveServer(shop.server);
            setActiveArea(shop.location);
            setIsSubdivision(shop.isApartment ? shop.isSubdivision : shop.plot > 30);
            handleMarkerClick(shop);
            // On mobile, close list when opening sidebar
            if (window.innerWidth < 640) setIsListViewOpen(false);
          }} 
        />
      )}

      <ShopSidebar shop={selectedShop} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onEditClick={handleEditClick} isBookmarked={selectedShop ? bookmarks.includes(selectedShop.id) : false} onToggleBookmark={toggleBookmark} isShifted={isListViewOpen} />
      
      {hasInteracted ? (
        <InteractiveMap 
          imageUrl={
            (AREA_MAPS as any)[activeArea] 
              ? (AREA_MAPS as any)[activeArea][isSubdivision ? 'sub' : 'normal']
              : null
          } 
          bounds={{ width: 1000, height: 1000 }} 
          markers={mapMarkers} 
          onMarkerClick={handleMarkerClick} 
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50/40 to-emerald-50/20 p-6 relative z-10">
          <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 flex items-center justify-center animate-bounce-slow">
                <img 
                  src="https://i.meee.com.tw/GcDoF16.png" 
                  alt="Welcome Logo" 
                  className="w-full h-full object-contain drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">歡迎來到光之街角</h1>
              <p className="text-xl text-slate-500 font-medium">推開這扇門，遇見艾奧傑亞的另一種生活。</p>
              <p className="text-sm text-emerald-600 font-bold bg-emerald-50 px-4 py-1.5 rounded-full inline-block border border-emerald-100">🖥️ 建議使用電腦版網頁以獲得最佳觀看體驗</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group cursor-pointer" onClick={() => { setHasInteracted(true); }}>
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform"><MapPin size={24} /></div>
                <h3 className="font-bold text-slate-800 mb-1">選擇地區開始探索</h3>
                <p className="text-sm text-slate-500">從上方的選單選擇您想前往的住宅區</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group cursor-pointer" onClick={handleRandomRecommend}>
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform"><Sparkles size={24} /></div>
                <h3 className="font-bold text-slate-800 mb-1">隨機推薦一間店</h3>
                <p className="text-sm text-slate-500">不知道去哪？讓我們為您挑選一間！</p>
              </div>
            </div>

            <div className="pt-8">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">請使用上方搜尋列或選擇地區以開啟地圖</p>
            </div>
          </div>
        </div>
      )}

      {/* Random Recommend Button on Right Bottom */}
      <div className="absolute right-6 bottom-24 z-[400] flex flex-col gap-4 pointer-events-none">
        <button 
          onClick={handleRandomRecommend}
          className="pointer-events-auto group bg-white/90 backdrop-blur-xl p-4 rounded-[2rem] border border-indigo-100 shadow-xl hover:shadow-indigo-200/50 hover:-translate-y-1 transition-all flex flex-col items-center gap-2 w-20 sm:w-24"
        >
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
            <Sparkles size={24} />
          </div>
          <span className="text-[10px] sm:text-xs font-black text-indigo-600 text-center leading-tight">隨機<br/>推薦</span>
        </button>
      </div>
    </div>
  );
}
