import mongoose from 'mongoose'; 

const farmDataSchema = new mongoose.Schema({
    fieldId: { type: String, required: true, index: true },
    date: { type: String, required: true }, 
    indices: {
        NDVI: Number,
        NDRE: Number,
        EVI: Number,
        SAVI: Number,
        NDMI: Number,
        NDWI: Number,
        RSM: Number,
        SOC: Number,
        BSI: Number,
        SI: Number
    },
    fetchedAt: { type: Date, default: Date.now }
});

farmDataSchema.index({ fieldId: 1, date: 1 }, { unique: true });


const FarmData = mongoose.model('FarmData', farmDataSchema);
export default FarmData;