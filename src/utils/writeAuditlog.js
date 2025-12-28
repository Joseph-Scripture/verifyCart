// import prisma from '../config/db.js';

// export const writeAuditlog = async ({
//     adminId,
//     vendorId,
//     action,
//     targetType,
//     targetId,
//     metadata,
// }) => {
// return prisma.auditLog.create({
//     data: {
//         action,
//         targetType,
//         targetId,
//         metadata,

//         admin: {
//         connect: { id: adminId },
//         },

//         ...(vendorId && {
//         vendor: {
//             connect: { id: vendorId },
//         },
//         }),
//     },
//     });
// };
