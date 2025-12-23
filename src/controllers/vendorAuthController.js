import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import generateToken from '../utils/generateToken.js';

export const vendorSignup = async (req, res) => {
    const {
    name,
    email,
    phone,
    businessName,
    password,
    socialLinks,
} = req.body;

    try {
    // Basic validation
    if (!name || !email || !phone || !businessName || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (
        !socialLinks ||
        typeof socialLinks !== 'object' ||
        Object.keys(socialLinks).length === 0
    ) {
        return res.status(400).json({
            message: 'At least one social link is required',
        });
    }

    // Check existing vendor
    const existingVendor = await prisma.vendor.findUnique({
        where: { email },
    });

    if (existingVendor) {
        return res.status(400).json({ message: 'Vendor already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create vendor
    const vendor = await prisma.vendor.create({
        data: {
        name,
        email,
        phone,
        businessName,
        password: hashedPassword,
        socialLinks,
        },
    });

    // Issue JWT
    const token = generateToken(vendor.id, res);

    res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        vendorId: vendor.id,
        token,
    });

} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
}
};

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

export const adminLogin = async (req, res) => {
const { email, password } = req.body;

const admin = await prisma.admin.findUnique({
    where: { email },
});

if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
}

const isMatch = await bcrypt.compare(password, admin.password);
if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
}

const token = generateToken({ adminId: admin.id, type: 'ADMIN' }, res);

return res.status(200).json({
    success: true,
    message: 'Admin logged in successfully',
    token,
});
}
