import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import generateToken from '../utils/generateToken.js';

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        message: 'Not authenticated',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vendor token
    if (decoded.vendorId) {
      const vendor = await prisma.vendor.findUnique({
        where: { id: decoded.vendorId },
      });

      if (!vendor) {
        return res.status(401).json({ message: 'Vendor not found' });
      }

      // Check for stale status and refresh token if needed
      if (decoded.status !== vendor.status) {
        console.log(`[Auth] Refreshing stale token for vendor ${vendor.email}. Old status: ${decoded.status}, New status: ${vendor.status}`);
        generateToken({
          vendorId: vendor.id,
          name: vendor.name,
          status: vendor.status
        }, res);
      }

      req.vendor = vendor;
      req.authType = 'VENDOR';
      return next();
    }

    // Admin token
    if (decoded.adminId) {
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.adminId },
      });

      if (!admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }

      req.admin = admin;
      req.authType = 'ADMIN';
      return next();
    }

    return res.status(401).json({ message: 'Invalid token' });

  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};

export default protect;
