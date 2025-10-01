// Common header (brand-aligned)
const emailHeader = (title, color = "#E7F6FB") => `
  <div style="background: ${color}; padding: 20px; text-align: center;">
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
      <img src="https://edupeerhub.com/images/edupeerhub-logo.svg" 
           alt="Edupeerhub Logo" 
           style="height: 40px;" />
      <span style="font-size: 24px; font-weight: bold; 
                   font-family: Poppins, Arial, sans-serif; 
                   color: #1B8FF1;">
        edupeerhub
      </span>
    </div>
    <h1 style="color: #2C3A47; margin: 10px 0 0; 
               font-size: 20px; font-family: Poppins, Arial, sans-serif;">
      ${title}
    </h1>
  </div>
`;

// Common footer
const emailFooter = `
  <div style="text-align: center; margin-top: 20px; 
              color: #2C3A47; font-size: 0.8em; font-family: Roboto, Arial, sans-serif;">
    <p style="margin: 0;">This is an automated message, please do not reply.</p>
    <p style="margin: 0;">© ${new Date().getFullYear()} edupeerhub</p>
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
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: Roboto, Arial, sans-serif; line-height: 1.6; color: #2C3A47; max-width: 600px; margin: 0 auto; padding: 20px; background: #E9EEF3;">
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
      <p style="font-family: Roboto, Arial, sans-serif;">Hello,</p>
      <p style="font-family: Roboto, Arial, sans-serif;">Thank you for signing up! Your verification code is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CA1F0;">${verificationCode}</span>
      </div>
      <p style="font-family: Roboto, Arial, sans-serif;">Enter this code on the verification page to complete your registration.</p>
      <p style="font-family: Roboto, Arial, sans-serif;">This code will expire in 1 hour for security reasons.</p>
      <p style="font-family: Roboto, Arial, sans-serif;">If you didn't create an account with us, please ignore this email.</p>
      <p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br>Edupeerhub</p>
    `
  );

exports.PASSWORD_RESET_REQUEST_TEMPLATE = (resetURL) =>
  emailWrapper(
    "Password Reset",
    `
      <p style="font-family: Roboto, Arial, sans-serif;">Hello,</p>
      <p style="font-family: Roboto, Arial, sans-serif;">We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
      <p style="font-family: Roboto, Arial, sans-serif;">To reset your password, click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetURL}" style="background-color: #4CA1F0; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-family: Poppins, Arial, sans-serif; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-family: Roboto, Arial, sans-serif;">This link will expire in 15 minutes for security reasons.</p>
      <p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br>Edupeerhub</p>
    `
  );

exports.PASSWORD_RESET_SUCCESS_TEMPLATE = () =>
  emailWrapper(
    "Password Reset Successful",
    `
      <p style="font-family: Roboto, Arial, sans-serif;">Hello,</p>
      <p style="font-family: Roboto, Arial, sans-serif;">We're writing to confirm that your password has been successfully reset.</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #4CA1F0; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
          ✓
        </div>
      </div>
      <p style="font-family: Roboto, Arial, sans-serif;">If you did not initiate this password reset, please contact our support team immediately.</p>
      <p style="font-family: Roboto, Arial, sans-serif;">For security reasons, we recommend that you:</p>
      <ul style="font-family: Roboto, Arial, sans-serif;">
        <li>Use a strong, unique password</li>
        <li>Avoid using the same password across multiple sites</li>
      </ul>
      <p style="font-family: Roboto, Arial, sans-serif;">Thank you for helping us keep your account secure.</p>
      <p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br>Edupeerhub</p>
    `
  );

