import prisma from '../config/db.js';

/**
 * @swagger
 * /api/vendor/profile:
 *   patch:
 *     summary: Update vendor profile
 *     tags: [Vendor Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               businessName:
 *                 type: string
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   instagram:
 *                     type: string
 *                   whatsapp:
 *                     type: string
 *                   facebook:
 *                     type: string
 *                   website:
 *                     type: string
 *                   tiktok:
 *                     type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 vendor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     businessName:
 *                       type: string
 *                     socialLinks:
 *                       type: object
 *                       properties:
 *                         instagram:
 *                           type: string
 *                         whatsapp:
 *                           type: string
 *                         facebook:
 *                           type: string
 *                         website:
 *                           type: string
 *                         tiktok:
 *                           type: string
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Vendor not authenticated
 *       500:
 *         description: Internal server error
 */

export const updateVendorProfile = async (req, res) => {
    const vendorId = req.vendor.id;
    const { name, phone, businessName, socialLinks } = req.body;

    try {
        const updatedVendor = await prisma.vendor.update({
            where: { id: vendorId },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
                ...(businessName && { businessName }),
                ...(socialLinks && { socialLinks }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                businessName: true,
                socialLinks: true,
                status: true,
                trustScore: true,
                badgeId: true,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            vendor: updatedVendor,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
