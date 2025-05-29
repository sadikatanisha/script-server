import { Router } from "express";
import {
  createUserInDb,
  getMyData,
  getToken,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create-user", createUserInDb);
router.post("/get-token", getToken);
router.get("/me", authMiddleware, getMyData);

export default router;
