// ============================================================
// FIRESTORE SERVICE LAYER — Veri-Nest
// Provides CRUD operations with automatic fallback to mock data
// ============================================================

import { db, isConfigured } from '../firebase';
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, onSnapshot, serverTimestamp, setDoc
} from 'firebase/firestore';
import {
  MOCK_USERS, MOCK_RESIDENTS, MOCK_VISITORS, MOCK_COMPLAINTS,
  MOCK_FEED, MOCK_MARKETPLACE, MOCK_EVENTS, MOCK_NOTIFICATIONS,
  MOCK_AADHAAR, MOCK_SOCIETY, MOCK_ANALYTICS
} from '../data/mockData';

// ---- Helper: Get or Mock ----
const getCollection = async (name, mockData, orderField) => {
  if (!isConfigured) return [...mockData];
  try {
    const q = orderField
      ? query(collection(db, name), orderBy(orderField, 'desc'))
      : collection(db, name);
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs.length > 0 ? docs : [...mockData];
  } catch (e) {
    console.warn(`Firestore read failed for ${name}:`, e.message);
    return [...mockData];
  }
};

// ---- RESIDENTS ----
export const getResidents = () => getCollection('residents', MOCK_RESIDENTS);

export const updateResident = async (id, data) => {
  if (!isConfigured) return { id, ...data };
  await updateDoc(doc(db, 'residents', id), { ...data, updatedAt: serverTimestamp() });
  return { id, ...data };
};

// ---- VISITORS ----
export const getVisitors = () => getCollection('visitors', MOCK_VISITORS);

export const addVisitor = async (data) => {
  if (!isConfigured) return { id: `VIS${Date.now()}`, ...data };
  const ref = await addDoc(collection(db, 'visitors'), { ...data, createdAt: serverTimestamp() });
  return { id: ref.id, ...data };
};

export const updateVisitor = async (id, data) => {
  if (!isConfigured) return { id, ...data };
  await updateDoc(doc(db, 'visitors', id), data);
  return { id, ...data };
};

// ---- COMPLAINTS ----
export const getComplaints = () => getCollection('complaints', MOCK_COMPLAINTS);

export const addComplaint = async (data) => {
  if (!isConfigured) return { id: `CMP${Date.now()}`, ...data, status: 'Open', date: new Date().toISOString().split('T')[0] };
  const ref = await addDoc(collection(db, 'complaints'), { ...data, status: 'Open', createdAt: serverTimestamp() });
  return { id: ref.id, ...data, status: 'Open' };
};

export const updateComplaint = async (id, data) => {
  if (!isConfigured) return { id, ...data };
  await updateDoc(doc(db, 'complaints', id), data);
  return { id, ...data };
};

// ---- COMMUNITY FEED ----
export const getFeed = () => getCollection('feed', MOCK_FEED);

export const addFeedPost = async (data) => {
  if (!isConfigured) return { id: `FEED${Date.now()}`, ...data, likes: 0, comments: 0, time: 'Just now' };
  const ref = await addDoc(collection(db, 'feed'), { ...data, likes: 0, comments: 0, createdAt: serverTimestamp() });
  return { id: ref.id, ...data, likes: 0, comments: 0, time: 'Just now' };
};

// ---- MARKETPLACE ----
export const getMarketplace = () => getCollection('marketplace', MOCK_MARKETPLACE);

export const addMarketItem = async (data) => {
  if (!isConfigured) return { id: `MKT${Date.now()}`, ...data, status: 'Available', date: new Date().toISOString().split('T')[0] };
  const ref = await addDoc(collection(db, 'marketplace'), { ...data, status: 'Available', createdAt: serverTimestamp() });
  return { id: ref.id, ...data, status: 'Available' };
};

// ---- EVENTS ----
export const getEvents = () => getCollection('events', MOCK_EVENTS);

export const addEvent = async (data) => {
  if (!isConfigured) return { id: `EVT${Date.now()}`, ...data, rsvp: 0, status: 'Upcoming' };
  const ref = await addDoc(collection(db, 'events'), { ...data, rsvp: 0, status: 'Upcoming', createdAt: serverTimestamp() });
  return { id: ref.id, ...data, rsvp: 0, status: 'Upcoming' };
};

export const updateEvent = async (id, data) => {
  if (!isConfigured) return { id, ...data };
  await updateDoc(doc(db, 'events', id), data);
  return { id, ...data };
};

// ---- NOTIFICATIONS ----
export const getNotifications = () => getCollection('notifications', MOCK_NOTIFICATIONS);

// ---- ANALYTICS ----
export const getAnalytics = async () => {
  if (!isConfigured) return MOCK_ANALYTICS;
  try {
    const snap = await getDoc(doc(db, 'meta', 'analytics'));
    return snap.exists() ? snap.data() : MOCK_ANALYTICS;
  } catch {
    return MOCK_ANALYTICS;
  }
};

// ---- SOCIETY INFO ----
export const getSociety = async () => {
  if (!isConfigured) return MOCK_SOCIETY;
  try {
    const snap = await getDoc(doc(db, 'meta', 'society'));
    return snap.exists() ? snap.data() : MOCK_SOCIETY;
  } catch {
    return MOCK_SOCIETY;
  }
};

// ---- SEED: Push mock data to Firestore (one-time) ----
export const seedFirestore = async () => {
  if (!isConfigured) { console.warn('Firebase not configured, cannot seed'); return; }

  const seedCollection = async (name, data) => {
    for (const item of data) {
      await setDoc(doc(db, name, item.id || item.mobile || `doc_${Date.now()}_${Math.random()}`), item);
    }
    console.log(`✅ Seeded ${name}: ${data.length} docs`);
  };

  await seedCollection('residents', MOCK_RESIDENTS);
  await seedCollection('visitors', MOCK_VISITORS);
  await seedCollection('complaints', MOCK_COMPLAINTS);
  await seedCollection('feed', MOCK_FEED);
  await seedCollection('marketplace', MOCK_MARKETPLACE);
  await seedCollection('events', MOCK_EVENTS);
  await seedCollection('notifications', MOCK_NOTIFICATIONS);
  await setDoc(doc(db, 'meta', 'analytics'), MOCK_ANALYTICS);
  await setDoc(doc(db, 'meta', 'society'), MOCK_SOCIETY);

  console.log('🎉 All mock data seeded to Firestore!');
};

// ---- REAL-TIME LISTENERS ----
export const onVisitorsChange = (callback) => {
  if (!isConfigured) return () => {};
  return onSnapshot(collection(db, 'visitors'), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const onFeedChange = (callback) => {
  if (!isConfigured) return () => {};
  return onSnapshot(collection(db, 'feed'), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const onComplaintsChange = (callback) => {
  if (!isConfigured) return () => {};
  return onSnapshot(collection(db, 'complaints'), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};
