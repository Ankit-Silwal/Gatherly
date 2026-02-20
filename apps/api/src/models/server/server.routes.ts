import { Router } from "express";
import { handleCreateServer, handleJoinServer } from "./server.controller";
import { requireSession } from "../../middlewares/authSession";

const router=Router();
router.post('create-server/',requireSession,handleCreateServer);
router.post('/join-server',requireSession,handleJoinServer)

export default router;