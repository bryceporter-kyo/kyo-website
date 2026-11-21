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
    
    // Determine accessible portals based on assigned roles
    const hasAdminAccess = roles.includes('Website Editor');
    const hasInternalAccess = roles.includes('Internal Editor') || roles.includes('Internal Viewer');
    const hasGrantsAccess = roles.includes('Grants Portal');

    const portalBulletsText: string[] = [];
    const portalBulletsHtml: string[] = [];

    if (hasAdminAccess) {
        portalBulletsText.push('- KYO Admin Panel: https://thekyo.ca/admin');
        portalBulletsHtml.push('<li><strong>KYO Admin Panel:</strong> <a href="https://thekyo.ca/admin" style="color: #047857;">https://thekyo.ca/admin</a></li>');
    }
    if (hasInternalAccess) {
        portalBulletsText.push('- KYO Internal Portal: https://thekyo.ca/internal');
        portalBulletsHtml.push('<li><strong>KYO Internal Portal:</strong> <a href="https://thekyo.ca/internal" style="color: #047857;">https://thekyo.ca/internal</a></li>');
    }
    if (hasGrantsAccess) {
        portalBulletsText.push('- KYO Grants Portal: https://thekyo.ca/grants');
        portalBulletsHtml.push('<li><strong>KYO Grants Portal:</strong> <a href="https://thekyo.ca/grants" style="color: #047857;">https://thekyo.ca/grants</a></li>');
    }

    // Fallback if no specific role matched
    if (portalBulletsText.length === 0) {
        portalBulletsText.push('- KYO Member Portal: https://thekyo.ca/admin');
        portalBulletsHtml.push('<li><strong>KYO Member Portal:</strong> <a href="https://thekyo.ca/admin" style="color: #047857;">https://thekyo.ca/admin</a></li>');
    }

    const email: EmailMessage = {
        to: recipientEmail,
        message: {
            subject: 'Welcome to KYO! Set Up Your Account',
            text: `Hello ${userName},\n\nYou have a new user profile created for you on the KYO website and portals with the following roles: ${rolesText}.\n\nAccessible Portals:\n${portalBulletsText.join('\n')}\n\nYour credentials and setup instructions are below. You will be asked to choose/reset your password when first accessing the page.\n\nTo activate your account and set up your login password:\n1. Visit https://thekyo.ca/admin/login\n2. Click on the "First Time Login" tab\n3. Enter your email (${recipientEmail}) and choose your password\n\nBest regards,\nThe KYO Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
                    <h2 style="color: #0f172a; margin-bottom: 8px;">Welcome, ${userName}!</h2>
                    <p>You have a new user profile created for you on the KYO website and portals.</p>
                    
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 20px; margin: 16px 0;">
                        <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Portals You Have Access To:</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                            ${portalBulletsHtml.join('')}
                        </ul>
                        <p style="margin: 10px 0 0 0; font-size: 13px; color: #64748b;">
                            <strong>Assigned Roles:</strong> ${roles.join(', ')}
                        </p>
                    </div>

                    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
                        <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 15px;">Your Credentials &amp; Account Setup</h4>
                        <p style="margin: 0 0 8px 0; font-size: 13.5px; color: #15803d;">
                            Your login email is: <strong>${recipientEmail}</strong>.<br/>
                            You will be asked to choose your password when first accessing the page:
                        </p>
                        <ol style="margin: 0; padding-left: 20px; color: #14532d; font-size: 14px;">
                            <li style="margin: 4px 0;">Go to <a href="https://thekyo.ca/admin/login" style="color: #047857; font-weight: bold;">thekyo.ca/admin/login</a></li>
                            <li style="margin: 4px 0;">Click the <strong>First Time Login</strong> tab</li>
                            <li style="margin: 4px 0;">Enter your email (<strong>${recipientEmail}</strong>) and set your new password</li>
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
