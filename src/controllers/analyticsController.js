import prisma from "../config/db.js";

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