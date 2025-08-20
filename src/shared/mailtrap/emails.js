const ApiError = require("@utils/apiError");
const {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} = require("./emailTemplates");
const { mailtrapClient, sender } = require("./mailtrap.config");

const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
  } catch (error) {
    throw new ApiError("Error sending verification email", 500, error.message);
  }
};

const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    await mailtrapClient.send({
      from: sender,
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

const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
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
  const recipient = [{ email }];

  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
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

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
};
