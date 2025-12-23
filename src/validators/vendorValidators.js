import { body } from 'express-validator';


export const vendorSignupValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage("Name is required"),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage("Valid email is required"),

    body('phone')
        .trim()
        .notEmpty()
        .withMessage("Phone number is required"),
    
    body('businessName')
        .trim()
        .notEmpty()
        .withMessage('Business name is required'),
    
    body('password')
        .isLength({min: 8})
        .withMessage("Password must be at least 8 characters"),

    body('socialLinks')
        .isObject()
        .withMessage("Social links must be an object")
        .custom((value) => object.key(value).length > 0)
        .withMessage('At least one social link is required')
]