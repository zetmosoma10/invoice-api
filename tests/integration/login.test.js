import request from "supertest";
import { beforeEach, afterEach, it, expect, describe } from "vitest";
import { User } from "../../models/User.js";

let server;

describe("/api/auth/login", () => {
  beforeEach(async () => {
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

  afterEach(async () => {
    if (server) {
      await server.close(); // Close server after each test
    }
  });

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
      email: "invalid@.com",
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

  //
});
