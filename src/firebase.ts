/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default config provided by user
const defaultFirebaseConfig = {
  apiKey: "AIzaSyD6s4vuTpV7-U3GAjVJkFeqlxWaFDV090M",
  authDomain: "eorzea-rp-map.firebaseapp.com",
  projectId: "eorzea-rp-map",
  storageBucket: "eorzea-rp-map.firebasestorage.app",
  messagingSenderId: "479011588697",
  appId: "1:479011588697:web:6a95fdd42670a5b424bf48"
};

// Check for platform-injected config
let firebaseConfig = defaultFirebaseConfig;
let appId = "eorzea-rp-map";

// In AI Studio Build, we might have a config file or global vars
// For now, we use the user's provided config as fallback.

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const APP_ID = appId;
