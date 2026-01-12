import express from "express";
import controller from "../controllers/farmController.js";




const router = express.Router();
router.post("/add", controller.addFarm);
router.put("/update/:farmId", controller.updateFarm);
router.post("/add1", controller.addFarm1);
router.delete("/delete/:farmId", controller.deleteFarm);


export default router;
