function reminderTemplate(invoice) {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #FF6347;">Hello ${invoice.billTo.clientName},</h2>
        <p>This is a friendly reminder that your invoice is due soon.</p>
        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Amount Due:</strong> R${invoice.amountDue}</p>
        <p><strong>Due Date:</strong> ${invoice.paymentDue}</p>
        <p>Please review your invoice and complete your payment by the due date to avoid any late fees. You can view and pay your invoice by clicking the button below:</p>
        <a href="#" style="padding: 10px 20px; background-color: #FF6347; color: #fff; text-decoration: none; border-radius: 5px;">View Invoice</a>
        <p>Thank you for your prompt attention to this matter. If you have any questions, feel free to reach out to us.</p>
        <p>Best regards,<br>Web DevSolution</p>
      </div>
    </body>
  </html>
        `;
}

export default reminderTemplate;