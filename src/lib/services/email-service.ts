import nodemailer from 'nodemailer';
import { getUserModel } from '@/lib/db/models-v2/user';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'RankShare <notifications@rankshare.app>',
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendNotificationEmail(
  userId: string,
  subject: string,
  content: string
) {
  try {
    const UserModel = await getUserModel();
    const user = await UserModel.findOne({ clerkId: userId }).select('email preferences').lean();

    if (!user?.email || !user.preferences?.notifications?.email) {
      return false;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #111827; font-size: 24px; margin-bottom: 16px;">${subject}</h1>
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">${content}</p>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                You received this email because you have email notifications enabled. 
                You can manage your notification preferences in your 
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #2563eb; text-decoration: none;">account settings</a>.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return sendEmail({
      to: user.email,
      subject,
      html
    });
  } catch (error) {
    console.error('Error sending notification email:', error);
    return false;
  }
} 