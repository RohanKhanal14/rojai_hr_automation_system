//Imports
import nodemailer from "nodemailer";
//Config — lazy singleton so env vars are read after dotenv.config() runs
let _transporter = null;
const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_API_KEY,
      },
    });
  }
  return _transporter;
};
//Helper Function
const mailer = async (mailingInfo) => {
  if (!mailingInfo.type || !mailingInfo.receiver) {
    throw new Error(
      "Must provide the mail's type and the receiver info to invoke mailing functions.",
    );
  }
  if (mailingInfo.type === "verifyAccount") {
    if (!mailingInfo.otp) {
      throw new Error("Must provide the otp value to be sent.");
    }
    await sendOtpMail(mailingInfo);
  } else if (mailingInfo.type === "welcomeUser") {
    await sendWelcomeMail(mailingInfo);
  } else if (mailingInfo.type === "resetOtp") {
    if (!mailingInfo.otp) {
      throw new Error("Must provide the otp value to be sent.");
    }
    await sendResetPasswordMail(mailingInfo);
  } else if (mailingInfo.type === "passwordResetMail") {
    await sendPasswordResetSuccessMail(mailingInfo);
  } else if (mailingInfo.type === "shortlistedForInterview") {
    await sendShortlistInterviewMail(mailingInfo);
  }
};
//Mailing Functions
const sendOtpMail = async (mailingInfo) => {
  try {
    const info = await getTransporter().sendMail({
      from: process.env.SENDER_EMAIL,
      to: mailingInfo.receiver,
      subject: "Verify your Account",
      html: `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Account Verification</title>
            <style>
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    background-color: #f4f6f8;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 500px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .header h2 {
                    color: #333;
                    margin: 0;
                }   
                .otp-box {
                    font-size: 28px;
                    letter-spacing: 6px;
                    font-weight: bold;
                    background: #f1f5ff;
                    color: #2d4fff;
                    padding: 15px;
                    text-align: center;
                    border-radius: 6px;
                    margin: 20px 0;
                }
                .info {
                    font-size: 14px;
                    color: #555;
                    line-height: 1.6;
                }
                .warning {
                    margin-top: 20px;
                    padding: 12px;
                    background: #fff4e5;
                    border-left: 4px solid #ffa726;
                    font-size: 13px;
                    color: #444;
                }
                .footer {
                    margin-top: 25px;
                    font-size: 12px;
                    color: #888;
                    text-align: center;
                }
                .company-name {
                    font-weight: bold;
                }
            </style>
        </head>

        <body>

            <div class="container">

                <div class="header">
                    <h2>Verify Your Account</h2>
                </div>

                <p class="info">
                    Thank you for signing up with <span class="company-name">Yukti.Exe</span>! Please use the One-Time Password (OTP) below to verify your account.
                </p>

                <div class="otp-box">
                    ${mailingInfo.otp}
                </div>

                <p class="info">
                    This OTP is valid for <strong>5 minutes</strong>.
                </p>

                <div class="warning">
                    ⚠️ You have a maximum of <strong>5 attempts</strong> to enter the correct OTP.  
                    If verification fails or the OTP expires, you will need to sign up again.
                </div>

                <p class="info">
                    If you did not request this verification, please ignore this email.
                </p>

                <div class="footer">
                    © 2026 <span class="company-name">Yukti.Exe</span>. All rights reserved.
                </div>

            </div>

        </body>
    </html>
    `,
    });
    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Unable to send the mail from nodemailer.", error.message);
    throw error;
  }
};
const sendWelcomeMail = async (mailingInfo) => {
  try {
    const info = await getTransporter().sendMail({
      from: process.env.SENDER_EMAIL,
      to: mailingInfo.receiver,
      subject: "Welcome to the application. User Onboarding!",
      html: `
        <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <title>Welcome to Yukti.Exe</title>
                <style>
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        background-color: #f4f6f8;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 500px;
                        margin: 40px auto;
                        background: #ffffff;
                        border-radius: 8px;
                        padding: 30px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .header h2 {
                        color: #333;
                        margin: 0;
                    }
                    .content {
                        font-size: 14px;
                        color: #555;
                        line-height: 1.6;
                    }
                    .highlight {
                        font-weight: bold;
                        color: #2d4fff;
                    }
                    .footer {
                        margin-top: 25px;
                        font-size: 12px;
                        color: #888;
                        text-align: center;
                    }
                    .company-name {
                        font-weight: bold;
                    }
                </style>
            </head>

            <body>
                <div class="container">

                    <div class="header">
                        <h2>Welcome to <span class="company-name">Yukti.Exe</span>!</h2>
                    </div>

                    <p class="content">
                        Congratulations! Your account has been successfully verified. You can now fully access and use all features of the <span class="company-name">Yukti.Exe</span> platform.
                    </p>

                    <p class="content">
                        We’re excited to have you on board. If you need any assistance or have questions, feel free to reach out to our support team.
                    </p>

                    <p class="content highlight">
                        Enjoy your experience and make the most out of <span class="company-name">Yukti.Exe</span>!
                    </p>

                    <div class="footer">
                        © 2026 <span class="company-name">Yukti.Exe</span>. All rights reserved.
                    </div>

                </div>
            </body>
        </html>
`,
    });
    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Unable to send the mail from nodemailer.", error.message);
    throw error;
  }
};
const sendResetPasswordMail = async (mailingInfo) => {
  try {
    const info = await getTransporter().sendMail({
      from: process.env.SENDER_EMAIL,
      to: mailingInfo.receiver,
      subject: "Password Reset OTP - Yukti.Exe",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <title>Password Reset - Yukti.Exe</title>
            <style>
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    background-color: #f4f6f8;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 500px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .header h2 {
                    color: #333;
                    margin: 0;
                }
                .content {
                    font-size: 14px;
                    color: #555;
                    line-height: 1.6;
                    margin-bottom: 15px;
                }
                .otp-box {
                    text-align: center;
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 6px;
                    color: #2d4fff;
                    background: #f1f3ff;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                }
                .warning {
                    background: #fff3cd;
                    color: #856404;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    margin-top: 15px;
                }
                .footer {
                    margin-top: 25px;
                    font-size: 12px;
                    color: #888;
                    text-align: center;
                }
                .company-name {
                    font-weight: bold;
                }
            </style>
        </head>

        <body>
            <div class="container">

                <div class="header">
                    <h2>Password Reset Request</h2>
                </div>

                <p class="content">
                    We received a request to reset your password for your 
                    <span class="company-name">Yukti.Exe</span> account.
                </p>

                <p class="content">
                    Please use the following One-Time Password (OTP) to continue:
                </p>

                <div class="otp-box">
                    ${mailingInfo.otp}
                </div>

                <div class="warning">
                    ⚠ <strong>Important Security Information</strong><br><br>
                    • This OTP will expire in <strong>5 minutes</strong>.<br>
                    • You have only <strong>5 attempts</strong> to enter the correct OTP.<br>
                    • If the OTP expires or the attempts are exceeded, you must start the password reset process again.
                </div>

                <p class="content">
                    If you did not request a password reset, please ignore this email or contact support immediately.
                </p>

                <div class="footer">
                    © 2026 <span class="company-name">Yukti.Exe</span>. All rights reserved.
                </div>

            </div>
        </body>
        </html>
      `,
    });
    console.log("Reset OTP mail sent:", info.messageId);
  } catch (error) {
    console.error("Unable to send reset password mail.", error.message);
    throw error;
  }
};
const sendPasswordResetSuccessMail = async (mailingInfo) => {
  try {
    const info = await getTransporter().sendMail({
      from: process.env.SENDER_EMAIL,
      to: mailingInfo.receiver,
      subject: "Password Successfully Reset - Yukti.Exe",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <title>Password Reset Successful - Yukti.Exe</title>
            <style>
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    background-color: #f4f6f8;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 500px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .header h2 {
                    color: #333;
                    margin: 0;
                }
                .content {
                    font-size: 14px;
                    color: #555;
                    line-height: 1.6;
                    margin-bottom: 15px;
                }
                .success-box {
                    background: #e6f7ee;
                    color: #1e7e34;
                    padding: 14px;
                    border-radius: 6px;
                    font-size: 14px;
                    margin: 20px 0;
                    text-align: center;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 25px;
                    font-size: 12px;
                    color: #888;
                    text-align: center;
                }
                .company-name {
                    font-weight: bold;
                }
            </style>
        </head>

        <body>
            <div class="container">

                <div class="header">
                    <h2>Password Updated Successfully</h2>
                </div>

                <p class="content">
                    Your password for the 
                    <span class="company-name">Yukti.Exe</span> account has been successfully reset.
                </p>

                <div class="success-box">
                    ✅ Your new password is now active.
                </div>

                <p class="content">
                    You can now use your new password to log in to the system.
                </p>

                <p class="content">
                    If you did not perform this password reset, please contact support immediately to secure your account.
                </p>

                <div class="footer">
                    © 2026 <span class="company-name">Yukti.Exe</span>. All rights reserved.
                </div>

            </div>
        </body>
        </html>
      `,
    });
    console.log("Password reset confirmation mail sent:", info.messageId);
  } catch (error) {
    console.error(
      "Unable to send password reset confirmation mail.",
      error.message,
    );
    throw error;
  }
};

