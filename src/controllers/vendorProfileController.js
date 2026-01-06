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
/**
 * @swagger
 * /api/vendor/profile/images:
 *   patch:
 *     summary: Update vendor profile images
 *     tags: [Vendor Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               bannerImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile images updated successfully
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
 *                     profileImage:
 *                       type: string
 *                     bannerImage:
 *                       type: string
 *       400:
 *         description: No images uploaded
 *       403:
 *         description: Vendor not authenticated
 *       500:
 *         description: Internal server error
 */

export const updateProfileImages = async (req, res) => {
    const vendor = req.vendor;
    if(!vendor){
        return res.status(403).json({message: 'Vendor not authenticated'})
    }
    try {
        const profileImage = req.files?.profileImage?.[0]?.path;
        const bannerImage = req.files?.bannerImage?.[0]?.path;
        if(!profileImage && !bannerImage){
            return res.status(400).json({message :"No images uploaded"});

        }
        const updatedVendor = await prisma.vendor.update({
            where: {id:vendor.id},
            data:{
                ...(profileImage && {profileImage}),
                ...(bannerImage && {bannerImage}),
            },
            select:{
                id:true,
                profileImage: true,
                bannerImage: true,

            },
        });
        res.status(200).json({
            success: true,
            message:"profile images updated",
            vendor:updatedVendor
        })
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}