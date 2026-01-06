import { body } from 'express-validator';

export const vendorSignupValidator = [
    body('name').notEmpty().trim().isLength({min: 2}).withMessage('Username must not be less than 2  letters'),
    body('email').isEmail().trim().normalizeEmail().withMessage("Enter a valid email"),
    body('phone').notEmpty().trim(),
    body('businessName').notEmpty().trim(),
    

    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/\d/).withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&-_]/).withMessage("Password must contain at least one special character (@$!%*?&)"),

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
