import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface BassRepairsCampaign {
  raised: number;
  goal: number;
  updatedAt?: string;
}

const BASS_REPAIRS_DOC = 'campaigns/bass-repairs';

/**
 * Default fallback campaign numbers as specified:
 * $1,000 raised out of $2,800 goal
 */
export const DEFAULT_BASS_CAMPAIGN: BassRepairsCampaign = {
  raised: 1000,
  goal: 2800,
};

/**
 * Fetch bass repairs campaign data once (client or server)
 */
export async function getBassRepairsCampaign(): Promise<BassRepairsCampaign> {
  try {
    const docRef = doc(db, 'campaigns', 'bass-repairs');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        raised: typeof data.raised === 'number' ? data.raised : DEFAULT_BASS_CAMPAIGN.raised,
        goal: typeof data.goal === 'number' ? data.goal : DEFAULT_BASS_CAMPAIGN.goal,
        updatedAt: data.updatedAt,
      };
    }
  } catch (err) {
    console.warn('[getBassRepairsCampaign] Could not fetch from Firestore, using default:', err);
  }
  return DEFAULT_BASS_CAMPAIGN;
}

/**
 * Subscribe to real-time changes in bass repairs campaign
 */
export function subscribeBassRepairsCampaign(callback: (data: BassRepairsCampaign) => void): () => void {
  try {
    const docRef = doc(db, 'campaigns', 'bass-repairs');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          callback({
            raised: typeof data.raised === 'number' ? data.raised : DEFAULT_BASS_CAMPAIGN.raised,
            goal: typeof data.goal === 'number' ? data.goal : DEFAULT_BASS_CAMPAIGN.goal,
            updatedAt: data.updatedAt,
          });
        } else {
          callback(DEFAULT_BASS_CAMPAIGN);
        }
      },
      (error) => {
        console.warn('[subscribeBassRepairsCampaign] Snapshot error:', error);
        callback(DEFAULT_BASS_CAMPAIGN);
      }
    );
  } catch (err) {
    console.warn('[subscribeBassRepairsCampaign] Setup error:', err);
    callback(DEFAULT_BASS_CAMPAIGN);
    return () => {};
  }
}

/**
 * Admin: update bass repairs campaign figures manually
 */
export async function setBassRepairsCampaign(raised: number, goal: number = 2800): Promise<void> {
  const docRef = doc(db, 'campaigns', 'bass-repairs');
  await setDoc(
    docRef,
    {
      raised: Math.max(0, Math.round(raised * 100) / 100),
      goal: Math.max(1, Math.round(goal * 100) / 100),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
