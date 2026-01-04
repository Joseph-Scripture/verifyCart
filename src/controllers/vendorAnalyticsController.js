import prisma from '../config/db.js';

/**
 * @swagger
 * /api/vendor/analytics:
 *   get:
 *     summary: Get vendor analytics
 *     tags: [Vendor Analytics]
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     badgeClicks:
 *                       type: integer
 *                     profileViews:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
export const getVendorAnalytics = async (req, res) => {
    const vendorId = req.vendor.id;

    try {
        const [badgeClicks, profileViews] = await Promise.all([
            prisma.analyticsEvent.count({
                where: { vendorId, type: 'BADGE_CLICK' },
            }),
            prisma.analyticsEvent.count({
                where: { vendorId, type: 'PROFILE_VIEW' },
            }),
        ]);

        res.status(200).json({
            success: true,
            analytics: {
                badgeClicks,
                profileViews,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
