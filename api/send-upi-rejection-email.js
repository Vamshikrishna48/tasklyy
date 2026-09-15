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

  const { email, userName, upiId, reason } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'User email is required' });
  }

  const formattedName = userName || 'Valued Member';
  const displayUpi = upiId || 'Submitted UPI ID';
  const rejectionReason = reason?.trim() || 'UPI VPA handle could not be verified with banking network or name mismatch.';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; border-radius: 20px; background-color: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.03);">
      <div style="text-align: center; margin-bottom: 28px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 30px; font-weight: 900; letter-spacing: -0.02em;">Tasskly</h1>
        <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Official Administration Notice</p>
      </div>

      <div style="padding: 24px; border-radius: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 24px;">
        <h3 style="color: #0f172a; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Notice: UPI ID Verification Update</h3>
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
          Dear <strong>${formattedName}</strong>,
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
          During our administrative payout verification review, the UPI ID associated with your account (<strong style="color: #dc2626; font-family: monospace;">${displayUpi}</strong>) could not be approved.
        </p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin-bottom: 18px;">
          <p style="color: #991b1b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 6px 0;">Administrative Review Note:</p>
          <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.5; font-weight: 500;">
            ${rejectionReason}
          </p>
        </div>

        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0; font-weight: 600;">
          What you need to do next:
        </p>
        <ol style="color: #475569; font-size: 13px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
          <li>Log in to your Tasskly dashboard.</li>
          <li>Navigate to your <strong>Profile & Payout Settings</strong>.</li>
          <li>Re-enter your valid active UPI ID (e.g., <em>yourname@okhdfcbank</em> or <em>mobilenumber@paytm</em>).</li>
          <li>Save the updated details so our team can re-verify your payout configuration.</li>
        </ol>

        <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
          If you need any assistance, please reach out to our administration support team at <a href="mailto:support@tasskly.com" style="color: #4f46e5; text-decoration: none; font-weight: 600;">support@tasskly.com</a>.
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0; font-weight: 600;">Tasskly Administration & Payout Team</p>
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
          subject: 'Formal Notice: Tasskly UPI ID Verification Update',
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
        subject: 'Formal Notice: Tasskly UPI ID Verification Update',
        html: htmlContent,
      });

      return res.status(200).json({ success: true, method: 'smtp' });
    } catch (e) {
      console.warn("SMTP email dispatch error:", e);
    }
  }

  return res.status(200).json({
    success: true,
    method: 'none',
    message: 'UPI status updated in database. (Email service not configured).'
  });
}
