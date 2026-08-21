import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  listTeams,
  createTeam,
  addTeamMember,
  removeTeamMember,
  assignProjectToTeam,
  removeProjectFromTeam,
} from "../controllers/team.controller.js";

const router = Router();

router.get("/", authenticate, listTeams);
router.post("/", authenticate, createTeam);
router.post("/:teamId/members", authenticate, addTeamMember);
router.delete("/:teamId/members/:userId", authenticate, removeTeamMember);
router.post("/:teamId/projects/:projectId", authenticate, assignProjectToTeam);
router.delete("/:teamId/projects/:projectId", authenticate, removeProjectFromTeam);

export default router;
