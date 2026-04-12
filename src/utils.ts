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
  if (!shop.openDays.includes(currentDay)) return false;
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = shop.openTime.split(':').map(Number);
  const [closeH, closeM] = shop.closeTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  let closeMinutes = closeH * 60 + closeM;
  
  if (closeMinutes < openMinutes) {
    // Overnights
    return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
  }
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
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
