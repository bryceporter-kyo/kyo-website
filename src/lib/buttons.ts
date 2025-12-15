import { db } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import data from './buttons.json';

export type LinkInfo = {
    type: 'internal' | 'external';
    value: string;
};

export type ButtonConfig = {
    id: string;
    location: string;
    text: string;
    link: LinkInfo;
    visible: boolean;
};

const legacyButtons: ButtonConfig[] = data.buttons as ButtonConfig[];

// Firestore collection name
const BUTTONS_COLLECTION = 'buttons';

/**
 * Get buttons from local JSON (legacy fallback)
 */
export function getButtons(): ButtonConfig[] {
    return legacyButtons;
}

/**
 * Get a button by ID from legacy data
 */
export function getButtonById(id: string): ButtonConfig | undefined {
    return legacyButtons.find(b => b.id === id);
}

/**
 * Fetch all buttons from Firebase Firestore
 */
export async function fetchButtonsFromFirebase(): Promise<ButtonConfig[]> {
    try {
        const buttonsRef = collection(db, BUTTONS_COLLECTION);
        const snapshot = await getDocs(buttonsRef);
        
        if (snapshot.empty) {
            console.log('[Buttons] No buttons in Firebase, using legacy data');
            return getButtons();
        }
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as ButtonConfig[];
    } catch (error) {
        console.error('[Buttons] Error fetching from Firebase:', error);
        return getButtons();
    }
}

/**
 * Save a button to Firebase (create or update)
 */
export async function saveButtonToFirebase(button: ButtonConfig): Promise<void> {
    const buttonRef = doc(db, BUTTONS_COLLECTION, button.id);
    const { id, ...buttonData } = button;
    await setDoc(buttonRef, buttonData);
}

/**
 * Update button visibility in Firebase
 */
export async function updateButtonVisibilityInFirebase(id: string, visible: boolean): Promise<void> {
    const buttonRef = doc(db, BUTTONS_COLLECTION, id);
    await updateDoc(buttonRef, { visible });
}

/**
 * Update button link in Firebase
 */
export async function updateButtonLinkInFirebase(id: string, link: LinkInfo): Promise<void> {
    const buttonRef = doc(db, BUTTONS_COLLECTION, id);
    await updateDoc(buttonRef, { link });
}

/**
 * Initialize buttons in Firebase from legacy data
 */
export async function initializeButtonsInFirebase(): Promise<void> {
    const buttons = getButtons();
    for (const button of buttons) {
        await saveButtonToFirebase(button);
    }
}
