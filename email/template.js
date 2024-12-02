function template(invoice) {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50;">Hello ${invoice.clientName},</h2>
        <p>We’re pleased to inform you that your invoice has been successfully created.</p>
        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber.toUpperCase()}</p>
        <p><strong>Amount Due:</strong> R${invoice.amountDue}</p>
        <p><strong>Due Date:</strong> ${invoice.paymentDue}</p>
        <p>Please check the attached invoice for detailed information.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">If you need any assistance or have questions, feel free to contact us at <a href="mailto:support@webdevsolution.com">support@webdevsolution.com</a>.</p>
        <p style="font-size: 12px; color: #888;">Thank you for choosing our services.</p>
      </div>
    </body>
  </html>
  `;
}

export default template;
