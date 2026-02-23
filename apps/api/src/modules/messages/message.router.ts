import { Router } from "express";
import { handleCreateMessage, handleGetMessages,handleEditMessage } from "./message.controller";
import { requireSession } from "../../middlewares/authSession";
const router = Router({ mergeParams: true });

router.post("/",requireSession,handleCreateMessage);

router.get("/",requireSession,handleGetMessages)
router.patch("/:messageId",requireSession,handleEditMessage);
export default router;