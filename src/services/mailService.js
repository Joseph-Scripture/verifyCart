
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
