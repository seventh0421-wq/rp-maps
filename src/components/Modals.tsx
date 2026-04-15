/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Shield, KeyRound, HelpCircle, MapPin, Sparkles, Search, Edit3, Heart, MessageSquare, AtSign, MessageCircle, Link as LinkIcon, ImageIcon, Plus, Trash2, Globe, FileText, AlertTriangle, Settings, Info, ChevronRight } from 'lucide-react';
import { Shop } from '../types';
import { TAG_LIST, SERVER_LIST, HOUSING_AREAS, DAYS_OF_WEEK, RP_LEVEL_LIST, RESERVATION_LIST } from '../constants';

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');

  if (!isOpen) return null;

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDeleteShop(deleteId);
      setDeleteId(null);
      setDeleteName('');
    }
  };

  return (
    <div className="absolute inset-0 z-[3500] flex items-center justify-center p-4 sm:p-8 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-5xl h-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Delete Confirmation Overlay */}
        {deleteId && (
          <div className="absolute inset-0 z-[3600] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-100">
              <div className="flex items-center gap-3 text-rose-600 mb-4">
                <AlertTriangle size={24} />
                <h4 className="text-lg font-bold">確認刪除店面</h4>
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                您確定要刪除「<span className="font-bold text-slate-800">{deleteName}</span>」嗎？<br/>
                此操作將永久刪除該店鋪的所有資料，且無法復原。
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">取消</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition-colors">確定刪除</button>
              </div>
            </div>
          </div>
        )}

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
                        <button onClick={() => { setDeleteId(shop.id); setDeleteName(shop.name); }} className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition-colors">刪除</button>
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

export const HelpModal = ({ isOpen, onClose, onOpenTutorial }: { isOpen: boolean, onClose: () => void, onOpenTutorial: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-sky-50"><h2 className="text-xl font-bold text-sky-800 flex items-center gap-2"><HelpCircle className="text-sky-500" size={22} /> 使用教學</h2><button onClick={onClose} className="text-sky-700/50 hover:text-sky-700 transition-colors bg-white p-1 rounded-full shadow-sm"><X size={20} /></button></div>
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar flex flex-col gap-6 text-slate-700">
          <div className="flex items-start gap-4"><div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 shrink-0 shadow-sm border border-slate-200/50"><MapPin size={20} /></div><div><h4 className="font-bold text-slate-800 mb-1">瀏覽與探索</h4><p className="text-sm text-slate-600 leading-relaxed">拖曳地圖與滾動縮放。點擊地圖上的圖釘，即可開啟側邊欄查看店鋪的詳細資訊與相簿。</p></div></div>
          <div className="flex items-start gap-4"><div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 shrink-0 shadow-sm border border-emerald-200/50"><Sparkles size={20} /></div><div><h4 className="font-bold text-slate-800 mb-1">營業中即時燈號</h4><p className="text-sm text-slate-600 leading-relaxed">圖釘右上角若亮起「<span className="text-emerald-500 font-bold">閃爍的綠燈</span>」，代表該店鋪現在正在營業中！</p></div></div>
          <div className="flex items-start gap-4"><div className="p-2.5 bg-amber-100 rounded-xl text-amber-600 shrink-0 shadow-sm border border-amber-200/50"><Search size={20} /></div><div><h4 className="font-bold text-slate-800 mb-1">尋找特定店鋪</h4><p className="text-sm text-slate-600 leading-relaxed">使用上方的導覽列切換住宅區、伺服器，點擊標籤分類，或直接搜尋店名與店主 ID。</p></div></div>
          <div className="flex items-start gap-4"><div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600 shrink-0 shadow-sm border border-indigo-200/50"><Info size={20} /></div><div><h4 className="font-bold text-slate-800 mb-1">RP 是什麼？</h4><p className="text-sm text-slate-600 leading-relaxed">不清楚什麼是 RP 嗎？點擊下方的按鈕查看 RP 小教學！</p><button onClick={onOpenTutorial} className="mt-2 px-4 py-1.5 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-colors shadow-sm">查看 RP 小教學</button></div></div>
          <div className="flex items-start gap-4"><div className="p-2.5 bg-rose-100 rounded-xl text-rose-600 shrink-0 shadow-sm border border-rose-200/50"><Edit3 size={20} /></div><div><h4 className="font-bold text-slate-800 mb-1">店面登記與修改</h4><p className="text-sm text-slate-600 leading-relaxed">點擊右上角「店面登記」即可新增店鋪。若需修改資訊，點擊資訊卡右上角的編輯按鈕並「<span className="font-bold text-rose-500">輸入您的專屬密碼</span>」即可修改。</p>
          <div className="mt-2 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2"><AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" /><p className="text-xs text-rose-700 font-bold leading-relaxed">提醒店主：若當日實際營業時間與登記時間不同，請務必於社群或 Discord 提前公告，以免客人向隅哦！</p></div>
          </div></div>
          <div className="flex items-start gap-4"><div className="p-2.5 bg-pink-100 rounded-xl text-pink-600 shrink-0 shadow-sm border border-pink-200/50"><Heart size={20} /></div><div><h4 className="font-bold text-slate-800 mb-1">收藏愛店與營業提醒</h4><p className="text-sm text-slate-600 leading-relaxed">在店鋪資訊卡右上角點擊愛心收藏。當您的愛店「<span className="text-pink-500 font-bold">開始營業</span>」時，系統會自動彈出氣泡框與提示音通知您！（需保持網頁開啟）</p></div></div>
          
          <div className="h-px bg-slate-100 w-full my-2"></div>
          
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-sky-100 rounded-xl text-sky-600 shrink-0 shadow-sm border border-sky-200/50">
              <LinkIcon size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 mb-1">好站連結</h4>
              <div className="flex flex-col gap-2">
                <a 
                  href="https://lakeside-blooms-photo-society.replit.app/photostudio" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-all shadow-sm"
                >
                  <div>
                    <p className="text-sm font-black text-slate-800 group-hover:text-sky-600 transition-colors">畔湖花攝</p>
                    <p className="text-[10px] text-slate-500 font-bold">FFXIV繁中攝影愛好者公會社群</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3"><MessageSquare size={18} className="text-slate-400 shrink-0 mt-0.5" /><p className="text-sm text-slate-600 font-medium leading-relaxed">忘記店鋪編輯密碼了嗎？<br />請聯絡 <span className="font-bold text-emerald-600">閻羅@奧汀</span> 協助找回。</p></div>
        </div>
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end"><button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 shadow-lg shadow-sky-500/30 transition-colors">我瞭解了</button></div>
      </div>
    </div>
  );
};

export const RPTutorialModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
          <h2 className="text-2xl font-black text-indigo-900 flex items-center gap-2"><Sparkles className="text-indigo-500" size={24} /> RP 小教學</h2>
          <button onClick={onClose} className="text-indigo-700/50 hover:text-indigo-700 transition-colors bg-white p-1.5 rounded-full shadow-sm"><X size={20} /></button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[75vh] custom-scrollbar text-slate-700">
          <div className="space-y-6">
            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
              <p className="leading-relaxed font-medium">
                RP 的全程為 <span className="text-indigo-600 font-bold">RolePlay</span>，也就是角色扮演的意思，通常是指店員會為自己創造一個有豐富內容的人物/角色/OC設定，店員則會扮演這個角色跟客人互動，互動時通常會分成無輕中重，決定要用幾成的 RP 沉浸感跟客人互動。
              </p>
            </div>

            <div className="p-5 border-2 border-dashed border-slate-200 rounded-2xl">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">角色設定範例：</h4>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                「假設我是一個比較冷漠面癱，但內心戲多的角色，並且懂得料理。然後我自己本人（中之）則是比較熱情健談的人！」
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 font-black text-slate-400 border border-slate-200">無</div>
                <div>
                  <h5 className="font-bold text-slate-800 mb-1">中之本色演出。</h5>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center shrink-0 font-black text-sky-500 border border-sky-200">輕</div>
                <div>
                  <h5 className="font-bold text-slate-800 mb-1">冒險了一整天好累，所以晚上我要去買麥當勞，新品感覺還不錯，推薦你也試試看！</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">（行為舉止稍微保有角色設定，對於使用詞彙以及口吻比較隨和，符合日常。）</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 font-black text-indigo-500 border border-indigo-200">中</div>
                <div>
                  <h5 className="font-bold text-slate-800 mb-1">今晚吃了些快餐，味道還行，但我還是比較喜歡自己做飯。</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">（行為舉止較接近角色設定，會在一些詞彙以及互動上貼近艾奧傑亞這個世界。）</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0 font-black text-purple-500 border border-purple-200">重</div>
                <div>
                  <h5 className="font-bold text-slate-800 mb-1">剛到魔女咖啡廳買了些三明治，用了些新鮮的渡渡鳥蛋做料理，味道挺不錯。</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">（行為舉止幾乎完全按照角色設定，使用的詞彙語句等完全會盡可能比照艾奧傑亞這個世界。）</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full my-4"></div>

            <div className="space-y-6">
              <h3 className="text-xl font-black text-indigo-900 flex items-center gap-2"><Shield className="text-indigo-500" size={20} /> RP 禮儀</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">1. 尊重角色的自主權 (禁止強制行為)</h5>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">請描述「試圖」做的動作，而非直接決定結果。</p>
                  <div className="space-y-2">
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs">
                      <span className="text-rose-600 font-bold">❌ 錯誤示範（強制干預）：</span><br/>
                      「我一拳打暈了面前的人，把他扛在肩上。」<br/>
                      <span className="text-rose-400">（這剝奪了對方反應的權利）</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                      <span className="text-emerald-600 font-bold">⭕ 正確示範（給予空間）：</span><br/>
                      「我猛然揮出一拳，試圖將面前的人打暈。」<br/>
                      <span className="text-emerald-500">（這讓對方可以決定自己是要閃避、被打中，還是格擋）</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">2. 拋接球原則</h5>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    RP 就像一場拋接球，請給店員或其他客人一點打字反應的時間，避免連續洗頻或強行介入正在進行中的深層對話。
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">3. 友善的邊界感</h5>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    不論是顧客或員工，在互動中感到任何不適，隨時與對方溝通或提出暫停，尋求他人的幫忙。
                  </p>
                </div>

                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200">
                  <h5 className="font-bold text-amber-900 mb-2 flex items-center gap-2">4. 尊重店家的 RP 程度</h5>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    若您本身是中重 RP 程度的玩家，請勿到輕無為主的 RP 店體驗後提出店員不夠主動、不積極接話甚至認為對話題敏感度缺乏作為理由進行說教、批評或投訴。
                  </p>
                  <p className="text-sm text-amber-900 font-black mt-2">請尊重該店的規則以及 RP 程度。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-center">
          <button onClick={onClose} className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 transition-all active:scale-95">我瞭解了</button>
        </div>
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
            <p className="font-medium">歡迎光臨《光之街角》（以下簡稱「本網站」）。本網站旨在為《FINAL FANTASY XIV》的 RP（角色扮演）玩家提供一個便利的店鋪登錄與搜尋平台。為了保障所有光之戰士的權益，請在使用前詳細閱讀以下聲明：</p>
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
  const defaultForm = { name: '', ownerName: '', type: '咖啡廳', customType: '', server: '鳳凰', location: currentArea, ward: 1, plot: 1, isApartment: false, isSubdivision: false, openDays: [] as number[], openTime: '', closeTime: '', isClosedThisWeek: false, reservationType: '不用預約' as '不用預約' | '開放預約' | '須提前預約', description: '', images: [''], threads: '', discord: '', website: '', editPassword: '', rpLevels: [] as string[], tags: [] as string[] };
  const [formData, setFormData] = useState(defaultForm);
  const [newTag, setNewTag] = useState('');
  const [isCustomTagActive, setIsCustomTagActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingShop) {
        const isCustom = !TAG_LIST.includes(editingShop.type);
        setFormData({ 
          name: editingShop.name, 
          ownerName: editingShop.ownerName || '', 
          type: isCustom ? '自訂' : editingShop.type, 
          customType: isCustom ? editingShop.type : '', 
          server: editingShop.server, 
          location: editingShop.location, 
          ward: editingShop.ward, 
          plot: editingShop.plot, 
          isApartment: !!editingShop.isApartment, 
          isSubdivision: !!editingShop.isSubdivision, 
          openDays: editingShop.openDays || [], 
          openTime: editingShop.openTime || '', 
          closeTime: editingShop.closeTime || '', 
          isClosedThisWeek: !!editingShop.isClosedThisWeek,
          reservationType: editingShop.reservationType || '不用預約',
          description: editingShop.description, 
          images: editingShop.images && editingShop.images.length > 0 ? editingShop.images : [''], 
          threads: editingShop.socialLinks?.threads || '', 
          discord: editingShop.socialLinks?.discord || '', 
          website: editingShop.socialLinks?.website || '', 
          editPassword: editingShop.editPassword || '', 
          rpLevels: editingShop.rpLevels || [],
          tags: editingShop.tags || [editingShop.type]
        });
      } else { 
        setFormData({ ...defaultForm, location: currentArea, tags: ['咖啡廳'] }); 
      }
      setIsCustomTagActive(false);
      setNewTag('');
    }
  }, [isOpen, editingShop, currentArea]);

  if (!isOpen) return null;

  const toggleDay = (dayIndex: number) => { const newDays = formData.openDays.includes(dayIndex) ? formData.openDays.filter(d => d !== dayIndex) : [...formData.openDays, dayIndex]; setFormData({ ...formData, openDays: newDays }); };
  const toggleRPLevel = (level: string) => { const newLevels = formData.rpLevels.includes(level) ? formData.rpLevels.filter(l => l !== level) : [...formData.rpLevels, level]; setFormData({ ...formData, rpLevels: newLevels }); };
  const handleImageChange = (index: number, value: string) => { const newImages = [...formData.images]; newImages[index] = value; setFormData({ ...formData, images: newImages }); };
  const addImageField = () => { if (formData.images.length < 4) setFormData({ ...formData, images: [...formData.images, ''] }); };
  const removeImageField = (index: number) => { setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) }); };

  const addTag = (tagToUse?: string) => {
    const tag = (tagToUse || newTag).trim();
    if (!tag) return;
    if (formData.tags.length >= 5) return alert("最多只能設定 5 個標籤！");
    if (formData.tags.includes(tag)) return;
    setFormData({ ...formData, tags: [...formData.tags, tag] });
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tags.length === 0) return alert("請至少設定一個標籤！");
    
    const validImages = formData.images.filter(url => url.trim() !== '');
    const submitData: Shop = { 
      ...formData, 
      type: formData.tags[0], // Use first tag as primary type for backward compatibility
      id: editingShop ? editingShop.id : `shop_${Date.now()}`, 
      images: validImages, 
      openTime: formData.openTime || '',
      closeTime: formData.closeTime || '',
      socialLinks: { threads: formData.threads, discord: formData.discord, website: formData.website } 
    };
    onSubmit(submitData, !!editingShop); onClose();
  };
  const isEditing = !!editingShop;
  return (
    <div className="absolute inset-0 z-[4500] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white/95 border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className={`p-5 border-b border-slate-100 flex justify-between items-center ${isEditing ? 'bg-amber-50' : 'bg-emerald-50'}`}><h2 className={`text-xl font-bold flex items-center gap-2 ${isEditing ? 'text-amber-800' : 'text-emerald-800'}`}>{isEditing ? <Edit3 size={20} /> : <MapPin size={20} />}{isEditing ? `編輯店面：${editingShop?.name}` : `店面登記`}</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white p-1 rounded-full shadow-sm"><X size={20} /></button></div>
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <form id="shop-form" onSubmit={handleSubmit} className="flex flex-col gap-5 text-slate-700">
            <div className="flex gap-4">
              <div className="flex-[2]"><label className="block text-base font-bold text-slate-600 mb-1">店名</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="例如：星空咖啡廳" /></div>
              <div className="flex-1"><label className="block text-base font-bold text-slate-600 mb-1">店主名稱</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition-all" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} placeholder="例如：閻羅" /></div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1"><label className="block text-base font-bold text-slate-600 mb-1">伺服器</label><select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500" value={formData.server} onChange={e => setFormData({...formData, server: e.target.value})}>{SERVER_LIST.slice(1).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="flex-1">
                <label className="block text-base font-bold text-slate-600 mb-1">店鋪標籤 (最多5個)</label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    <select 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 text-sm" 
                      value={isCustomTagActive ? '自訂' : ''} 
                      onChange={e => { 
                        if (e.target.value === '自訂') { 
                          setIsCustomTagActive(true); 
                          setNewTag(''); 
                        } else if (e.target.value !== '') { 
                          setIsCustomTagActive(false); 
                          addTag(e.target.value);
                        } 
                      }}
                    >
                      <option value="">選擇標籤...</option>
                      {TAG_LIST.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
                      <option value="自訂">✨ 自訂標籤...</option>
                    </select>
                  </div>
                  {isCustomTagActive && (
                    <div className="flex gap-1 animate-in fade-in slide-in-from-top-1">
                      <input type="text" className="flex-1 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 outline-none focus:border-sky-500 transition-all text-sm" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="輸入自訂標籤並按 Enter" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); setIsCustomTagActive(false); } }} />
                      <button type="button" onClick={() => { addTag(); setIsCustomTagActive(false); }} className="p-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"><Plus size={20} /></button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-emerald-900"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-100/50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-4"><div className="flex gap-4"><div className="flex-1"><label className="block text-base font-bold text-slate-600 mb-1">住宅區</label><select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>{HOUSING_AREAS.map(area => <option key={area} value={area}>{area}</option>)}</select></div><div className="flex-1"><label className="block text-base font-bold text-slate-600 mb-1">第幾區</label><input required type="number" min="1" max="30" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500" value={formData.ward} onChange={e => setFormData({...formData, ward: e.target.value === '' ? 1 : parseInt(e.target.value)})} /></div></div><div className="flex gap-4 items-end"><div className="flex-1"><label className="block text-base font-bold text-slate-600 mb-1">{formData.isApartment ? '房間號碼' : '番地'}</label><input required type="number" min="1" max={formData.isApartment ? 999 : 60} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500" value={formData.plot} onChange={e => setFormData({...formData, plot: e.target.value === '' ? 1 : parseInt(e.target.value)})} /></div><div className="flex-1 flex flex-col gap-2"><label className="flex items-center gap-2 text-base font-bold text-slate-700 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors hover:bg-slate-50"><input type="checkbox" checked={formData.isApartment} onChange={e => setFormData({...formData, isApartment: e.target.checked})} className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500" />🏢 位於公寓大樓</label></div></div>{formData.isApartment && (<div className="flex gap-4 animate-in fade-in slide-in-from-top-1"><div className="flex-1"><label className="block text-base font-bold text-slate-600 mb-1">公寓大樓位置</label><select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500" value={formData.isSubdivision ? 'sub' : 'normal'} onChange={e => setFormData({...formData, isSubdivision: e.target.value === 'sub'})}><option value="normal">一般區大樓</option><option value="sub">擴建區大樓</option></select></div></div>)}</div>
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-base font-bold text-amber-800">營業時間 (24小時制 / 選填)</label>
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, isClosedThisWeek: !formData.isClosedThisWeek })}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all border ${formData.isClosedThisWeek ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-rose-300 hover:text-rose-500'}`}
                >
                  {formData.isClosedThisWeek ? '🚫 本週休業中' : '💤 設定本週休業'}
                </button>
              </div>
              <p className="text-sm text-amber-600 font-bold mb-2">💡 若營業時間不固定，請先以本週或下週為主。您可以隨時回來修改資訊。</p>
              {!formData.isClosedThisWeek ? (
                <>
                  <div className="flex gap-1 mb-3">{DAYS_OF_WEEK.map((day, idx) => (<button type="button" key={day} onClick={() => toggleDay(idx)} className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all border ${formData.openDays.includes(idx) ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-slate-400 border-slate-200'}`}>{day}</button>))}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 font-bold mb-1 ml-1">開始時間 (24小時制)</p>
                      <div className="flex gap-1">
                        <select 
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-2 py-2 outline-none focus:border-amber-500 text-sm font-bold"
                          value={formData.openTime.split(':')[0]}
                          onChange={e => {
                            const mins = formData.openTime.split(':')[1] || '00';
                            setFormData({...formData, openTime: `${e.target.value}:${mins}`});
                          }}
                        >
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')} 點</option>
                          ))}
                        </select>
                        <select 
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-2 py-2 outline-none focus:border-amber-500 text-sm font-bold"
                          value={formData.openTime.split(':')[1]}
                          onChange={e => {
                            const hours = formData.openTime.split(':')[0] || '00';
                            setFormData({...formData, openTime: `${hours}:${e.target.value}`});
                          }}
                        >
                          {Array.from({ length: 60 }).map((_, i) => (
                            <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')} 分</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <span className="text-slate-400 font-bold mt-5">~</span>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 font-bold mb-1 ml-1">結束時間 (24小時制)</p>
                      <div className="flex gap-1">
                        <select 
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-2 py-2 outline-none focus:border-amber-500 text-sm font-bold"
                          value={formData.closeTime.split(':')[0]}
                          onChange={e => {
                            const mins = formData.closeTime.split(':')[1] || '00';
                            setFormData({...formData, closeTime: `${e.target.value}:${mins}`});
                          }}
                        >
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')} 點</option>
                          ))}
                        </select>
                        <select 
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-2 py-2 outline-none focus:border-amber-500 text-sm font-bold"
                          value={formData.closeTime.split(':')[1]}
                          onChange={e => {
                            const hours = formData.closeTime.split(':')[0] || '00';
                            setFormData({...formData, closeTime: `${hours}:${e.target.value}`});
                          }}
                        >
                          {Array.from({ length: 60 }).map((_, i) => (
                            <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')} 分</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center bg-rose-50/50 rounded-xl border border-rose-100 border-dashed">
                  <p className="text-sm font-bold text-rose-600">已設定為本週休業，地圖將顯示為休息中。</p>
                </div>
              )}
            </div>
            <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
              <label className="block text-base font-bold text-rose-800 mb-2">預約制度</label>
              <div className="flex gap-2">
                {RESERVATION_LIST.map(type => (
                  <button 
                    type="button" 
                    key={type} 
                    onClick={() => setFormData({ ...formData, reservationType: type as any })} 
                    className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all border ${formData.reservationType === type ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-white text-slate-400 border-slate-200'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100"><label className="block text-base font-bold text-indigo-800 mb-2">RP 程度 (可複選)</label><div className="flex gap-2">{RP_LEVEL_LIST.map(level => (<button type="button" key={level} onClick={() => toggleRPLevel(level)} className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all border ${formData.rpLevels.includes(level) ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' : 'bg-white text-slate-400 border-slate-200'}`}>{level}</button>))}</div></div>
            <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100"><label className="block text-base font-bold text-sky-800 mb-3">社群與網站 (選填)</label><div className="flex flex-col gap-2"><div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-sky-500 transition-all"><AtSign size={16} className="text-sky-500" /><input type="url" className="flex-1 outline-none text-sm bg-transparent" placeholder="Threads 網址" value={formData.threads} onChange={e => setFormData({...formData, threads: e.target.value})} /></div><div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 transition-all"><MessageCircle size={16} className="text-indigo-500" /><input type="url" className="flex-1 outline-none text-sm bg-transparent" placeholder="Discord 群組網址" value={formData.discord} onChange={e => setFormData({...formData, discord: e.target.value})} /></div><div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 transition-all"><LinkIcon size={16} className="text-emerald-500" /><input type="url" className="flex-1 outline-none text-sm bg-transparent" placeholder="個人網站 / 噗浪網址" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} /></div></div></div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="flex items-center justify-between text-base font-bold text-slate-600 mb-2">
                <span className="flex items-center gap-1"><ImageIcon size={16}/> 宣傳照片 (最多4張)</span>
                <span className="text-sm text-slate-400 font-normal">{formData.images.length} / 4</span>
              </label>
              <div className="mb-3 p-2.5 bg-sky-50 border border-sky-100 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-sky-700 font-bold">推薦使用圖床：<span className="text-sky-600">meee.com.tw</span></p>
                  <a href="https://meee.com.tw/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-sky-500 text-white text-xs font-black rounded-lg hover:bg-sky-600 transition-colors shadow-sm">前往上傳</a>
                </div>
                <p className="text-xs text-sky-600 font-bold leading-tight">⚠️ 提醒：請在圖片上點擊「右鍵」並選擇「複製圖片位址」，貼上的網址才能正確顯示圖片喔！</p>
              </div>
              <div className="flex flex-col gap-2">{formData.images.map((url, index) => (<div key={index} className="flex gap-2 items-center"><input type="url" className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500" value={url} onChange={e => handleImageChange(index, e.target.value)} placeholder="貼上圖片網址" />{formData.images.length > 1 && (<button type="button" onClick={() => removeImageField(index)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>)}</div>))}</div>{formData.images.length < 4 && (<button type="button" onClick={addImageField} className="mt-3 text-sm text-emerald-600 font-bold flex items-center gap-1 hover:text-emerald-700"><Plus size={14} /> 新增照片</button>)}</div>
            <div><label className="block text-base font-bold text-slate-600 mb-1">店鋪介紹</label><textarea required rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="寫下歡迎詞..." /></div>
            <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100"><label className="flex items-center gap-2 text-base font-bold text-rose-800 mb-1"><KeyRound size={16} /> 店鋪編輯密碼</label><p className="text-sm text-rose-600/80 mb-2">請設定密碼，未來修改或刪除資訊時會用到。</p><input required type="text" className="w-full bg-white border border-rose-200 rounded-xl px-4 py-2 outline-none focus:border-rose-500 text-rose-900 font-mono" value={formData.editPassword} onChange={e => setFormData({...formData, editPassword: e.target.value})} placeholder="例如：mycafe123" /></div>
          </form>
        </div>
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-200 font-bold transition-colors">取消</button><button type="submit" form="shop-form" className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-lg transition-colors ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>{isEditing ? '儲存修改' : '發布店面'}</button></div>
      </div>
    </div>
  );
};

export const RegistrationSuccessModal = ({ isOpen, onClose, shopName, ownerName }: { isOpen: boolean, onClose: () => void, shopName: string, ownerName: string }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300 border-4 border-emerald-500/20">
        <div className="p-8 text-center bg-gradient-to-b from-emerald-50 to-white">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-500/40 animate-bounce-slow">
            <Sparkles size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">登記成功！</h2>
          <p className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-6">恭喜您的店面已加入光之街角</p>
          
          <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-bold text-slate-500">店名：</span>
              <span className="text-sm font-black text-slate-800">{shopName}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
              <span className="text-sm font-bold text-slate-500">店主：</span>
              <span className="text-sm font-black text-slate-800">{ownerName}</span>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <h4 className="font-black text-slate-800 flex items-center gap-2">
              <Search size={18} className="text-amber-500" /> 如何找到您的店？
            </h4>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">在上方搜尋框輸入您的 <span className="text-emerald-600 font-bold">店名</span> 或 <span className="text-emerald-600 font-bold">店主名稱</span>。</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">切換至正確的 <span className="text-amber-600 font-bold">住宅區</span> 與 <span className="text-amber-600 font-bold">一般/擴建</span> 區塊。</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">3</div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">點擊右側的 <span className="text-sky-600 font-bold">列表按鈕</span> 即可在清單中快速找到。</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button onClick={onClose} className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 shadow-xl shadow-emerald-500/30 transition-all active:scale-95">開始探索</button>
        </div>
      </div>
    </div>
  );
};
