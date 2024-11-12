import request from "supertest";
import { beforeEach, afterEach, it, expect, describe } from "vitest";
import { User } from "../../models/User.js";

let server;
let user;

describe("Authentication", () => {
  beforeEach(async () => {
    const module = await import("../../server.js"); // Dynamically import server
    server = module.default || module;
  });

  beforeEach(async () => {
    user = await User.create({
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

  it("should return 401 if token not provided", async () => {
    const res = await request(server)
      .get("/api/user/me")
      .set("authorization", `Bearer `);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Authentication token missing/i);
  });

  it("should return 401 if user associated with token does not exist", async () => {
    const token = user.generateJwt();
    await User.deleteMany({});
    console.log(token);
    console.log(user);

    const res = await request(server)
      .get("/api/user/me")
      .set("authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(
      /User associated with the token doest not exist/i
    );
  });

  it("should attach user to req object if authentication passed", async () => {
    const token = user.generateJwt();

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
});
