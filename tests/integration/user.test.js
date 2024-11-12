import request from "supertest";
import { beforeEach, afterEach, it, expect, describe } from "vitest";
import { User } from "../../models/User.js";

let server;
let token;

describe("/api/user", () => {
  beforeEach(async () => {
    const module = await import("../../server.js"); // Dynamically import server
    server = module.default || module;
  });

  beforeEach(async () => {
    const user = await User.create({
      firstName: "aaa",
      lastName: "bbb",
      email: "z@z.com",
      password: "123456",
    });

    token = user.generateJwt();
  });

  afterEach(async () => {
    if (server) {
      await server.close(); // Close server after each test
    }
    token = "";
  });

  describe("/register", () => {
    it("should register a user and return the registered user", async () => {
      const res = await request(server).post("/api/user/register").send({
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
      const res = await request(server).post("/api/user/register").send({
        firstName: "cccc",
        lastName: "dddd",
        email: "z@z.com",
        password: "1223445",
      });

      expect(res.body.success).toBe(false);
    });
  });

  describe("/me", () => {
    it("should return current logged in user", async () => {
      const res = await request(server)
        .get("/api/user/me")
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toMatchObject({
        firstName: "aaa",
        lastName: "bbb",
        email: "z@z.com",
      });
    });

    it("should return 401 if user not logged in", async () => {
      const res = await request(server)
        .get("/api/user/me")
        .set("authorization", `Bearer `);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token missing/i);
    });
  });
  //
});
