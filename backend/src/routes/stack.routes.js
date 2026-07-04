import express from "express";

import {
  createStack,
  listStacks,
  getStack,
  deleteStack,
  getStackServices,
  getStackTasks,
} from "../controllers/stack.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Stacks
 *   description: Docker Stack Management APIs
 */

/**
 * @swagger
 * /api/stacks/{projectId}:
 *   post:
 *     summary: Deploy a Docker Stack
 *     tags:
 *       - Stacks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stackName:
 *                 type: string
 *                 example: nginx-stack
 *               composeFile:
 *                 type: string
 *     responses:
 *       201:
 *         description: Stack deployed successfully
 */
router.post("/:projectId", createStack);

/**
 * @swagger
 * /api/stacks/{projectId}:
 *   get:
 *     summary: List Docker Stacks
 *     tags:
 *       - Stacks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of Docker stacks
 */
router.get("/:projectId", listStacks);

/**
 * @swagger
 * /api/stacks/{projectId}/{stackName}:
 *   get:
 *     summary: Get Docker Stack Details
 *     tags:
 *       - Stacks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: stackName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stack details
 */
router.get("/:projectId/:stackName", getStack);

/**
 * @swagger
 * /api/stacks/{projectId}/{stackName}:
 *   delete:
 *     summary: Delete Docker Stack
 *     tags:
 *       - Stacks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *       - in: path
 *         name: stackName
 *         required: true
 *     responses:
 *       200:
 *         description: Stack deleted successfully
 */
router.delete("/:projectId/:stackName", deleteStack);

/**
 * @swagger
 * /api/stacks/{projectId}/{stackName}/services:
 *   get:
 *     summary: Get Stack Services
 *     tags:
 *       - Stacks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *       - in: path
 *         name: stackName
 *         required: true
 *     responses:
 *       200:
 *         description: Stack services
 */
router.get("/:projectId/:stackName/services", getStackServices);

/**
 * @swagger
 * /api/stacks/{projectId}/{stackName}/tasks:
 *   get:
 *     summary: Get Stack Tasks
 *     tags:
 *       - Stacks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *       - in: path
 *         name: stackName
 *         required: true
 *     responses:
 *       200:
 *         description: Stack tasks
 */
router.get("/:projectId/:stackName/tasks", getStackTasks);

export default router;