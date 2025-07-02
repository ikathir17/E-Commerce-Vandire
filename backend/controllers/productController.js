import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import { cache } from '../middleware/cache.js'; // Assuming you have a cache middleware

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300;

// function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)
        
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }
        
        const result = await productModel.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        res.json({ success: true, message: "Product Removed Successfully" });
    } catch (error) {
        console.error('Error removing product:', error);
        res.status(500).json({ success: false, message: error.message || "Error removing product" });
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for update product
const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, sizes, bestseller, discount } = req.body;
        const updateData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            bestseller: bestseller === "true" || bestseller === true,
            sizes: JSON.parse(sizes),
            discount: discount ? Number(discount) : 0
        };
        
        // Handle images if provided
        if (req.files) {
            const imageFields = ['image1', 'image2', 'image3', 'image4'];
            let images = imageFields.map(field => req.files[field] && req.files[field][0]).filter(Boolean);
            if (images.length > 0) {
                let imagesUrl = await Promise.all(
                    images.map(async (item) => {
                        let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                        return result.secure_url
                    })
                );
                updateData.image = imagesUrl;
            }
        }
        
        await productModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        res.json({ success: true, message: "Product Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Add or edit review to product
const addReview = async (req, res) => {
    try {
        const { productId, userId, rating, feedback } = req.body;
        // Ensure rating is a number and between 1 and 5
        if (!productId || !userId || typeof rating === 'undefined' || rating === null) {
            return res.json({ success: false, message: 'Missing required fields.' });
        }
        const parsedRating = Number(rating);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.json({ success: false, message: 'Rating must be between 1 and 5.' });
        }
        // Find product and update or add review
        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: 'Product not found.' });
        let updated = false;
        product.reviews = product.reviews.map(r => {
            if (r.userId === userId) {
                updated = true;
                return { ...r.toObject(), rating: parsedRating, feedback, date: new Date() };
            }
            return r;
        });
        if (!updated) {
            product.reviews.push({ userId, rating: parsedRating, feedback });
        }
        await product.save();
        res.json({ success: true, message: updated ? 'Review updated.' : 'Review added successfully.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get product statistics
const getProductStats = async (req, res) => {
    try {
        // Try to get from cache first
        const cacheKey = 'product:stats';
        const cachedStats = cache.get(cacheKey);
        
        if (cachedStats) {
            return res.status(200).json({
                success: true,
                message: 'Product statistics retrieved from cache',
                stats: cachedStats
            });
        }

        // If not in cache, calculate fresh stats
        const stats = await productModel.getProductStats();
        
        // Cache the result
        cache.set(cacheKey, stats, CACHE_DURATION);
        
        res.status(200).json({
            success: true,
            message: 'Product statistics retrieved successfully',
            stats
        });
    } catch (error) {
        console.error('Error getting product statistics:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting product statistics',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

export { 
    listProducts, 
    addProduct, 
    removeProduct, 
    singleProduct, 
    updateProduct, 
    addReview,
    getProductStats 
}