exports.PASSWORD_CHANGE_SUCCESS_TEMPLATE = () =>
  emailWrapper(
    "Password Change Successful",
    ` 
      <p style="font-family: Roboto, Arial, sans-serif;">Hello,</p>
      <p style="font-family: Roboto, Arial, sans-serif;">We're writing to confirm that your password has been successfully changed.</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #4CA1F0; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
          ✓
        </div>
      </div>
      <p style="font-family: Roboto, Arial, sans-serif;">If you did not initiate this password change, please contact our support team immediately.</p>
      <p style="font-family: Roboto, Arial, sans-serif;">For security reasons, we recommend that you:</p>
      <ul style="font-family: Roboto, Arial, sans-serif;">
        <li>Use a strong, unique password</li>
        <li>Avoid using the same password across multiple sites</li>
      </ul>
      <p style="font-family: Roboto, Arial, sans-serif;">Thank you for helping us keep your account secure.</p>
      <p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br>Edupeerhub</p>
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
        <p style="font-family: Roboto, Arial, sans-serif;">Hello ${userName},</p>
        <p style="font-family: Roboto, Arial, sans-serif;">You have <strong>${unreadCount}</strong> unread message${unreadCount > 1 ? "s" : ""} waiting for you!</p>
        <div style="background-color: #E7F6FB; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-family: Roboto, Arial, sans-serif;"><strong>Unread Messages:</strong> ${unreadCount}</p>
          <p style="margin: 5px 0 0 0; font-family: Roboto, Arial, sans-serif;"><strong>From:</strong> ${senderNames || "Unknown sender"}</p>
        </div>
        <p style="font-family: Roboto, Arial, sans-serif;">Don't miss out on important conversations. Log in to read your messages now!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appURL}" style="background-color: #4CA1F0; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-family: Poppins, Arial, sans-serif; display: inline-block;">Read Messages</a>
        </div>
        <p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br>Edupeerhub</p>
      `
  );

exports.TUTOR_APPROVAL_TEMPLATE = (name) =>
  emailWrapper(
    "Welcome to Edupeerhub!",
    `
        <p style="font-family: Roboto, Arial, sans-serif;">Hi ${name},</p>
        <p style="font-family: Roboto, Arial, sans-serif;">Congratulations! 🎉 Your tutor application has been reviewed and <strong>approved</strong>.</p>
        <p style="font-family: Roboto, Arial, sans-serif;">You can now log in to your account and start connecting with students.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://edupeerhub.com/dashboard" style="background-color: #4CA1F0; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-family: Poppins, Arial, sans-serif; display: inline-block;">Go to Dashboard</a>
        </div>
        <p style="font-family: Roboto, Arial, sans-serif;">We're excited to have you on board and can't wait to see the impact you'll make!</p>
        <p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br>Edupeerhub Team</p>
      `
  );

exports.TUTOR_REJECTION_TEMPLATE = (name, reason) =>
  emailWrapper(
    "Application Update",
    `
          <p style="font-family: Roboto, Arial, sans-serif;">Hi ${name},</p>
          <p style="font-family: Roboto, Arial, sans-serif;">We appreciate your interest in becoming a tutor at Edupeerhub. After careful review, we regret to inform you that your application has not been approved at this time.</p>
          <p style="font-family: Roboto, Arial, sans-serif;"><strong>Reason provided:</strong></p>
          <blockquote style="background: #fff; border-left: 4px solid #e53935; margin: 15px 0; padding: 10px 15px; color: #555;">
            ${reason || "No specific reason provided."}
          </blockquote>
          <p style="font-family: Roboto, Arial, sans-serif;">You're welcome to update your application and reapply in the future.</p>
          <p style="font-family: Roboto, Arial, sans-serif;">Thank you for your interest and understanding.</p>
          <p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br>Edupeerhub Team</p>
        `,
    "#e53935" // red rejection header
  );

exports.CALL_REMINDER_TEMPLATE = (role, url, timeText) =>
  emailWrapper(
    "Session Reminder",
    `
<p style="font-family: Roboto, Arial, sans-serif;">Dear ${role},</p>
<p style="font-family: Roboto, Arial, sans-serif;">This is a reminder that your tutoring session is coming up ${timeText}.</p>
<p><a href="${url}" target="_blank" style="background-color: #4CA1F0; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-family: Poppins, Arial, sans-serif; display: inline-block;">Join Session</a></p>
<p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br/>Edupeerhub Team</p>
`
  );

