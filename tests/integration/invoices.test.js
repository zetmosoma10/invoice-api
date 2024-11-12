import request from "supertest";
import { beforeEach, afterEach, it, expect, describe } from "vitest";
import { User } from "../../models/User.js";
import { Invoice } from "../../models/Invoice.js";
import mongoose from "mongoose";

let server;
let token;
let invoice;
let user;

describe("/api/invoices", () => {
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

    token = user.generateJwt();

    // * add invoices to db
    invoice = await Invoice.create({
      user: user._id,
      billFrom: {
        address: {
          street: "391 Main St",
          city: "Pretoria",
          postalCode: "3001",
          country: "South Africa",
        },
      },
      billTo: {
        clientName: "France",
        clientEmail: "france@gmail.com",
        address: {
          street: "400 Clive St",
          city: "Midrand",
          postalCode: "5000",
          country: "South Africa",
        },
        paymentTerms: "Next 7 days",
        projectDescription: "Database managment",
        items: [
          { name: "Design", quantity: 2, price: 700 },
          { name: "Development", quantity: 4, price: 150 },
        ],
      },
    });
  });

  afterEach(async () => {
    if (server) {
      await server.close(); // Close server after each test
    }
  });

  const exec = () => {
    return request(server)
      .get("/api/invoices")
      .set("authorization", `Bearer ${token}`);
  };

  describe("POST /", () => {
    it("should return 201 and created invoice", async () => {
      await Invoice.deleteMany({}); // * CLEAR invoice collection

      const res = await request(server)
        .post("/api/invoices")
        .set("authorization", `Bearer ${token}`)
        .send({
          user: user._id,
          billFrom: {
            address: {
              street: "391 Main St",
              city: "Pretoria",
              postalCode: "3001",
              country: "South Africa",
            },
          },
          billTo: {
            clientName: "France",
            clientEmail: "france@gmail.com",
            address: {
              street: "400 Clive St",
              city: "Midrand",
              postalCode: "5000",
              country: "South Africa",
            },
            paymentTerms: "Next 7 days",
            projectDescription: "Database managment",
            items: [
              { name: "Design", quantity: 2, price: 700 },
              { name: "Development", quantity: 4, price: 150 },
            ],
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 401 if user is not logged in", async () => {
      await Invoice.deleteMany({}); // * CLEAR invoice collection
      token = "";

      const res = await request(server)
        .post("/api/invoices")
        .set("authorization", `Bearer ${token}`)
        .send({
          user: user._id,
          billFrom: {
            address: {
              street: "391 Main St",
              city: "Pretoria",
              postalCode: "3001",
              country: "South Africa",
            },
          },
          billTo: {
            clientName: "France",
            clientEmail: "france@gmail.com",
            address: {
              street: "400 Clive St",
              city: "Midrand",
              postalCode: "5000",
              country: "South Africa",
            },
            paymentTerms: "Next 7 days",
            projectDescription: "Database managment",
            items: [
              { name: "Design", quantity: 2, price: 700 },
              { name: "Development", quantity: 4, price: 150 },
            ],
          },
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token missing/i);
    });
  });

  describe("GET /", () => {
    it("should return 200 and all invoices", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.invoices).toBeInstanceOf(Array);
      expect(res.body.invoices[0]).toHaveProperty("user", expect.any(String));
      expect(res.body.invoices[0].billTo).toHaveProperty(
        "clientName",
        "France"
      );
    });

    it("should return 401 user not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token missing/i);
    });
  });

  describe("GET /:id", () => {
    it("should return 200 and invoice for given id", async () => {
      const res = await request(server)
        .get(`/api/invoices/${invoice._id}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.invoice).toHaveProperty("user", expect.any(String));
      expect(res.body.invoice.billTo).toHaveProperty("clientName", "France");
    });

    it("should return 404 if there is no invoice for given id", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(server)
        .get(`/api/invoices/${id}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invoice for given id doest not exist/i);
    });

    it("should return 401 if user not logged in", async () => {
      const id = new mongoose.Types.ObjectId();
      token = "";

      const res = await request(server)
        .get(`/api/invoices/${id}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token missing/i);
    });
  });

  describe("DELETE /:id", () => {
    it("should return 200 and delete the invoice", async () => {
      const res = await request(server)
        .delete(`/api/invoices/${invoice._id}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 if there is no invoice for given id", async () => {
      await Invoice.deleteMany({}); // * CLEAR invoice collection database

      const res = await request(server)
        .delete(`/api/invoices/${invoice._id}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invoice already deleted/i);
    });

    it("should return 401 if user not logged in", async () => {
      token = "";

      const res = await request(server)
        .delete(`/api/invoices/${invoice._id}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token missing/i);
    });
  });
});
