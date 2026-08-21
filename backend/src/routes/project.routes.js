import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireProjectAccess } from "../middleware/authorization.middleware.js";
import {
  createProject,
  getProjects,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project Management APIs
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: CloudGuardian
 *               description:
 *                 type: string
 *                 example: Docker Monitoring Platform
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get("/:id", authenticate, requireProjectAccess("id"), getProjectById);

router.get("/:id/members", authenticate, requireProjectAccess("id"), getProjectMembers);
router.post("/:id/members", authenticate, requireProjectAccess("id"), addProjectMember);
router.delete("/:id/members/:userId", authenticate, requireProjectAccess("id"), removeProjectMember);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: CloudGuardian
 *               description:
 *                 type: string
 *                 example: Updated Docker Monitoring Platform
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 */
router.put("/:id", authenticate, requireProjectAccess("id"), updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete("/:id", authenticate, requireProjectAccess("id"), deleteProject);

export default router;