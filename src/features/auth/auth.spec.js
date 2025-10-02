const request = require("supertest");
const { cleanupDB } = require("@src/shared/tests/test-db");

const app = require("@src/app");
const sequelize = require("@src/shared/database");
const { User } = require("@src/shared/database/models");
const { hashPassword } = require("@src/shared/utils/authHelpers");
jest.mock("@src/shared/middlewares/rateLimit.middleware", () => {
  return () => (req, res, next) => next();
});
const { userObject: user, createUser } = require("@src/shared/tests/utils");
const session = require("supertest-session");
const { login } = require("./auth.controller");

let testSession, authenticatedSession;
let loggedInUser;
async function createAndLoginUser(verified = true) {
  testSession = session(app);
  loggedInUser = await createUser({ verified });

  await testSession
    .post("/api/auth/login")
    .send({
      email: user.email,
      password: user.password,
    })
    .expect(200);

  authenticatedSession = testSession;
}

describe("Auth integration test", () => {
  beforeEach(async () => await cleanupDB());
  describe("POST /signup", () => {
    it("should return user details ", async () => {
      const response = await request(app).post(`/api/auth/signup`).send(user);

      expect(response.statusCode).toBe(201);
      expect(response.headers["set-cookie"]).toBeDefined();

      expect(response.body).toEqual({
        message: "User registered successfully",
        success: true,
        data: {
          id: expect.any(String),
          email: user.email,
        },
      });
    });
  });

  describe("POST /login", () => {
    it("should login user with valid credentials", async () => {
      // add user to DB
      await createUser({});
      // login user
      const res = await request(app)
        .post(`/api/auth/login`)
        .send({ email: user.email, password: user.password });

      //expectations
      expect(res.statusCode).toBe(200);

      expect(res.headers["set-cookie"]).toBeDefined();

      expect(res.body).toEqual({
        success: true,
        message: "User signed in successfully",
        data: {
          id: expect.any(String), // Expect the id to be a string
          email: user.email,
        },
      });
    });
  });

  describe("POST /forgot-password", () => {
    it("should send password reset email if user exists", async () => {
      await createAndLoginUser();
      const res = await authenticatedSession
        .post(`/api/auth/forgot-password`)
        .send({ email: user.email });
      expect(res.statusCode).toBe(200);

      expect(res.body).toEqual({
        success: true,
        message: "Password reset link sent to your email",
        data: null,
      });
    });

    it("should return 401 also if user does not exist", async () => {
      const res = await request(app)
        .post(`/api/auth/forgot-password`)
        .send({ email: "nonexistent@test.com" });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Password reset link sent to your email",
        data: null,
      });
    });
  });

  describe("POST /reset/:token", () => {
    it("should reset password with valid token", async () => {
      // Simulate user and token
      await createAndLoginUser();
      const res0 = await authenticatedSession
        .post(`/api/auth/forgot-password`)
        .send({ email: loggedInUser.email });
      expect(res0.statusCode).toBe(200);

      const retrievedUser = await User.scope("verified").findByPk(
        loggedInUser.id
      );
      const { resetPasswordToken } = retrievedUser;
      const newPassword = "newPassword123!";
      const res = await authenticatedSession
        .post(`/api/auth/reset/${resetPasswordToken}`)
        .send({ password: newPassword });

      //TODO: find a way to test this properly

      // expect(res.statusCode).toBe(200);
      // expect(res.body).toEqual({
      //   success: true,
      //   message: "Password reset successful",
      //   data: null,
      // });
    });
    it("should return 401 for invalid token", async () => {
      const token = "invalid-token";
      const res = await request(app)
        .post(`/api/auth/reset/${token}`)
        .send({ password: "newPassword123!" });
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid or expired reset token",
        error: null,
      });
    });
  });

  describe("GET /me", () => {
    it("should return current user details if authenticated", async () => {
      await createUser({});
      const loginRes = await request(app)
        .post(`/api/auth/login`)
        .send({ email: user.email, password: user.password });
      const cookie = loginRes.headers["set-cookie"];
      const res = await request(app).get(`/api/auth/me`).set("Cookie", cookie);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Profile fetch successful",
        data: {
          id: expect.any(String),
          email: user.email,
          firstName: user.firstName,
          isOnboarded: true,
          isVerified: true,
          lastName: user.lastName,
          profileImageUrl: "randomAvatar",
          role: null,
        },
      });
    });
    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get(`/api/auth/me`);
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Unauthorized - No token provided",
        error: null,
      });
    });
  });

  describe("POST /verify-email", () => {
    it("should verify email with valid token", async () => {
      const response = await createAndLoginUser(false);

      const token = loggedInUser.verificationToken;
      const res = await testSession
        .post(`/api/auth/verify-email`)
        .send({ code: token });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Email verified successfully",
        data: {
          id: expect.any(String),
          email: expect.any(String),
        },
      });
    });
    it("should return 401 for invalid token", async () => {
      const token = "000000";
      await createAndLoginUser(false);
      const res = await authenticatedSession
        .post(`/api/auth/verify-email`)
        .send({ code: token });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid or expired verification code",
        error: null,
      });
    });
  });

  describe("POST /resend-email-verification", () => {
    it("should resend email verification if user exists", async () => {
      await createAndLoginUser(false);
      const res = await authenticatedSession
        .post(`/api/auth/resend-email-verification`)
        .send({ email: loggedInUser.email });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Verification email resent successfully",
        data: null,
      });
    });
    it("should 400 if user already verified", async () => {
      await createAndLoginUser();
      const res = await authenticatedSession
        .post(`/api/auth/resend-email-verification`)
        .send();
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "User is already verified",
        error: null,
      });
    });
  });

  describe("PUT /change-password", () => {
    it("should change password if authenticated and valid", async () => {
      await createAndLoginUser();

      const res = await authenticatedSession
        .put(`/api/auth/change-password`)
        .send({
          currentPassword: user.password,
          newPassword: "newPassword123%",
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Password changed successfully",
        data: {
          email: user.email,
          id: expect.any(String),
        },
      });
    });
    it("should return 400 if old password is incorrect", async () => {
      await createAndLoginUser();
      const res = await authenticatedSession
        .put(`/api/auth/change-password`)

        .send({ oldPassword: "wrongPassword", newPassword: "newPassword123" });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Validation error.",
        error: expect.arrayContaining([
          {
            field: "currentPassword",
            issue: "Password is required",
          },
          {
            field: "newPassword",
            issue:
              "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          },
        ]),
      });
    });
  });

  describe("POST /logout", () => {
    it("should logout user and clear session", async () => {
      await createAndLoginUser();

      const res = await authenticatedSession.post(`/api/auth/logout`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Logout Successful",
        data: null,
      });
    });
    it("should return 401 if not authenticated", async () => {
      const res = await request(app).post(`/api/auth/logout`);
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Unauthorized - No token provided",
        error: null,
      });
    });
  });
});
