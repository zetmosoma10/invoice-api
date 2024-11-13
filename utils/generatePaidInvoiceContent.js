function generatePaidInvoiceContent(clientName, invoiceNumber, amoutDue) {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50;">Hello ${clientName},</h2>
        <p>We’re delighted to inform you that your recent invoice payment has been received.</p>
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Amount Paid:</strong> R${amoutDue}</p>
        <p>Your account balance is now updated. Thank you for your prompt payment and for trusting us with your business.</p>
        <p>Best regards,<br>Web DevSolution</p>
      </div>
    </body>
  </html>
        `;
}

export default generatePaidInvoiceContent;
