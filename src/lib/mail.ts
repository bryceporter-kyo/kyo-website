import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

// Firestore collection name for the Trigger Email extension
const MAIL_COLLECTION = 'mail';

export type EmailMessage = {
    to: string | string[];
    message: {
        subject: string;
        text?: string;
        html?: string;
    };
};

/**
 * Send an email using Firebase's Trigger Email extension.
 * This function adds a document to the 'mail' collection which triggers the extension.
 */
export async function sendEmail(email: EmailMessage): Promise<string> {
    const mailRef = collection(db, MAIL_COLLECTION);
    const docRef = await addDoc(mailRef, email);
    console.log('[Mail] Email queued with ID:', docRef.id);
    return docRef.id;
}

/**
 * Send a notification email to a new user about their website editor permissions.
 */
export async function sendUserAddedEmail(
    recipientEmail: string,
    userName: string,
    roles: string[]
): Promise<string> {
    const rolesText = roles.join(', ');
    
    const email: EmailMessage = {
        to: recipientEmail,
        message: {
            subject: 'Welcome! You have been added as a user',
            text: `Hello ${userName},\n\nYou have been added as a user and given the following permissions: ${rolesText}.\n\nYou can now access the website editor and manage content based on your assigned roles.\n\nBest regards,\nThe KYO Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome, ${userName}!</h2>
                    <p>You have been added as a user and given the following permissions:</p>
                    <ul>
                        ${roles.map(role => `<li><strong>${role}</strong></li>`).join('')}
                    </ul>
                    <p>You can now access the website editor and manage content based on your assigned roles.</p>
                    <p>Best regards,<br/>The KYO Team</p>
                </div>
            `,
        },
    };

    return sendEmail(email);
}

/**
 * Send a notification email to a new staff member.
 */
export async function sendStaffAddedEmail(
    recipientEmail: string,
    memberName: string,
    title: string
): Promise<string> {
    const email: EmailMessage = {
        to: recipientEmail,
        message: {
            subject: 'Welcome to the KYO Staff Team!',
            text: `Hello ${memberName},\n\nCongratulations! You have been added as a staff member with the title: ${title}.\n\nWe're excited to have you on our team!\n\nBest regards,\nThe KYO Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to the KYO Staff Team, ${memberName}!</h2>
                    <p>Congratulations! You have been added as a staff member with the following title:</p>
                    <p style="font-size: 18px; color: #333;"><strong>${title}</strong></p>
                    <p>We're excited to have you on our team!</p>
                    <p>Best regards,<br/>The KYO Team</p>
                </div>
            `,
        },
    };

    return sendEmail(email);
}

/**
 * Send a notification email to a new board member.
 */
export async function sendBoardMemberAddedEmail(
    recipientEmail: string,
    memberName: string,
    title: string
): Promise<string> {
    const email: EmailMessage = {
        to: recipientEmail,
        message: {
            subject: 'Welcome to the KYO Board!',
            text: `Hello ${memberName},\n\nCongratulations! You have been added as a board member with the title: ${title}.\n\nWe're honored to have you serve on our board!\n\nBest regards,\nThe KYO Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to the KYO Board, ${memberName}!</h2>
                    <p>Congratulations! You have been added as a board member with the following title:</p>
                    <p style="font-size: 18px; color: #333;"><strong>${title}</strong></p>
                    <p>We're honored to have you serve on our board!</p>
                    <p>Best regards,<br/>The KYO Team</p>
                </div>
            `,
        },
    };

    return sendEmail(email);
}
