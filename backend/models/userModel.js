import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    cartData: { 
        type: Object, 
        default: {}
    },
    wishlist: { 
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        }], 
        default: [] 
    },
    orders: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'order'
        }],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    minimize: false 
})

const userModel = mongoose.models.user || mongoose.model('user',userSchema);

export default userModel