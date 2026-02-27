import User from '../dbModels/userModel.js'; 
import bcrypt from 'bcrypt';
import { sendVerificationCode, sendWelcomeEmail } from '../middlewares/sendVerificationCode.js';
import jwt from 'jsonwebtoken';


export const register = async (req, res) => { 
    try {
        const { email, password, name } = req.body;

        // 1. Validation
        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2. Check for duplicate
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists. Please login to continue" });
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now()+ 10*60*1000;

        // 4. Create User
        const newUser = await User.create({
            email,
            password: hashedPassword,
            name,
            verificationOTP,
            otpExpires
        });
       
        await sendVerificationCode(email, verificationOTP);
        
        // 5. Success Response
        res.status(201).json({ 
            success: true, 
            message: "User registered successfully",
            user: { 
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            }
        });
         
        console.log(`New user registered: ${email}`);   

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error",
            error: error.message 
        });
    }
};

export const verify = async (req, res) => {
    try {
        const {code} = req.body
        const user = await User.findOne({ verificationOTP: code });

        if (!user) {
            return res.status(400).json({ 
                message: "Invalid verification code" });
        }
        user.isVerified = true;
        user.verificationOTP = undefined;
        await user.save();
        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({ 
            message: "Email verified successfully" });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not registered"
            });
        }

        // --- NEW SECURITY CHECK ---
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email address before logging in."
            });
        }
        // --------------------------

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }
  
        const token = jwt.sign( 
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};