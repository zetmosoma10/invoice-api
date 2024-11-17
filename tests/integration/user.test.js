import request from "supertest";
import { beforeEach, expect, describe } from "vitest";
import { User } from "../../models/User.js";

let server;
let token;

describe("/api/user", () => {
  beforeAll(async () => {
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

  afterAll(async () => {
    if (server) {
      await server.close(); // Close server after each test
    }
  });

  describe("/get-current-user", () => {
    it("should return current logged in user", async () => {
      const res = await request(server)
        .get("/api/user/get-current-user")
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
        .get("/api/user/get-current-user")
        .set("authorization", `Bearer `);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token missing/i);
    });
  });

  describe("/update-user", () => {
    it("should return 200 and updated user", async () => {
      const res = await request(server)
        .patch("/api/user/update-user")
        .set("authorization", `Bearer ${token}`)
        .send({ firstName: "John", lastName: "Smith" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toMatchObject({
        firstName: "John",
        lastName: "Smith",
      });
    });

    it("should return 400 if password is provided", async () => {
      const res = await request(server)
        .patch("/api/user/update-user")
        .set("authorization", `Bearer ${token}`)
        .send({ password: "123456" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(
        /Password cannot be update with this operation/i
      );
    });

    it("should return 400 if invalid credentials passed", async () => {
      const res = await request(server)
        .patch("/api/user/update-user")
        .set("authorization", `Bearer ${token}`)
        .send({ firstName: "aa", lastName: "bb", email: "invalid" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
  //
});
