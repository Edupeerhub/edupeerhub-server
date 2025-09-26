const ApiError = require("@utils/apiError");
const {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_CHANGE_SUCCESS_TEMPLATE,
  UNREAD_MESSAGE_TEMPLATE,
  TUTOR_APPROVAL_TEMPLATE,
  TUTOR_REJECTION_TEMPLATE,
  CALL_REMINDER_TEMPLATE,
} = require("./emailTemplates");
const { sendEmail } = require("./email.utils");

// send verification email
const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    await sendEmail({
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE(verificationToken),
      category: "Email Verification",
    });
  } catch (error) {
    throw new ApiError("Error sending verification email", 500, error.message);
  }
};

// send welcome email
const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    await sendEmail({
      to: recipient,
      template_uuid: "0cac693c-dc72-4084-8364-bfad49a07de3",
      template_variables: {
        company_info_name: "Edupeerhub",
        name: name,
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

// send password reset email
const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    await sendEmail({
      to: recipient,
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

// send reset success email
const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    await sendEmail({
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE(),
      category: "Password Reset",
    });
  } catch (error) {
    throw new ApiError(
      "Error sending password reset success email",
      500,
      error.message
    );
  }
};
const sendPasswordChangeSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    await sendEmail({
      to: recipient,
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

const sendCallReminderEmail = async ({
  tutorEmail,
  studentEmail,
  tutorCallUrl,
  studentCallUrl,
  type,
}) => {
  try {
    // You can personalize by sending two separate emails if tutor/student need different links
    await Promise.all([
      sendEmail({
        to: [{ email: tutorEmail }],
        subject: `${type} - Upcoming Tutoring Session`,
        html: CALL_REMINDER_TEMPLATE("Tutor", tutorCallUrl, type),
        category: "Call Reminder",
      }),
      sendEmail({
        to: [{ email: studentEmail }],
        subject: `${type} - Upcoming Tutoring Session`,
        html: CALL_REMINDER_TEMPLATE("Student", studentCallUrl, type),
        category: "Call Reminder",
      }),
    ]);
  } catch (error) {
    throw new ApiError("Error sending call reminder email", 500, error.message);
  }
};

const sendUnreadMessageEmail = async (
  userEmail,
  userName,
  unreadCount,
  senderNames
) => {
  const recipient = [{ email: userEmail }];
  const appURL = process.env.CLIENT_URL || "http://localhost:5173";

  try {
    await sendEmail({
      to: recipient,
      subject: `You have ${unreadCount} unread message${
        unreadCount > 1 ? "s" : ""
      }`,
      html: UNREAD_MESSAGE_TEMPLATE(userName, unreadCount, senderNames, appURL),
      category: "Unread Messages",
    });
  } catch (error) {
    throw new ApiError(
      "Error sending unread message email",
      500,
      error.message
    );
  }
};
module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendPasswordChangeSuccessEmail,
  sendUnreadMessageEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendCallReminderEmail,
};
