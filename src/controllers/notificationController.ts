import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";
import handlePrismaError from "../utils/errorHandling";

// Fetch all active notifications
const fetchNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | undefined> => {
    try {
      const notifications = await prisma.notification.findMany({
        where: { active: true },
      });
      return res.json(notifications);
    } catch (error) {
      handlePrismaError(
        error,
        {
          message: "Failed to fetch notifications.",
          record: "notification",
        },
        next
      );
    }
  };

// Create a new notification
const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const { text, link } = req.body;

  try {
    const newNotification = await prisma.notification.create({
      data: { text, link },
    });

    return res.status(201).json(newNotification);
  } catch (error) {
    handlePrismaError(
      error,
      { message: "Failed to create notification.", record: "notification" },
      next
    );
  }
};

// Dismiss a notification
const dismissNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const { id } = req.params;

  try {
    const updatedNotification = await prisma.notification.update({
      where: { id: Number(id) },
      data: { active: false },
    });

    return res.json(updatedNotification);
  } catch (error) {
    handlePrismaError(
      error,
      {
        message: `Failed to dismiss notification with id ${id}.`,
        record: "notification",
      },
      next
    );
  }
};

export { fetchNotifications, createNotification, dismissNotification };