import prisma from '../config/db.js';
import {recalculateVendorStatus} from '../utils/recalculateVendorStatus.js'
import {recalculateTrustAndBadge} from '../utils/recalculateTrustAndBadge.js'

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
export const reviewVerificationItem = async (req, res) => {
    const { id } = req.params;
    const { decision, note } = req.body;
  
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ message: "Invalid decision" });
    }
  
    try {
      // 1. Find verification item
      const item = await prisma.verificationItem.findUnique({
        where: { id },
        include: { vendor: true },
      });
  
      if (!item) {
        return res.status(404).json({ message: "Verification item not found" });
      }
  
      // 2. Update verification item
      await prisma.verificationItem.update({
        where: { id },
        data: {
          status: decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
          adminNote: note || null,
        },
      });
  
      // 3. Recalculate vendor status
      await recalculateVendorStatus(item.vendorId);
      await recalculateTrustAndBadge(item.vendorId);
      
  
      res.status(200).json({
        success: true,
        message: `Verification ${decision.toLowerCase()}`,
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  