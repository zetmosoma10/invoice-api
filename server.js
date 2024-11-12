import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import app from "./app.js";
import mongoose from "mongoose";

const dbConnectionSTR =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DB_CONN_STR
    : process.env.DB_CONN_STR;

const message = process.env.NODE_ENV === "test" ? "Test" : "Production";

mongoose
  .connect(dbConnectionSTR)
  .then((data) => {
    console.log(`Successfull Connected to ${message} database...`);
  })
  .catch((err) => {
    console.log("FAILD DB connection...");
    console.log(err);
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server listing at port: ${port}...`);
});

export default server;
