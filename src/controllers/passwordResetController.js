import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import generateResetCode from "../utils/generateResetCode.js";
import { sendResetCodeEmail } from "../services/mailService.js";

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset code
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset code sent if email exists
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { email },
        });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        const resetCode = generateResetCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.vendor.update({
            where: { email },
            data: {
                resetCode,
                resetCodeExpiresAt: expiresAt
            }
        });
        await sendResetCodeEmail(email, resetCode);
        return res.status(200).json({ message: "If this email exists, a reset code has been sent" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });

    }

}


/**
 * @swagger
 * /api/auth/verify-reset-code:
 *   post:
 *     summary: Verify the password reset code
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - resetCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               resetCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset code is valid
 *       404:
 *         description: Invalid or expired code
 *       500:
 *         description: Internal server error
 */
export const verifyResetCode = async (req, res) => {
    const { email, resetCode } = req.body;
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { email },
        });
        if (
            !vendor ||
            vendor.resetCode !== resetCode ||
            vendor.resetCodeExpiresAt < new Date()) {
            return res.status(404).json({ message: "Invalid or expired code" });
        }
        return res.status(200).json({ message: "Reset code is valid" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with code
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - resetCode
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               resetCode:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Missing fields
 *       404:
 *         description: Invalid or expired code
 *       500:
 *         description: Internal server error
 */
export const resetPassword = async (req, res) => {
    const { email, resetCode, newPassword } = req.body;
    try {
        if (!email || !resetCode || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const vendor = await prisma.vendor.findUnique({
            where: { email },
        });
        if (
            !vendor ||
            vendor.resetCode !== resetCode ||
            vendor.resetCodeExpiresAt < new Date()) {
            return res.status(404).json({ message: "Invalid or expired code" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await prisma.vendor.update({
            where: { email },
            data: {
                password: hashedPassword,
                resetCode: null,
                resetCodeExpiresAt: null
            }
        });
        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }

}