import prisma from '../config/db.js';

export const getPendingVerificationItems = async (req, res) => {
    try {
        const items = await prisma.verificationItem.findMany({
            where: {
                status: 'UNDER_REVIEW',
            },
            include: {
                vendor: {
                    include: {
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        res.status(200).json({
            success: true,
            count: items.length,
            items,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
