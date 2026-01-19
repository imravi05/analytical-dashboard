
import mongoose from "mongoose";

const cropSchema = new mongoose.Schema({
    name: { type: String, required: true },
    crop_code: { type: String }, // For external APIs like Farmonaut
    description: String,
    image: String
});

const Crop = mongoose.model("Crop", cropSchema);
export default { Crop };