import express from "express";
import controller from "../controllers/farmController.js"; 
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", controller.addFarm);
router.put("/update/:farm_id", controller.updateFarm);

router.delete("/delete/:farm_id", controller.deleteFarm);

// FIX 1: Controller export is named 'getFarmsByUser', not 'getFarmByUserId'.
// FIX 2: Controller expects 'req.params.user_id', so route param must be ':user_id'.
router.get("/getfarm/:user_id", controller.getFarmsByUser); 

router.post("/add",protect, controller.addFarm);

export default router;