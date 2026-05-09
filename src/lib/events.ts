import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import data from './events.json';

export type Event = {
  id: string;
  date: string;
  name: string;
  location?: string;
  time?: string;
  endTime?: string;
  notes?: string;
  attachments?: { name: string; url: string }[];
  link?: string;
  type: 'special' | 'normal';
};

// Legacy type for JSON data
type LegacyEvent = Omit<Event, 'id'> & { id: number };

const legacyEvents: LegacyEvent[] = data.events;

// Firestore collection name
const EVENTS_COLLECTION = 'events';

/**
 * Get events from local JSON (legacy fallback)
 */
export function getEvents(): Event[] {
  // Sort by date ascending
  return legacyEvents
    .map(e => ({ ...e, id: String(e.id) }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Fetch all events from Firebase Firestore
 */
export async function fetchEventsFromFirebase(): Promise<Event[]> {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(eventsRef, orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // If no events in Firebase, return legacy events
      console.log('[Events] No events in Firebase, using legacy data');
      return getEvents();
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];
  } catch (error) {
    console.error('[Events] Error fetching from Firebase:', error);
    // Fallback to legacy events
    return getEvents();
  }
}

/**
 * Add a new event to Firebase
 */
export async function addEventToFirebase(event: Omit<Event, 'id'>): Promise<Event> {
  const eventsRef = collection(db, EVENTS_COLLECTION);
  const docRef = await addDoc(eventsRef, event);
  return { id: docRef.id, ...event };
}

/**
 * Update an event in Firebase
 */
export async function updateEventInFirebase(id: string, event: Partial<Event>): Promise<void> {
  const eventRef = doc(db, EVENTS_COLLECTION, id);
  const { id: _id, ...eventData } = event as Event;
  await updateDoc(eventRef, eventData);
}

/**
 * Delete an event from Firebase
 */
export async function deleteEventFromFirebase(id: string): Promise<void> {
  const eventRef = doc(db, EVENTS_COLLECTION, id);
  await deleteDoc(eventRef);
}