const sendShortlistInterviewMail = async (mailingInfo) => {
  try {
    const candidateName = mailingInfo.candidateName || "Candidate";
    const positionName = mailingInfo.position || "the selected role";

    const info = await getTransporter().sendMail({
      from: process.env.SENDER_EMAIL,
      to: mailingInfo.receiver,
      subject: `Shortlisted for Interview - ${positionName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <title>Interview Shortlist - Yukti.Exe</title>
            <style>
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    background-color: #f4f6f8;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 500px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .header h2 {
                    color: #1f2937;
                    margin: 0;
                }
                .content {
                    font-size: 14px;
                    color: #4b5563;
                    line-height: 1.6;
                }
                .highlight {
                    margin: 16px 0;
                    padding: 12px;
                    border-radius: 6px;
                    background: #ecfdf5;
                    color: #065f46;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 25px;
                    font-size: 12px;
                    color: #888;
                    text-align: center;
                }
                .company-name {
                    font-weight: bold;
                }
            </style>
        </head>

        <body>
            <div class="container">

                <div class="header">
                    <h2>Interview Shortlist Update</h2>
                </div>

                <p class="content">Hi ${candidateName},</p>

                <p class="content">
                    Great news. You have been shortlisted for the interview stage at <span class="company-name">Yukti.Exe</span>.
                </p>

                <div class="highlight">
                    Position: ${positionName}
                </div>

                <p class="content">
                    Please log in to your candidate dashboard and complete your interview from the application details page.
                </p>

                <p class="content">
                    Best of luck. We look forward to your interview.
                </p>

                <div class="footer">
                    © 2026 <span class="company-name">Yukti.Exe</span>. All rights reserved.
                </div>

            </div>
        </body>
        </html>
      `,
    });

    console.log("Shortlist mail sent:", info.messageId);
  } catch (error) {
    console.error("Unable to send shortlist mail.", error.message);
    throw error;
  }
};
//Export
export default mailer;
