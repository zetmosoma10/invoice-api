import request from "supertest";
import { beforeEach, afterEach, it, expect, describe } from "vitest";
import { User } from "../../models/User.js";

let server;

describe("/api/auth", () => {
  beforeAll(async () => {
    const module = await import("../../server.js"); // Dynamically import server
    server = module.default || module;
  });

  beforeEach(async () => {
    await User.create({
      firstName: "aaa",
      lastName: "bbb",
      email: "z@z.com",
      password: "123456",
    });
  });

  afterAll(async () => {
    if (server) {
      await server.close(); // Close server after each test
    }
  });

  describe("/register", () => {
    it("should register a user and return the registered user", async () => {
      const res = await request(server).post("/api/auth/register").send({
        firstName: "aaa",
        lastName: "bbb",
        email: "b@b.com",
        password: "123456",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("token");
    });

    it("should return error if email already exist in db", async () => {
      const res = await request(server).post("/api/auth/register").send({
        firstName: "cccc",
        lastName: "dddd",
        email: "z@z.com",
        password: "1223445",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("/login", () => {
    it("should return token if valid credentials provided", async () => {
      const res = await request(server).post("/api/auth/login").send({
        email: "z@z.com",
        password: "123456",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("token");
    });

    it("should return 401 if invalid email provided", async () => {
      const res = await request(server).post("/api/auth/login").send({
        email: "pa@gmail.com",
        password: "123456",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

    it("should return 401 if invalid password provided", async () => {
      const res = await request(server).post("/api/auth/login").send({
        email: "z@z.com",
        password: "invalid",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });
  });

  //
});
