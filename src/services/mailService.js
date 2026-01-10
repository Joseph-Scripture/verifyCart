
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendResetCodeEmail = async (to, code) => {
    await transporter.sendMail({
        to,
        subject: 'VerifyCart Password Reset Code',
        html: `
        <p>Your password reset code is:</p>
        <h2>${code}</h2>
        <p>This code expires in 10 minutes.</p>
    `,
    });
};

export const sendVerificationStatusEmail = async (to, vendorName, status, itemType = '', note = '') => {
    let subject = '';
    let message = '';

    switch (status.toUpperCase()) {
        case 'APPROVED':
            subject = 'VerifyCart: Verification Item Approved';
            message = `Congratulations ${vendorName}, your ${itemType} verification has been approved. Your trust score has been updated.`;
            break;
        case 'REJECTED':
            subject = 'VerifyCart: Verification Item Rejected';
            message = `Hello ${vendorName}, unfortunately your ${itemType} verification was rejected. ${note ? `\n\nNote from admin: ${note}` : ''}`;
            break;
        case 'REVOKED':
            subject = 'VerifyCart: Vendor Status Revoked';
            message = `Hello ${vendorName}, your verified status on VerifyCart has been revoked. ${note ? `\n\nReason: ${note}` : ''}`;
            break;
        default:
            subject = 'VerifyCart: Verification Status Update';
            message = `Hello ${vendorName}, there has been an update to your verification status.`;
    }

    await transporter.sendMail({
        to,
        subject,
        html: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>${subject}</h2>
                <p>${message}</p>
                <p>Log in to your dashboard for more details.</p>
                <hr />
                <p style="color: #666; font-size: 12px;">This is an automated message from VerifyCart.</p>
            </div>
        `,
    });
};
