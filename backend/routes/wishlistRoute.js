import express from 'express';
import { addToWishlist, removeFromWishlist, getWishlist } from '../controllers/wishlistController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/add', verifyToken, addToWishlist);
router.post('/remove', verifyToken, removeFromWishlist);
router.get('/', verifyToken, getWishlist); // Changed from '/:userId' to '/' since we get userId from token

export default router;
