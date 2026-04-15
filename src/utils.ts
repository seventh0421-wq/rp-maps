/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLOT_COORDINATES } from './constants';
import { Shop } from './types';

export const checkIsOpen = (shop: Shop) => {
  if (shop.isClosedThisWeek) return false;
  if (!shop.openDays || !shop.openTime || !shop.closeTime) return false;
  
  const now = new Date();
  const currentDay = now.getDay();
  const yesterday = (currentDay + 6) % 7;
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = shop.openTime.split(':').map(Number);
  const [closeH, closeM] = shop.closeTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  // 情況 A: 檢查今天開始的班次
  if (shop.openDays.includes(currentDay)) {
    if (closeMinutes >= openMinutes) {
      // 一般班次 (未跨夜)
      if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) return true;
    } else {
      // 跨夜班次 - 目前處於前半段 (23:00 - 23:59)
      if (currentMinutes >= openMinutes) return true;
    }
  }

  // 情況 B: 檢查昨天開始的班次 (是否跨夜到今天)
  if (shop.openDays.includes(yesterday)) {
    if (closeMinutes < openMinutes) {
      // 昨天是跨夜班次 - 目前處於後半段 (00:00 - 02:00)
      if (currentMinutes <= closeMinutes) return true;
    }
  }

  return false;
};

export const getPlotCoordinates = (area: string, plot: number, isApartment: boolean, isSubdivision: boolean) => {
  const areaCoords = PLOT_COORDINATES[area] || {};
  if (isApartment) {
    return isSubdivision 
      ? (areaCoords['aptSub'] || areaCoords['apt'] || { x: 500, y: 500 }) 
      : (areaCoords['apt'] || { x: 500, y: 500 });
  }
  if (areaCoords[plot]) return areaCoords[plot];
  const actualPlot = plot > 30 ? plot - 30 : plot;
  return areaCoords[actualPlot] || { x: 500, y: 500 }; 
};

export const getWeekNumber = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const shuffleWithSeed = <T>(array: T[], seed: number): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
