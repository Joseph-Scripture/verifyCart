import prisma from '../config/db.js';
import {generateBadgeId} from './generateBadgeId.js'


export const recalculateVendorVerificationState = async (vendorId) => {
    const latestItems = await prisma.verificationItem.findMany({
    where: { vendorId },
    orderBy: { createdAt: 'desc' },
    distinct: ['type'],
    });

    const scoreMap = {
    ID: 30,
    ADDRESS: 30,
    REGISTRATION: 40,
    };

    let approvedCount = 0;
    let trustScore = 0;

    for (const item of latestItems) {
    if (item.status === 'APPROVED') {
        approvedCount++;
        trustScore += scoreMap[item.type] || 0;
    }
    }

    let status = 'NOT_SUBMITTED';

    if (approvedCount === 3) {
    status = 'VERIFIED';
    } else if (approvedCount > 0) {
    status = 'PARTIALLY_VERIFIED';
    }

    let badgeId = null;

    if (status === 'VERIFIED' && trustScore >= 80) {
    badgeId = generateBadgeId();
    }

    await prisma.vendor.update({
    where: { id: vendorId },
    data: {
        status,
        trustScore,
        badgeId,
    },
    });

    return {
    status,
    trustScore,
    badgeIssued: Boolean(badgeId),
    };
};
