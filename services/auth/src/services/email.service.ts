import nodemailer from 'nodemailer';

const LOG_PREFIX = '[EmailService]';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  async initialize(): Promise<void> {
    console.info(`${LOG_PREFIX} Initializing email transporter`);
    
    // Check if SMTP credentials are configured
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      console.info(`${LOG_PREFIX} Transporter initialized with configured SMTP`, { 
        host: process.env.SMTP_HOST || 'smtp.ethereal.email' 
      });
    } else {
      // Create test account with Ethereal
      console.info(`${LOG_PREFIX} No SMTP credentials found, creating Ethereal test account`);
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.info(`${LOG_PREFIX} Ethereal test account created`, { user: testAccount.user });
    }
  }

  async sendEmail(options: EmailOptions): Promise<string | null> {
    console.info(`${LOG_PREFIX} Sending email`, { to: options.to, subject: options.subject });
    
    if (!this.transporter) {
      await this.initialize();
    }

    if (!this.transporter) {
      console.error(`${LOG_PREFIX} Email transporter not initialized`);
      return null;
    }

    try {
      const info = await this.transporter.sendMail({
        from: '"Performance Tool" <noreply@performancetool.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      });

      console.info(`${LOG_PREFIX} Email sent successfully`, { 
        messageId: info.messageId, 
        to: options.to 
      });

      // Get preview URL for Ethereal
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.info(`${LOG_PREFIX} Email preview URL`, { previewUrl });
      }

      return info.messageId;
    } catch (error) {
      console.error(`${LOG_PREFIX} Failed to send email`, { 
        to: options.to, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    console.info(`${LOG_PREFIX} Sending password reset email`, { email });
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    const result = await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    const success = result !== null;
    if (success) {
      console.info(`${LOG_PREFIX} Password reset email sent successfully`, { email });
    } else {
      console.error(`${LOG_PREFIX} Failed to send password reset email`, { email });
    }
    
    return success;
  }
}

export const emailService = new EmailService();
