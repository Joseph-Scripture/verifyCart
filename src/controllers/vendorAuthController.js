import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import generateToken from '../utils/generateToken.js';


/**
 * @swagger
 * /api/auth/vendor/register:
 *   post:
 *     summary: Register a new vendor
 *     tags: [Vendor Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - businessName
 *               - socialLinks
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 example: jane@store.com
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 example: StrongPass123!
 *               businessName:
 *                 type: string
 *               socialLinks:
 *                 type: object
 *                 example:
 *                   instagram: https://instagram.com/store
 *                   website: https://store.com
 *     responses:
 *       201:
 *         description: Vendor created successfully
 *       400:
 *         description: validation error
 */


export const vendorSignup = async (req, res) => {
    const {
        name,
        email,
        phone,
        businessName,
        password,
        socialLinks,
    } = req.body;

    try {
        if (!name || !email || !phone || !businessName || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (
            !socialLinks ||
            typeof socialLinks !== 'object' ||
            Object.keys(socialLinks).length === 0
        ) {
            return res.status(400).json({
                message: 'At least one social link is required',
            });
        }

        const existingVendor = await prisma.vendor.findUnique({
            where: { email },
        });

        if (existingVendor) {
            return res.status(400).json({ message: 'Vendor already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const vendor = await prisma.vendor.create({
            data: {
                name,
                email,
                phone,
                businessName,
                password: hashedPassword,
                socialLinks,
            },
        });

        const token = generateToken(vendor.id, res);

        res.status(201).json({
            success: true,
            message: 'Vendor created successfully',
            vendorId: vendor.id,
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /api/auth/vendor/login:
 *   post:
 *     summary: Vendor Login
 *     tags: [Vendor Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: jane@store.com
 *               password:
 *                 type: string
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid Credentials
 *       500:
 *         description: Internal server error
 */




export const vendorLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' })
    }
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { email },
        });
        if (!vendor) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }
        if (vendor.lockUntil && vendor.lockUntil > new Date()) {
            return res.status(403).json({
                message: "Account locked Try again later"
            })
        }

        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) {
            await prisma.vendor.update({
                where: { id: vendor.id },
                data: {
                    failedLoginAttempts: { increment: 1 },
                    lockUntil:
                        vendor.failedLoginAttempts + 1 >= 5
                            ? new Date(Date.now() + 15 * 60 * 1000)
                            : null
                }
            });
            return res.status(401).json({ message: 'Invalid email or password' })
        }
        await prisma.vendor.update({
            where: { id: vendor.id },
            data: {
                failedLoginAttempts: 0,
                lockUntil: null
            }
        })
        const token = generateToken({ vendorId: vendor.id }, res);
        return res.status(200).json({
            success: true,
            message: 'Vendor logged in successfully',
            token,
            vendorId:vendor.id
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
/**
 * @swagger
 * /api/auth/vendor/logout:
 *   post:
 *     summary: Vendor Logout
 *     tags: [Vendor Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
export const vendorLogout = async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    return res.status(200).json({
        success: true,
        message: 'Vendor logged out successfully',
    })
}

/** 
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Admin Login
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *       500:
 *         description: Internal server error
 */

export const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await prisma.admin.findUnique({
            where: { email },
        });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken({ adminId: admin.id, type: 'ADMIN' }, res);

        return res.status(200).json({
            success: true,
            message: 'Admin logged in successfully',
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }

}
