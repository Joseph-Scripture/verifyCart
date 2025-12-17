import crypto from 'crypto';

export const generateBadgeId = () => {
  return `VC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};
