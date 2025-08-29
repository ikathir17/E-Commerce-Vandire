import userModel from "../models/userModel.js"


// add products to user cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { itemId, size } = req.body;

        // Validate required fields
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        if (!itemId || !size) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: itemId and size are required' 
            });
        }

        // Find user and validate
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Initialize or get existing cart data
        const cartData = userData.cartData || {};
        
        // Initialize item in cart if it doesn't exist
        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }
        
        // Update quantity for the specific size
        cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

        // Save updated cart
        const updatedUser = await userModel.findByIdAndUpdate(
            userId, 
            { cartData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw new Error('Failed to update user cart');
        }

        return res.json({ 
            success: true, 
            message: 'Added To Cart', 
            cartData: updatedUser.cartData || {}
        });

    } catch (error) {
        console.error('Error in addToCart:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error adding item to cart',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update user cart with specific quantity
const updateCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { itemId, size, quantity } = req.body;

        // Validate required fields
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        if (!itemId || size === undefined || quantity === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: itemId, size, and quantity are required' 
            });
        }

        // Validate quantity is a valid number
        const parsedQuantity = parseInt(quantity, 10);
        if (isNaN(parsedQuantity) || parsedQuantity < 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Quantity must be a non-negative number' 
            });
        }

        // Find user and validate
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Initialize or get existing cart data
        const cartData = userData.cartData || {};
        
        // If quantity is 0 or negative, remove the size entry
        if (parsedQuantity <= 0) {
            if (cartData[itemId]?.[size] !== undefined) {
                delete cartData[itemId][size];
                
                // If no more sizes for this item, remove the item entry
                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId];
                }
            }
        } else {
            // Update quantity for the specific size
            if (!cartData[itemId]) {
                cartData[itemId] = {};
            }
            cartData[itemId][size] = parsedQuantity;
        }

        // Save updated cart
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { cartData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw new Error('Failed to update user cart');
        }

        return res.json({ 
            success: true, 
            message: 'Cart Updated',
            cartData: updatedUser.cartData || {}
        });

    } catch (error) {
        console.error('Error in updateCart:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error updating cart',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// get user cart data
const getUserCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        
        const userData = await userModel.findById(userId);
        
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Initialize cartData as empty object if it doesn't exist
        const cartData = userData.cartData || {};

        res.json({ success: true, cartData });
    } catch (error) {
        console.error('Error in getUserCart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching cart data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export { addToCart, updateCart, getUserCart }