import { Router } from "express";
import containerRoutes from "./container.routes.js";
const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "CloudGuardian API v1",
  });
});
router.use("/containers", containerRoutes);
export default router;