import prisma from '../config/db.js';
import {recalculateVendorVerificationState} from '../utils/recalculateVendorVerificationState.js';

import { writeAuditlog } from '../utils/writeAuditlog.js';

export const getPendingVerificationItems = async (req, res) => {
  try {
    const items = await prisma.verificationItem.findMany({
      where: {
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            status: true,
            trustScore: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const reviewVerificationItem = async (req, res) => {
  const { id } = req.params;
  const { decision, note } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    return res.status(400).json({ message: 'Invalid decision' });
  }

  try {
    const item = await prisma.verificationItem.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ message: 'Verification item not found' });
    }

    await prisma.verificationItem.update({
      where: { id },
      data: {
        status: decision,
        adminNote: note || null,
      },
    });

    const result = await recalculateVendorVerificationState(item.vendorId);

    await writeAuditlog({
      data:{
        admin:{
          connect:{id:req.admin.id}
        }
      },
      adminId: req.admin.id,
      action:
        decision === 'APPROVED'
          ? 'APPROVE_VERIFICATION'
          : 'REJECT_VERIFICATION',
      targetType: 'VERIFICATION_ITEM',
      targetId: item.id,
      metadata: {
        verificationType: item.type,
        note,
        resultingStatus: result.status,
        trustScore: result.trustScore,
        badgeIssued: result.badgeIssued,
      },
    });

    res.status(200).json({
      success: true,
      message: `Verification ${item.type} ${decision.toLowerCase()}`,
      ...result,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
