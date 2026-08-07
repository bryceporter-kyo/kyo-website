import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query } from 'firebase/firestore';

export type CalendarSubscriber = {
  id: string;
  email: string;
  programs: ('orchestras' | 'upbeat' | 'lessons')[];
};

const SUBSCRIBERS_COLLECTION = 'calendar_subscribers';

/**
 * Fetch all admin-subscribed calendar users from Firestore
 */
export async function fetchCalendarSubscribers(): Promise<CalendarSubscriber[]> {
  try {
    const ref = collection(db, SUBSCRIBERS_COLLECTION);
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CalendarSubscriber[];
  } catch (error) {
    console.error('[Calendar Subscribers] Error fetching:', error);
    return [];
  }
}

/**
 * Add a new subscriber to a specific program channel
 */
export async function addCalendarSubscriber(email: string, programs: ('orchestras' | 'upbeat' | 'lessons')[]): Promise<CalendarSubscriber> {
  const ref = collection(db, SUBSCRIBERS_COLLECTION);
  const data = { email: email.toLowerCase().trim(), programs };
  const docRef = await addDoc(ref, data);
  return { id: docRef.id, ...data };
}

/**
 * Remove a subscriber
 */
export async function deleteCalendarSubscriber(id: string): Promise<void> {
  const ref = doc(db, SUBSCRIBERS_COLLECTION, id);
  await deleteDoc(ref);
}
