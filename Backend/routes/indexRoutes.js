import express from 'express';
import {getFieldIndices}from '../controllers/indexController.js';

// Stress APIs
const router = express.Router();

router.get('/field/:fieldId', getFieldIndices);



export default router;