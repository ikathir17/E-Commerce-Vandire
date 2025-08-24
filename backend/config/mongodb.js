import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        mongoose.connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'e-commerce',
            serverSelectionTimeoutMS: 30000, // 30 seconds timeout
        });
        
        console.log('🔌 Connected to MongoDB database');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        console.error('Connection string used:', process.env.MONGODB_URI ? '*****' : 'Not provided');
        process.exit(1);
    }
};

export default connectDB;