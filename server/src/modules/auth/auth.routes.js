import express from "express";
import { register, login, logout } from "./auth.controller.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

router.post("/logout", logout);

router.get("/me", protect, (req, res) => {
  res.json({
    success: true,
    userId: req.user.userId,
    role: req.user.role
  });
});



export default router;
