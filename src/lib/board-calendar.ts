import { db, sanitizeForFirestore } from './firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { MeetingActionItem, BoardMeeting } from './board-meetings';

const EVENTS_COLLECTION = 'events';

/**
 * Sync an action item from board minutes directly to the KYO Board / Internal Calendar.
 * Also stores it in Firestore with type 'board-action' so it immediately renders
 * on the /internal upcoming calendar widget.
 */
export async function syncActionItemToCalendar(
  action: MeetingActionItem,
  meeting: Pick<BoardMeeting, 'id' | 'title' | 'date'>
): Promise<string> {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const dueDate = action.dueDate || meeting.date;

    const eventPayload = {
      name: `[Board Action] ${action.task} (${action.assignedTo || 'Unassigned'})`,
      date: dueDate,
      notes: `Action item originating from Board Meeting on ${meeting.date}. Responsible: ${action.assignedTo || 'Unassigned'}.`,
      type: 'board-action',
      meetingId: meeting.id,
      actionId: action.id,
    };

    const cleanPayload = sanitizeForFirestore(eventPayload);
    const docRef = await addDoc(eventsRef, cleanPayload);
    console.log('[Board Calendar] Action item synced to calendar with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[Board Calendar] Failed to sync action item to calendar:', error);
    throw error;
  }
}

/**
 * Batch sync all action items of a meeting to the calendar
 */
export async function syncMeetingActionItemsToCalendar(
  meeting: BoardMeeting
): Promise<void> {
  for (const item of meeting.agendaItems) {
    for (const action of item.actionItems) {
      if (!action.syncedToCalendar) {
        try {
          const eventId = await syncActionItemToCalendar(action, meeting);
          action.syncedToCalendar = true;
          action.googleCalendarEventId = eventId;
        } catch (err) {
          console.warn('Could not sync action item:', action.task, err);
        }
      }
    }
  }
}
