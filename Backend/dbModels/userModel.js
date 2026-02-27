import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  password: {       
    type: String, 
    required: true 
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationOTP:String,
  otpExpiresAt: Date,

},{timestamps:true});

const User = mongoose.model('User', userSchema);
export default User;