import prisma from '../config/db.js';
import { VerificationType } from '@prisma/client';

/**
 * @swagger
 * /api/vendor/verification/{type}:
 *   post:
 *     summary: Submit a verification document
 *     tags: [Vendor Verification]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of verification (e.g., ID, ADDRESS, REGISTRATION)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document submitted successfully
 *       400:
 *         description: Invalid input or missing file
 *       403:
 *         description: Vendor not authenticated
 */
export const submitVerificationItem = async (req, res) => {
  const { type } = req.params;
  const vendor = req.vendor;

  if (!vendor) {
    return res.status(403).json({ message: 'Vendor not authenticated' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Document is required' });
  }

  if (!Object.values(VerificationType).includes(type)) {
    return res.status(400).json({ message: 'Invalid verification type' });
  }

  const existingItem = await prisma.verificationItem.findUnique({
    where: {
      vendorId_type: {
        vendorId: vendor.id,
        type,
      },
    },
  });

  let item;
  const fileUrl = req.file.path;

  if (existingItem) {
    if (existingItem.status === 'APPROVED' && vendor.status !== 'REVOKED') {
      return res.status(400).json({
        message: 'This document has already been verified and cannot be resubmitted',
      });
    }

    if (existingItem.status === 'PENDING') {
      return res.status(400).json({
        message: 'This document is already under review',
      });
    }

    item = await prisma.verificationItem.update({
      where: { id: existingItem.id },
      data: {
        fileUrl,
        status: 'PENDING',
      },
    });
  } else {
    item = await prisma.verificationItem.create({
      data: {
        vendorId: vendor.id,
        type,
        fileUrl,
      },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Document submitted successfully',
    item,
  });
};


/**
 * @swagger
 * /api/vendor/summary/{vendorId}:
 *   get:
 *     summary: Get verification summary for a vendor
 *     tags: [Public Vendor Info]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor verification summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 vendor:
 *                   type: object
 *                 verification:
 *                   type: object
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
export const getVendorVerificationSummary = async (req, res) => {
  const { vendorId } = req.params;

  try {
    // 1. Fetch vendor core info
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        name: true,
        businessName: true,
        email: true,
        phone: true,
        socialLinks: true,
        status: true,
        trustScore: true,
        badgeId: true,
        createdAt: true,
      },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    const validSources = ['INSTAGRAM', 'WHATSAPP', 'FACEBOOK', 'WEBSITE', 'DIRECT', 'TIKTOK'];
    let sourceInput = req.query.source || req.query.ref || 'DIRECT';
    sourceInput = sourceInput.toUpperCase();

    const source = validSources.includes(sourceInput) ? sourceInput : 'DIRECT';
    const eventType = (sourceInput === 'BADGE') ? 'BADGE_CLICK' : 'PROFILE_VIEW';

    await prisma.analyticsEvent.create({
      data: {
        vendorId,
        type: eventType,
        source: source,
        metadata: {
          referrer: req.get('referer') || null,
          userAgent: req.get('user-agent'),
        },
      },
    });

    const items = await prisma.verificationItem.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });
    const verification = {
      ID: 'NOT_SUBMITTED',
      ADDRESS: 'NOT_SUBMITTED',
      REGISTRATION: 'NOT_SUBMITTED',
    };

    for (const item of items) {
      if (verification[item.type] === 'NOT_SUBMITTED') {
        verification[item.type] = item.status;
      }
    }

    const reviews = await prisma.review.findMany({
      where: { vendorId: vendor.id, status: 'VISIBLE' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        reviewer: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    const avgRating =
      reviews.length > 0
        ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
        : null;

    res.status(200).json({
      success: true,
      vendor: {
        ...vendor,
        averageRating: avgRating,
        reviewCount: reviews.length,
      },
      verification,
      reviews,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



/**
 * @swagger
 * /api/vendors/search:
 *   get:
 *     summary: Search for vendors
 *     tags: [Public Vendor Info]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *      
 *                      
 *       400:
 *         description: Missing search query
 *       500:
 *         description: Internal server error
 */
export const searchVendors = async (req, res) => {
  const query = req.query.q?.trim();

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const vendors = await prisma.vendor.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { businessName: { contains: query, mode: 'insensitive' } },

          { socialLinks: { path: ['instagram'], string_contains: query } },
          { socialLinks: { path: ['twitter'], string_contains: query } },
          { socialLinks: { path: ['website'], string_contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        status: true,
        trustScore: true,
        badgeId: true,
        socialLinks: true,

      },
    });

    res.status(200).json({
      success: true,
      count: vendors.length,
      results: vendors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
