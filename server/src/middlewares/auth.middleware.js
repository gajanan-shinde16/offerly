import jwt from "jsonwebtoken";

/**
 * Middleware to protect routes using JWT
 * - Verifies token from HttpOnly cookie
 * - Attaches decoded payload to req.user
 */
export const protect = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { userId, role, iat, exp }
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token"
    });
  }
};
