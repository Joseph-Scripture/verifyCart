import prisma from '../config/db.js';

export const writeAuditlog = async ({
    adminId,
    action,
    targetType,
    targetId,
    metadata = null,
}) => {
    try {
        await prisma.auditLog.create({
            data: {
                adminId,
                action,
                targetType,
                targetId,
                metadata,
            },
        });
    } catch (error) {
        console.error(error);
    }
}