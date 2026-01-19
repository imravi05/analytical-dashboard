import express from 'express';
import controller from '../controllers/farmController.js';

const router = express.Router();


router.post('/add', controller.addFarmCrop);
router.get('/farm/:farm_id', controller.getFarmCropsByFarm);
router.get('/user/:user_id', controller.getFarmCropsByUser);
router.get('/details/:id', controller.getFarmCropById);
router.put('/update/:id', controller.updateFarmCrop);
router.put('/update-stage/:id', controller.updateFarmCropStage);
router.delete('/delete/:id', controller.deleteFarmCrop);

// --- Static Data ---

// Get list of all available crop types (Wheat, Rice, etc.)
router.get('/list', controller.getAllCrops);

// Get all active pincodes (Optional: included here as it was in the same controller)
router.get('/pincodes', controller.getAllPincodes);

export default router;