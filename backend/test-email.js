import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Testing SMTP configuration...\n');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-4) : 'NOT SET');
console.log('\n');

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      debug: true, // Enable debug output
      logger: true  // Log to console
    });

    console.log('✅ Transporter created');
    console.log('🔄 Verifying SMTP connection...\n');

    // Verify connection
    await transporter.verify();
    console.log('\n✅ SMTP connection verified successfully!');

    // Try to send test email
    console.log('\n📧 Sending test email...\n');

    const info = await transporter.sendMail({
      from: `"MONTIO Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'MONTIO SMTP Test',
      text: 'This is a test email from MONTIO system.',
      html: '<p>This is a <strong>test email</strong> from MONTIO system.</p>'
    });

    console.log('\n✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.command) console.error('Command:', error.command);
    if (error.response) console.error('Response:', error.response);
  }
}

testEmail();
