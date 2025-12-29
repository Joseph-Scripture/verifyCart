import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Map errors to just the message string for concise output
        const errorMessages = errors.array().map(error => error.msg);

        return res.status(400).json({
            message: "Validation failed",
            errors: errorMessages,
        });
    }
    next()
}