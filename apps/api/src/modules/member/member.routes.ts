import { Router } from "express";
import {
  handleGetMembers,
  handleChangeRole,
  handleKickMember
} from "./member.controller";
import { requireSession } from "../../middlewares/authSession";
import {
  checkServerAdmin,
  checkServerAdminOrModerator,
} from "../../middlewares/serverRoleAuth";
const router = Router({ mergeParams: true });

router.get("/", requireSession, handleGetMembers);

router.patch(
  "/:userId",requireSession,checkServerAdmin,handleChangeRole);

router.delete("/:userId",requireSession,checkServerAdminOrModerator,handleKickMember);

export default router;