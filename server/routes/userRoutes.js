import express from 'express';
import { auth } from '../middlewares/auth.js';
import { getPublishCreations, getUserCreations, toggleLikeCreations } from '../controllers/userController.js';
const userRouter = express.Router();

userRouter.get('/get-user-creations' , auth, getUserCreations)
// Published creations should be public (no auth) so community page works for visitors
userRouter.get('/get-published-creations' , getPublishCreations)
userRouter.post('/toggle-like-creations' , auth, toggleLikeCreations)

export default userRouter