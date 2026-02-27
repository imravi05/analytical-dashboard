import axios from 'axios';
import FarmData from '../models/indexModel.js';

const FARMONAUT_URL = "https://us-central1-farmbase-b2f7e.cloudfunctions.net/getAllIndexValues";

export const getFieldIndices = async (req, res) => {
    const { fieldId } = req.params;

    try {
        const response = await axios.post(FARMONAUT_URL, 
            { FieldID: fieldId }, 
            { headers: { 'Authorization': `Bearer ${process.env.FARMONAUT_API_KEY}` } }
        );

        const apiData = response.data; // This is the "indices" object you showed
        const transformedData = {};

        /** * 1. PIVOT THE DATA
         * Convert from: index -> date -> value
         * To: date -> { index: value }
         */
        Object.keys(apiData).forEach(indexName => {
            const dateEntries = apiData[indexName]; // e.g., {"20251229": "10", ...}
            
            Object.keys(dateEntries).forEach(date => {
                if (!transformedData[date]) {
                    transformedData[date] = {};
                }
                // Convert string values to Numbers for your DB model
                // We use uppercase (NDVI) to match your Mongoose Schema
                transformedData[date][indexName.toUpperCase()] = parseFloat(dateEntries[date]);
            });
        });

        // 2. PREPARE BULK OPS
        const bulkOps = Object.keys(transformedData).map(dateKey => ({
            updateOne: {
                filter: { fieldId: fieldId, date: dateKey },
                update: { 
                    $set: { 
                        indices: transformedData[dateKey],
                        fetchedAt: new Date()
                    } 
                },
                upsert: true
            }
        }));

        // 3. EXECUTE DB WRITE
        if (bulkOps.length > 0) {
            await FarmData.bulkWrite(bulkOps);
        }

        res.status(200).json({
            success: true,
            message: `Stored ${bulkOps.length} dates in DB`,
            data: transformedData
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};