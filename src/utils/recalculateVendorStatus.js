import prisma from '../config/db.js';

export const recalculateVendorStatus = async (vendorId) =>{
    const requiredTypes = ['ID', 'ADDRESS', 'REGISTRATION'];
    const items = await prisma.verificationItem.findMany({
        where:{vendorId},
    });
    const statusMap = Object.fromEntries(
        requiredTypes.map(type => [type, "MISSING"])

    )
    for (const item of items) {
        statusMap[item.type] = item.status;

    }
    let newStatus = "NOT_SUBMITTED";
    if (Object.values(statusMap).includes("UNDER_REVIEW")){
        newStatus = 'UndER_REVIEW';
    }
    if(
        requiredTypes.every(type => statusMap[type] === 'VERIFIED')
    ){
        newStatus = 'VERIFIED';
    }
    await prisma.vendorProfile.update({
        where:{ id: vendorId },
        data:{status: newStatus},
    })
};