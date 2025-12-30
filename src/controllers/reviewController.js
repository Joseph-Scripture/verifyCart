import prisma from "../config/db.js";

export const submitReview = async (req, res) => {
    const vendorId = req.params.vendorId;
    const { rating, comment, reviewer } = req.body;

    // if(!comment || !reviewer){
    //     return res.status(400).json({ message: "Missing required fields" });
    // }
    if(!comment || comment.trim().length < 5){
        return res.status(400).json({    
            success:false,
            message:"Comment is too short" 
        })
    }
    if(!rating || rating < 1 || rating > 5){
        return res.status(400).json({ 
            success:false,
            message: "Rating must be between 1 and 5" 
        });
    }

    try {
        const vendor = await prisma.vendor.findUnique({
            where: {id:vendorId}
        })
        if(!vendor){
            return res.status(404).json({ 
                success:false,
                message: "Vendor not found" 
            });
        }
        const review = await prisma.review.create({
            data: {
                vendorId,
                rating,
                comment,
                reviewer: reviewer || 'Anonymous',
            },
        });
        return res.status(201).json({ 
            success:true,
            message: "Review submitted and awaiting moderation",
            reviewId: review.id
        }); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success:false,
            message: "Internal server error" 
        });
    }
}


export const getVendorReviews = async (req, res) => {
    const { vendorId } = req.params;

    try {
        const reviews = await prisma.review.findMany({
        where: {
            vendorId,
            status: 'VISIBLE',
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            reviewer: true,
            rating: true,
            comment: true,
            createdAt: true,
        },
        });

        res.status(200).json({
        success: true,
        count: reviews.length,
        reviews,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
