import prisma from '../config/db.js';
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