exports.BOOKING_CREATED_TEMPLATE = (tutorName, studentName, scheduledStart) =>
  emailWrapper(
    "New Booking Request",
    `
        <p style="font-family: Roboto, Arial, sans-serif;">Hi ${tutorName},</p>
        <p style="font-family: Roboto, Arial, sans-serif;">You have a new booking request from <strong>${studentName}</strong>.</p>
        <p style="font-family: Roboto, Arial, sans-serif;">The requested session is scheduled for:</p>
        <p style="font-family: Roboto, Arial, sans-serif;"><strong>${new Date(scheduledStart).toLocaleString()}</strong></p>
        <p style="font-family: Roboto, Arial, sans-serif;">This booking is <strong>pending your confirmation</strong>. Please review and confirm in your dashboard.</p>
        <p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br/>Edupeerhub Team</p>
      `
  );

exports.BOOKING_CONFIRMED_TEMPLATE = (role, scheduledStart, url) =>
  emailWrapper(
    "Booking Confirmed",
    `
        <p style="font-family: Roboto, Arial, sans-serif;">Dear ${role},</p>
        <p style="font-family: Roboto, Arial, sans-serif;">Your tutoring session has been <strong>confirmed</strong>!</p>
        <p style="font-family: Roboto, Arial, sans-serif;">Scheduled for: <strong>${new Date(scheduledStart).toLocaleString()}</strong></p>
        <p><a href="${url}" target="_blank" style="background-color: #4CA1F0; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-family: Poppins, Arial, sans-serif; display: inline-block;">Join Session</a></p>
        <p style="font-family: Roboto, Arial, sans-serif;">We wish you a great session!</p>
        <p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br/>Edupeerhub Team</p>
      `
  );

exports.BOOKING_RESCHEDULED_TEMPLATE = (role, newStart, url) =>
  emailWrapper(
    "Booking Rescheduled",
    `
        <p style="font-family: Roboto, Arial, sans-serif;">Dear ${role},</p>
        <p style="font-family: Roboto, Arial, sans-serif;">Your tutoring session has been <strong>rescheduled</strong>.</p>
        <p style="font-family: Roboto, Arial, sans-serif;">New schedule: <strong>${new Date(newStart).toLocaleString()}</strong></p>
        <p>
          <a href="${url}" target="_blank" 
             style="background-color: #4CA1F0; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-family: Poppins, Arial, sans-serif; display: inline-block;">
            Join Session
          </a>
        </p>
        <p style="font-family: Roboto, Arial, sans-serif;">We look forward to seeing you at the new time!</p>
        <p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br/>Edupeerhub Team</p>
      `
  );

exports.BOOKING_CANCELLED_TEMPLATE = (role, scheduledStart, reason) =>
  emailWrapper(
    "Booking Cancelled",
    `
        <p style="font-family: Roboto, Arial, sans-serif;">Dear ${role},</p>
        <p style="font-family: Roboto, Arial, sans-serif;">We're sorry to inform you that your tutoring session scheduled for <strong>${new Date(
          scheduledStart
        ).toLocaleString()}</strong> has been cancelled.</p>
        ${
          reason
            ? `<p style="font-family: Roboto, Arial, sans-serif;"><strong>Reason:</strong> ${reason}</p>`
            : '<p style="font-family: Roboto, Arial, sans-serif;">No reason was provided.</p>'
        }
        <p style="font-family: Roboto, Arial, sans-serif;">If you have any questions, please reach out via support.</p>
        <p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br/>Edupeerhub Team</p>
      `
  );

exports.BOOKING_DECLINED_TEMPLATE = (scheduledStart) =>
  emailWrapper(
    "Booking Declined",
    `
        <p style="font-family: Roboto, Arial, sans-serif;">Dear Student,</p>
        <p style="font-family: Roboto, Arial, sans-serif;">We're sorry to inform you that your booking request for 
        <strong>${new Date(scheduledStart).toLocaleString()}</strong> 
        was declined by the tutor.</p>
        <p style="font-family: Roboto, Arial, sans-serif;">You can explore other tutors and available slots to continue your learning journey.</p>
        <p style="font-family: Roboto, Arial, sans-serif;">Best regards,<br/>Edupeerhub Team</p>
      `
  );
