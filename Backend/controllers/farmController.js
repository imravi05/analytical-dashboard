import mongoose from "mongoose";
import FarmModel from "../models/farmModel.js";
import axios from "axios";

// Extract Farm model correctly from the default export object
const { Farm } = FarmModel;

// --- Helper Function: Validate & Close Polygon Loop ---
const formatPolygon = (coords) => {
    // Clone to avoid mutating original
    const ring = structuredClone(coords);
    
    if (ring.length > 0) {
        const first = ring[0];
        const last = ring[ring.length - 1];

        // Ensure 3 coordinates minimum for a polygon
        if (ring.length < 3) return null; 

        // Close the loop if not closed
        if (first[0] !== last[0] || first[1] !== last[1]) {
            ring.push(first);
        }
    }
    
    return {
        type: 'Polygon',
        coordinates: [ring]
    };
};

// 1. Add Farm (Simple Version)
const addFarm = async (req, res) => {
  try {
    const { user_id, farm_name, pincode_id, farm_coordinates } = req.body;
    console.log("Request Body:", req.body);

    // Validation: user_id is strictly required. Do not auto-generate.
    if (!user_id || !farm_name || !pincode_id || !farm_coordinates) {
      return res.status(400).json({
        success: false,
        message: "user_id, farm_name, pincode_id and coordinates are required",
      });
    }
    
    // Format GeoJSON
    const locationObject = formatPolygon(farm_coordinates);
    if (!locationObject) {
         return res.status(400).json({ success: false, message: "Invalid coordinates provided" });
    }

    const newFarm = new Farm({
      user_id,
      farm_name,
      pincode_id,
      farm_coordinates: locationObject, 
    });

    await newFarm.save();

    res.status(201).json({
      success: true,
      message: "Farm added successfully",
      farm_id: newFarm._id, 
      user_id: newFarm.user_id, 
      farm: newFarm,
    });

  } catch (error) {
    console.error("Error in addFarm:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 2. Add Farm (With Farmonaut Integration)
const addFarm1 = async (req, res) => {
  try {
    const { user_id, farm_name, pincode_id, farm_coordinates } = req.body;

    // Validation
    if (!user_id || !farm_name || !pincode_id || !farm_coordinates) {
      return res.status(400).json({
        success: false,
        message: "All fields including user_id are required",
      });
    }

    if (!Array.isArray(farm_coordinates) || farm_coordinates.length < 3) {
      return res.status(400).json({
        success: false,
        message: "At least 3 boundary points required",
      });
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

    if (!response.data.FieldID) {
      console.error("Farmonaut Failed. Full Response:", JSON.stringify(response.data, null, 2));
        return res.status(400).json({
            success: false,
            message: "Farmonaut rejected the field.",
            apiResponse: response.data
        });
    }

    const fieldId = response.data.FieldID;
    console.log("Farmonaut FieldID:", fieldId);

    // 3. Prepare for MongoDB (GeoJSON Polygon)
    const locationObject = formatPolygon(farm_coordinates);

    // 4. Save to Database
    const newFarm = new Farm({
      user_id,
      farm_name,
      pincode_id,
      farm_coordinates: locationObject,
      field_id: fieldId
    });

    await newFarm.save();

    res.status(201).json({
      success: true,
      message: "Farm added successfully",
      farm_id: newFarm._id,
      user_id: newFarm.user_id,
      data: newFarm,
    });

  } catch (error) {
    console.error("Error in addFarm1:", error.message);
    if (error.response) {
        console.error("Farmonaut API Error Data:", error.response.data);
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updateFarm = async(req, res) => {
    try {
        const { farm_name, pincode_id, farm_coordinates } = req.body;
        const { farmId } = req.params;
        
        if (!farmId) {
            return res.status(400).json({ 
                success: false, 
                message: "farmId is required" 
            });   
        }   

        let updateData = {};
        if (farm_name) updateData.farm_name = farm_name;
        if (pincode_id) updateData.pincode_id = pincode_id;
        
        if (farm_coordinates) {
            const locationObject = formatPolygon(farm_coordinates);
            if(locationObject) updateData.farm_coordinates = locationObject;
        }

        const updatedFarm = await Farm.findByIdAndUpdate(farmId, updateData, { new: true });

        if (!updatedFarm) {
            return res.status(404).json({ 
                success: false, 
                message: "Farm not found" 
            });   
        }
        res.status(200).json({
            success: true, 
            message: "Farm updated successfully", 
            farm: updatedFarm   
        }) 

    } catch (error) {
        console.error("Error in updateFarm:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });   
    }
}

const deleteFarm = async (req, res) => {
  try {
    // FIX: Using farmId instead of farm_id to match route: /delete/:farmId
    const { farmId } = req.params;

    if (!farmId) {
      return res.status(400).json({
        success: false,
        message: "farmId is required",
      });
    }

    const deletedFarm = await Farm.findByIdAndDelete(farmId);

    if (!deletedFarm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Farm deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteFarm:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFarmByUserId = async (req, res) => {
  try {
    // FIX: Using userId instead of user_id to match route: /getfarm/:userId
    const { userId } = req.params; 

    if(!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Database query matches field user_id with param userId
    const farms = await Farm.find({ user_id: userId });
    
    if (!farms || farms.length === 0) {
        return res.status(404).json({ success: false, message: "No farms found for this user" });
    }

    res.status(200).json({
        success: true,
        count: farms.length,
        data: farms
    });

  } catch (error) {
    console.error("Error in getFarmByUserId:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export default {
    addFarm,
    addFarm1,
    updateFarm,
    deleteFarm,
    getFarmByUserId
};