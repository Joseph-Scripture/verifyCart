import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import generateToken from '../utils/generateToken.js';

export const vendorSignup = async (req, res) => {
    const {name, email, password, phone, businessName} = req.body; 
    if (!name || !email || !password || !phone || !businessName) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }
    try {
        const existingVendor = await prisma.vendor.findUnique({
            where: {
                email,
            },
        });
        if (existingVendor) {
            return res.status(400).json({ message: 'Vendor already exists' });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        const vendor = await prisma.vendor.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                businessName,
            },
        });
        const token = generateToken({vendorId: vendor.id}, res);
        return res.status(201).json({
            success: true,
            message: 'Vendor created successfully',
            token,
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
    
}
export const vendorLogin = async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({message: 'Please fill in all fields'})
    }
    try {
        const vendor = await prisma.vendor.findUnique({
            where:{email},
        });
        if(!vendor){
            return res.status(401).json({message: 'Invalid email or password'})
        }
        const isMatch = await bcrypt.compare(password, vendor.password);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid email or password'})
        }
        const token = generateToken({vendorId: vendor.id}, res);
        return res.status(200).json({
            success: true,
            message: 'Vendor logged in successfully',
            token,
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const  vendorLogout = async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    return res.status(200).json({
        success: true,
        message: 'Vendor logged out successfully',
    })
} 