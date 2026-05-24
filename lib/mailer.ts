import nodemailer from "nodemailer";
export async function sendOtp(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Your InkVerse login OTP",
    text: `Your OTP is ${code}. It expires in 10 minutes.`,
    html: `<div style="background:#07070b;color:white;padding:24px;font-family:Arial"><h2>InkVerse OTP</h2><p>Your login code is:</p><div style="font-size:32px;letter-spacing:8px;font-weight:700">${code}</div><p>This expires in 10 minutes.</p></div>`
  });
}
