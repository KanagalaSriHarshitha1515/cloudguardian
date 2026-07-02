import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
    getNetworks,
    inspectNetwork,
    createNetwork,
    deleteNetwork,
    connectContainer,
    disconnectContainer
} from "../controllers/network.controller.js";
const router = express.Router();

router.get(
    "/:dockerHostId",
    authenticate,
    getNetworks
);
router.get(
    "/:dockerHostId/:networkId",
    authenticate,
    inspectNetwork
);
router.post(
    "/:dockerHostId",
    authenticate,
    createNetwork
);
router.delete(
    "/:dockerHostId/:networkId",
    authenticate,
    deleteNetwork
);
router.post(
    "/:dockerHostId/:networkId/connect",
    authenticate,
    connectContainer
);
router.post(
    "/:dockerHostId/:networkId/disconnect",
    authenticate,
    disconnectContainer
);
export default router;