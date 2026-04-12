/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Shop {
  id: string;
  name: string;
  type: string;
  customType?: string;
  server: string;
  location: string;
  ward: number;
  plot: number;
  isApartment: boolean;
  isSubdivision: boolean;
  openDays: number[];
  openTime: string;
  closeTime: string;
  description: string;
  images: string[];
  tags: string[];
  socialLinks?: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
  editPassword?: string;
  ownerId?: string;
}

export interface Marker {
  id: string;
  x: number;
  y: number;
  data: Shop;
  isBookmarked: boolean;
}
