/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Maximize2, Crosshair } from 'lucide-react';
import { Marker, Shop } from '../types';
import { checkIsOpen } from '../utils';

export const InteractiveMap = ({ imageUrl, bounds, markers, onMarkerClick, selectedShop }: { imageUrl: string | null, bounds: { width: number, height: number }, markers: Marker[], onMarkerClick: (shop: Shop) => void, selectedShop: Shop | null }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const zoomToFit = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (markers.length === 0) {
      const initialScale = Math.min(rect.width / bounds.width, rect.height / bounds.height) * 0.9;
      setTransform({ 
        x: (rect.width - bounds.width * initialScale) / 2, 
        y: (rect.height - bounds.height * initialScale) / 2, 
        scale: initialScale 
      });
      return;
    }

    const padding = 100;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    markers.forEach(m => {
      minX = Math.min(minX, m.x);
      maxX = Math.max(maxX, m.x);
      minY = Math.min(minY, m.y);
      maxY = Math.max(maxY, m.y);
    });

    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;
    
    const scale = Math.min(rect.width / contentWidth, rect.height / contentHeight, 1.5);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    setTransform({
      x: rect.width / 2 - centerX * scale,
      y: rect.height / 2 - centerY * scale,
      scale
    });
  };

  const centerOnShop = (shop: Shop) => {
    const marker = markers.find(m => m.data.id === shop.id);
    if (marker && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scale = Math.max(transform.scale, 1.2);
      setTransform({
        x: rect.width / 2 - marker.x * scale,
        y: rect.height / 2 - marker.y * scale,
        scale
      });
    }
  };

  useEffect(() => {
    if (selectedShop && !isLoading) {
      centerOnShop(selectedShop);
    }
  }, [selectedShop, isLoading]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const preventWheel = (e: WheelEvent) => e.preventDefault();
    container.addEventListener('wheel', preventWheel, { passive: false });
    return () => container.removeEventListener('wheel', preventWheel);
  }, []);

  useEffect(() => { setIsLoading(true); }, [imageUrl]);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const initialScale = Math.min(rect.width / bounds.width, rect.height / bounds.height) * 0.9;
      setTransform({ x: (rect.width - bounds.width * initialScale) / 2, y: (rect.height - bounds.height * initialScale) / 2, scale: initialScale });
    }
  }, [bounds.width, bounds.height, imageUrl]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({ ...prev, x: e.clientX - startPos.x, y: e.clientY - startPos.y }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    let newScale = Math.max(0.2, Math.min(transform.scale * zoomFactor, 5));
    const rect = containerRef.current!.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;
    const imageX = (pointerX - transform.x) / transform.scale;
    const imageY = (pointerY - transform.y) / transform.scale;
    setTransform({ x: pointerX - imageX * newScale, y: pointerY - imageY * newScale, scale: newScale });
  };

  return (
    <div ref={containerRef} className={`w-full h-full overflow-hidden relative touch-none bg-transparent ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onWheel={handleWheel}>
      {isLoading && (<div className="absolute inset-0 z-[50] flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm"><div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center gap-3 animate-in zoom-in-95"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /><span className="text-xs font-extrabold text-emerald-800 tracking-widest uppercase">載入地圖中...</span></div></div>)}
      <div className="absolute origin-top-left will-change-transform" style={{ width: bounds.width, height: bounds.height, transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Map Background" 
            onLoad={() => setIsLoading(false)} 
            className={`w-full h-full object-contain pointer-events-none transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`} 
            draggable={false} 
          />
        )}
        {!isLoading && markers.map(marker => {
          const isOpen = checkIsOpen(marker.data);
          const isSelected = selectedShop?.id === marker.data.id;
          return (
            <div 
              key={marker.id} 
              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-full transition-all origin-bottom z-10 ${isSelected ? 'scale-150 z-20' : 'hover:scale-125'}`} 
              style={{ left: marker.x, top: marker.y }} 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { 
                e.stopPropagation(); 
                onMarkerClick(marker.data); 
              }}
            >
              <div style={{ filter: isSelected ? 'drop-shadow(0px 8px 12px rgba(249,115,22,0.4))' : 'drop-shadow(0px 6px 6px rgba(0,0,0,0.4))' }} className="relative">
                {marker.isBookmarked && (<div className="absolute -top-1 -left-2 z-30 bg-pink-500 rounded-full p-1 border-2 border-white shadow-md"><div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div></div></div>)}
                {isOpen && (<span className="absolute -top-1 -right-1 flex h-4 w-4 z-20"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span></span>)}
                <svg width="44" height="44" viewBox="0 0 24 24" fill={isSelected ? "#f97316" : (isOpen ? "#fb923c" : "#94a3b8")} stroke={isSelected ? "white" : "white"} strokeWidth={isSelected ? "3" : "2"} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3.5" fill="white"></circle>
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Controls */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 pointer-events-auto"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            zoomToFit();
          }}
          className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-slate-200 shadow-xl text-slate-700 hover:text-emerald-600 hover:scale-110 transition-all group"
          title="縮放至全覽"
        >
          <Maximize2 size={20} />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">縮放至全覽</span>
        </button>
        {selectedShop && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              centerOnShop(selectedShop);
            }}
            className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-emerald-200 shadow-xl text-emerald-600 hover:scale-110 transition-all group"
            title="定位當前店鋪"
          >
            <Crosshair size={20} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">定位當前店鋪</span>
          </button>
        )}
      </div>
    </div>
  );
};
