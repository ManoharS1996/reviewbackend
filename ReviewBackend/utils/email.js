const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

const getStatusColor = (status) => {
  switch (status) {
    case 'Scheduled': return '#1976d2';
    case 'In Progress': return '#ff9800';
    case 'Completed': return '#4caf50';
    case 'Failed': return '#f44336';
    default: return '#9e9e9e';
  }
};

const sendStatusNotification = async (schedule, newStatus) => {
  try {
    const formattedDate = new Date(schedule.deploymentDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const statusColor = getStatusColor(newStatus);

    const mailOptions = {
      from: `Deployment Manager <${process.env.FROM_EMAIL}>`,
      to: schedule.developers.join(','),
      subject: `[Deployment Update] ${schedule.appName} status changed to ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Deployment Status Update</h1>
          </div>
          <div style="padding: 20px;">
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0 0 5px 0; color: #333;">Application Details</h3>
              <p style="margin: 0;"><strong>Application:</strong> ${schedule.appName}</p>
              <p style="margin: 0;"><strong>Scheduled Date:</strong> ${formattedDate}</p>
              <p style="margin: 0;"><strong>Time Slot:</strong> ${schedule.timeSlot}</p>
              <p style="margin: 0;"><strong>New Status:</strong> 
                <span style="color: ${statusColor}; font-weight: bold;">${newStatus}</span>
              </p>
              ${schedule.failureReason && newStatus === 'Failed' ? `
                <p style="margin: 0;"><strong>Failure Reason:</strong> ${schedule.failureReason}</p>
              ` : ''}
            </div>
            
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0 0 5px 0; color: #333;">Assigned Developers</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${schedule.developers.map(dev => `<li>${dev}</li>`).join('')}
              </ul>
            </div>
            
            ${schedule.notes ? `
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0 0 5px 0; color: #333;">Additional Notes</h3>
              <p style="margin: 0; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${schedule.notes}</p>
            </div>
            ` : ''}
          </div>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 0.8em; color: #666;">
            Deployment Management System
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return schedule.developers;
  } catch (err) {
    console.error('Email sending error:', err);
    throw new Error('Failed to send status notifications');
  }
};

module.exports = {
  sendStatusNotification
};