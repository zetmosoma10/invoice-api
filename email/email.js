import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: "Digital Web App",
      address: process.env.EMAIL_USER,
    },
    to: options.clientEmail,
    subject: options.subject,
    html: options.htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
