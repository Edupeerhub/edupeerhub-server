// Common header (brand-aligned)
const emailHeader = (title, color = "#2D9A95") => `
  <div style="background: ${color}; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">${title}</h1>
  </div>
`;

// Common footer
const emailFooter = `
  <div style="text-align: center; margin-top: 20px; color: #555; font-size: 0.8em;">
    <p style="margin: 0;">This is an automated message, please do not reply to this email.</p>
    <p style="margin: 0;">© ${new Date().getFullYear()} Edupeerhub</p>
  </div>
`;

// Wrapper (brand background)
const emailWrapper = (title, content, headerColor) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #000000; max-width: 600px; margin: 0 auto; padding: 20px; background: #E7F6FB;">
  ${emailHeader(title, headerColor)}
  <div style="background-color: white; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    ${content}
  </div>
  ${emailFooter}
</body>
</html>
`;

// Specific templates
exports.VERIFICATION_EMAIL_TEMPLATE = (verificationCode) =>
  emailWrapper(
    "Verify Your Email",
    `
      <p>Hello,</p>
      <p>Thank you for signing up! Your verification code is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">${verificationCode}</span>
      </div>
      <p>Enter this code on the verification page to complete your registration.</p>
      <p>This code will expire in 1 hour for security reasons.</p>
      <p>If you didn't create an account with us, please ignore this email.</p>
      <p>Best regards,<br>Edupeerhub</p>
    `
  );

exports.PASSWORD_RESET_REQUEST_TEMPLATE = (resetURL) =>
  emailWrapper(
    "Password Reset",
    `
      <p>Hello,</p>
      <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
      <p>To reset your password, click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>Best regards,<br>Edupeerhub</p>
    `
  );

exports.PASSWORD_RESET_SUCCESS_TEMPLATE = () =>
  emailWrapper(
    "Password Reset Successful",
    `
      <p>Hello,</p>
      <p>We're writing to confirm that your password has been successfully reset.</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
          ✓
        </div>
      </div>
      <p>If you did not initiate this password reset, please contact our support team immediately.</p>
      <p>For security reasons, we recommend that you:</p>
      <ul>
        <li>Use a strong, unique password</li>
        <li>Avoid using the same password across multiple sites</li>
      </ul>
      <p>Thank you for helping us keep your account secure.</p>
      <p>Best regards,<br>Edupeerhub</p>
    `
  );

exports.PASSWORD_CHANGE_SUCCESS_TEMPLATE = () =>
  emailWrapper(
    "Password Change Successful",
    ` 
      <p>Hello,</p>
      <p>We're writing to confirm that your password has been successfully changed.</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
          ✓
        </div>
      </div>
      <p>If you did not initiate this password change, please contact our support team immediately.</p>
      <p>For security reasons, we recommend that you:</p>
      <ul>
        <li>Use a strong, unique password</li>
        <li>Avoid using the same password across multiple sites</li>
      </ul>
      <p>Thank you for helping us keep your account secure.</p>
      <p>Best regards,<br>Edupeerhub</p>
  `
  );

exports.UNREAD_MESSAGE_TEMPLATE = (
  userName,
  unreadCount,
  senderNames,
  appURL
) =>
  emailWrapper(
    "Unread Messages",
    `
      <p>Hello ${userName},</p>
      <p>You have <strong>{unreadCount}</strong> unread message{unreadCount > 1 ? 's' : ''} waiting for you!</p>
      <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Unread Messages:</strong> ${unreadCount}</p>
        <p style="margin: 5px 0 0 0;"><strong>From:</strong> ${senderNames}</p>
      </div>
      <p>Don't miss out on important conversations. Log in to read your messages now!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appURL}" style="background-color: #FF9800; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Read Messages</a>
      </div>
      <p>Best regards,<br>Edupeerhub</p>
  `
  );

exports.TUTOR_APPROVAL_TEMPLATE = (name) =>
  emailWrapper(
    "Welcome to Edupeerhub!",
    `
        <p>Hi ${name},</p>
        <p>Congratulations! 🎉 Your tutor application has been reviewed and <strong>approved</strong>.</p>
        <p>You can now log in to your account and start connecting with students.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://edupeerhub.com/dashboard" style="background-color: #2D9A95; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
        </div>
        <p>We’re excited to have you on board and can’t wait to see the impact you’ll make!</p>
        <p>Best regards,<br>Edupeerhub Team</p>
      `
  );

exports.TUTOR_REJECTION_TEMPLATE = (name, reason) =>
  emailWrapper(
    "Application Update",
    `
          <p>Hi ${name},</p>
          <p>We appreciate your interest in becoming a tutor at Edupeerhub. After careful review, we regret to inform you that your application has not been approved at this time.</p>
          <p><strong>Reason provided:</strong></p>
          <blockquote style="background: #fff; border-left: 4px solid #e53935; margin: 15px 0; padding: 10px 15px; color: #555;">
            ${reason || "No specific reason provided."}
          </blockquote>
          <p>You’re welcome to update your application and reapply in the future.</p>
          <p>Thank you for your interest and understanding.</p>
          <p>Best regards,<br>Edupeerhub Team</p>
        `,
    "#e53935" // red rejection header
  );

// emailTemplates.js
exports.CALL_REMINDER_TEMPLATE = (role, url, type) =>
  emailWrapper(
    "Session Reminder",
    `
<p>Dear ${role},</p>
<p>This is a ${type.toLowerCase()} reminder for your upcoming tutoring session.</p>
<p><a href="${url}" target="_blank">Join Session</a></p>
<p>Best regards,<br/>Edupeerhub Team</p>
`
  );
