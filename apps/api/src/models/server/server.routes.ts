import { Router } from "express";
import {
	handleCreateServer,
	handleDeleteServer,
	handleGetAllServers,
	handleJoinServer,
	handleServerDetails,
} from "./server.controller";
import { requireSession } from "../../middlewares/authSession";

const router=Router();
router.post('/create',requireSession,handleCreateServer);
router.post('/join',requireSession,handleJoinServer)
router.get('/',requireSession,handleGetAllServers)
router.get('/:serverId',requireSession,handleServerDetails)
router.delete('/:sessionId',requireSession,handleDeleteServer)
export default router;