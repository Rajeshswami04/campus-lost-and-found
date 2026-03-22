import crypto from "crypto";
import User from "@/models/Users";
import nodemailer from "nodemailer";

type EmailType = "VERIFY" | "RESET";

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

    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const isVerifyEmail = emailType === "VERIFY";
    const path = isVerifyEmail ? "verifyemail" : "resetpassword";
    const subject = isVerifyEmail ? "Verify your email" : "Reset your password";
    const actionText = isVerifyEmail ? "verify your email" : "reset your password";

    const mailOptions = {
      from: "support@lostfound.com",
      to: email,
      subject,
      html: `<p>Click <a href="${process.env.DOMAIN}/${path}?token=${rawToken}">here</a> to ${actionText}.</p>`,
    };

    return await transport.sendMail(mailOptions);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
