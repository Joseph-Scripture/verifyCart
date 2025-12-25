    import { body } from 'express-validator';

    export const vendorSignupValidator = [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phone').notEmpty(),
    body('businessName').notEmpty(),
    body('password').isLength({ min: 8 }),

    body('socialLinks')
    .exists().withMessage('socialLinks is required')
    .isObject().withMessage('socialLinks must be an object')
    .custom((value) => {
    const allowedKeys = ['instagram', 'twitter', 'website'];
    const hasAtLeastOne = allowedKeys.some(
    key => typeof value[key] === 'string' && value[key].trim() !== ''
    );

    if (!hasAtLeastOne) {
    throw new Error('At least one social link is required');
    }
    return true;
    }),

    body('socialLinks.instagram').optional().isURL(),
    body('socialLinks.twitter').optional().isURL(),
    body('socialLinks.website').optional().isURL(),
    ];
