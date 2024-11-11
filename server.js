import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import app from "./app.js";
import mongoose from "mongoose";

mongoose
  .connect(process.env.DB_CONN_STR)
  .then((data) => {
    console.log(`DB Connection Successfull...`);
  })
  .catch((err) => {
    console.log("FAILD DB connection...");
    console.log(err);
  });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listing at port: ${port}...`);
});
