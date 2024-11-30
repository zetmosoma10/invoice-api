function resetPasswordTemplate(user, link) {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #FF6347;">Hello ${user.firstName},</h2>
        <p>We received a request to reset your password. If you didn't request this change, you can safely ignore this email.</p>
        <p>Otherwise, you can reset your password by clicking the button below:</p>
        <a href="${link}" style="padding: 10px 20px; margin-top: 12px ;background-color: #FF6347; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>Please note: This link will expire in 15 minutes for your security.</p>
        <p>Thank you for keeping your account secure.</p>
        <p>Best regards,<br>Web DevSolution</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">If you need help or have questions, contact us at <a href="mailto:support@webdevsolution.com">support@webdevsolution.com</a>.</p>
      </div>
    </body>
  </html>
`;
}

export default resetPasswordTemplate;
