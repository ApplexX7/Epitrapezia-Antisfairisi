import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });


export async function SendEmail(to:string, subject: string, html : string) {
    try{
        const info = await transporter.sendMail({
            from: `"πινγκ-πονγκ" <mr.mhdhilali@gmail.com>"`,
            to,
            subject,
            html,
        });
        return info;
    }catch (err){
        throw err;
    }
}