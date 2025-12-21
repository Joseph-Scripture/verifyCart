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
