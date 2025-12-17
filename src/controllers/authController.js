import bcrypt from 'bcryptjs'
import prisma from '../config/db'
import generateToken from '../utils/generateToken'

const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "VENDOR", 
      },
    });

    await prisma.vendorProfile.create({
      data: {
        userId: newUser.id,
        businessName: "", 
        status: "NOT_SUBMITTED",
      },
    });

    // 3. Generate JWT
    const token = generateToken(newUser.id, res);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if(!email || !password){
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if(!user){
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = generateToken(user.id, res);
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User logged out successfully" });
};


export { signup, login, logout };
