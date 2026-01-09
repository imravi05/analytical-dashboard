import { emailTemplate,welcomeEmailTemplate } from "../utils/emailTemplate.js";
import { transporter } from "./emailConfig.js";

export const sendVerificationCode = async(email , verificationOTP) => {
    try {
        const res = await transporter.sendMail({
              from: '"FarmsEasy Team" <imravishinde@gmail.com>',
              to: email,
              subject: "verify your email",
              text: "verify your email",
              html: emailTemplate(verificationOTP),
          });
            console.log("Message sent:", res.messageId);
            console.log(`Verification code sent to ${email}: ${verificationOTP}`);
        
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

export const sendWelcomeEmail = async(email, name) => {
    try {
        const res = await transporter.sendMail({
              from: '"FarmsEasy Team" <imravishinde@gmail.com>',
                to: email,
                subject: "Welcome to FarmsEasy!",
                text: "Welcome to FarmsEasy!",
                html: welcomeEmailTemplate(name),
          });
            console.log("Welcome email sent:", res.messageId);
            console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
}