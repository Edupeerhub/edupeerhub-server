const ApiError = require("@utils/apiError");
const logger = require("../utils/logger");
const { sendEmail, safeSendEmail } = require("./email.utils");

const {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_CHANGE_SUCCESS_TEMPLATE,
  UNREAD_MESSAGE_TEMPLATE,
  TUTOR_APPROVAL_TEMPLATE,
  TUTOR_REJECTION_TEMPLATE,
  CALL_REMINDER_TEMPLATE,
  BOOKING_CREATED_TEMPLATE,
  BOOKING_CONFIRMED_TEMPLATE,
  BOOKING_CANCELLED_TEMPLATE,
} = require("./emailTemplates");

// --------------------
// Critical emails (must succeed)
// --------------------
const sendVerificationEmail = async (email, verificationToken) => {
  try {
    await sendEmail({
      to: [{ email }],
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE(verificationToken),
      category: "Email Verification",
    });
  } catch (error) {
    throw new ApiError("Error sending verification email", 500, error.message);
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
    await sendEmail({
      to: [{ email }],
      template_uuid: "0cac693c-dc72-4084-8364-bfad49a07de3",
      template_variables: {
        company_info_name: "Edupeerhub",
        name,
        company_info_address: "123, Ikeja",
        company_info_city: "Lagos",
        company_info_zip_code: "100100",
        company_info_country: "Nigeria",
      },
    });
  } catch (error) {
    throw new ApiError("Error sending welcome email", 500, error.message);
  }
};

const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    await sendEmail({
      to: [{ email }],
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE(resetURL),
      category: "Password Reset",
    });
  } catch (error) {
    throw new ApiError(
      "Error sending password reset email",
      500,
      error.message
    );
  }
};

const sendResetSuccessEmail = async (email) => {
  try {
    await sendEmail({
      to: [{ email }],
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE(),
      category: "Password Reset",
    });
  } catch (error) {
    throw new ApiError("Error sending reset success email", 500, error.message);
  }
};

const sendPasswordChangeSuccessEmail = async (email) => {
  try {
    await sendEmail({
      to: [{ email }],
      subject: "Password Change Successful",
      html: PASSWORD_CHANGE_SUCCESS_TEMPLATE(),
      category: "Password Change",
    });
  } catch (error) {
    throw new ApiError(
      "Error sending password change success email",
      500,
      error.message
    );
  }
};

const sendApprovalEmail = async (email, name) => {
  try {
    await sendEmail({
      to: [{ email }],
      subject: "Your Tutor Application has been Approved",
      html: TUTOR_APPROVAL_TEMPLATE(name),
      category: "Tutor Application",
    });
  } catch (error) {
    throw new ApiError(
      "Error sending tutor approval email",
      500,
      error.message
    );
  }
};

const sendRejectionEmail = async (email, name, reason) => {
  try {
    await sendEmail({
      to: [{ email }],
      subject: "Your Tutor Application Update",
      html: TUTOR_REJECTION_TEMPLATE(name, reason),
      category: "Tutor Application",
    });
  } catch (error) {
    throw new ApiError(
      "Error sending tutor rejection email",
      500,
      error.message
    );
  }
};

// --------------------
// Non-critical emails (log failures, don’t throw)
// --------------------
const sendCallReminderEmail = async ({
  tutorEmail,
  studentEmail,
  tutorCallUrl,
  studentCallUrl,
  type,
}) => {
  await Promise.all([
    safeSendEmail({
      to: [{ email: tutorEmail }],
      subject: `Your session is coming up ${type}`,
      html: CALL_REMINDER_TEMPLATE("Tutor", tutorCallUrl, type),
      category: "Call Reminder",
    }),
    safeSendEmail({
      to: [{ email: studentEmail }],
      subject: `Your session is coming up ${type}`,
      html: CALL_REMINDER_TEMPLATE("Student", studentCallUrl, type),
      category: "Call Reminder",
    }),
  ]);
};

const sendUnreadMessageEmail = async (
  userEmail,
  userName,
  unreadCount,
  senderNames
) => {
  const appURL = process.env.CLIENT_URL || "http://localhost:5173";

  await safeSendEmail({
    to: [{ email: userEmail }],
    subject: `You have ${unreadCount} unread message${
      unreadCount > 1 ? "s" : ""
    }`,
    html: UNREAD_MESSAGE_TEMPLATE(userName, unreadCount, senderNames, appURL),
    category: "Unread Messages",
  });
};

const sendBookingCreatedEmail = async (
  tutorEmail,
  tutorName,
  studentName,
  scheduledStart
) => {
  await safeSendEmail({
    to: [{ email: tutorEmail }],
    subject: `New booking request from ${studentName}`,
    html: BOOKING_CREATED_TEMPLATE(tutorName, studentName, scheduledStart),
    category: "Booking Created",
  });
};

const sendBookingConfirmedEmail = async ({
  tutorEmail,
  studentEmail,
  tutorCallUrl,
  studentCallUrl,
  scheduledStart,
}) => {
  await Promise.all([
    safeSendEmail({
      to: [{ email: tutorEmail }],
      subject: "Your tutoring session has been confirmed",
      html: BOOKING_CONFIRMED_TEMPLATE("Tutor", scheduledStart, tutorCallUrl),
      category: "Booking Confirmed",
    }),
    safeSendEmail({
      to: [{ email: studentEmail }],
      subject: "Your tutoring session has been confirmed",
      html: BOOKING_CONFIRMED_TEMPLATE(
        "Student",
        scheduledStart,
        studentCallUrl
      ),
      category: "Booking Confirmed",
    }),
  ]);
};

const sendBookingCancelledEmail = async ({
  tutorEmail,
  studentEmail,
  scheduledStart,
  reason,
}) => {
  await Promise.all([
    safeSendEmail({
      to: [{ email: tutorEmail }],
      subject: "Your tutoring session has been cancelled",
      html: BOOKING_CANCELLED_TEMPLATE("Tutor", scheduledStart, reason),
      category: "Booking Cancelled",
    }),
    safeSendEmail({
      to: [{ email: studentEmail }],
      subject: "Your tutoring session has been cancelled",
      html: BOOKING_CANCELLED_TEMPLATE("Student", scheduledStart, reason),
      category: "Booking Cancelled",
    }),
  ]);
};

module.exports = {
  // critical
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendPasswordChangeSuccessEmail,
  sendApprovalEmail,
  sendRejectionEmail,

  // non-critical
  sendCallReminderEmail,
  sendUnreadMessageEmail,
  sendBookingCreatedEmail,
  sendBookingConfirmedEmail,
  sendBookingCancelledEmail,
};
