/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  type: string;
  customType?: string;
  server: string;
  location: string;
  ward: number;
  plot: number;
  isApartment: boolean;
  isSubdivision: boolean;
  openDays: number[];
  openTime?: string;
  closeTime?: string;
  isClosedThisWeek?: boolean;
  reservationType?: '須提前預約' | '開放預約' | '不用預約';
  reservationLink?: string;
  description: string;
  images: string[];
  tags: string[];
  rpLevels: string[];
  socialLinks?: {
    threads?: string;
    discord?: string;
    website?: string;
  };
  editPassword?: string;
  ownerId?: string;
  updatedAt?: number;
}

export interface Marker {
  id: string;
  x: number;
  y: number;
  data: Shop;
  isBookmarked: boolean;
}
