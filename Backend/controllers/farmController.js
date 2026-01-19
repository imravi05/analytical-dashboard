import mongoose from "mongoose";
import { Farm } from "../models/farmModel.js"; // FIX: Named import
import axios from "axios";

// ... (Rest of your existing functions: formatPolygon, addFarm, addFarm1, updateFarm, deleteFarm, getFarmByUserId)
// ... (Ensure you DO NOT remove the logic, just update the import at the top)

const formatPolygon = (coords) => {
    // ... (Keep existing logic)
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

// ... (Keep your existing addFarm, addFarm1, updateFarm, deleteFarm, getFarmByUserId implementations here)

// Example for brevity (Keep your full code):
const addFarm = async (req, res) => {
    // ... logic ...
};
// ... other functions ...

export default {
    addFarm, // defined in your file
    addFarm1, // defined in your file
    updateFarm, // defined in your file
    deleteFarm, // defined in your file
    getFarmByUserId // defined in your file
};