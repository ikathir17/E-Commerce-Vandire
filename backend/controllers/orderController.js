import crypto from 'crypto';
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import razorpay from 'razorpay'

// global variables
const currency = 'inr'
const deliveryCharge = 10

// gateway initialize
let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
} else {
    console.warn('Razorpay is not configured. Online payment features will be disabled.');
}

// Placing orders using COD Method
const placeOrder = async (req,res) => {
    
    try {
        
        const { userId, items, amount, address} = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true,message:"Order Placed"})


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}


// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req,res) => {
    if (!razorpayInstance) {
        return res.status(400).send({
            success: false,
            message: 'Online payments are not configured. Please use Cash on Delivery.'
        });
    }
    
    try {
        const { userId, items, amount, address} = req.body;
        
        if(!userId || !items || !amount || !address) {
            return res.status(400).send({
                success : false,
                message : 'All fields are required'
            })
        }

        const user = await userModel.findById(userId)
        
        if(!user) {
            return res.status(404).send({
                success : false,
                message : 'User not found'
            })
        }
        
        const newOrder = await orderModel.create({
            userId,
            items,
            amount,
            address,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now()
        })

        const orderOptions = {
            amount : amount * 100,
            currency,
            receipt : newOrder._id,
            payment_capture : 1
        }

        const order = await razorpayInstance.orders.create(orderOptions);
        
        res.status(200).send({
            success : true,
            order,
            orderId : newOrder._id
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success : false,
            message : 'Error in placing order',
            error: error.message
        })
    }
}

const verifyRazorpay = async (req,res) => {
    if (!razorpayInstance) {
        return res.status(400).send({
            success: false,
            message: 'Online payments are not configured.'
        });
    }
    
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).send({
                success: false,
                message: 'All fields are required'
            });
        }

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).send({
                success: false,
                message: 'Order not found'
            });
        }

        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            order.payment = true;
            order.paymentId = razorpay_payment_id;
            await order.save();
            
            return res.status(200).send({
                success: true,
                message: 'Payment verified successfully',
                order
            });
        } else {
            return res.status(400).send({
                success: false,
                message: 'Invalid signature'
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in verifying payment',
            error: error.message
        });
    }
}


// All Orders data for Admin Panel
const allOrders = async (req,res) => {

    try {
        
        const orders = await orderModel.find({})
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// User Order Data For Forntend
const userOrders = async (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// update order status from Admin Panel
const updateStatus = async (req,res) => {
    try {
        
        const { orderId, status } = req.body

        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({success:true,message:'Status Updated'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Cancel order by user before out for delivery
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: 'Order not found' });
        if (order.status === 'Out for Delivery' || order.status === 'Delivered') {
            return res.json({ success: false, message: 'Order cannot be cancelled at this stage.' });
        }
        order.status = 'Cancelled';
        await order.save();
        res.json({ success: true, message: 'Order cancelled successfully.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export { placeOrder, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyRazorpay, cancelOrder }