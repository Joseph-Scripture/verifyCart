import prisma from '../config/db.js';
import { recalculateVendorVerificationState } from '../utils/recalculateVendorVerificationState.js';
import { sendVerificationStatusEmail } from '../services/mailService.js';

import { writeAuditlog } from '../utils/writeAuditlog.js';

/**
 * @swagger
 * /api/admin/verification/pending:
 *   get:
 *     summary: Get pending verification items
 *     tags: [Admin Verification]
 *     responses:
 *       200:
 *         description: List of pending items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       status:
 *                         type: string
 *                       vendor:
 *                         type: object
 *       500:
 *         description: Internal server error
 */
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


/**
 * @swagger
 * /api/admin/verification/{id}:
 *   patch:
 *     summary: Review a verification item
 *     tags: [Admin Verification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decision
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item reviewed successfully
 *       400:
 *         description: Invalid decision or input
 *       404:
 *         description: Verification item not found
 *       500:
 *         description: Internal server error
 */
export const reviewVerificationItem = async (req, res) => {
  const { id } = req.params;
  const { decision, note } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    return res.status(400).json({ message: 'Invalid decision' });
  }

  try {
    const item = await prisma.verificationItem.findUnique({
      where: { id },
      include: { vendor: true }
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
      adminId: req.admin.id,
      vendorId: item.vendorId,
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

    // Send email notification to vendor
    await sendVerificationStatusEmail(
      item.vendor.email,
      item.vendor.name,
      decision,
      item.type,
      note
    );

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
/**
 * @swagger
 * /api/admin/review/{reviewId}:
 *   patch:
 *     summary: Moderate a review
 *     tags: [Admin Verification]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decision
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [APPROVED, REJECTED, HIDDEN]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review moderated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 review:
 *                    type: object
 *       400:
 *         description: Invalid decision
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */

export const moderateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { decision, note } = req.body;

  if (!['APPROVED', 'REJECTED', 'HIDDEN'].includes(decision)) {
    return res.status(400).json({ message: 'Invalid decision' });
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      status:
        decision === 'APPROVED'
          ? 'VISIBLE'
          : decision === 'REJECTED'
            ? 'REJECTED'
            : 'HIDDEN',
      adminNote: note || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      admin: { connect: { id: req.admin.id } },
      vendor: { connect: { id: review.vendorId } },
      action:
        decision === 'APPROVED'
          ? 'APPROVE_REVIEW'
          : decision === 'REJECTED'
            ? 'REJECT_REVIEW'
            : 'HIDE_REVIEW',
      targetType: 'REVIEW',
      targetId: review.id,
      metadata: {
        rating: review.rating,
        note,
      },
    },
  });

  res.json({
    success: true,
    review: updatedReview,
  });
};

/**
 * @swagger
 * /api/admin/vendor/{vendorId}/revoke:
 *   patch:
 *     summary: Revoke a vendor's verified status/badge
 *     tags: [Admin Verification]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Vendor revoked successfully
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
export const revokeVendor = async (req, res) => {
  const { vendorId } = req.params;

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        status: 'NOT_SUBMITTED',
        trustScore: 0,
        badgeId: null,
      },
    });

    await writeAuditlog({
      adminId: req.admin.id,
      vendorId: vendor.id,
      action: 'REVOKE_VENDOR',
      targetType: 'VENDOR',
      targetId: vendor.id,
      metadata: {
        reason: 'Admin revoked status',
        previousStatus: vendor.status,
      },
    });

    // Send email notification to vendor
    await sendVerificationStatusEmail(
      vendor.email,
      vendor.name,
      'REVOKED',
      '',
      'Admin revoked your verified status'
    );

    res.status(200).json({
      success: true,
      message: 'Vendor status revoked',
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
/**
 * @swagger
 * /api/admin/verification:
 *   get:
 *     summary: Get all verification items (PENDING, APPROVED, REJECTED)
 *     tags: [Admin Verification]
 *     responses:
 *       200:
 *         description: List of all verification items
 *       500:
 *         description: Internal server error
 */
export const getAllVerificationItems = async (req, res) => {
  try {
    const items = await prisma.verificationItem.findMany({
      orderBy: {
        createdAt: 'desc',
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

/**
 * @swagger
 * /api/admin/vendors/approved:
 *   get:
 *     summary: Get all approved (verified) vendors
 *     tags: [Admin Verification]
 *     responses:
 *       200:
 *         description: List of approved vendors
 *       500:
 *         description: Internal server error
 */
export const getApprovedVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: {
        status: { in: ['VERIFIED', 'PARTIALLY_VERIFIED'] },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/admin/vendors/rejected:
 *   get:
 *     summary: Get all rejected or revoked vendors
 *     tags: [Admin Verification]
 *     responses:
 *       200:
 *         description: List of rejected/revoked vendors
 *       500:
 *         description: Internal server error
 */
export const getRejectedVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: {
        status: { in: ['REVOKED'] }, // Assuming REVOKED is the status for rejected/blocked
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
