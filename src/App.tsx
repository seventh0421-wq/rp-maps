/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Search, Sparkles, Coffee, ChevronDown, Tag, HelpCircle, Shield, Heart, Calendar, User, FileText, MapPin, Map, X, Sun, Menu } from 'lucide-react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

import { auth, db, APP_ID } from './firebase';
import { Shop, Marker } from './types';
import { HOUSING_AREAS, SERVER_LIST, TAG_LIST, AREA_MAPS, RP_LEVEL_LIST } from './constants';
import { checkIsOpen, getPlotCoordinates, getWeekNumber, shuffleWithSeed } from './utils';
import { AdminLoginModal, AdminDashboard, HelpModal, DisclaimerModal, PasswordPromptModal, RegistrationModal, RPTutorialModal, RegistrationSuccessModal } from './components/Modals';
import { WeeklyItineraryModal } from './components/WeeklyItineraryModal';
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
  const [isHelpOpen, setIsHelpOpen] = useState(() => {
    // Check if user has seen help before
    const hasSeenHelp = localStorage.getItem('hasSeenHelp_v1');
    return hasSeenHelp !== 'true';
  }); 
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
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [registeredShop, setRegisteredShop] = useState<Shop | null>(null);
  const [notifications, setNotifications] = useState<{id: string, shop: Shop}[]>([]);
  const [lastNotified, setLastNotified] = useState<Record<string, string>>({}); // shopId -> date string
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const weeklyItinerary = React.useMemo(() => {
    if (shops.length === 0) return {};
    
    const now = new Date();
    const weekNum = getWeekNumber(now);
    const year = now.getFullYear();
    // Seed based on year and week to ensure it changes every Monday
    const seed = year * 100 + weekNum;
    
    // Deterministically shuffle shops for the week
    const shuffledShops = shuffleWithSeed<Shop>(shops, seed);
    const itinerary: Record<number, Shop[]> = {};
    
    // For each day of the week (0-6)
    [1, 2, 3, 4, 5, 6, 0].forEach((day, index) => {
      // Find shops open on this day
      const availableShops = shuffledShops.filter((s: Shop) => s.openDays?.includes(day));
      
      // Pick up to 3 shops per day to keep it manageable but diverse
      // Use a sliding window based on the day index to ensure different shops each day
      const startIdx = (index * 2) % Math.max(1, availableShops.length);
      const dayShops = availableShops.slice(startIdx, startIdx + 2);
      
      // If we didn't get enough shops, wrap around
      if (dayShops.length < 2 && availableShops.length > dayShops.length) {
        const remaining = 2 - dayShops.length;
        dayShops.push(...availableShops.slice(0, remaining));
      }
      
      // Sort by open time
      dayShops.sort((a, b) => {
        const timeA = a.openTime || '00:00';
        const timeB = b.openTime || '00:00';
        return timeA.localeCompare(timeB);
      });
      
      itinerary[day] = dayShops;
    });
    
    return itinerary;
  }, [shops]);

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

  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const todayStr = now.toDateString();
      
      const newlyOpened = shops.filter(shop => {
        if (!bookmarks.includes(shop.id)) return false;
        if (!checkIsOpen(shop)) return false;
        
        // Only notify once per day
        const lastDate = lastNotified[shop.id];
        return lastDate !== todayStr;
      });

      if (newlyOpened.length > 0) {
        const newNotifs = newlyOpened.map(shop => ({ id: `${shop.id}-${Date.now()}`, shop }));
        setNotifications(prev => [...prev, ...newNotifs]);
        
        setLastNotified(prev => {
          const next = { ...prev };
          newlyOpened.forEach(shop => {
            next[shop.id] = todayStr;
          });
          return next;
        });
        
        // Play sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
      }
    };

    // Initial check after a short delay to let data load
    const initialTimeout = setTimeout(checkNotifications, 3000);
    const interval = setInterval(checkNotifications, 60000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [shops, bookmarks, lastNotified]);

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

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
    const dataWithTimestamp = { ...shopData, updatedAt: Date.now() };
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'shops', shopData.id);
    try { 
      await setDoc(docRef, dataWithTimestamp); 
      setEditingShop(null);
      
      if (isEdit) {
        if (!isAdminDashboardOpen) {
          setSelectedShop(dataWithTimestamp);
          setIsSidebarOpen(true);
        }
      } else {
        // New registration
        setRegisteredShop(dataWithTimestamp);
        setIsSuccessModalOpen(true);
        
        if (!isAdminDashboardOpen) {
          setActiveServer(dataWithTimestamp.server);
          setActiveArea(dataWithTimestamp.location);
          setIsSubdivision(dataWithTimestamp.isApartment ? dataWithTimestamp.isSubdivision : dataWithTimestamp.plot > 30);
          setActiveTag('全部');
          setSelectedShop(dataWithTimestamp);
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

  const handleCloseHelp = () => {
    setIsHelpOpen(false);
    localStorage.setItem('hasSeenHelp_v1', 'true');
  };

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
      <HelpModal isOpen={isHelpOpen} onClose={handleCloseHelp} onOpenTutorial={() => { handleCloseHelp(); setIsRPTutorialOpen(true); }} />
      <RPTutorialModal isOpen={isRPTutorialOpen} onClose={() => setIsRPTutorialOpen(false)} />
      <RegistrationSuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} shopName={registeredShop?.name || ''} ownerName={registeredShop?.ownerName || ''} />
      <WeeklyItineraryModal 
        isOpen={isItineraryOpen} 
        onClose={() => setIsItineraryOpen(false)} 
        itinerary={weeklyItinerary}
        onSelectShop={(shop) => {
          setActiveServer(shop.server);
          setActiveArea(shop.location);
          setIsSubdivision(shop.isApartment ? shop.isSubdivision || false : shop.plot > 30);
          setSelectedShop(shop);
          setIsSidebarOpen(true);
        }}
      />
      <DisclaimerModal isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
      
      {/* Notification System */}
      <div className="fixed top-24 right-6 z-[6000] flex flex-col gap-3 pointer-events-none">
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            className="pointer-events-auto bg-white/95 backdrop-blur-xl border-2 border-pink-100 rounded-3xl p-4 shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full duration-500 max-w-xs cursor-pointer hover:bg-pink-50 transition-all hover:-translate-x-1"
            onClick={() => {
              handleSelectSuggestion(notif.shop);
              removeNotification(notif.id);
            }}
          >
            <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-3 rounded-2xl text-white shadow-lg shadow-pink-200">
              <Heart size={20} fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-0.5">愛店營業提醒</p>
              <h4 className="font-extrabold text-slate-800 text-sm truncate">您的愛店「{notif.shop.name}」</h4>
              <p className="text-[11px] font-bold text-slate-500">現在開始營業囉！</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
              className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <PasswordPromptModal isOpen={isPwdPromptOpen} onClose={() => setIsPwdPromptOpen(false)} onSubmit={handlePasswordSubmit} errorMsg={pwdErrorMsg} />
      <RegistrationModal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingShop(null); }} onSubmit={handleShopSubmit} currentArea={activeArea} editingShop={editingShop} />

      {/* Mobile Hamburger Menu Button */}
      <div className="fixed top-6 left-6 z-[1100] sm:hidden">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-3 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-lg text-slate-700 hover:text-emerald-600 transition-all"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[2000] sm:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute top-0 left-0 h-full w-[80%] max-w-sm bg-white shadow-2xl flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="bg-emerald-500 p-1.5 rounded-lg text-white shadow-sm">
                    <Map size={20} />
                  </div>
                  <span className="font-extrabold text-emerald-900 text-lg">光之街角</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">搜尋店鋪</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="搜尋店名、店主名稱..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all" 
                      value={searchQuery} 
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.trim() !== '') {
                          setIsListViewOpen(true);
                          setIsMobileMenuOpen(false);
                        }
                      }} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">選擇住宅區</label>
                  <div className="grid grid-cols-1 gap-2">
                    {HOUSING_AREAS.map(area => (
                      <button
                        key={area}
                        onClick={() => {
                          setActiveArea(area);
                          setIsSubdivision(false);
                          setIsSidebarOpen(false);
                          setHasInteracted(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full p-3 rounded-xl text-left font-bold text-sm transition-all border ${
                          activeArea === area 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">分區選擇</label>
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button 
                      onClick={() => { setIsSubdivision(false); setIsMobileMenuOpen(false); }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isSubdivision ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                    >
                      一般
                    </button>
                    <button 
                      onClick={() => { setIsSubdivision(true); setIsMobileMenuOpen(false); }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isSubdivision ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                    >
                      擴建
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">伺服器</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none"
                    value={activeServer}
                    onChange={(e) => { setActiveServer(e.target.value); setIsMobileMenuOpen(false); }}
                  >
                    {SERVER_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="h-px bg-slate-100 my-4"></div>

                <div className="space-y-4">
                  <button 
                    onClick={() => { setIsItineraryOpen(true); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-left group"
                  >
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-indigo-700 leading-tight">本週推薦行程</span>
                      <span className="text-[10px] font-bold text-indigo-400">一週探店指南</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => { handleRandomRecommend(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-left group"
                  >
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
                      <Sparkles size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-indigo-600 leading-tight">不知道去哪？</span>
                      <span className="text-[10px] font-bold text-indigo-400">點我隨機推薦</span>
                    </div>
                  </button>
                </div>

                {shops.filter(s => s.updatedAt && (Date.now() - s.updatedAt < 24 * 60 * 60 * 1000)).length > 0 && (
                  <div className="space-y-3">
                    <label className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      <Sun size={14} className="animate-spin-slow" /> 24H 最近更新
                    </label>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl overflow-hidden">
                      <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {shops
                          .filter(s => s.updatedAt && (Date.now() - s.updatedAt < 24 * 60 * 60 * 1000))
                          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
                          .map(shop => (
                            <div 
                              key={shop.id} 
                              onClick={() => { handleSelectSuggestion(shop); setIsMobileMenuOpen(false); }}
                              className="p-3 hover:bg-white rounded-xl cursor-pointer transition-colors border-b border-emerald-50/50 last:border-0 group"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <h5 className="text-sm font-black text-slate-800 truncate group-hover:text-emerald-600 transition-colors">{shop.name}</h5>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">NEW</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><MapPin size={10} /> {shop.location}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6 space-y-4">
                <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>系統資訊</span>
                    <span className="text-emerald-500">2026/04/14 更新</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600">
                        <User size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700">閻羅@奧汀</span>
                        <span className="text-[10px] font-bold text-slate-400">地圖作者</span>
                      </div>
                    </div>
                    <button onClick={() => { isAdmin ? setIsAdminDashboardOpen(true) : setIsAdminLoginOpen(true); setIsMobileMenuOpen(false); }} className={`p-2 rounded-lg transition-colors ${isAdmin ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`} title="後臺管理"><Shield size={16} /></button>
                  </div>
                  <button onClick={() => { setIsDisclaimerOpen(true); setIsMobileMenuOpen(false); }} className="w-full mt-2 py-2 text-[10px] font-black text-rose-500 bg-rose-50 rounded-lg border border-rose-100/50 flex items-center justify-center gap-1.5 uppercase tracking-widest"><FileText size={12} /> 免責聲明</button>
                </div>

                <button 
                  onClick={() => { setIsHelpOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 text-slate-500 font-bold hover:text-emerald-600 transition-colors"
                >
                  <HelpCircle size={20} /> 使用說明
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 left-0 w-full z-[500] p-4 hidden sm:flex flex-col items-center gap-3 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-lg p-3 flex items-center justify-between gap-4 pointer-events-auto max-w-[1000px] w-full">
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
                placeholder="搜尋店名、店主名稱或 ID..." 
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all shadow-sm" 
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
                      <div className="flex justify-between items-center"><span className="font-bold text-slate-800">{shop.name}</span><span className="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-md">{shop.server}</span></div>
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

      <div className="absolute bottom-6 right-6 z-[400] animate-in fade-in duration-700 hidden sm:block">
        <div className="bg-white/80 backdrop-blur-xl px-5 py-2.5 rounded-full border border-slate-200/60 shadow-lg text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-3 sm:gap-5">
          <span className="flex items-center gap-1.5 whitespace-nowrap"><Calendar size={14} className="text-emerald-500" /> 更新日期：2026/04/14</span>
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
          selectedShop={selectedShop}
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

      {/* Recently Updated & Random Recommend Buttons on Right Bottom */}
      <div className={`absolute right-6 z-[400] hidden sm:flex flex-col items-end gap-4 pointer-events-none transition-all duration-500 ${isSidebarOpen ? 'bottom-[88vh] sm:bottom-24' : 'bottom-24'}`}>
        {/* Recently Updated List */}
        {shops.filter(s => s.updatedAt && (Date.now() - s.updatedAt < 24 * 60 * 60 * 1000)).length > 0 && (
          <div className="pointer-events-auto w-64 bg-white/90 backdrop-blur-xl rounded-[2rem] border border-emerald-100 shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-500">
            <div className="bg-emerald-500 px-5 py-3 flex items-center gap-2">
              <Sun size={18} className="text-white animate-spin-slow" />
              <span className="text-sm font-black text-white uppercase tracking-widest">24H 最近更新</span>
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar p-2">
              {shops
                .filter(s => s.updatedAt && (Date.now() - s.updatedAt < 24 * 60 * 60 * 1000))
                .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
                .map(shop => (
                  <div 
                    key={shop.id} 
                    onClick={() => handleSelectSuggestion(shop)}
                    className="p-3 hover:bg-emerald-50 rounded-2xl cursor-pointer transition-colors border-b border-slate-50 last:border-0 group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h5 className="text-sm font-black text-slate-800 truncate group-hover:text-emerald-600 transition-colors">{shop.name}</h5>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">NEW</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><MapPin size={10} /> {shop.location}</span>
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><User size={10} /> {shop.ownerName || '店主'}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsItineraryOpen(true)}
          className="pointer-events-auto group bg-white/90 backdrop-blur-xl p-4 rounded-full border border-indigo-100 shadow-xl hover:shadow-indigo-200/50 hover:-translate-y-1 transition-all flex items-center gap-4 w-64"
        >
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform shrink-0">
            <Calendar size={22} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-black text-indigo-700 leading-tight">本週推薦行程</span>
            <span className="text-xs font-bold text-indigo-400">幫您排好一週探店指南！</span>
          </div>
        </button>

        <button 
          onClick={handleRandomRecommend}
          className="pointer-events-auto group bg-white/90 backdrop-blur-xl p-4 rounded-full border border-indigo-100 shadow-xl hover:shadow-indigo-200/50 hover:-translate-y-1 transition-all flex items-center gap-4 w-64"
        >
          <div className="w-11 h-11 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform shrink-0">
            <Sparkles size={22} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-black text-indigo-600 leading-tight">不知道去哪？</span>
            <span className="text-xs font-bold text-indigo-400">點我隨機推薦一間店！</span>
          </div>
        </button>
      </div>
    </div>
  );
}
