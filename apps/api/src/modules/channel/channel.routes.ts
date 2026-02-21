import { Router } from "express";
import { checkServerAdminOrModerator } from "../../middlewares/serverRoleAuth";
import { handleCreateChannel } from "./channel.controller";
const router=Router();

router.post('/',checkServerAdminOrModerator,handleCreateChannel);

export default router;