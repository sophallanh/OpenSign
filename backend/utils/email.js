const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = async (to, subject, text, html) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    text,
    html
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

exports.sendDocumentSignatureRequest = async (to, documentTitle, signUrl, senderName) => {
  const subject = `Signature Request: ${documentTitle}`;
  const text = `${senderName} has requested your signature on "${documentTitle}". Please visit: ${signUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Signature Request</h2>
      <p>Hello,</p>
      <p><strong>${senderName}</strong> has requested your signature on the following document:</p>
      <h3 style="color: #0066cc;">${documentTitle}</h3>
      <p>
        <a href="${signUrl}" 
           style="background-color: #0066cc; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Sign Document
        </a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        If you have any questions, please contact the sender directly.
      </p>
    </div>
  `;

  return await this.sendEmail(to, subject, text, html);
};

exports.sendCommissionNotification = async (to, amount, leadName) => {
  const subject = `Commission Earned: $${amount.toFixed(2)}`;
  const text = `Congratulations! You've earned a commission of $${amount.toFixed(2)} for the lead "${leadName}".`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Congratulations!</h2>
      <p>You've earned a commission for your referral:</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
        <h3 style="color: #333; margin: 0 0 10px 0;">Lead: ${leadName}</h3>
        <p style="font-size: 24px; color: #28a745; margin: 0;">
          <strong>$${amount.toFixed(2)}</strong>
        </p>
      </div>
      <p>Thank you for your continued partnership!</p>
    </div>
  `;

  return await this.sendEmail(to, subject, text, html);
};
