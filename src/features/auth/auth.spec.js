const request = require("supertest");
const { cleanupDB } = require("@src/shared/tests/test-db");

const app = require("@src/app");
const sequelize = require("@src/shared/database");
const { User } = require("@src/shared/database/models");
const { hashPassword } = require("@src/shared/utils/authHelpers");

const {
  userObject: user,
  createVerifiedUser,
} = require("@src/shared/tests/utils");
const session = require("supertest-session");
const { login } = require("./auth.controller");

let testSession, authenticatedSession;
let loggedInUser;
async function createAndLoginUser() {
  testSession = session(app);
  loggedInUser = await createVerifiedUser();
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
      await createVerifiedUser();
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

    it("should return 404 if user does not exist", async () => {
      await createAndLoginUser();

      const res = await authenticatedSession
        .post(`/api/auth/forgot-password`)
        .send({ email: "nonexistent@test.com" });
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: "User not found",
        error: null,
      });
    });
  });

  describe("POST /reset/:token", () => {
    it("should reset password with valid token", async () => {
      // Simulate user and token

      const token = "valid-token";
      const newPassword = "newPassword123!";
      const res = await authenticatedSession
        .post(`/api/auth/reset/${token}`)
        .send({ password: newPassword });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Password reset successful",
        data: null,
      });
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
      await createVerifiedUser();
      const loginRes = await request(app)
        .post(`/api/auth/login`)
        .send({ email: user.email, password: user.password });
      const cookie = loginRes.headers["set-cookie"];
      const res = await request(app).get(`/api/auth/me`).set("Cookie", cookie);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "User details retrieved successfully",
        data: {
          id: expect.any(String),
          email: user.email,
        },
      });
    });
    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get(`/api/auth/me`);
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Unauthorized",
        error: null,
      });
    });
  });

  describe("POST /verify-email", () => {
    it("should verify email with valid token", async () => {
      

      const response = await testSession.post(`/api/auth/signup`).send(user);
      const user = await User.scope("active").findByPk(
        response.body.data.id,
        {}
      );
      const token = user.verificationToken;
      const res = await testSession
        .post(`/api/auth/verify-email`)
        .send({ code: token });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Email verified successfully",
        data: null,
      });
    });
    it("should return 400 for invalid token", async () => {
      const token = "invalid-token";
      const res = await request(app)
        .post(`/api/auth/verify-email`)
        .send({ token });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid or expired token",
        error: null,
      });
    });
  });

  describe("POST /resend-email-verification", () => {
    it("should resend email verification if user exists", async () => {
      await createVerifiedUser();
      const res = await request(app)
        .post(`/api/auth/resend-email-verification`)
        .send({ email: user.email });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Verification email resent",
        data: {
          email: user.email,
        },
      });
    });
    it("should return 404 if user does not exist", async () => {
      const res = await request(app)
        .post(`/api/auth/resend-email-verification`)
        .send({ email: "nonexistent@test.com" });
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: "User not found",
        error: null,
      });
    });
  });

  describe("PUT /change-password", () => {
    it("should change password if authenticated and valid", async () => {
      await createVerifiedUser();
      const loginRes = await request(app)
        .post(`/api/auth/login`)
        .send({ email: user.email, password: user.password });
      const cookie = loginRes.headers["set-cookie"];
      const res = await request(app)
        .put(`/api/auth/change-password`)
        .set("Cookie", cookie)
        .send({ oldPassword: user.password, newPassword: "newPassword123" });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Password changed successfully",
        data: null,
      });
    });
    it("should return 400 if old password is incorrect", async () => {
      await createVerifiedUser();
      const loginRes = await request(app)
        .post(`/api/auth/login`)
        .send({ email: user.email, password: user.password });
      const cookie = loginRes.headers["set-cookie"];
      const res = await request(app)
        .put(`/api/auth/change-password`)
        .set("Cookie", cookie)
        .send({ oldPassword: "wrongPassword", newPassword: "newPassword123" });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Old password is incorrect",
        error: null,
      });
    });
  });

  describe("POST /logout", () => {
    it("should logout user and clear session", async () => {
      await createVerifiedUser();
      const loginRes = await request(app)
        .post(`/api/auth/login`)
        .send({ email: user.email, password: user.password });
      const cookie = loginRes.headers["set-cookie"];
      const res = await request(app)
        .post(`/api/auth/logout`)
        .set("Cookie", cookie);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "User logged out successfully",
        data: null,
      });
    });
    it("should return 401 if not authenticated", async () => {
      const res = await request(app).post(`/api/auth/logout`);
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Unauthorized",
        error: null,
      });
    });
  });
});
