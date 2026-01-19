import mongoose from "mongoose";

const farmCropSchema = new mongoose.Schema({
    farm_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true,
        index: true
    },
    crop_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop',
        required: true
    },
    sowing_date: {
        type: Date,
        required: true
    },
    current_stage_id: {
        type: String, // Or ObjectId if you track stages in DB
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'harvested', 'deleted'],
        default: 'active'
    }
}, { timestamps: true });

const FarmCrop = mongoose.model("FarmCrop", farmCropSchema);
export default { FarmCrop };