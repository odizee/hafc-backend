import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import {
  getAttendanceHistory,
  markAttendance,
  markBulkAttendance,
} from "../controllers/attendance";
import { errorHandler } from "../error-handler";

const attendanceRoutes: Router = Router();

attendanceRoutes.post("/", [authMiddleware], errorHandler(markAttendance));
attendanceRoutes.post(
  "/bulk",
  [authMiddleware],
  errorHandler(markBulkAttendance)
);
attendanceRoutes.get(
  "/history",
  [authMiddleware],
  errorHandler(getAttendanceHistory)
);
// authRoutes.get("/me", [authMiddleware], errorHandler(me));

export default attendanceRoutes;
