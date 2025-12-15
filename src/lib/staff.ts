import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import data from './staff.json';

export type StaffMember = {
    id: string;
    name: string;
    title: string;
    bio?: string;
    image?: string;
    email: string;
}

export type BoardMember = {
    id: string;
    name: string;
    title: string;
    email: string;
    bio?: string;
    image?: string;
}

const legacyStaff: StaffMember[] = data.staff;
const legacyBoard: BoardMember[] = data.board;

// Firestore collection names
const STAFF_COLLECTION = 'staff';
const BOARD_COLLECTION = 'board';

export function getStaff(): StaffMember[] {
    return legacyStaff;
}

export function getBoard(): BoardMember[] {
    return legacyBoard;
}

/**
 * Fetch all staff members from Firebase Firestore
 */
export async function fetchStaffFromFirebase(): Promise<StaffMember[]> {
    try {
        const staffRef = collection(db, STAFF_COLLECTION);
        const snapshot = await getDocs(staffRef);
        
        if (snapshot.empty) {
            console.log('[Staff] No staff in Firebase, using legacy data');
            return getStaff();
        }
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as StaffMember[];
    } catch (error) {
        console.error('[Staff] Error fetching from Firebase:', error);
        return getStaff();
    }
}

/**
 * Fetch all board members from Firebase Firestore
 */
export async function fetchBoardFromFirebase(): Promise<BoardMember[]> {
    try {
        const boardRef = collection(db, BOARD_COLLECTION);
        const snapshot = await getDocs(boardRef);
        
        if (snapshot.empty) {
            console.log('[Board] No board members in Firebase, using legacy data');
            return getBoard();
        }
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as BoardMember[];
    } catch (error) {
        console.error('[Board] Error fetching from Firebase:', error);
        return getBoard();
    }
}

/**
 * Add a new staff member to Firebase
 */
export async function addStaffToFirebase(staff: Omit<StaffMember, 'id'>): Promise<StaffMember> {
    const staffRef = collection(db, STAFF_COLLECTION);
    const docRef = await addDoc(staffRef, staff);
    return { id: docRef.id, ...staff };
}

/**
 * Add a new board member to Firebase
 */
export async function addBoardToFirebase(board: Omit<BoardMember, 'id'>): Promise<BoardMember> {
    const boardRef = collection(db, BOARD_COLLECTION);
    const docRef = await addDoc(boardRef, board);
    return { id: docRef.id, ...board };
}

/**
 * Update a staff member in Firebase
 */
export async function updateStaffInFirebase(id: string, staff: Partial<StaffMember>): Promise<void> {
    const staffRef = doc(db, STAFF_COLLECTION, id);
    const { id: _id, ...staffData } = staff as StaffMember;
    await updateDoc(staffRef, staffData);
}

/**
 * Update a board member in Firebase
 */
export async function updateBoardInFirebase(id: string, board: Partial<BoardMember>): Promise<void> {
    const boardRef = doc(db, BOARD_COLLECTION, id);
    const { id: _id, ...boardData } = board as BoardMember;
    await updateDoc(boardRef, boardData);
}

/**
 * Delete a staff member from Firebase
 */
export async function deleteStaffFromFirebase(id: string): Promise<void> {
    const staffRef = doc(db, STAFF_COLLECTION, id);
    await deleteDoc(staffRef);
}

/**
 * Delete a board member from Firebase
 */
export async function deleteBoardFromFirebase(id: string): Promise<void> {
    const boardRef = doc(db, BOARD_COLLECTION, id);
    await deleteDoc(boardRef);
}
