import { Router } from "express";
import { handleCreateMessage } from "./message.controller";
import { requireSession } from "../../middlewares/authSession";
const router = Router({ mergeParams: true });

router.post(
  "/",requireSession,handleCreateMessage);

export default router;