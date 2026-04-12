/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Shield, KeyRound, HelpCircle, MapPin, Sparkles, Search, Edit3, Heart, MessageSquare, Twitter, MessageCircle, Link as LinkIcon, ImageIcon, Plus, Trash2, Globe, FileText, AlertTriangle, Settings } from 'lucide-react';
import { Shop } from '../types';
import { TAG_LIST, SERVER_LIST, HOUSING_AREAS, DAYS_OF_WEEK } from '../constants';

export const AdminLoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: () => void }) => {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === 'admin123') { onLogin(); setPwd(''); setError(''); } 
    else { setError('管理員密碼錯誤！'); }
  };
  return (
    <div className="absolute inset-0 z-[4000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 border-2 border-emerald-500/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Shield className="text-emerald-600" size={20} /> 管理員登入</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-slate-500 mb-4">請輸入最高權限管理員密碼以進入後臺。</p>
          <input type="password" required autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 mb-2 font-mono" placeholder="輸入管理員密碼..." value={pwd} onChange={(e) => setPwd(e.target.value)} />
          {error && <p className="text-xs text-red-500 font-bold mb-4">{error}</p>}
          <button type="submit" className="w-full py-2.5 mt-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/30">登入後臺</button>
        </form>
      </div>
    </div>
  );
};

