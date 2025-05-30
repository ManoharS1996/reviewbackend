const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // Define email options
  const mailOptions = {
    from: `Deployment Manager <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

const sendDeploymentNotification = async (schedule, developers) => {
  const formattedDate = new Date(schedule.deploymentDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1976d2; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">New Deployment Scheduled</h1>
      </div>
      <div style="padding: 20px;">
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 5px 0; color: #333;">Application Details</h3>
          <p style="margin: 0;"><strong>Application:</strong> ${schedule.appName}</p>
          <p style="margin: 0;"><strong>Scheduled Date:</strong> ${formattedDate}</p>
          <p style="margin: 0;"><strong>Timings:</strong> ${schedule.timings}</p>
          <p style="margin: 0;"><strong>Status:</strong> ${schedule.status}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 5px 0; color: #333;">Assigned Developers</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${developers.map(dev => `<li>${dev}</li>`).join('')}
          </ul>
        </div>
        
        ${schedule.notes ? `
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 5px 0; color: #333;">Additional Notes</h3>
          <p style="margin: 0; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${schedule.notes}</p>
        </div>
        ` : ''}
        
        <div style="margin-top: 20px; text-align: center;">
          <p>Please prepare accordingly and ensure all necessary checks are completed before deployment.</p>
          <p style="color: #666; font-size: 0.9em;">This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
      <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 0.8em; color: #666;">
        Deployment Management System
      </div>
    </div>
  `;

  try {
    await sendEmail({
      email: process.env.NOTIFICATION_EMAIL || developers.map(d => `${d.split(' ')[0].toLowerCase()}@wonhubs.com`),
      subject: `[Action Required] Deployment Scheduled: ${schedule.appName} on ${formattedDate}`,
      html: message
    });

    return developers;
  } catch (err) {
    console.error('Email sending error:', err);
    throw new Error('Failed to send deployment notifications');
  }
};

module.exports = {
  sendEmail,
  sendDeploymentNotification
};