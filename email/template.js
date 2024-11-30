function template(invoice) {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50;">Hello ${invoice.clientName},</h2>
        <p>We’re pleased to let you know that your invoice has been successfully created.</p>
        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber.toUpperCase()}</p>
        <p><strong>Amount Due:</strong> R${invoice.amountDue}</p>
        <p><strong>Due Date:</strong> ${invoice.paymentDue}</p>
        <p>To view your invoice, click the button below:</p>
        <a href="#" style="padding: 10px 20px; margin-top: 12px ;background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">View Invoice</a>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">If you need help or have questions, contact us at <a href="mailto:support@webdevsolution.com">support@webdevsolution.com</a>.</p> 
      </div>
    </body>
  </html>
        `;
}

export default template;
