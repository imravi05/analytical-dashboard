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
        type: String, 
        required: true,
        trim: true
    },
    farm_coordinates: {
        type: {
            type: String,
            enum: ['Polygon'],
            required: true,
            default: 'Polygon'
        },
        coordinates: {
            type: [[[Number]]], // Array of arrays of arrays of numbers (GeoJSON format)
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