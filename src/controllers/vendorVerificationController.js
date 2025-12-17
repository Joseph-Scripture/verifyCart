import prisma from '../config/db.js';

export const submitVerificationItem = async (req, res) => {
  const { type } = req.params;
  const vendor = req.user.vendorProfile;

  if (!vendor) {
    return res.status(403).json({ message: "Vendor profile not found" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Document is required" });
  }

  const allowedTypes = ['REGISTRATION', 'ADDRESS', 'ID'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ message: "Invalid verification type" });
  }

  const filePath = req.file.path;

  // Upsert → latest state only
  const item = await prisma.verificationItem.upsert({
    where: {
      vendorId_type: {
        vendorId: vendor.id,
        type,
      },
    },
    update: {
      value: filePath,
      status: 'UNDER_REVIEW',
      adminNote: null,
    },
    create: {
      vendorId: vendor.id,
      type,
      value: filePath,
      status: 'UNDER_REVIEW',
    },
  });

  // Update vendor status
  await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: { status: 'UNDER_REVIEW' },
  });

  res.status(200).json({
    success: true,
    message: "Document submitted successfully",
    item,
  });
};
