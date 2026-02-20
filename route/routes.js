import {Router} from "express"
import { loginController, registerController,refreshTokenController, logoutController, profileController, forgotPasswordController} from "../controller/userController.js";
import { authenticationToken } from "../auth/auth.js";

const router = Router();

router.post("/register",registerController)
router.post("/login",loginController)
router.post("/refreshToken",refreshTokenController)
router.post("/logout",logoutController)
router.post("/profile",authenticationToken,profileController)
router.post("/reset-password",forgotPasswordController)

export default router;