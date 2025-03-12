import { NextFunction, Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { ValidationError } from "../types/error";

const prisma = new PrismaClient();

export const markAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Check if the user is an admin
    if (req.user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "You must be an admin to mark attendance" });
    }

    const { date, present, userId } = req.body;

    if (!date || present === undefined) {
      throw new ValidationError("Date and present status are required");
    }

    if (new Date(date) > new Date()) {
      throw new ValidationError("Cannot mark attendance for future dates");
    }

    // Check if attendance already exists for the user on the given date
    const existingAttendance = await prisma.attendance.findFirst({
      where: { userId, date: new Date(date) },
    });

    let attendance;
    if (existingAttendance) {
      // Update the existing record
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: { present },
      });
    } else {
      // Create a new record if not found
      attendance = await prisma.attendance.create({
        data: { date: new Date(date), present, userId },
      });
    }

    res.json({ msg: "Attendance marked successfully", data: attendance });
  } catch (error) {
    next(error);
  }
};

export const markBulkAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Check if the user is an admin
    if (req.user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "You must be an admin to mark attendance" });
    }

    // Validate the input data
    const { attendanceData } = req.body; // Expecting an array of attendance objects

    // Check if attendanceData is an array
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      throw new ValidationError("Attendance data should be a non-empty array");
    }

    // Ensure each entry has the necessary fields
    const invalidEntries = attendanceData.filter(
      (entry) => !entry.userId || !entry.date || entry.present === undefined
    );
    if (invalidEntries.length > 0) {
      throw new ValidationError(
        "Some entries are missing required fields (userId, date, present)"
      );
    }

    // Create attendance records in bulk
    const createdAttendance = await prisma.attendance.createMany({
      data: attendanceData.map((entry) => ({
        userId: entry.userId,
        date: new Date(entry.date),
        present: entry.present,
      })),
    });

    // Return the response
    res.status(201).json({
      status: "success",
      message: `${createdAttendance.count} attendance records created successfully`,
    });
  } catch (error) {
    next(error); // Pass error to error handler
  }
};

export const getAttendanceHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { date } = req.query; // Extract date from query parameters
    const userId = req.user!.userId;

    let whereClause: Prisma.AttendanceWhereInput = { userId };

    // const whereClause = {
    //   userId,
    //   ...(date && { date: new Date(date as string) }), // Add date filter if provided
    // };

    if (date) {
      const parsedDate = new Date(date as string);
      const startOfDay = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
      );
      const endOfDay = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate() + 1
      );

      whereClause.date = {
        gte: startOfDay,
        lt: endOfDay,
      };
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        user: {
          select: {
            name: true,
            positions: true,
            role: true,
            stats: true,
          },
        },
      },
    });

    // Parse positions before sending the response
    const formattedAttendance = attendance.map((record) => ({
      ...record,
      user: {
        ...record.user,
        positions: record.user.positions
          ? JSON.parse(record.user.positions)
          : [],
      },
    }));

    res.json(formattedAttendance);
  } catch (error) {
    next(error);
  }
};
