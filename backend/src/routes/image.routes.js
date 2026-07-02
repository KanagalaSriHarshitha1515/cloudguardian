import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
    getImages,
    pullImage,
    deleteImage,
    tagImage
} from "../controllers/image.controller.js";
const router = Router();

router.get(
  "/:dockerHostId",
  authenticate,
  getImages
);
router.post(
    "/:dockerHostId/pull",
    authenticate,
    pullImage
);
router.delete(
  "/:dockerHostId/:imageId",
  authenticate,
  deleteImage
);
router.post(
    "/:dockerHostId/:imageId/tag",
    authenticate,
    tagImage
);
export default router;