import { Router } from "express";
import { getCurrentUser, logoutUser } from "../controllers/user.controller";

const router = Router();

router.route("/getCurrentUser").get(getCurrentUser);
router.route("/logoutUser").post(logoutUser);

export default router;
