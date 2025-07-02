import express from 'express';
import { 
    listProducts, 
    addProduct, 
    removeProduct, 
    singleProduct, 
    updateProduct, 
    addReview,
    getProductStats 
} from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import { authUser } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';

const productRouter = express.Router();

productRouter.post('/add',adminAuth,upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),addProduct);
productRouter.post('/remove',adminAuth,removeProduct);
productRouter.post('/single',singleProduct);
productRouter.get('/list',listProducts)
productRouter.post('/update', adminAuth, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), updateProduct);
productRouter.post('/review', authUser, addReview);

// Admin statistics endpoint
productRouter.get('/stats', adminAuth, getProductStats);

export default productRouter;