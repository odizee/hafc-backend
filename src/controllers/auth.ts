import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { BadRequestsException } from "../exceptions/bad-request";
import { ErrorCode } from "../exceptions/root";
import { SignUpSchema } from "../schema/users";
import { NotFoundException } from "../exceptions/not-found";
import { sendEmail } from "../../utils/email";
import { randomBytes } from "crypto";
import { addHours } from "date-fns";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  SignUpSchema.parse(req.body);
  const { email, password, name, positions, sex } = req.body;
  const token = req.query.token as string | undefined;

  // Find the invitation and check expiration
  const invitation = await prismaClient.invitation.findFirst({
    where: { token, email, accepted: false },
  });
  if (!invitation || new Date() > invitation.expiresAt) {
    return res.status(400).json({ message: "Invalid or expired invitation." });
  }

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (user) {
    next(
      new BadRequestsException(
        "User already exists!",
        ErrorCode.USER_ALREADY_EXISTS
      )
    );
  }

  user = await prismaClient.user.create({
    data: {
      name,
      email,
      password: hashSync(password, 10),
      positions,
      sex,
    },
  });

  // Mark invitation as accepted
  await prismaClient.invitation.update({
    where: { id: invitation.id },
    data: { accepted: true },
  });

  await sendEmail({
    email: user.email,
    subject: "Welcome",
    message: "You have signed up successfully",
  });

  res.json(user);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (!user) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }

  if (!compareSync(password, user.password)) {
    throw new BadRequestsException(
      "Incorrect password!",
      ErrorCode.INCORRECT_PASSWORD
    );
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET
  );

  res.json({ user, token });
};

export const me = async (req: any, res: Response) => {
  res.json(req.user);
};

export const sendInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, role } = req.body;

    // Validate role
    if (!role || !["ADMIN", "USER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    // Check if the user or invitation already exists
    const existingUser = await prismaClient.user.findFirst({
      where: { email },
    });
    const existingInvite = await prismaClient.invitation.findFirst({
      where: { email, accepted: false },
    });

    if (existingUser || existingInvite) {
      return res
        .status(400)
        .json({ message: "User already invited or signed up." });
    }

    // Generate an invite token and expiry date (e.g., 24 hours from now)
    const token = randomBytes(32).toString("hex");
    const expiresAt = addHours(new Date(), 24);

    // Store the invitation in the database
    await prismaClient.invitation.create({
      data: { email, token, expiresAt },
    });

    // Send invite email
    const inviteLink = `http://localhost:3000/signup?token=${token}&role=${role}`;
    await sendEmail({
      email: email,
      subject: "You're Invited to Join Our App!",
      message: `You've been invited to join our app. Sign up here: ${inviteLink}`,
      //   html: `<p>You've been invited to join our app. Click <a href="${inviteLink}">here</a> to sign up.</p>`,
    });

    res.json({ message: "Invitation sent successfully." });
  } catch (error) {
    next(error);
  }
};

export const bulkSendInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { invitations } = req.body; // Assume `emails` is an array of email addresses

    if (!Array.isArray(invitations) || invitations.length === 0) {
      return res.status(400).json({ message: "Invalid email list." });
    }

    const failedInvitations: { email: string; reason: string }[] = [];
    const successInvitations: string[] = [];

    for (const { email, role } of invitations) {
      try {
        // Validate role
        if (!role || !["ADMIN", "USER"].includes(role)) {
          failedInvitations.push({ email, reason: "Invalid role specified." });
          continue;
        }

        // Check if the user or invitation already exists
        const existingUser = await prismaClient.user.findFirst({
          where: { email },
        });

        const existingInvite = await prismaClient.invitation.findFirst({
          where: { email, accepted: false },
        });

        if (existingUser || existingInvite) {
          failedInvitations.push({
            email,
            reason: "User already invited or signed up.",
          });
          continue; // Skip to the next email
        }

        // Generate an invite token and expiry date (e.g., 24 hours from now)
        const token = randomBytes(32).toString("hex");
        const expiresAt = addHours(new Date(), 24);

        // Store the invitation in the database
        await prismaClient.invitation.create({
          data: { email, token, expiresAt },
        });

        // Send invite email
        const inviteLink = `http://localhost:3000/signup?token=${token}&role=${role}`;
        await sendEmail({
          email: email,
          subject: "You're Invited to Join Our App!",
          message: `You've been invited to join our app. Sign up here: ${inviteLink}`,
        });

        successInvitations.push(email);
      } catch (err) {
        // Capture failed attempts
        failedInvitations.push(email);
      }
    }

    res.json({
      message: "Bulk invitation process completed.",
      success: successInvitations,
      failed: failedInvitations,
    });
  } catch (error) {
    next(error);
  }
};
