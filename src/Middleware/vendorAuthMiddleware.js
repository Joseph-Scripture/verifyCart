import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';


export const protectVendor = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt;
        if(!token){
            return res.status(401).json({message: 'Unauthorized'})
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.vendorId) {
            return res.status(401).json({message:"Invalid token"});

        }
        const vendor = await prisma.vendor.findUnique({
            where: {
                id: decoded.vendorId,
            },
            select: {
                id:true,
                email:true,
                status:true,
                trustScore:true,
                badgeId:true,
                
            },
        });
        if (!vendor) {
            return res.status(401).json({message:"Invalid token"});
        }
        req.vendor = vendor;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({
            message:"Token expired or invalid"
        })
    }
}