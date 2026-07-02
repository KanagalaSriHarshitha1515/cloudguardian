import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
    getVolumes,
    createVolume,
    inspectVolume,
    deleteVolume,
    pruneVolumes
} from "../controllers/volume.controller.js";

const router = express.Router();

router.get("/:dockerHostId", authenticate, getVolumes);
router.post(
    "/:dockerHostId",
    authenticate,
    createVolume
);
router.get(
    "/:dockerHostId/:volumeName",
    authenticate,
    inspectVolume
);
router.delete(
    "/:dockerHostId/:volumeName",
    authenticate,
    deleteVolume
);
router.post(
    "/:dockerHostId/prune",
    authenticate,
    pruneVolumes
);
export default router;