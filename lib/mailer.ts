import bcryptjs from 'bcryptjs';
import User from "@/models/Users";
import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config();

export const sendEmail = async({email, emailType, userId}: any) => {
    try {
       
         const hashedToken = await bcryptjs.hash(userId.toString(), 10);

            await User.findByIdAndUpdate(userId, {
                verifyToken: hashedToken,
                verifyTokenExpiry: Date.now() + 3600000 // 1 hour expiry
            });
        


        const transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 2525,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
        });

    
        const mailOptions = {
            from: 'support@lostfound.com',
            to: email,
            subject:  "Verify your email" ,
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to 
            ${ "verify your email" }</p>`
        };

        const mailResponse = await transport.sendMail(mailOptions);
        return mailResponse;

} catch (error: any) {
        throw new Error(error.message);
    }
}