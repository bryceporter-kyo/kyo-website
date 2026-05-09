import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import data from './staff.json';
import { sendStaffAddedEmail, sendBoardMemberAddedEmail } from './mail';

export type TeamMemberLinks = {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    spotify?: string;
    website?: string;
}

export type StaffMember = {
    id: string;
    name: string;
    title: string;
    bio?: string;
    image?: string;
    email: string;
    links?: TeamMemberLinks;
    order?: number;
}

export type BoardMember = {
    id: string;
    name: string;
    title: string;
    email: string;
    bio?: string;
    image?: string;
    links?: TeamMemberLinks;
    order?: number;
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
 * Add a new staff member to Firebase and send a welcome email
 */
export async function addStaffToFirebase(staff: Omit<StaffMember, 'id'>): Promise<StaffMember> {
    const staffRef = collection(db, STAFF_COLLECTION);
    const docRef = await addDoc(staffRef, staff);
    
    // Send welcome email to the new staff member
    try {
        await sendStaffAddedEmail(staff.email, staff.name, staff.title);
        console.log('[Staff] Welcome email sent to:', staff.email);
    } catch (error) {
        console.error('[Staff] Failed to send welcome email:', error);
        // Don't throw - staff member was still created successfully
    }
    
    return { id: docRef.id, ...staff };
}

/**
 * Add a new board member to Firebase and send a welcome email
 */
export async function addBoardToFirebase(board: Omit<BoardMember, 'id'>): Promise<BoardMember> {
    const boardRef = collection(db, BOARD_COLLECTION);
    const docRef = await addDoc(boardRef, board);
    
    // Send welcome email to the new board member
    try {
        await sendBoardMemberAddedEmail(board.email, board.name, board.title);
        console.log('[Board] Welcome email sent to:', board.email);
    } catch (error) {
        console.error('[Board] Failed to send welcome email:', error);
        // Don't throw - board member was still created successfully
    }
    
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
 * Sorts team members by order first (ascending), then by name (alphabetically)
 */
export function sortTeamMembers<T extends { name: string; order?: number }>(members: T[]): T[] {
    return [...members].sort((a, b) => {
        // If order is not set, treat it as very high (place at the end)
        const orderA = a.order !== undefined && a.order !== null ? Number(a.order) : 999999;
        const orderB = b.order !== undefined && b.order !== null ? Number(b.order) : 999999;
        
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        
        // Secondary sort by name
        return a.name.localeCompare(b.name);
    });
}
