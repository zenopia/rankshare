import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "general", "other"]),
  sourcePage: z.string().optional(),
  comment: z.string(),
  userId: z.string().optional().nullable(),
  username: z.string().optional(),
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    const { type, sourcePage, comment, userId, username } = validatedData;

    const html = `
      <h2>New Feedback Received</h2>
      <p><strong>Type:</strong> ${type}</p>
      ${sourcePage ? `<p><strong>Source Page:</strong> ${sourcePage}</p>` : ""}
      ${userId ? `<p><strong>User ID:</strong> ${userId}</p>` : ""}
      ${username ? `<p><strong>Username:</strong> @${username}</p>` : ""}
      <p><strong>Comment:</strong></p>
      <p style="white-space: pre-line">${comment}</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "itsuki.kama@gmail.com",
      subject: `Favely Feedback: ${type}${username ? ` from @${username}` : ''}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
} 