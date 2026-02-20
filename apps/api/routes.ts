import { type Application } from "express";
import serverRoutes from "./src/models/server/server.routes.js";
import authRoutes from "./src/models/auth/auth.routes.js";

export const setUpRoutes = (app: Application) => {
	app.use("/auth", authRoutes);
  app.use("/server",serverRoutes);
};
