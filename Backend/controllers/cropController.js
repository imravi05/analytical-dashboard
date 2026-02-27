import { Farm } from "../models/farmModel.js";
import { FarmCrop } from "../models/farmCropModel.js";
import { Crop } from "../models/cropModel.js";
import { Pincode } from "../models/pincodeModel.js";


// =======================
// FARM CROP APIs
// =======================

const addFarmCrop = async (req, res) => {
    try {
        const { farm_id, crop_id, sowing_date } = req.body;

        if (!farm_id || !crop_id || !sowing_date) {
            return res.status(400).json({ success: false, message: "farm_id, crop_id, and sowing_date are required" });
        }

        const data = await FarmCrop.create({
            farm_id,
            crop_id,
            sowing_date,
            status: 'active'
        });

        res.status(201).json({ success: true, message: "Farm crop added successfully", data });
    } catch (error) {
        console.error("Error in addFarmCrop:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getFarmCropsByFarm = async (req, res) => {
    try {
        const { farm_id } = req.params;
        if (!farm_id) return res.status(400).json({ success: false, message: "farm_id is required" });

        const data = await FarmCrop.find({ farm_id }).populate('crop_id');
        res.status(200).json({ success: true, message: "Farm crops retrieved successfully", data });
    } catch (error) {
        console.error("Error in getFarmCropsByFarm:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getFarmCropById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "id is required" });

        const data = await FarmCrop.findById(id).populate('crop_id');
        if (!data) return res.status(404).json({ success: false, message: "Farm crop not found" });

        res.status(200).json({ success: true, message: "Farm crop retrieved successfully", data });
    } catch (error) {
        console.error("Error in getFarmCropById:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateFarmCropStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { current_stage_id } = req.body;

        if (!id || !current_stage_id) return res.status(400).json({ success: false, message: "id and current_stage_id are required" });

        const data = await FarmCrop.findByIdAndUpdate(id, { current_stage_id }, { new: true });
        if (!data) return res.status(404).json({ success: false, message: "Farm crop not found" });

        res.status(200).json({ success: true, message: "Farm crop stage updated successfully", data });
    } catch (error) {
        console.error("Error in updateFarmCropStage:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateFarmCrop = async (req, res) => {
    try {
        const { id } = req.params;
        const { sowing_date } = req.body;

        if (!id) return res.status(400).json({ success: false, message: "id is required" });

        const data = await FarmCrop.findByIdAndUpdate(id, { sowing_date }, { new: true });
        if (!data) return res.status(404).json({ success: false, message: "Farm crop not found" });

        res.status(200).json({ success: true, message: "Farm crop updated successfully", data });
    } catch (error) {
        console.error("Error in updateFarmCrop:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteFarmCrop = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "id is required" });

        const data = await FarmCrop.findByIdAndDelete(id);
        if (!data) return res.status(404).json({ success: false, message: "Farm crop not found" });

        res.status(200).json({ success: true, message: "Farm crop deleted successfully" });
    } catch (error) {
        console.error("Error in deleteFarmCrop:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// =======================
// UTILITY APIs
// =======================

const getAllPincodes = async (req, res) => {
    try {
        const pincodes = await Pincode.find({ isActive: true });
        res.json({ success: true, pincodes });
    } catch (error) {
        console.error("Error in getAllPincodes:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getAllCrops = async (req, res) => {
    try {
        const data = await Crop.find({});
        res.status(200).json({ success: true, message: "Crops retrieved successfully", data });
    } catch (error) {
        console.error("Error in getAllCrops:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getFarmCropsByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) return res.status(400).json({ success: false, message: "user_id is required" });

        // 1. Find all farms for this user
        const userFarms = await Farm.find({ user_id }).select('_id');
        const farmIds = userFarms.map(farm => farm._id);

        // 2. Find all crops associated with these farm IDs
        const data = await FarmCrop.find({ farm_id: { $in: farmIds } })
            .populate('crop_id')
            .populate('farm_id', 'farm_name');

        res.status(200).json({ success: true, message: "Farm crops retrieved successfully", data });
    } catch (error) {
        console.error("Error in getFarmCropsByUser:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default {
    addFarmCrop,
    getFarmCropsByFarm,
    getFarmCropById,
    updateFarmCropStage,
    updateFarmCrop,
    deleteFarmCrop,
    getAllPincodes,
    getFarmCropsByUser,
    getAllCrops,
};