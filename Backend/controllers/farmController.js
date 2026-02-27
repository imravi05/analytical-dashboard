import mongoose from "mongoose";
import { Farm } from "../models/farmModel.js"; 
import { FarmCrop } from "../models/farmCropModel.js"; // FIX: Added missing import
import axios from "axios";

// Helper function
const formatPolygon = (coords) => {
    const ring = structuredClone(coords);
    if (ring.length > 0) {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (ring.length < 3) return null; 
        if (first[0] !== last[0] || first[1] !== last[1]) {
            ring.push(first);
        }
    }
    return { type: 'Polygon', coordinates: [ring] };
};

const addFarm = async (req, res) => {
    try {
        const { user_id, farm_name, pincode_id, farm_coordinates } = req.body;

        // 1. Validation
        if (!user_id || !farm_name || !pincode_id || !farm_coordinates) {
            return res.status(400).json({ success: false, message: "user_id, farm_name, pincode_id and coordinates are required" });
        }
        if (!Array.isArray(farm_coordinates) || farm_coordinates.length < 3) {
            return res.status(400).json({ success: false, message: "At least 3 boundary points required" });
        }

        // 2. Call Farmonaut API
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
    if (error.response) {
        // Farmonaut returned an error status (4xx, 5xx)
        return res.status(error.response.status).json({ 
            success: false, 
            message: "Farmonaut API Error", 
            error: error.response.data 
        });
    }
    console.error("Error in addFarm:", error);
    res.status(500).json({ success: false, message: "Server error" });
}
};

const getFarmsByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) return res.status(400).json({ success: false, message: "user_id is required" });

        const data = await Farm.find({ user_id });

        res.status(200).json({ success: true, message: "Farms retrieved successfully", data });
    } catch (error) {
        console.error("Error in getFarmsByUser:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getFarmById = async (req, res) => {
    try {
        const { farm_id } = req.params;
        if (!farm_id) return res.status(400).json({ success: false, message: "farm_id is required" });

        const data = await Farm.findById(farm_id);

        if (!data) return res.status(404).json({ success: false, message: "Farm not found" });

        res.status(200).json({ success: true, message: "Farm retrieved successfully", data });
    } catch (error) {
        console.error("Error in getFarmById:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateFarm = async (req, res) => {
    try {
        const { farm_id } = req.params;
        const { farm_name, pincode_id, farm_coordinates } = req.body;

        if (!farm_id) return res.status(400).json({ success: false, message: "farm_id is required" });

        let updateData = {};
        if (farm_name) updateData.farm_name = farm_name;
        if (pincode_id) updateData.pincode_id = pincode_id;
        if (farm_coordinates) updateData.farm_coordinates = formatPolygon(farm_coordinates);

        const data = await Farm.findByIdAndUpdate(farm_id, updateData, { new: true });

        if (!data) return res.status(404).json({ success: false, message: "Farm not found" });

        res.status(200).json({ success: true, message: "Farm updated successfully", data });
    } catch (error) {
        console.error("Error in updateFarm:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteFarm = async (req, res) => {
    try {
        const { farm_id } = req.params;
        if (!farm_id) return res.status(400).json({ success: false, message: "farm_id is required" });

        const data = await Farm.findByIdAndDelete(farm_id);

        if (!data) return res.status(404).json({ success: false, message: "Farm not found" });
        
        // Cascade delete associated FarmCrops
        // FIX: This works now because FarmCrop is imported
        await FarmCrop.deleteMany({ farm_id: farm_id });

        res.status(200).json({ success: true, message: "Farm deleted successfully" });
    } catch (error) {
        console.error("Error in deleteFarm:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default {
    addFarm, 
    updateFarm, 
    deleteFarm, 
    getFarmById,
    getFarmsByUser
};