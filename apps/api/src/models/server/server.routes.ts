import { Router } from "express";
import { handleCreateServer } from "./server.controller";
import { requireSession } from "../../middlewares/authSession";

const router=Router();
router.post('/',requireSession,handleCreateServer);

export default router;