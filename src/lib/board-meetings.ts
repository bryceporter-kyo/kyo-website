import { db, sanitizeForFirestore } from './firebase';
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export type MeetingType = 'Standing' | 'Ad Hoc' | 'Members Meeting' | 'Annual General Members Meeting';

export type LocationType = 'remote' | 'hybrid' | 'in-person';

export type VoteStatus = 'Approved' | 'Rejected' | 'Abstained' | 'Recused' | 'Ineligible';

export type MeetingMotion = {
  id: string;
  text: string;
  movedBy: string;
  secondedBy: string;
  result: 'unanimous' | 'approved' | 'defeated' | 'tabled';
  voterRollCall?: Record<string, VoteStatus>;
  linkedActionItemIds?: string[];
};

export type MeetingActionItem = {
  id: string;
  task: string;
  assignedTo: string;
  assignedToEmail?: string;
  dueDate: string; // YYYY-MM-DD
  linkedMotionId?: string;
  syncedToCalendar?: boolean;
  googleCalendarEventId?: string;
  completed?: boolean;
};

export type MeetingAgendaItem = {
  id: string;
  title: string;
  discussion: string; // Markdown text with linebreaks preserved
  motions: MeetingMotion[];
  actionItems: MeetingActionItem[];
};

export type MeetingAttendee = {
  id: string;
  name: string;
  email?: string;
  role?: string; // e.g. Director, Chair, Secretary, Guest
  status: 'present' | 'regrets' | 'guest';
  isIneligibleToVote?: boolean;
};

export type BoardMeeting = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm or h:mm A
  meetingType: MeetingType;
  locationType: LocationType;
  locationDetails: string; // e.g. "Zoom (link)", "Art Gallery of Peterborough / Zoom"
  chair: string;
  secretary: string;
  attendees: MeetingAttendee[];
  agendaItems: MeetingAgendaItem[];
  nextMeetingDate?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  callToOrderTime?: string;
  adjournmentTime?: string;
};

export const DEFAULT_AGENDA_ITEMS = [
  "Call to Order",
  "Approval of Agenda",
  "Approval of Past Meeting Minutes",
  "Chair's Remarks / Executive Update",
  "Artistic Director & Program Report",
  "Operations Report",
  "Business & Finance Committee Report (Treasurer)",
  "Community Engagement & Fundraising Committee Report",
  "Programming, Education & Accessibility Committee Report",
  "Governance, HR & Compliance Committee Report",
  "New Business / Other Business",
  "In-Camera Session (Confidential)",
  "Next Meeting Date",
  "Adjournment"
];

const MEETINGS_COLLECTION = 'board_meetings';

/**
 * Fetch all board meetings ordered by date descending
 */
export async function fetchBoardMeetings(): Promise<BoardMeeting[]> {
  try {
    const colRef = collection(db, MEETINGS_COLLECTION);
    const q = query(colRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BoardMeeting[];
  } catch (error) {
    console.error('[Board Meetings] Error fetching meetings:', error);
    return [];
  }
}

/**
 * Fetch a single board meeting by ID
 */
export async function fetchBoardMeetingById(id: string): Promise<BoardMeeting | null> {
  try {
    const docRef = doc(db, MEETINGS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as BoardMeeting;
  } catch (error) {
    console.error('[Board Meetings] Error fetching meeting by id:', error);
    return null;
  }
}

/**
 * Create a new board meeting
 */
export async function createBoardMeeting(data: Omit<BoardMeeting, 'id'>): Promise<BoardMeeting> {
  const colRef = collection(db, MEETINGS_COLLECTION);
  const cleanData = sanitizeForFirestore({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const docRef = await addDoc(colRef, cleanData);
  return {
    id: docRef.id,
    ...data,
  };
}

/**
 * Update an existing board meeting (continuous auto-save)
 */
export async function updateBoardMeeting(id: string, data: Partial<BoardMeeting>): Promise<void> {
  const docRef = doc(db, MEETINGS_COLLECTION, id);
  const cleanData = sanitizeForFirestore({
    ...data,
    updatedAt: new Date().toISOString(),
  });
  await updateDoc(docRef, cleanData);
}

/**
 * Delete a board meeting
 */
export async function deleteBoardMeeting(id: string): Promise<void> {
  const docRef = doc(db, MEETINGS_COLLECTION, id);
  await deleteDoc(docRef);
}
