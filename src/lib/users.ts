
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, query, where } from 'firebase/firestore';
import data from './users.json';

export type UserRole = 'Website Editor' | 'Internal Editor' | 'Internal Viewer';

export type User = {
  id: string; // Changed from number to string for Firestore IDs
  name: string;
  email: string;
  roles: UserRole[];
};

const legacyUsers: User[] = data.users.map(u => ({ ...u, id: String(u.id) })) as User[];

// Firestore collection name
const USERS_COLLECTION = 'users';

/**
 * Get users from local JSON (legacy fallback)
 */
export function getUsers(): User[] {
  return legacyUsers;
}

/**
 * Fetch all users from Firebase Firestore
 */
export async function fetchUsersFromFirebase(): Promise<User[]> {
    try {
        const usersRef = collection(db, USERS_COLLECTION);
        const snapshot = await getDocs(usersRef);
        
        if (snapshot.empty) {
            console.log('[Users] No users in Firebase, using legacy data');
            return getUsers();
        }
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as User[];
    } catch (error) {
        console.error('[Users] Error fetching from Firebase:', error);
        return getUsers();
    }
}

/**
 * Add a new user to Firebase
 */
export async function addUserToFirebase(user: Omit<User, 'id'>): Promise<User> {
    const usersRef = collection(db, USERS_COLLECTION);
    const docRef = await addDoc(usersRef, user);
    return { id: docRef.id, ...user };
}

/**
 * Update a user in Firebase
 */
export async function updateUserInFirebase(id: string, user: Partial<User>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, id);
    const { id: _id, ...userData } = user;
    await updateDoc(userRef, userData);
}

/**
 * Delete a user from Firebase
 */
export async function deleteUserFromFirebase(id: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, id);
    await deleteDoc(userRef);
}

/**
 * Get user roles by email
 */
export async function getUserRolesByEmail(email: string): Promise<UserRole[]> {
    try {
        const usersRef = collection(db, USERS_COLLECTION);
        const q = query(usersRef, where("email", "==", email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            const userData = snapshot.docs[0].data() as User;
            return userData.roles || [];
        }

        // Fallback to legacy users if not found in Firestore
        const legacyUser = legacyUsers.find(u => u.email === email);
        if (legacyUser) {
            console.log('[Users] User found in legacy data:', email);
            return legacyUser.roles;
        }

        return [];
    } catch (error) {
        console.error('[Users] Error fetching user roles:', error);
        return [];
    }
}

