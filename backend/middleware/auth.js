import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

const authUser = async (req, res, next) => {
    try {
        // Check for token in Authorization header (Bearer) or directly in headers
        let token;
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Handle Bearer token format: 'Bearer <token>'
            token = authHeader.split(' ')[1];
        } else if (req.headers.token) {
            // Handle direct token in headers
            token = req.headers.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'No authentication token provided' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded || !decoded.id) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        // Attach user ID to request
        req.user = { id: decoded.id };
        req.body.userId = decoded.id; // For backward compatibility
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

export { authUser };