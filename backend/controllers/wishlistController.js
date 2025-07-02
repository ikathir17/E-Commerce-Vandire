import userModel from '../models/userModel.js';
import { verifyToken } from '../middleware/auth.js';

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.userId; // Set by verifyToken middleware
        
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Add product to wishlist if not already present
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }

        res.status(200).json({ 
            success: true, 
            wishlist: user.wishlist,
            message: 'Product added to wishlist'
        });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding to wishlist',
            error: error.message 
        });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.userId; // Set by verifyToken middleware
        
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Remove product from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        res.status(200).json({ 
            success: true, 
            wishlist: user.wishlist,
            message: 'Product removed from wishlist'
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error removing from wishlist',
            error: error.message 
        });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const userId = req.userId; // Set by verifyToken middleware
        
        // Check if user exists
        const user = await userModel.findById(userId).populate('wishlist');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ 
            success: true, 
            wishlist: user.wishlist,
            count: user.wishlist.length
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching wishlist',
            error: error.message 
        });
    }
};
