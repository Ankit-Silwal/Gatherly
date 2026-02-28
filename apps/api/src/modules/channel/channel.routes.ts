
import { Router } from "express";
import { checkServerAdminOrModerator } from "../../middlewares/serverRoleAuth";
import {
	handleCreateChannel,
	handleGetChannels,
	handleRenameChannel,
	handleDeleteChannel
} from "./channel.controller";
import { requireSession } from "../../middlewares/authSession";

const router = Router();

router.post('/:serverId/channels', checkServerAdminOrModerator, handleCreateChannel);

router.get('/:serverId/channels',requireSession, handleGetChannels);

router.patch('/:serverId/:channelId/rename', checkServerAdminOrModerator, handleRenameChannel);

router.delete('/:serverId/:channelId', checkServerAdminOrModerator, handleDeleteChannel);

export default router;