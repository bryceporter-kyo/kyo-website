import { db, sanitizeForFirestore } from './firebase';
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
    const cleanEmail = sanitizeForFirestore(email);
    const docRef = await addDoc(mailRef, cleanEmail);
    console.log('[Mail] Email queued with ID:', docRef.id);
    return docRef.id;
}

/**
 * Send a notification email to a new user with onboarding / credential setup instructions.
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
            subject: 'Welcome to KYO! Set Up Your Account',
            text: `Hello ${userName},\n\nYou have been added as an authorized user for the KYO website & portals with the following roles: ${rolesText}.\n\nTo activate your account and set up your login password:\n1. Visit https://thekyo.ca/admin/login\n2. Click on the "First Time Login" tab\n3. Enter your email (${recipientEmail}) and choose your password\n\nBest regards,\nThe KYO Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
                    <h2 style="color: #0f172a; margin-bottom: 8px;">Welcome, ${userName}!</h2>
                    <p>You have been added as an authorized user for the KYO website &amp; portal with the following permissions:</p>
                    <ul style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 24px; margin: 16px 0;">
                        ${roles.map(role => `<li style="margin: 4px 0;"><strong>${role}</strong></li>`).join('')}
                    </ul>
                    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
                        <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 15px;">How to Set Up Your Password &amp; Login</h4>
                        <ol style="margin: 0; padding-left: 20px; color: #14532d; font-size: 14px;">
                            <li style="margin: 4px 0;">Go to <a href="https://thekyo.ca/admin/login" style="color: #047857; font-weight: bold;">thekyo.ca/admin/login</a></li>
                            <li style="margin: 4px 0;">Click the <strong>First Time Login</strong> tab</li>
                            <li style="margin: 4px 0;">Enter your email (<strong>${recipientEmail}</strong>) and choose your new password</li>
                        </ol>
                    </div>
                    <p style="font-size: 13px; color: #64748b; margin-top: 24px;">If you have any questions or require assistance, please contact the KYO team.</p>
                    <p style="font-size: 14px; margin-top: 16px;">Best regards,<br/><strong>The KYO Team</strong></p>
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
