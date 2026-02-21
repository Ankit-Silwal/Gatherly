import { type Application } from "express";
import serverRoutes from "./src/modules/server/server.routes.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import memberRoutes from "./src/modules/member/member.routes.js";
import channelRoutes from "./src/modules/channel/channel.routes.js";
export const setUpRoutes = (app: Application) => {
	app.use("/auth", authRoutes);
  app.use("/server",serverRoutes);
  app.use("/servers/:serverId",memberRoutes);
  app.use("/server/:serverId/channels",channelRoutes);
};
