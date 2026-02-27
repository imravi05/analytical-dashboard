import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import connectDB from './config/dbConnect.js';
import farmRoutes from './routes/farmRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import indexRoutes from './routes/indexRoutes.js';

dotenv.config();

connectDB();    


const app = express();
const PORT = process.env.PORT || 5000;      
        
app.use(cors());    

app.use(express.json());
app.use(express.urlencoded({ extended: true }));        

// routes 
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/indexes', indexRoutes);
      


app.get('/', (req, res) => {
    res.send('Server is up and running');
});






app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
}); 



