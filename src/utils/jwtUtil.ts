// jwtUtils.ts
import jwt from 'jsonwebtoken';

// Secret key for JWT, make sure to use a strong and secure key
export const jwtSecret = 'your-secret-key';

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
};

export const verifyToken = (token: string): string | object => {
    try {
        const decoded = jwt.verify(token, jwtSecret);
        return decoded;
    } catch (error) {
        // Handle JWT verification error
        console.error(error);
        return '';
    }
};
