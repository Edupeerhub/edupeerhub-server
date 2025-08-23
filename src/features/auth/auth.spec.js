const request = require("supertest");
const { cleanupDB } = require("@src/shared/tests/test-db");

const app = require("@src/app");
const sequelize = require("@src/shared/database");
const { User } = require("@src/shared/database/models");
const { hashPassword } = require("@src/shared/utils/authHelpers");

const user = {
  firstName: "John",
  lastName: "Dupe",
  email: "john@example.com",
  password: "StrongPass123!",
};

const hashedPassword =
  "$2b$10$PjBOJPU3o7wQtjVfpQnUIuhmn69ZYjXDNqlQjLy7eXkjIvQW.WeZ.";

// hashawait hashPassword(user.password);

describe("Auth integration test", () => {
  beforeEach(async () => await cleanupDB());
  describe("POST /signup", () => {
    it("should return user details ", async () => {
      const response = await request(app).post(`/api/auth/signup`).send(user);
      expect(response.statusCode).toBe(201);
      const { success, message, data } = response.body;
      expect(success).toBe(true);
      expect(message).toBe("User registered successfully");

      expect(data.id).toBeDefined();
      expect(data.email).toBe(user.email);
    });
  });

  describe("POST /login", () => {
    it("should login user with valid credentials", async () => {
      // add user to DB
      await User.create({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        passwordHash: hashedPassword, //TODO: refactor to use hook to hash password
        profileImageUrl: "randomAvatar",
        verificationToken: "code",
        verificationTokenExpiresAt: Date.now(),
        isVerified: false,
        isOnboarded: false,
      });
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
    it("", async () => {});
  });

  describe("POST /reset/:token", () => {
    it("", async () => {});
  });

  describe("GET /me", () => {
    it("", async () => {});
  });

  describe("POST /verify-email", () => {
    it("", async () => {});
  });

  describe("POST /resend-email-verification", () => {
    it("", async () => {});
  });

  describe("PUT /change-password", () => {
    it("", async () => {});
  });

  describe("POST /logout", () => {
    it("", async () => {});
  });
});
