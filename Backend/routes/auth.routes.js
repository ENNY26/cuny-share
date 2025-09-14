import express from "express"
import { forgotPassword, login, resendOtp, resetPassword, signup, verifyOtp } from "../controllers/AuthController.js"


const router = express.Router()

router.post('/signup', signup)
router.post('/verify', verifyOtp)
router.post('/login', login)
router.post('/forgot-password', forgotPassword);    
router.post('/reset-password', resetPassword); 
router.post('/resend-otp', resendOtp)

export default router