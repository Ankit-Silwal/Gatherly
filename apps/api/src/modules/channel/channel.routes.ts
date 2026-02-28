
import { Router } from "express";
import { checkServerAdminOrModerator } from "../../middlewares/serverRoleAuth";
import {
	handleCreateChannel,
	handleGetChannels,
	handleRenameChannel,
	handleDeleteChannel
} from "./channel.controller";

const router = Router();

router.post('/:serverId', checkServerAdminOrModerator, handleCreateChannel);

router.get('/:serverId', handleGetChannels);

router.patch('/:serverId/:channelId', checkServerAdminOrModerator, handleRenameChannel);

router.delete('/:serverId/:channelId', checkServerAdminOrModerator, handleDeleteChannel);

export default router;