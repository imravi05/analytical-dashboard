import mongoose from "mongoose";

const pincodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    // Add city, state, etc. if needed
});

export const Pincode = mongoose.model("Pincode", pincodeSchema);