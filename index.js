import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// const authRoutes = require('./src/routes/authRoutes'); 
import {authRoutes} from './src/routes/authRoutes';
import {vendorRoutes} from './src/routes/vendorRoutes';
import {adminRoutes} from './src/routes/adminRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Verify-cart API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
