import dayjs from "dayjs";

function paidTemplate(invoice) {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50;">Hello ${invoice.clientName},</h2>
        <p>We’re delighted to inform you that your recent invoice payment has been received.</p>
        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber.toUpperCase()}</p>
        <p><strong>Amount Paid:</strong> R${invoice.amountDue}</p>
        <p><strong>Date Paid:</strong> ${dayjs(invoice.paidAt).format(
          "DD MMM, YYYY"
        )}</p>
        <p>Your account balance is now updated. Thank you for your prompt payment and for trusting us with your business.</p>
        <p>Best regards,<br>Web DevSolution</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">If you need help or have questions, contact us at <a href="mailto:support@webdevsolution.com">support@webdevsolution.com</a>.</p>
      </div>
    </body>
  </html>
        `;
}

export default paidTemplate;
