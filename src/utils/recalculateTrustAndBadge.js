import prisma from '../config/db.js';
import { generateBadgeId } from './generateBadgeId.js';

export const recalculateTrustAndBadge = async (vendorId) => {
  const requiredTypes = ['ID', 'ADDRESS', 'REGISTRATION'];

  const items = await prisma.verificationItem.findMany({
    where: { vendorId },
  });

  let trustScore = 0;

  for (const item of items) {
    if (item.status === 'VERIFIED') trustScore += 30;
    if (item.status === 'REJECTED') trustScore -= 20;
  }

  if (trustScore < 0) trustScore = 0;

  const allVerified = requiredTypes.every(
    type => items.find(i => i.type === type && i.status === 'VERIFIED')
  );

  const vendorData = {
    trustScore,
    badgeId: null,
  };

  if (allVerified) {
    vendorData.trustScore = Math.max(trustScore, 80);
    vendorData.badgeId = generateBadgeId();
  }

  await prisma.vendorProfile.update({
    where: { id: vendorId },
    data: vendorData,
  });
};
