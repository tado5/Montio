import nodemailer from 'nodemailer';

/**
 * Send invitation email to company owner
 * Only works in production - development mode just logs
 */
export const sendInviteEmail = async (email, inviteLink) => {
  const isProduction = process.env.NODE_ENV === 'production';

  console.log('📧 [sendInviteEmail] Called with:', { email, isProduction });
  console.log('🔍 [sendInviteEmail] SMTP Config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER ? '***' + process.env.SMTP_USER.slice(-10) : 'NOT SET',
    pass: process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-4) : 'NOT SET'
  });

  // Development mode - just log (no real email)
  if (!isProduction) {
    console.log('📧 [DEV MODE] Email would be sent to:', email);
    console.log('🔗 Invite link:', inviteLink);
    return { success: true, mode: 'development' };
  }

  // Production mode - send real email
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true, // use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Email content
    const mailOptions = {
      from: `"MONTIO System" <${process.env.SMTP_USER || 'noreply@montio.sk'}>`,
      to: email,
      subject: 'Pozvánka do MONTIO - Registrácia firmy',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #334155;
              margin: 0;
              padding: 0;
              background-color: #f8fafc;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
              padding: 40px 30px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 32px;
              font-weight: 800;
              letter-spacing: -0.5px;
            }
            .content {
              background: white;
              padding: 40px 30px;
              border-radius: 0 0 12px 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            }
            .content h2 {
              color: #1e293b;
              font-size: 24px;
              margin-top: 0;
              margin-bottom: 16px;
            }
            .content p {
              color: #64748b;
              font-size: 16px;
              margin: 12px 0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
              color: white !important;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: 600;
              font-size: 16px;
              margin: 24px 0;
              box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
            }
            .link-box {
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              word-break: break-all;
            }
            .link-box p {
              margin: 0;
              color: #64748b;
              font-size: 13px;
            }
            .link-box a {
              color: #f97316;
              text-decoration: none;
              font-size: 14px;
              font-family: monospace;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #94a3b8;
              font-size: 13px;
            }
            .footer a {
              color: #f97316;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔧 MONTIO</h1>
            </div>
            <div class="content">
              <h2>Vitajte v MONTIO!</h2>
              <p>Boli ste pozvaní do systému MONTIO pre správu montážnych firiem.</p>
              <p>Kliknutím na tlačidlo nižšie dokončíte registráciu svojej firmy:</p>

              <div style="text-align: center;">
                <a href="${inviteLink}" class="button">Dokončiť registráciu</a>
              </div>

              <div class="link-box">
                <p><strong>Alternatívny link:</strong></p>
                <p>Ak tlačidlo nefunguje, skopírujte tento link do prehliadača:</p>
                <a href="${inviteLink}">${inviteLink}</a>
              </div>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 14px;">
                Tento email bol odoslaný na základe pozvánky od administrátora systému MONTIO.
                Ak ste túto pozvánku nedostali oprávnene, môžete tento email ignorovať.
              </p>
            </div>
            <div class="footer">
              <p>Vytvorené s ❤️ tímom <a href="https://tsdigital.sk">TSDigital</a></p>
              <p>© ${new Date().getFullYear()} MONTIO. Všetky práva vyhradené.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);

    return { success: true, mode: 'production', messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // Don't throw - continue even if email fails
    return { success: false, mode: 'production', error: error.message };
  }
};
