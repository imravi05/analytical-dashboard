import { Farm } from "../models/farmModel.js";
import { FarmCrop } from "../models/farmCropModel.js";
import { Crop } from "../models/cropModel.js";
import { Pincode } from "../models/pincodeModel.js";
import axios from "axios";
import mongoose from "mongoose";

// --- Helper: Format Coordinates for MongoDB GeoJSON ---
const formatPolygon = (coords) => {
    // MongoDB requires the first and last point to be the same (closed loop)
    const ring = structuredClone(coords);
    if (ring.length > 0) {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
            ring.push(first);
        }
    }
    return { type: 'Polygon', coordinates: [ring] };
};

// =======================
// FARM APIs
// =======================

const addFarm = async (req, res) => {
    try {
        const { user_id, farm_name, pincode_id, farm_coordinates } = req.body;

        // 1. Validation
        if (!user_id || !farm_name || !pincode_id || !farm_coordinates) {
            return res.status(400).json({ 
                success: false, 
                message: "user_id, farm_name, pincode_id and coordinates are required" });
        }
        if (!Array.isArray(farm_coordinates) || farm_coordinates.length < 3) {
            return res.status(400).json({ 
                success: false, 
                message: "At least 3 boundary points required" });
        }
        const response = await axios.post(
            "https://us-central1-farmbase-b2f7e.cloudfunctions.net/submitField",
            {
                CropCode: "2",
                FieldName: farm_name,
                PaymentType: 1,
                SowingDate: Math.floor(Date.now() / 1000).toString(),
                Points: farm_coordinates,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.FARMONAUT_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const fieldId = response.data.FieldID;

        if (!fieldId) {
            return res.status(400).json({ 
                success: false, 
                message: "Farmonaut failed to return a FieldID", 
                apiResponse: response.data 
            });
        }

        // 3. Save to MongoDB
        const locationObject = formatPolygon(farm_coordinates);
        
        const newFarm = await Farm.create({
            user_id,
            farm_name,
            pincode_id,
            farm_coordinates: locationObject,
            field_id: fieldId
        });

        res.status(201).json({
            success: true,
            message: "Farm added successfully",
            data: newFarm,
        });

    } catch (error) {
        console.error("Error in addFarm:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message });
    }
};

const getFarmsByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) return res.status(400).json({ 
            success: false, 
            message: "user_id is required" });

        const data = await Farm.find({ user_id });

        res.status(200).json({ 
            success: true, 
            message: "Farms retrieved successfully", 
            data });

    } catch (error) {
        console.error("Error in getFarmsByUser:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" });
    }
};

const getFarmById = async (req, res) => {
    try {
        const { farm_id } = req.params;
        if (!farm_id) return res.status(400).json({ 
            success: false, 
            message: "farm_id is required" });

        const data = await Farm.findById(farm_id);

        if (!data) return res.status(404).json({ 
            success: false, 
            message: "Farm not found" });

        res.status(200).json({ 
            success: true, 
            message: "Farm retrieved successfully", 
            data });
    } catch (error) {
        console.error("Error in getFarmById:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" });
    }
};

const updateFarm = async (req, res) => {
    try {
        const { farm_id } = req.params;
        const { farm_name, pincode_id, farm_coordinates } = req.body;

        if (!farm_id) return res.status(400).json({ 
            success: false, 
            message: "farm_id is required" });

        let updateData = {};
        if (farm_name) updateData.farm_name = farm_name;
        if (pincode_id) updateData.pincode_id = pincode_id;
        if (farm_coordinates) updateData.farm_coordinates = formatPolygon(farm_coordinates);

        const data = await Farm.findByIdAndUpdate(farm_id, updateData, { new: true });

        if (!data) return res.status(404).json({ 
            success: false, 
            message: "Farm not found" });

        res.status(200).json({ 
            success: true, 
            message: "Farm updated successfully", 
            data });
    } catch (error) {
        console.error("Error in updateFarm:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" });
    }
};

const deleteFarm = async (req, res) => {
    try {
        const { farm_id } = req.params;
        if (!farm_id) return res.status(400).json({ 
            success: false, 
            message: "farm_id is required" });

        const data = await Farm.findByIdAndDelete(farm_id);

        if (!data) return res.status(404).json({ 
            success: false, 
            message: "Farm not found" });
        
        // Optional: Cascade delete associated FarmCrops
        await FarmCrop.deleteMany({ farm_id: farm_id });

        res.status(200).json({ 
            success: true, 
            message: "Farm deleted successfully" });
    } catch (error) {
        console.error("Error in deleteFarm:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" });
    }
};

// =======================
// FARM CROP APIs
// =======================

const addFarmCrop = async (req, res) => {
    try {
        const { farm_id, crop_id, sowing_date } = req.body;

        if (!farm_id || !crop_id) {
            return res.status(400).json({ 
                success: false, 
                message: "farm_id and crop_id are required" });
        }

        const data = await FarmCrop.create({
            farm_id,
            crop_id,
            sowing_date,
            status: 'active'
        });

        res.status(201).json({ 
            success: true, 
            message: "Farm crop added successfully", data });
    } catch (error) {
        console.error("Error in addFarmCrop:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" });
    }
};

const getFarmCropsByFarm = async (req, res) => {
    try {
        const { farm_id } = req.params;
        if (!farm_id) return res.status(400).json({ 
            success: false, 
            message: "farm_id is required" });

        // Populate crop details to get name/image/etc.
        const data = await FarmCrop.find({ farm_id }).populate('crop_id');

        res.status(200).json({ 
            success: true, 
            message: "Farm crops retrieved successfully", 
            data });
    } catch (error) {
        console.error("Error in getFarmCropsByFarm:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" });
    }
};

const getFarmCropById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ 
            success: false, 
            message: "id is required" });

        const data = await FarmCrop.findById(id).populate('crop_id');

        if (!data) return res.status(404).json({ 
            success: false, 
            message: "Farm crop not found" });

        res.status(200).json({ 
            success: true, 
            message: "Farm crop retrieved successfully", 
            data });

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

        const data = await FarmCrop.findByIdAndUpdate(
            id, 
            { current_stage_id }, 
            { new: true }
        );

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

        const data = await FarmCrop.findByIdAndUpdate(
            id, 
            { sowing_date }, 
            { new: true }
        );

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
// UTILITY APIs (Pincodes, Crops, User Crops)
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
        
        // Extract just the IDs array
        const farmIds = userFarms.map(farm => farm._id);

        // 2. Find all crops associated with these farm IDs
        const data = await FarmCrop.find({ farm_id: { $in: farmIds } })
            .populate('crop_id')
            .populate('farm_id', 'farm_name'); // Optional: include farm name in result

        res.status(200).json({ success: true, message: "Farm crops retrieved successfully", data });
    } catch (error) {
        console.error("Error in getFarmCropsByUser:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default {
    addFarm,
    getFarmsByUser,
    getFarmById,
    updateFarm,
    deleteFarm,
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