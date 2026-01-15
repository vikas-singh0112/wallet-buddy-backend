import { Router } from "express";
import { createTransaction, getTransaction } from "../controllers/transaction.controller";

const router = Router();

router.route("/").post(createTransaction);
router.route("/").get(getTransaction);

export default router;
