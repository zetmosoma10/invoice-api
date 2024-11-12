import mongoose from "mongoose";
import { afterAll, afterEach } from "vitest";

afterEach(async () => {
  const collection = mongoose.connection.collections;
  for (const key in collection) {
    await collection[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});
