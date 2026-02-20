import { type Application } from "express";
import { Router } from "express";
import {
	changeForgotPassword,
	changePassword,
	forgotPassword,
	getMe,
	getMySessions,
	loginUser,
	logoutAllUserSessions,
	logoutCurrentSession,
	logoutSpecificSession,
	registerUsers,
	resendForgotPasswordOtp,
	resendOtp,
	verifyForgotPassword,
	verifyResentForgotPassword,
	verifyResentOtp,
	verifyUser,
} from "./src/models/auth/authManager.js";
import { requireSession } from "./src/middlewares/authSession.js";

export const setUpRoutes = (app: Application) => {
	const authRouter = Router();

	authRouter.post("/register", registerUsers);
	authRouter.post("/verify", verifyUser);
	authRouter.post("/resend-otp", resendOtp);
	authRouter.post("/verify-resent-otp", verifyResentOtp);

	authRouter.post("/login", loginUser);
	authRouter.get("/me", requireSession, getMe);

	authRouter.post("/forgot-password", forgotPassword);
	authRouter.post("/forgot-password/resend-otp", resendForgotPasswordOtp);
	authRouter.post("/forgot-password/verify", verifyForgotPassword);
	authRouter.post(
		"/forgot-password/verify-resent-otp",
		verifyResentForgotPassword
	);
	authRouter.patch("/forgot-password/change", changeForgotPassword);

	authRouter.patch("/change-password", requireSession, changePassword);

	authRouter.get("/sessions", requireSession, getMySessions);
	authRouter.delete("/sessions/current", requireSession, logoutCurrentSession);
	authRouter.delete("/sessions", requireSession, logoutAllUserSessions);
	authRouter.delete("/sessions/:sessionId", requireSession, logoutSpecificSession);

	app.use("/auth", authRouter);
};
