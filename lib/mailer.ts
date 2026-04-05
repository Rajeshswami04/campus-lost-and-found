import crypto from "crypto";
import User from "@/models/Users";
import nodemailer from "nodemailer";

type EmailType = "VERIFY" | "RESET";

function getBaseUrl() {
  return (process.env.DOMAIN || "http://localhost:3000").replace(/\/$/, "");
}

function createTransporter() {
  const service = process.env.SMTP_SERVICE;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error(
      "Email service is not configured. Please set SMTP_USER and SMTP_PASS."
    );
  }

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: {
        user,
        pass,
      },
    });
  }

  const host = process.env.SMTP_HOST;
  if (!host) {
    throw new Error(
      "Email service is not configured. Please set SMTP_SERVICE or SMTP_HOST."
    );
  }

  const port = Number(process.env.SMTP_PORT) || 587;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export const sendEmail = async ({
  email,
  emailType,
  userId,
}: {
  email: string;
  emailType: EmailType;
  userId: string;
}) => {
  try {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const tokenExpiry = new Date(Date.now() + 3600000);

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: tokenExpiry,
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: tokenExpiry,
      });
    }

    const isVerifyEmail = emailType === "VERIFY";
    const path = isVerifyEmail ? "verifyemail" : "resetpassword";
    const subject = isVerifyEmail ? "Verify your email" : "Reset your password";
    const actionText = isVerifyEmail ? "verify your email" : "reset your password";
    const actionUrl = `${getBaseUrl()}/${path}?token=${rawToken}`;
    const transport = createTransporter();

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin-bottom: 12px;">Lost & Found</h2>
          <p>Click the button below to ${actionText}.</p>
          <p style="margin: 24px 0;">
            <a
              href="${actionUrl}"
              style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; display: inline-block;"
            >
              ${isVerifyEmail ? "Verify Email" : "Reset Password"}
            </a>
          </p>
          <p>If the button does not work, open this link:</p>
          <p><a href="${actionUrl}">${actionUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    };

    return await transport.sendMail(mailOptions);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to send email";
    throw new Error(message);
  }
};
