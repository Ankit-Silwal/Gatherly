import { Router } from "express";
import { handleCreateMessage, handleGetMessages } from "./message.controller";
import { requireSession } from "../../middlewares/authSession";
const router = Router({ mergeParams: true });

router.post("/",requireSession,handleCreateMessage);
router.get("/",requireSession,handleGetMessages)

export default router;