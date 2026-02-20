import { Router } from "express";
import { handleCreateServer, handleGetAllServers, handleJoinServer } from "./server.controller";
import { requireSession } from "../../middlewares/authSession";

const router=Router();
router.post('/create',requireSession,handleCreateServer);
router.post('/join',requireSession,handleJoinServer)
router.get('/',requireSession,handleGetAllServers)
export default router;