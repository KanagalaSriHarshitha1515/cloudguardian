import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Management APIs
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get User Profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticate, (req, res) => {
  res.json({
    message: "Profile fetched successfully",
    user: req.user,
  });
});

export default router;