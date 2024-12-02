function passwordSuccessTemplate(user) {
  return `
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #4CAF50;">Password Reset Confirmation</h2>
                <p>Hello ${user.firstName},</p>
                <p>We wanted to let you know that your password was successfully reset. If you made this change, no further action is required.</p>
                <p>If you didn’t request this change, please contact our support team immediately to secure your account.</p>
                <p>Thank you for using our service.</p>
                <p>Best regards,<br>WebDev Solutions</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #888;">If you need help or have questions, contact us at <a href="mailto:support@webdevsolution.com">support@webdevsolution.com</a>.</p>
                </div>
            </body>
        </html>
    `;
}

export default passwordSuccessTemplate;
