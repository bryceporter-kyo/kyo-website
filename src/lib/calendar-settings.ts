import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type CalendarSettings = {
  upbeatCalendarId: string;
  lessonsCalendarId: string;
  orchestrasCalendarId: string;
};

const SETTINGS_COLLECTION = 'settings';
const CALENDAR_DOCUMENT = 'calendar';

/**
 * Fetch calendar settings from Firestore.
 */
export async function fetchCalendarSettings(): Promise<CalendarSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CALENDAR_DOCUMENT);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        upbeatCalendarId: data.upbeatCalendarId || '',
        lessonsCalendarId: data.lessonsCalendarId || '',
        orchestrasCalendarId: data.orchestrasCalendarId || '',
      };
    }

    return {
      upbeatCalendarId: '',
      lessonsCalendarId: '',
      orchestrasCalendarId: '',
    };
  } catch (error) {
    console.error('[Calendar Settings] Error fetching settings:', error);
    return {
      upbeatCalendarId: '',
      lessonsCalendarId: '',
      orchestrasCalendarId: '',
    };
  }
}

/**
 * Save calendar settings to Firestore.
 */
export async function saveCalendarSettings(settings: CalendarSettings): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, CALENDAR_DOCUMENT);
  await setDoc(docRef, settings);
}
