import express from "express";
import controller from "../controllers/farmController.js"; //

const router = express.Router();

router.post("/add", controller.addFarm);
router.put("/update/:farm_id", controller.updateFarm); // Ensure param matches controller destructuring if needed, though controller usually takes any param

// FIX: 'addFarm1' was not exported in your controller, so it caused a crash.
// router.post("/add1", controller.addFarm1); 

router.delete("/delete/:farm_id", controller.deleteFarm);

// FIX 1: Controller export is named 'getFarmsByUser', not 'getFarmByUserId'.
// FIX 2: Controller expects 'req.params.user_id', so route param must be ':user_id'.
router.get("/getfarm/:user_id", controller.getFarmsByUser); 

export default router;