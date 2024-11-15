import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "zetmosoma10@gmail.com",
    to: options.clientEmail,
    subject: options.subject,
    html: options.htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
