import prisma from "../config/db.js";

/**
 * @swagger
 * /api/badge/{vendorId}:
 *   get:
 *     summary: Track badge click and redirect
 *     tags: [Public Analytics]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Source of the click (e.g., INSTAGRAM, WEBSITE)
 *     responses:
 *       302:
 *         description: Redirects to vendor profile
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
export const trackBadgeClick = async (req, res) => {
    const { vendorId } = req.params;
    const { source } = req.query;

    try {
        const vendor = await prisma.vendor.findUnique({
            where: {
                id: vendorId,
            },
            select: {
                id: true
            }
        });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // 2. Record analytics event
        await prisma.analyticsEvent.create({
            data: {
                vendorId,
                type: 'BADGE_CLICK',
                source: source?.toUpperCase() || 'UNKNOWN',
                metadata: {
                    referrer: req.get('referer') || null,
                    userAgent: req.get('user-agent'),
                },
            },
        });

        return res.redirect(`${process.env.PUBLIC_URL}/vendors/${vendorId}`)

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}