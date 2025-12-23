import prisma from '../config/db.js';
import { VerificationType } from '@prisma/client';

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

  const fileUrl = req.file.path;

  const item = await prisma.verificationItem.create({
    data: {
      vendorId: vendor.id,
      type,
      fileUrl,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Document submitted successfully',
    item,
  });
};


export const getVendorVerificationSummary = async (req, res) => {
  const { vendorId } = req.params;

  try {
    // 1. Fetch vendor
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        name: true,
        businessName: true,
        status: true,
        trustScore: true,
        badgeId: true,
      },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // 2. Fetch latest verification items
    const items = await prisma.verificationItem.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Build summary map
    const verification = {
      ID: 'NOT_SUBMITTED',
      ADDRESS: 'NOT_SUBMITTED',
      REGISTRATION: 'NOT_SUBMITTED',
    };

    for (const item of items) {
      if (!verification[item.type]) continue;
      if (verification[item.type] === 'NOT_SUBMITTED') {
        verification[item.type] = item.status;
      }
    }

    // 4. Respond
    res.status(200).json({
      success: true,
      vendor,
      verification,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const searchVendors = async (req, res) => {
  const { q } = req.query.q?.trim();

  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const vendors = await prisma.vendor.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { businessName: { contains: q, mode: 'insensitive' } },

          { socialLinks: { path: ['instagram'], string_contains: q } },
          { socialLinks: { path: ['twitter'], string_contains: q } },
          { socialLinks: { path: ['website'], string_contains: q } },
        ],
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        status: true,
        trustScore: true,
        badgeId: true,
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
