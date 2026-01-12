 import FarmModel from "../models/farmModel.js";
import axios from "axios";


const { Farm } = FarmModel;
const addFarm = async (req, res) => {
  try {
    const { user_id,  farm_name, pincode_id, farm_coordinates} = req.body;
    console.log(req.body);

    if (!user_id || !farm_name || !pincode_id || !farm_coordinates) {
      return res.status(400).json({
        success: false,
        message: "user_id, farm_id, farm_name, pincode_id and coordinates are required",
      });
    }
    
    const locationObject = {
      type: 'Polygon',
  
      coordinates: [farm_coordinates] 
    };

    
    const ring = locationObject.coordinates[0];
    if (ring.length > 0) {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
            ring.push(first); // 
        }
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
      farm: newFarm,
    });

  } catch (error) {
    console.error("Error in addFarm:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};




const updateFarm = async(req, res)=>{
    try {
        const {farm_name, pincode_id, farm_coordinates} = req.body;
        const {farmId} = req.params;
        console.log(farmId)
        // Find the farm by ID

        if (!farmId) {
            return res.status(400).json({ 
                success: false, 
                message: "farmId is required" });   
        }   
        let updateData = {};
        if (farm_name) updateData.farm_name = farm_name;
        if (pincode_id) updateData.pincode_id = pincode_id;
        if (farm_coordinates) {
            const locationObject = {
                type: 'Polygon',
                coordinates: [farm_coordinates] 
            };
            const ring = locationObject.coordinates[0];
            if (ring.length > 0) {
                const first = ring[0];
                const last = ring[ring.length - 1];
                if (first[0] !== last[0] || first[1] !== last[1]) {
                    ring.push(first); // Close the polygon
                }
            }
            updateData.farm_coordinates = locationObject;
        }
        const updatedFarm = await Farm.findByIdAndUpdate(farmId, updateData, { new: true });

        if (!updatedFarm) {
            return res.status(404).json({ 
                success: false, 
                message: "Farm not found" });   
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
            error: error.message });   
    }

}



const addFarm1 = async (req, res) => {
  try {
    const { user_id, farm_name, pincode_id, farm_coordinates } = req.body;

    // 1. Basic Validation
    if (!user_id || !farm_name || !pincode_id || !farm_coordinates) {
      return res.status(400).json({
        success: false,
        message: "user_id, farm_name, pincode_id and coordinates are required",
      });
    }

    if (!Array.isArray(farm_coordinates) || farm_coordinates.length < 3) {
      return res.status(400).json({
        success: false,
        message: "At least 3 boundary points required",
      });
    }

    // 2. Call Farmonaut API
    // We pass the coordinates DIRECTLY as you received them (Array of [Lng, Lat])
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

    // DEBUG: Print the response if it fails
    if (!response.data.FieldID) {
      console.error("Farmonaut Failed. Full Response:", JSON.stringify(response.data, null, 2));
        return res.status(400).json({
            success: false,
            message: "Farmonaut rejected the field. Check server logs for details.",
            apiResponse: response.data
        });
    }

    const fieldId = response.data.FieldID;
    console.log("Farmonaut FieldID:", fieldId);
    // 3. Prepare for MongoDB (GeoJSON Polygon)
    // Create a copy so we don't mess up the original array
    const mongoCoordinates = structuredClone(farm_coordinates);

    // MongoDB requires the loop to be closed (First point === Last Point)
    if (mongoCoordinates.length > 0) {
        const first = mongoCoordinates[0];
        const last = mongoCoordinates.at(-1);

        // Compare Lng and Lat to see if they are different
        if (first[0] !== last[0] || first[1] !== last[1]) {
            mongoCoordinates.push(first); // Add the first point to the end to close the loop
        }
    }

    const locationObject = {
      type: 'Polygon',
      coordinates: [mongoCoordinates] 
    };

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
      data: newFarm,
    });

  } catch (error) {
    console.error("Error in addFarm:", error.message);
    if (error.response) {
        // Log API errors from Farmonaut (e.g., 401 Unauthorized, 500 Server Error)
        console.error("Farmonaut API Error Data:", error.response.data);
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const deleteFarm = async (req, res) => {
  try {
    const { farm_id } = req.params;

    if (!farm_id) {
      return res.status(400).json({
        success: false,
        message: "farm_id is required",
      });
    }

    const data = await deleteFarmModel(farm_id);

    if (!data) {
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



export default {
    addFarm,
    addFarm1,
    updateFarm,
    deleteFarm
};