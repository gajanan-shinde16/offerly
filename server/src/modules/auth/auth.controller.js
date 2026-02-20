import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.model.js";

const isProd = process.env.NODE_ENV === "production";

//REGISTER 
export const register = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await User.create({
      ...req.body,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });
  } catch (err) {
    next(err);
  }
};

//LOGIN 
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000
      })
      .json({
        success: true,
        message: "Login successful"
      });
  } catch (err) {
    next(err);
  }
};

//LOGOUT 
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax"
  });

  res.json({
    success: true,
    message: "Logged out successfully"
  });
};
