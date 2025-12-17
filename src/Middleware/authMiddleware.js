import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },

            include: {
                vendorProfile: true,
            },
        });

        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const vendorOnly = (req, res, next) => {
    if (req.user && req.user.role === 'VENDOR') {
        next();
    } else {
        return res.status(403).json({ message: "Access denied: Vendors only" });
    }
};

export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }
};
