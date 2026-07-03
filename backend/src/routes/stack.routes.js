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

router.post("/:projectId", createStack);

router.get("/:projectId", listStacks);

router.get("/:projectId/:stackName", getStack);

router.delete("/:projectId/:stackName", deleteStack);

router.get("/:projectId/:stackName/services", getStackServices);

router.get("/:projectId/:stackName/tasks", getStackTasks);

export default router;