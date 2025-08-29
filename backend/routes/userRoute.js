import express from 'express';
import { loginUser, registerUser, adminLogin, getCurrentUser, updateName } from '../controllers/userController.js';
import { authUser } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.get('/me', authUser, getCurrentUser)
userRouter.put('/update-name', authUser, updateName)

export default userRouter;