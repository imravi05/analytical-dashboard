import mongoose from "mongoose";

const farmSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farm_name: {
        type: String,
        required: true
    },
    pincode_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pincode',
        required: true
    },
    farm_coordinates: {
        type: {
            type: String,
            enum: ['Polygon'], 
            default: 'Polygon' // FIX: Removed the long whitespace string
        },
        coordinates: {
            type: [[[Number]]], 
            required: true
        }
    },
    field_id: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

farmSchema.index({ farm_coordinates: '2dsphere' });

// FIX: Use Named Export so you can import { Farm } elsewhere
const Farm = mongoose.model("Farm", farmSchema);
export default { Farm };