export const AdminDashboard = ({ isOpen, onClose, shops, onEditShop, onDeleteShop }: { isOpen: boolean, onClose: () => void, shops: Shop[], onEditShop: (shop: Shop) => void, onDeleteShop: (id: string) => void }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[3500] flex items-center justify-center p-4 sm:p-8 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-5xl h-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-sm text-white"><Shield size={24} /></div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 leading-tight">光之街角 後臺管理系統</h2>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Admin Dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all shadow-sm"><X size={24} /></button>
        </div>
        <div className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 sticky top-0 backdrop-blur-md z-10 shadow-sm">
              <tr>
                <th className="p-4 text-xs font-extrabold text-slate-500 uppercase">店名</th>
                <th className="p-4 text-xs font-extrabold text-slate-500 uppercase hidden sm:table-cell">伺服器</th>
                <th className="p-4 text-xs font-extrabold text-slate-500 uppercase">位置</th>
                <th className="p-4 text-xs font-extrabold text-slate-500 uppercase hidden md:table-cell">類型</th>
                <th className="p-4 text-xs font-extrabold text-rose-500 uppercase">編輯密碼</th>
                <th className="p-4 text-xs font-extrabold text-slate-500 uppercase text-right">管理操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {shops.length === 0 ? (<tr><td colSpan={6} className="p-8 text-center text-slate-400 font-bold">目前沒有任何店面資料</td></tr>) : (
                shops.map(shop => (
                  <tr key={shop.id} className="hover:bg-white transition-colors group">
                    <td className="p-4"><div className="font-bold text-slate-800">{shop.name}</div><div className="text-xs text-slate-500 font-mono mt-0.5">ID: {shop.id}</div></td>
                    <td className="p-4 hidden sm:table-cell"><span className="px-2.5 py-1 bg-sky-100 text-sky-700 font-bold text-xs rounded-lg">{shop.server}</span></td>
                    <td className="p-4 text-sm font-bold text-slate-600">{shop.location} {shop.ward}區 {shop.isApartment ? `公寓 ${shop.plot}號` : `${shop.plot}番地`}</td>
                    <td className="p-4 hidden md:table-cell text-sm text-slate-500">{shop.type}</td>
                    <td className="p-4 text-sm font-mono font-bold text-rose-500 bg-rose-50/50 border-l border-r border-rose-100/50">{shop.editPassword}</td>
                    <td className="p-4 text-right"><div className="flex justify-end gap-2">
                        <button onClick={() => onEditShop(shop)} className="px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white rounded-lg text-xs font-bold transition-colors">編輯</button>
                        <button onClick={() => { if(window.confirm(`確定要刪除「${shop.name}」嗎？這無法復原。`)) onDeleteShop(shop.id) }} className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition-colors">刪除</button>
                    </div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-amber-50 border-t border-amber-200 shrink-0 flex items-center gap-3"><AlertTriangle size={20} className="text-amber-500 shrink-0" /><p className="text-xs font-bold text-amber-800">您正處於最高權限管理員模式。在此面板中的任何編輯與刪除操作將直接生效，請謹慎操作。</p></div>
      </div>
    </div>
  );
};

export const PasswordPromptModal = ({ isOpen, onClose, onSubmit, errorMsg }: { isOpen: boolean, onClose: () => void, onSubmit: (pwd: string) => void, errorMsg: string }) => {
  const [pwd, setPwd] = useState('');
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(pwd); setPwd(''); };
  return (
    <div className="absolute inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><KeyRound className="text-amber-500" size={20} /> 驗證編輯權限</h3><button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button></div>
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-slate-500 mb-4">請輸入這家店在登記時設定的編輯密碼。</p>
          <input type="password" required autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 mb-2" placeholder="請輸入編輯密碼..." value={pwd} onChange={(e) => setPwd(e.target.value)} />
          {errorMsg && <p className="text-xs text-red-500 font-bold mb-2">{errorMsg}</p>}
          <p className="text-xs text-slate-400 font-medium mb-4">忘記店鋪編輯密碼了嗎？請聯絡 <span className="font-bold text-emerald-600">閻羅＠奧汀</span> 協助找回。</p>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">取消</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/30">確認</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const HelpModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-sky-50"><h2 className="text-xl font-bold text-sky-800 flex items-center gap-2"><HelpCircle className="text-sky-500" size={22} /> 使用教學</h2><button onClick={onClose} className="text-sky-700/50 hover:text-sky-700 transition-colors bg-white p-1 rounded-full shadow-sm"><X size={20} /></button></div>
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar flex flex-col gap-6 text-slate-700">
          <div className="flex items-start gap-4"><div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 shrink-0 shadow-sm border border-slate-200/50"><MapPin size={20} /></div><div><h4 className="font-bold text-slate-800 mb-1">瀏覽與探索</h4><p className="text-sm text-slate-600 leading-relaxed">拖曳地圖與滾動縮放。點擊地圖上的圖釘，即可開啟側邊欄查看店鋪的詳細資訊與相簿。</p></div></div>
          <div className="flex items-start gap-4"><div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 shrink-0 shadow-sm border border-emerald-200/50"><Sparkles size={20} /></div><div><h4 className="font-bold text-slate-800 mb-1">營業中即時燈號</h4><p className="text-sm text-slate-600 leading-relaxed">圖釘右上角若亮起「<span className="text-emerald-500 font-bold">閃爍的綠燈</span>」，代表該店鋪現在正在營業中！</p></div></div>
          <div className="flex items-start gap-4"><div className="p-2.5 bg-amber-100 rounded-xl text-amber-600 shrink-0 shadow-sm border border-amber-200/50"><Search size={20} /></div><div><h4 className="font-bold text-slate-800 mb-1">尋找特定店鋪</h4><p className="text-sm text-slate-600 leading-relaxed">使用上方的導覽列切換住宅區、伺服器，點擊標籤分類，或直接搜尋店名與店主 ID。</p></div></div>
          <div className="flex items-start gap-4"><div className="p-2.5 bg-rose-100 rounded-xl text-rose-600 shrink-0 shadow-sm border border-rose-200/50"><Edit3 size={20} /></div><div><h4 className="font-bold text-slate-800 mb-1">登記與修改店面</h4><p className="text-sm text-slate-600 leading-relaxed">點擊右上角「登記」即可新增店鋪。若需修改資訊，點擊資訊卡右上角的編輯按鈕並「<span className="font-bold text-rose-500">輸入您的專屬密碼</span>」即可修改。</p>
          <div className="mt-2 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2"><AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" /><p className="text-xs text-rose-700 font-bold leading-relaxed">提醒店主：若當日實際營業時間與登記時間不同，請務必於社群或 Discord 提前公告，以免客人向隅哦！</p></div>
          </div></div>
          <div className="flex items-start gap-4"><div className="p-2.5 bg-pink-100 rounded-xl text-pink-600 shrink-0 shadow-sm border border-pink-200/50"><Heart size={20} /></div><div><h4 className="font-bold text-slate-800 mb-1">收藏愛店</h4><p className="text-sm text-slate-600 leading-relaxed">在店鋪資訊卡右上角點擊愛心收藏，下次打開標籤就能快速找到你的專屬清單！</p></div></div>
          <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3"><MessageSquare size={18} className="text-slate-400 shrink-0 mt-0.5" /><p className="text-sm text-slate-600 font-medium leading-relaxed">忘記店鋪編輯密碼了嗎？<br />請聯絡 <span className="font-bold text-emerald-600">閻羅@奧汀</span> 協助找回。</p></div>
        </div>
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end"><button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 shadow-lg shadow-sky-500/30 transition-colors">我瞭解了</button></div>
      </div>
    </div>
  );
};

export const DisclaimerModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[4000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-rose-50"><h2 className="text-xl font-bold text-rose-800 flex items-center gap-2"><Shield className="text-rose-500" size={22} /> 免責聲明與使用規範</h2><button onClick={onClose} className="text-rose-700/50 hover:text-rose-700 transition-colors bg-white p-1 rounded-full shadow-sm"><X size={20} /></button></div>
        <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar text-slate-700">
          <div className="text-sm leading-relaxed space-y-6">
            <p className="font-medium">歡迎光臨《光之街角 | Eorzea RP Map》（以下簡稱「本網站」）。本網站旨在為《FINAL FANTASY XIV》的 RP（角色扮演）玩家提供一個便利的店鋪登錄與搜尋平台。為了保障所有光之戰士的權益，請在使用前詳細閱讀以下聲明：</p>
            <section><h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2"><Globe size={18} className="text-slate-400"/> 1. 關於本網站屬性（非官方聲明）</h3><p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">本網站為 FF14 玩家（作者：閻羅@奧汀）出於熱情所製作的 <strong className="text-rose-600">非官方、非營利</strong> 社群工具，與 Square Enix Co., Ltd. 及其相關企業無任何官方合作或從屬關係。本網站所使用之遊戲內地圖、圖像、專有名詞等，其相關著作權及商標權均歸屬於 Square Enix 所有。<br/><span className="text-xs text-slate-400 mt-1 inline-block">(C) SQUARE ENIX CO., LTD. All Rights Reserved.</span></p></section>
            <section><h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2"><MessageSquare size={18} className="text-slate-400"/> 2. 使用者生成內容（UGC）免責聲明</h3><ul className="list-disc pl-5 space-y-2 text-slate-600"><li>本網站內所有的店鋪資訊均為玩家自行填寫發布。作者 <strong className="text-rose-600">不對</strong> 內容的真實性、合法性提供保證，亦不負擔任何法律責任。</li><li>若玩家於實地造訪店鋪時遇到任何糾紛，請自行與該店主溝通，本網站無法介入處理。</li><li>嚴禁發布含有色情、暴力、侵權或違反法律內容。作者保留刪除該資訊的權利。</li></ul></section>
            <section><h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2"><LinkIcon size={18} className="text-slate-400"/> 3. 外部連結風險與官方條款</h3><ul className="list-disc pl-5 space-y-2 text-slate-600"><li>店主提供的外部連結不在本網站控制範圍內。點擊產生之風險需由使用者自行承擔。</li><li>請務必嚴格遵守 FF14 官方「服務條款」。<strong className="text-rose-600">嚴禁</strong>利用本網站進行真實貨幣交易（RMT）、代練宣傳、或任何惡意騷擾行為。</li></ul></section>
            <section><h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2"><Settings size={18} className="text-slate-400"/> 4. 服務提供與聯絡方式</h3><p className="text-slate-600">本網站為免費提供，作者保留隨時修改或終止服務的權利，且不保證資料絕對不會遺失。如果您發現嚴重違規內容或系統錯誤，歡迎聯絡作者 <strong className="text-sky-600">閻羅@奧汀</strong>。</p></section>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end"><button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition-colors">我已閱讀並瞭解</button></div>
      </div>
    </div>
  );
};

export const RegistrationModal = ({ isOpen, onClose, onSubmit, currentArea, editingShop }: { isOpen: boolean, onClose: () => void, onSubmit: (data: Shop, isEdit: boolean) => void, currentArea: string, editingShop: Shop | null }) => {
  const defaultForm = { name: '', type: '咖啡廳', customType: '', server: '鳳凰', location: currentArea, ward: 1, plot: 1, isApartment: false, isSubdivision: false, openDays: [new Date().getDay()], openTime: '20:00', closeTime: '23:00', description: '', images: [''], twitter: '', discord: '', website: '', editPassword: '' };
  const [formData, setFormData] = useState(defaultForm);
  useEffect(() => {
    if (isOpen) {
      if (editingShop) {
        const isCustom = !TAG_LIST.includes(editingShop.type);
        setFormData({ name: editingShop.name, type: isCustom ? '自訂' : editingShop.type, customType: isCustom ? editingShop.type : '', server: editingShop.server, location: editingShop.location, ward: editingShop.ward, plot: editingShop.plot, isApartment: !!editingShop.isApartment, isSubdivision: !!editingShop.isSubdivision, openDays: editingShop.openDays, openTime: editingShop.openTime, closeTime: editingShop.closeTime, description: editingShop.description, images: editingShop.images && editingShop.images.length > 0 ? editingShop.images : [''], twitter: editingShop.socialLinks?.twitter || '', discord: editingShop.socialLinks?.discord || '', website: editingShop.socialLinks?.website || '', editPassword: editingShop.editPassword || '' });
      } else { setFormData({ ...defaultForm, location: currentArea }); }
    }
  }, [isOpen, editingShop, currentArea]);
  if (!isOpen) return null;
  const toggleDay = (dayIndex: number) => { const newDays = formData.openDays.includes(dayIndex) ? formData.openDays.filter(d => d !== dayIndex) : [...formData.openDays, dayIndex]; setFormData({ ...formData, openDays: newDays }); };
  const handleImageChange = (index: number, value: string) => { const newImages = [...formData.images]; newImages[index] = value; setFormData({ ...formData, images: newImages }); };
  const addImageField = () => { if (formData.images.length < 4) setFormData({ ...formData, images: [...formData.images, ''] }); };
  const removeImageField = (index: number) => { setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) }); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.openDays.length === 0) return alert("請至少選擇一天營業日！");
    let finalType = formData.type;
    if (formData.type === '自訂') { finalType = formData.customType.trim(); if (!finalType) return alert("請輸入自訂標籤！"); }
    const validImages = formData.images.filter(url => url.trim() !== '');
    const submitData: Shop = { 
      ...formData, 
      type: finalType, 
      id: editingShop ? editingShop.id : `shop_${Date.now()}`, 
      tags: [finalType], 
      images: validImages, 
      socialLinks: { twitter: formData.twitter, discord: formData.discord, website: formData.website } 
    };
    onSubmit(submitData, !!editingShop); onClose();
  };
  const isEditing = !!editingShop;
  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white/95 border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className={`p-5 border-b border-slate-100 flex justify-between items-center ${isEditing ? 'bg-amber-50' : 'bg-emerald-50'}`}><h2 className={`text-xl font-bold flex items-center gap-2 ${isEditing ? 'text-amber-800' : 'text-emerald-800'}`}>{isEditing ? <Edit3 size={20} /> : <MapPin size={20} />}{isEditing ? `編輯店面：${editingShop?.name}` : `登記新店面`}</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white p-1 rounded-full shadow-sm"><X size={20} /></button></div>
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <form id="shop-form" onSubmit={handleSubmit} className="flex flex-col gap-5 text-slate-700">
            <div><label className="block text-sm font-bold text-slate-600 mb-1">店名</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="例如：星空咖啡廳" /></div>
            <div className="flex gap-4"><div className="flex-1"><label className="block text-sm font-bold text-slate-600 mb-1">伺服器</label><select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500" value={formData.server} onChange={e => setFormData({...formData, server: e.target.value})}>{SERVER_LIST.slice(1).map(s => <option key={s} value={s}>{s}</option>)}</select></div><div className="flex-1"><label className="block text-sm font-bold text-slate-600 mb-1">類型</label><div className="flex flex-col gap-2"><select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>{TAG_LIST.slice(1).map(t => <option key={t} value={t}>{t}</option>)}<option value="自訂">✨ 自訂標籤...</option></select>{formData.type === '自訂' && (<input required type="text" className="w-full bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 outline-none focus:border-sky-500 transition-all text-sm" value={formData.customType} onChange={e => setFormData({...formData, customType: e.target.value})} placeholder="輸入自訂類型" />)}</div></div></div>
            <div className="bg-slate-100/50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-4"><div className="flex gap-4"><div className="flex-1"><label className="block text-sm font-bold text-slate-600 mb-1">住宅區</label><select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>{HOUSING_AREAS.map(area => <option key={area} value={area}>{area}</option>)}</select></div><div className="flex-1"><label className="block text-sm font-bold text-slate-600 mb-1">第幾區</label><input required type="number" min="1" max="30" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500" value={formData.ward} onChange={e => setFormData({...formData, ward: e.target.value === '' ? 1 : parseInt(e.target.value)})} /></div></div><div className="flex gap-4 items-end"><div className="flex-1"><label className="block text-sm font-bold text-slate-600 mb-1">{formData.isApartment ? '房間號碼' : '番地'}</label><input required type="number" min="1" max={formData.isApartment ? 999 : 60} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500" value={formData.plot} onChange={e => setFormData({...formData, plot: e.target.value === '' ? 1 : parseInt(e.target.value)})} /></div><div className="flex-1 flex flex-col gap-2"><label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors hover:bg-slate-50"><input type="checkbox" checked={formData.isApartment} onChange={e => setFormData({...formData, isApartment: e.target.checked})} className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500" />🏢 位於公寓大樓</label></div></div>{formData.isApartment && (<div className="flex gap-4 animate-in fade-in slide-in-from-top-1"><div className="flex-1"><label className="block text-sm font-bold text-slate-600 mb-1">公寓大樓位置</label><select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500" value={formData.isSubdivision ? 'sub' : 'normal'} onChange={e => setFormData({...formData, isSubdivision: e.target.value === 'sub'})}><option value="normal">一般區大樓</option><option value="sub">擴建區大樓</option></select></div></div>)}</div>
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100"><label className="block text-sm font-bold text-amber-800 mb-2">營業時間</label><div className="flex gap-1 mb-3">{DAYS_OF_WEEK.map((day, idx) => (<button type="button" key={day} onClick={() => toggleDay(idx)} className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all border ${formData.openDays.includes(idx) ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-slate-400 border-slate-200'}`}>{day}</button>))}</div><div className="flex items-center gap-2"><input required type="time" className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-amber-500" value={formData.openTime} onChange={e => setFormData({...formData, openTime: e.target.value})} /><span className="text-slate-400 font-bold">~</span><input required type="time" className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-amber-500" value={formData.closeTime} onChange={e => setFormData({...formData, closeTime: e.target.value})} /></div></div>
            <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100"><label className="block text-sm font-bold text-sky-800 mb-3">社群與網站 (選填)</label><div className="flex flex-col gap-2"><div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-sky-500 transition-all"><Twitter size={16} className="text-sky-500" /><input type="url" className="flex-1 outline-none text-sm bg-transparent" placeholder="Twitter 網址" value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} /></div><div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 transition-all"><MessageCircle size={16} className="text-indigo-500" /><input type="url" className="flex-1 outline-none text-sm bg-transparent" placeholder="Discord 群組網址" value={formData.discord} onChange={e => setFormData({...formData, discord: e.target.value})} /></div><div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 transition-all"><LinkIcon size={16} className="text-emerald-500" /><input type="url" className="flex-1 outline-none text-sm bg-transparent" placeholder="個人網站 / 噗浪網址" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} /></div></div></div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200"><label className="flex items-center justify-between text-sm font-bold text-slate-600 mb-2"><span className="flex items-center gap-1"><ImageIcon size={16}/> 宣傳照片 (最多4張)</span><span className="text-xs text-slate-400 font-normal">{formData.images.length} / 4</span></label><div className="flex flex-col gap-2">{formData.images.map((url, index) => (<div key={index} className="flex gap-2 items-center"><input type="url" className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500" value={url} onChange={e => handleImageChange(index, e.target.value)} placeholder="貼上圖片網址" />{formData.images.length > 1 && (<button type="button" onClick={() => removeImageField(index)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>)}</div>))}</div>{formData.images.length < 4 && (<button type="button" onClick={addImageField} className="mt-3 text-sm text-emerald-600 font-bold flex items-center gap-1 hover:text-emerald-700"><Plus size={14} /> 新增照片</button>)}</div>
            <div><label className="block text-sm font-bold text-slate-600 mb-1">店鋪介紹</label><textarea required rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="寫下歡迎詞..." /></div>
            <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100"><label className="flex items-center gap-2 text-sm font-bold text-rose-800 mb-1"><KeyRound size={16} /> 店鋪編輯密碼</label><p className="text-xs text-rose-600/80 mb-2">請設定密碼，未來修改或刪除資訊時會用到。</p><input required type="text" className="w-full bg-white border border-rose-200 rounded-xl px-4 py-2 outline-none focus:border-rose-500 text-rose-900 font-mono" value={formData.editPassword} onChange={e => setFormData({...formData, editPassword: e.target.value})} placeholder="例如：mycafe123" /></div>
          </form>
        </div>
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-200 font-bold transition-colors">取消</button><button type="submit" form="shop-form" className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-lg transition-colors ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>{isEditing ? '儲存修改' : '發布店面'}</button></div>
      </div>
    </div>
  );
};
