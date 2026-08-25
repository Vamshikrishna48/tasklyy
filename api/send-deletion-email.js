import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, userName } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'User email is required' });
  }

  const formattedName = userName || 'Valued User';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; border-radius: 20px; background-color: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.03);">
      <div style="text-align: center; margin-bottom: 28px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 30px; font-weight: 900; letter-spacing: -0.02em;">Tasskly</h1>
        <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Official Administration Notice</p>
      </div>

      <div style="padding: 24px; border-radius: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 24px;">
        <h3 style="color: #0f172a; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Notification of Account & Data Deletion</h3>
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
          Dear <strong>${formattedName}</strong>,
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
          This email serves as formal notification that your Tasskly account (<strong style="color: #4f46e5;">${email}</strong>) and all associated platform records have been officially deleted from our system database by the platform administrator.
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0; font-weight: 600;">
          The following user data and records have been permanently erased:
        </p>
        <ul style="color: #475569; font-size: 13px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
          <li>Account Profile and Login Credentials</li>
          <li>All Posted Tasks and Bid Submissions</li>
          <li>Verification Documents and Uploaded Attachments</li>
          <li>Transaction Logs, Wallet Entries, and Activity History</li>
        </ul>
        <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
          If you have questions regarding this deletion or believe this action was taken in error, please contact our administrative support team at <a href="mailto:support@tasskly.com" style="color: #4f46e5; text-decoration: none; font-weight: 600;">support@tasskly.com</a>.
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0; font-weight: 600;">Tasskly Administration Team</p>
        <p style="color: #cbd5e1; font-size: 11px; margin: 0;">&copy; 2026 Tasskly • India's Student Marketplace. All rights reserved.</p>
      </div>
    </div>
  `;

  // 1. Try Resend if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Tasskly Admin <info@tasskly.com>',
          to: [email],
          subject: 'Formal Notice: Tasskly Account Deletion',
          html: htmlContent
        })
      });

      const resData = await response.json();
      if (response.ok) {
        return res.status(200).json({ success: true, method: 'resend', data: resData });
      }
    } catch (e) {
      console.warn("Resend email dispatch error:", e);
    }
  }

  // 2. Try SMTP fallback
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT || '465';
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (smtpUser && smtpPassword) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort) || 465,
        secure: parseInt(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });

      await transporter.sendMail({
        from: `"Tasskly Admin" <${smtpUser}>`,
        to: email,
        subject: 'Formal Notice: Tasskly Account Deletion',
        html: htmlContent,
      });

      return res.status(200).json({ success: true, method: 'smtp' });
    } catch (e) {
      console.warn("SMTP email dispatch error:", e);
    }
  }

  return res.status(503).json({
    success: false,
    method: 'none',
    message: 'No email provider configured. Set RESEND_API_KEY or SMTP_USER/SMTP_PASSWORD.'
  });
}
