import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
    getImages,
    pullImage,
    deleteImage,
    tagImage
} from "../controllers/image.controller.js";
const router = Router();
/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Docker Image Management APIs
 */
/**
 * @swagger
 * /api/images:
 *   get:
 *     summary: Get all Docker images
 *     tags:
 *       - Images
 *     responses:
 *       200:
 *         description: List of Docker images
 */
router.get(
  "/:dockerHostId",
  authenticate,
  getImages
);
/**
 * @swagger
 * /api/images/pull:
 *   post:
 *     summary: Pull a Docker image
 *     tags:
 *       - Images
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *             example:
 *               image: nginx:latest
 *     responses:
 *       200:
 *         description: Image pulled successfully
 */
router.post(
    "/:dockerHostId/pull",
    authenticate,
    pullImage
);
/**
 * @swagger
 * /api/images/{id}:
 *   delete:
 *     summary: Delete a Docker image
 *     tags:
 *       - Images
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 */
router.delete(
  "/:dockerHostId/:imageId",
  authenticate,
  deleteImage
);
/**
 * @swagger
 * /api/images/{dockerHostId}/{imageId}/tag:
 *   post:
 *     summary: Tag a Docker image
 *     description: Creates a new tag for an existing Docker image.
 *     tags:
 *       - Images
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dockerHostId
 *         required: true
 *         schema:
 *           type: string
 *         description: Docker Host ID
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Docker Image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - repo
 *               - tag
 *             properties:
 *               repo:
 *                 type: string
 *                 example: my-nginx
 *               tag:
 *                 type: string
 *                 example: v1
 *     responses:
 *       200:
 *         description: Image tagged successfully
 *       404:
 *         description: Docker host not found
 *       500:
 *         description: Internal server error
 */
router.post(
    "/:dockerHostId/:imageId/tag",
    authenticate,
    tagImage
);
export default router;