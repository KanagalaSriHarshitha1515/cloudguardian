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
/**
 * @swagger
 * tags:
 *   name: Volumes
 *   description: Docker Volume Management APIs
 *//**
 * @swagger
 * /api/volumes:
 *   get:
 *     summary: Get all Docker volumes
 *     tags:
 *       - Volumes
 *     responses:
 *       200:
 *         description: List of Docker volumes
 */
router.get("/:dockerHostId", authenticate, getVolumes);
/**
 * @swagger
 * /api/volumes:
 *   post:
 *     summary: Create a Docker volume
 *     tags:
 *       - Volumes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             example:
 *               name: my-volume
 *     responses:
 *       201:
 *         description: Volume created successfully
 */
router.post(
    "/:dockerHostId",
    authenticate,
    createVolume
);
/**
 * @swagger
 * /api/volumes/{name}:
 *   get:
 *     summary: Inspect a Docker volume
 *     tags:
 *       - Volumes
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Docker volume name
 *     responses:
 *       200:
 *         description: Volume details
 *       404:
 *         description: Volume not found
 */
router.get(
    "/:dockerHostId/:volumeName",
    authenticate,
    inspectVolume
);
/**
 * @swagger
 * /api/volumes/{name}:
 *   delete:
 *     summary: Delete a Docker volume
 *     tags:
 *       - Volumes
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Volume deleted successfully
 */
router.delete(
    "/:dockerHostId/:volumeName",
    authenticate,
    deleteVolume
);
/**
 * @swagger
 * /api/volumes/prune:
 *   post:
 *     summary: Remove all unused Docker volumes
 *     tags:
 *       - Volumes
 *     responses:
 *       200:
 *         description: Unused volumes removed
 */
router.post(
    "/:dockerHostId/prune",
    authenticate,
    pruneVolumes
);
export default router;