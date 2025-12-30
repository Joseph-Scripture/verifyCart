import prisma from "../config/db.js";

/**
 * @swagger
 * /api/review/{vendorId}:
 *   post:
 *     summary: Submit a review for a vendor
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the vendor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 minLength: 5
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 reviewId:
 *                   type: string
 *       400:
 *         description: Invalid input or missing fields
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
export const submitReview = async (req, res) => {
    const { vendorId } = req.params;
    const { rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    try {
        const review = await prisma.review.create({
            data: {
                vendorId,
                rating,
                comment,
                status: 'PENDING',
            },
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted and awaiting moderation',
            review,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


/**
 * @swagger
 * /api/review/{vendorId}:
 *   get:
 *     summary: Get reviews for a specific vendor
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the vendor
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of reviews for the vendor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reviewer:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
export const getVendorReviews = async (req, res) => {
    const { vendorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: {
                vendorId,
                status: 'VISIBLE',
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
                reviewer: true,
                rating: true,
                comment: true,
                createdAt: true,
            },
        }),
        prisma.review.count({
            where: {
                vendorId,
                status: 'VISIBLE',
            },
        }),
    ]);

    res.json({
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        reviews,
    });
};

