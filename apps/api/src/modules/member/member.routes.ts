import { Router } from "express";
import {
  handleGetMembers,
  handleChangeRole,
  handleKickMember
} from "./member.controller";
import { requireSession } from "../../middlewares/authSession";
const router = Router({ mergeParams: true });

router.get("/", requireSession, handleGetMembers);

router.patch(
  "/:userId",requireSession,handleChangeRole);

router.delete("/:userId",requireSession,handleKickMember);

export default router;