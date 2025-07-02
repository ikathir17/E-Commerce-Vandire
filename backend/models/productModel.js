import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    rating: { type: Number, required: true },
    feedback: { type: String, maxlength: 1000 },
    date: { type: Date, default: Date.now }
}, { _id: true, timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: [String], required: true },
    category: { type: String, required: true, index: true },
    subCategory: { type: String, required: true, index: true },
    sizes: { type: [String], required: true },
    bestseller: { type: Boolean, default: false, index: true },
    discount: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 100,
        validate: {
            validator: Number.isInteger,
            message: 'Discount must be a whole number between 0 and 100'
        }
    },
    stock: { type: Number, default: 0, min: 0 },
    reviews: { type: [reviewSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for calculating the final price after discount
productSchema.virtual('finalPrice').get(function() {
    return this.price * (1 - (this.discount / 100));
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ discount: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ updatedAt: -1 });

// Pre-save hook to ensure data consistency
productSchema.pre('save', function(next) {
    // Ensure price is a positive number
    if (this.price < 0) {
        this.price = 0;
    }
    
    // Ensure discount is between 0 and 100
    if (this.discount < 0) {
        this.discount = 0;
    } else if (this.discount > 100) {
        this.discount = 100;
    }
    
    next();
});

// Static method to get product statistics
productSchema.statics.getProductStats = async function() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current month products
    const currentMonthProducts = await this.find({
        createdAt: { $gte: startOfMonth }
    });

    // Get last month's products
    const lastMonthProducts = await this.find({
        createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
    });

    // Calculate categories
    const categories = await this.distinct('category');
    const currentMonthCategories = await this.distinct('category', {
        createdAt: { $gte: startOfMonth }
    });
    const lastMonthCategories = await this.distinct('category', {
        createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
    });

    // Calculate new categories this month
    const newCategories = currentMonthCategories.filter(
        cat => !lastMonthCategories.includes(cat)
    );

    // Calculate discount stats
    const onDiscount = await this.countDocuments({ discount: { $gt: 0 } });
    const prevOnDiscount = await this.countDocuments({
        discount: { $gt: 0 },
        createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
    });
    const discountChange = prevOnDiscount > 0 
        ? Math.round(((onDiscount - prevOnDiscount) / prevOnDiscount) * 100)
        : 0;

    // Calculate average price
    const avgPriceResult = await this.aggregate([
        { $group: { _id: null, avgPrice: { $avg: "$price" } } }
    ]);
    const avgPrice = avgPriceResult[0]?.avgPrice || 0;

    const prevAvgPriceResult = await this.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth } } },
        { $group: { _id: null, avgPrice: { $avg: "$price" } } }
    ]);
    const prevAvgPrice = prevAvgPriceResult[0]?.avgPrice || 0;

    const priceChange = prevAvgPrice > 0 
        ? Math.round(((avgPrice - prevAvgPrice) / prevAvgPrice) * 100)
        : 0;

    return {
        totalProducts: await this.countDocuments(),
        totalProductsChange: lastMonthProducts.length > 0
            ? Math.round(((currentMonthProducts.length - lastMonthProducts.length) / lastMonthProducts.length) * 100)
            : 100,
        categories: categories.length,
        newCategories: newCategories.length,
        onDiscount,
        discountChange,
        avgPrice,
        priceChange,
        updatedAt: now
    };
};

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;