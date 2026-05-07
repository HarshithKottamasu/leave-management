const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a status-change email to the employee.
 * @param {Object} options
 * @param {string} options.to          - Employee email
 * @param {string} options.employeeName
 * @param {string} options.status      - 'approved' | 'rejected' | 'pending'
 * @param {Object} options.leave       - Leave document
 * @param {string} [options.reviewNote]
 */
async function sendLeaveStatusEmail({ to, employeeName, status, leave, reviewNote }) {
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const colorMap = { approved: '#1D9E75', rejected: '#E24B4A', pending: '#EF9F27' };
  const color = colorMap[status] || '#378ADD';

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #f9f9f7; border-radius: 12px; overflow: hidden;">
      <div style="background: #185FA5; padding: 28px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 600;">LeaveHub</h1>
        <p style="color: #B5D4F4; margin: 4px 0 0; font-size: 13px;">Employee Leave Management</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #444; font-size: 15px;">Hi <strong>${employeeName}</strong>,</p>
        <p style="color: #444; font-size: 15px;">Your leave request has been updated:</p>
        <div style="background: #fff; border-radius: 8px; border: 1px solid #e5e5e5; padding: 20px; margin: 20px 0;">
          <table style="width:100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="color:#888; padding: 6px 0;">Status</td>
              <td style="padding: 6px 0; text-align: right;">
                <span style="background: ${color}22; color: ${color}; padding: 3px 12px; border-radius: 20px; font-weight: 600;">${statusLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="color:#888; padding: 6px 0;">Leave type</td>
              <td style="padding: 6px 0; text-align: right; text-transform: capitalize;">${leave.leaveType}</td>
            </tr>
            <tr>
              <td style="color:#888; padding: 6px 0;">From</td>
              <td style="padding: 6px 0; text-align: right;">${new Date(leave.fromDate).toDateString()}</td>
            </tr>
            <tr>
              <td style="color:#888; padding: 6px 0;">To</td>
              <td style="padding: 6px 0; text-align: right;">${new Date(leave.toDate).toDateString()}</td>
            </tr>
            <tr>
              <td style="color:#888; padding: 6px 0;">Total days</td>
              <td style="padding: 6px 0; text-align: right;">${leave.totalDays} day(s)</td>
            </tr>
            ${reviewNote ? `<tr>
              <td style="color:#888; padding: 6px 0; vertical-align: top;">Manager note</td>
              <td style="padding: 6px 0; text-align: right; color: #444;">${reviewNote}</td>
            </tr>` : ''}
          </table>
        </div>
        <p style="color: #888; font-size: 13px;">If you have questions, contact your HR administrator.</p>
        <p style="color: #888; font-size: 12px; margin-top: 32px;">— LeaveHub Team</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject: `Leave Request ${statusLabel} — ${leave.leaveType} leave`,
    html,
  });
}

/**
 * Notify manager of a new leave request.
 */
async function sendManagerNotificationEmail({ to, managerName, employee, leave }) {
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background: #185FA5; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">New Leave Request</h1>
      </div>
      <div style="background: #f9f9f7; padding: 28px 32px; border-radius: 0 0 12px 12px;">
        <p style="color: #444;">Hi <strong>${managerName}</strong>,</p>
        <p style="color: #444;"><strong>${employee.name}</strong> has submitted a new leave request requiring your approval.</p>
        <div style="background: #fff; border-radius: 8px; border: 1px solid #e5e5e5; padding: 20px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 14px; color: #444;"><strong>Type:</strong> ${leave.leaveType}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #444;"><strong>From:</strong> ${new Date(leave.fromDate).toDateString()}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #444;"><strong>To:</strong> ${new Date(leave.toDate).toDateString()}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #444;"><strong>Days:</strong> ${leave.totalDays}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #444;"><strong>Reason:</strong> ${leave.reason}</p>
        </div>
        <p style="color: #888; font-size: 13px;">Please log in to LeaveHub to review.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject: `Action Required: Leave request from ${employee.name}`,
    html,
  });
}

module.exports = { sendLeaveStatusEmail, sendManagerNotificationEmail };