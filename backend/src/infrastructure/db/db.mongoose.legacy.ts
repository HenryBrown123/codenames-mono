import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/codenames").catch((e) => {
  console.error("Connection error", e.message);
});

export const mongoDb = mongoose.connection;
