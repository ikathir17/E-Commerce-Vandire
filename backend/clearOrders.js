import mongoose from 'mongoose';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import orderModel from './models/orderModel.js';

// Connect to the database
await connectDB();

// Delete all orders
await orderModel.deleteMany({});

console.log('All orders have been deleted.');
process.exit(0);
