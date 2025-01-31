import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendCollaborationInviteEmailParams {
  to: string;
  inviterName: string;
  listTitle: string;
  listUrl: string;
  note?: string;
}

export async function sendCollaborationInviteEmail({
  to,
  inviterName,
  listTitle,
  listUrl,
  note
}: SendCollaborationInviteEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.error('NEXT_PUBLIC_APP_URL is not defined');
    throw new Error('Application URL is not configured');
  }

  const signUpUrl = `${appUrl}/sign-up`;
  console.log('Generating email with URLs:', { appUrl, signUpUrl, listUrl });
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin: 2em;">
        <img src="${appUrl}/Favely-logo.png" alt="Favely" style="width: 271px; height: 42px;" />
      </div>
      <h2>You're invited to collaborate!</h2>
      <p>${inviterName} has invited you to collaborate on the list "${listTitle}" on Favely.net.</p>
      
      ${note ? `<p style="padding: 1em; background-color: #f5f5f5; border-radius: 4px;">
        <strong>Note from ${inviterName}:</strong><br>
        ${note}
      </p>` : ''}
      
      <p>Favely is a platform for creating and sharing lists with friends.</p>
      
      <div style="margin: 2em 0;">
        <a href="${signUpUrl}" style="
          display: inline-block;
          background-color: #000;
          color: #fff;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin-right: 12px;
        ">Create Account</a>
        
        <a href="${listUrl}" style="
          display: inline-block;
          background-color: #fff;
          color: #000;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          border: 1px solid #000;
        ">View List</a>
      </div>
      
      <p style="color: #666; font-size: 0.9em;">
        If you already have an account, you can simply click "View List" to see the collaboration.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Favely" <${process.env.SMTP_FROM}>`,
    to,
    subject: `${inviterName} invited you to collaborate on "${listTitle}"`,
    html,
  });
} 