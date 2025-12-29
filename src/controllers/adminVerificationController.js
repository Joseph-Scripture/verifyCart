import prisma from '../config/db.js';
import { recalculateVendorVerificationState } from '../utils/recalculateVendorVerificationState.js';

// import { writeAuditlog } from '../utils/writeAuditlog.js';

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

    // await writeAuditlog({
    //   adminId: req.admin.id,
    //   vendorId: item.vendorId,
    //   action:
    //     decision === 'APPROVED'
    //       ? 'APPROVE_VERIFICATION'
    //       : 'REJECT_VERIFICATION',
    //   targetType: 'VERIFICATION_ITEM',
    //   targetId: item.id,
    //   metadata: {
    //     verificationType: item.type,
    //     note,
    //     resultingStatus: result.status,
    //     trustScore: result.trustScore,
    //     badgeIssued: result.badgeIssued,
    //   },
    // });

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
